'use server';

/**
 * @fileOverview Ações de servidor para integração com a API PushinPay.
 */

const PUSHINPAY_TOKEN = "62133|gD7m59ZAlFsPeLDZ14T512Byv7PoY2TNocGw2TTy1d28a226";
const API_BASE_URL = "https://api.pushinpay.com.br/api";

export type PixResponse = {
  id: string;
  qr_code: string;
  qr_code_base64: string;
  value: number;
};

export async function createPixAction(valueInReais: number) {
  try {
    const valueInCents = Math.round(valueInReais * 100);
    
    const response = await fetch(`${API_BASE_URL}/pix/cashIn`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PUSHINPAY_TOKEN}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        value: valueInCents,
        webhook_url: "https://pjcontas.com/api/webhook/pushinpay"
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao gerar PIX');
    }

    const data = await response.json();
    return {
      id: data.id,
      qr_code: data.qr_code,
      qr_code_base64: data.qr_code_base64,
      value: valueInReais
    } as PixResponse;
  } catch (error: any) {
    console.error("Payment Error:", error);
    throw error;
  }
}

export async function checkPixStatusAction(transactionId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PUSHINPAY_TOKEN}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) return { status: 'error' };

    const data = await response.json();
    return { status: data.status }; // 'pending', 'paid', etc.
  } catch (error) {
    return { status: 'error' };
  }
}
