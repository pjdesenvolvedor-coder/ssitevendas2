'use server';

/**
 * @fileOverview Ação de servidor para envio de webhooks, contornando restrições de CORS do navegador.
 */

export async function sendWebhookAction(url: string, payload: any) {
  if (!url) return { success: false, error: 'URL do Webhook não configurada.' };

  try {
    console.log(`[Webhook] Enviando requisição para: ${url}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      // Envia o payload exatamente como solicitado, sem wraps extras
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Webhook] Erro no servidor de destino (${response.status}):`, errorText);
      return { success: false, status: response.status, error: errorText };
    }

    console.log('[Webhook] Sucesso! Dados enviados com sucesso.');
    return { success: true };
  } catch (error: any) {
    console.error("[Webhook] Erro de conexão:", error.message);
    return { success: false, error: error.message };
  }
}
