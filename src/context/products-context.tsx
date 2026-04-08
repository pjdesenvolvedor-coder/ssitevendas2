
"use client";

import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { 
  StreamingService, 
  AccountCredential, 
  Order, 
  WebhookConfig, 
  Affiliate, 
  Commission, 
  AppSettings,
  WithdrawalRequest 
} from '@/lib/types';
import { sendWebhookAction } from '@/lib/webhook-actions';
import { 
  useFirestore, 
  useCollection, 
  useDoc, 
  useMemoFirebase,
  setDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking
} from '@/firebase';
import { collection, doc } from 'firebase/firestore';

type ProductsContextType = {
  products: StreamingService[];
  orders: Order[];
  affiliates: Affiliate[];
  webhookSettings: WebhookConfig;
  appSettings: AppSettings;
  withdrawals: WithdrawalRequest[];
  isLoading: boolean;
  addProduct: (product: StreamingService) => void;
  deleteProduct: (id: string) => void;
  updateProduct: (product: StreamingService) => void;
  updateProductsOrder: (reorderedProducts: StreamingService[]) => void;
  addCredential: (productId: string, credential: Omit<AccountCredential, 'id' | 'addedAt' | 'sold'>) => void;
  removeCredential: (productId: string, credentialId: string) => void;
  sellCredential: (productId: string) => AccountCredential | null;
  addOrder: (order: Order) => void;
  updateWebhookSettings: (settings: WebhookConfig) => void;
  updateAppSettings: (settings: AppSettings) => void;
  registerAffiliate: (affiliate: Omit<Affiliate, 'id' | 'status' | 'balance' | 'createdAt' | 'totalSalesVolume'>) => void;
  updateAffiliateStatus: (id: string, status: Affiliate['status'], commissionRate?: number) => void;
  updateAffiliatePix: (id: string, pixData: { pixType: string; pixKey: string; pixName: string }) => void;
  requestWithdrawal: (affId: string, amount: number) => void;
  updateWithdrawalStatus: (withdrawalId: string, status: 'paid' | 'rejected') => void;
  getAffiliateByEmail: (email: string) => Affiliate | undefined;
};

const DEFAULT_WEBHOOK: WebhookConfig = {
  url: '',
  enabled: false,
  fields: {
    orderId: true,
    customerName: true,
    customerPhone: true,
    total: true,
    items: true,
  }
};

const DEFAULT_SETTINGS: AppSettings = {
  defaultCommissionRate: 10
};

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const db = useFirestore();

  const productsQuery = useMemoFirebase(() => collection(db, 'products'), [db]);
  const ordersQuery = useMemoFirebase(() => collection(db, 'orders'), [db]);
  const affiliatesQuery = useMemoFirebase(() => collection(db, 'affiliates'), [db]);
  const withdrawalsQuery = useMemoFirebase(() => collection(db, 'withdrawals'), [db]);
  const webhookDocRef = useMemoFirebase(() => doc(db, 'settings', 'webhook'), [db]);
  const settingsDocRef = useMemoFirebase(() => doc(db, 'settings', 'general'), [db]);

  const { data: productsData, isLoading: loadingProducts } = useCollection<StreamingService>(productsQuery);
  const { data: ordersData, isLoading: loadingOrders } = useCollection<Order>(ordersQuery);
  const { data: affiliatesData, isLoading: loadingAffiliates } = useCollection<Affiliate>(affiliatesQuery);
  const { data: withdrawalsData, isLoading: loadingWithdrawals } = useCollection<WithdrawalRequest>(withdrawalsQuery);
  const { data: webhookData, isLoading: loadingWebhook } = useDoc<WebhookConfig>(webhookDocRef);
  const { data: settingsData, isLoading: loadingSettings } = useDoc<AppSettings>(settingsDocRef);

  const products = useMemo(() => productsData || [], [productsData]);
  const orders = useMemo(() => {
    if (!ordersData) return [];
    return [...ordersData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [ordersData]);
  
  const affiliates = useMemo(() => affiliatesData || [], [affiliatesData]);
  const withdrawals = useMemo(() => withdrawalsData || [], [withdrawalsData]);
  const webhookSettings = useMemo(() => webhookData || DEFAULT_WEBHOOK, [webhookData]);
  const appSettings = useMemo(() => settingsData || DEFAULT_SETTINGS, [settingsData]);
  
  const isLoading = loadingProducts || loadingOrders || loadingAffiliates || loadingWebhook || loadingSettings || loadingWithdrawals;

  const addProduct = useCallback((product: StreamingService) => {
    const productRef = doc(db, 'products', product.id);
    setDocumentNonBlocking(productRef, { ...product, credentials: product.credentials || [] }, { merge: true });
  }, [db]);

  const deleteProduct = useCallback((id: string) => {
    const productRef = doc(db, 'products', id);
    deleteDocumentNonBlocking(productRef);
  }, [db]);

  const updateProduct = useCallback((updated: StreamingService) => {
    const productRef = doc(db, 'products', updated.id);
    updateDocumentNonBlocking(productRef, updated);
  }, [db]);

  const updateProductsOrder = useCallback((reordered: StreamingService[]) => {
    reordered.forEach((p, index) => {
      const productRef = doc(db, 'products', p.id);
      updateDocumentNonBlocking(productRef, { sortOrder: index });
    });
  }, [db]);

  const addCredential = useCallback((productId: string, credentialData: Omit<AccountCredential, 'id' | 'addedAt' | 'sold'>) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const newCredential: AccountCredential = {
      ...credentialData,
      id: Math.random().toString(36).substr(2, 9),
      addedAt: new Date().toISOString(),
      sold: false
    };

    const updatedCredentials = [...(product.credentials || []), newCredential];
    const productRef = doc(db, 'products', productId);
    
    updateDocumentNonBlocking(productRef, {
      credentials: updatedCredentials,
      stock: updatedCredentials.filter(c => !c.sold).length
    });
  }, [db, products]);

  const removeCredential = useCallback((productId: string, credentialId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const updatedCredentials = (product.credentials || []).filter(c => c.id !== credentialId);
    const productRef = doc(db, 'products', productId);

    updateDocumentNonBlocking(productRef, {
      credentials: updatedCredentials,
      stock: updatedCredentials.filter(c => !c.sold).length
    });
  }, [db, products]);

  const sellCredential = useCallback((productId: string): AccountCredential | null => {
    const product = products.find(p => p.id === productId);
    if (!product || !product.credentials) return null;

    const credentialIndex = product.credentials.findIndex(c => !c.sold);
    if (credentialIndex === -1) return null;

    const updatedCredentials = [...product.credentials];
    const soldItem = { ...updatedCredentials[credentialIndex], sold: true };
    updatedCredentials[credentialIndex] = soldItem;

    const productRef = doc(db, 'products', productId);
    
    updateDocumentNonBlocking(productRef, {
      credentials: updatedCredentials,
      stock: updatedCredentials.filter(c => !c.sold).length
    });

    return soldItem;
  }, [db, products]);

  const calculateProgressiveRate = (volume: number): number => {
    if (volume >= 280) return 20;
    if (volume >= 150) return 18;
    if (volume >= 80) return 14;
    return 10;
  };

  const addOrder = useCallback((order: Order) => {
    const storedRef = typeof window !== 'undefined' ? sessionStorage.getItem('pj_contas_ref') : null;
    const affiliateId = order.affiliateId || storedRef;
    
    const finalOrder = {
      ...order,
      affiliateId
    };

    // 1. Salvar o pedido no Firestore IMEDIATAMENTE
    const orderRef = doc(db, 'orders', finalOrder.id);
    setDocumentNonBlocking(orderRef, finalOrder, { merge: true });

    // 2. Processar Afiliado
    if (affiliateId) {
      const affiliate = affiliates.find(a => a.id === affiliateId);
      if (affiliate && affiliate.status === 'active') {
        const currentVolume = affiliate.totalSalesVolume || 0;
        const rate = affiliate.commissionRate || calculateProgressiveRate(currentVolume);
        const commissionAmount = (finalOrder.total * rate) / 100;
        
        const affiliateRef = doc(db, 'affiliates', affiliate.id);
        updateDocumentNonBlocking(affiliateRef, {
          balance: (affiliate.balance || 0) + commissionAmount,
          totalSalesVolume: currentVolume + finalOrder.total
        });

        const commissionId = `COM-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        const commissionRef = doc(db, 'commissions', commissionId);
        setDocumentNonBlocking(commissionRef, {
          id: commissionId,
          affiliateId: affiliate.id,
          orderId: finalOrder.id,
          amount: commissionAmount,
          date: new Date().toISOString()
        }, { merge: true });
        
        // Limpar ref após processamento bem sucedido
        if (typeof window !== 'undefined') sessionStorage.removeItem('pj_contas_ref');
      }
    }

    // 3. Disparar Webhook (Payload ÚNICO com todos os itens)
    if (webhookSettings.enabled && webhookSettings.url) {
      const triggerWebhook = async () => {
        const payload = {
          orderId: finalOrder.id,
          cliente: finalOrder.customerName,
          whatsapp: finalOrder.customerPhone,
          total: finalOrder.total,
          data: finalOrder.date,
          affiliateId: affiliateId || null,
          itens: finalOrder.items.map(item => ({
            produto: item.productName,
            email: item.email,
            senha: item.pass,
            perfil: item.screen,
            senhaPerfil: item.screenPass || 'Sem senha',
            revenda: item.isRevenda || false
          }))
        };

        await sendWebhookAction(webhookSettings.url, payload);
      };
      triggerWebhook();
    }
  }, [db, webhookSettings, affiliates]);

  const updateWebhookSettings = useCallback((settings: WebhookConfig) => {
    const webhookRef = doc(db, 'settings', 'webhook');
    setDocumentNonBlocking(webhookRef, settings, { merge: true });
  }, [db]);

  const updateAppSettings = useCallback((settings: AppSettings) => {
    const settingsRef = doc(db, 'settings', 'general');
    setDocumentNonBlocking(settingsRef, settings, { merge: true });
  }, [db]);

  const registerAffiliate = useCallback((data: Omit<Affiliate, 'id' | 'status' | 'balance' | 'createdAt' | 'totalSalesVolume'>) => {
    const id = `AFF-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const affRef = doc(db, 'affiliates', id);
    setDocumentNonBlocking(affRef, {
      ...data,
      id,
      status: 'pending',
      balance: 0,
      totalSalesVolume: 0,
      createdAt: new Date().toISOString()
    }, { merge: true });
  }, [db]);

  const updateAffiliateStatus = useCallback((id: string, status: Affiliate['status'], commissionRate?: number) => {
    const affRef = doc(db, 'affiliates', id);
    const updateData: any = { status };
    if (commissionRate !== undefined) updateData.commissionRate = commissionRate;
    updateDocumentNonBlocking(affRef, updateData);
  }, [db]);

  const updateAffiliatePix = useCallback((id: string, pixData: { pixType: string; pixKey: string; pixName: string }) => {
    const affRef = doc(db, 'affiliates', id);
    updateDocumentNonBlocking(affRef, pixData);
  }, [db]);

  const requestWithdrawal = useCallback((affId: string, amount: number) => {
    const aff = affiliates.find(a => a.id === affId);
    if (!aff) return;

    const hasPending = withdrawals.some(w => w.affiliateId === affId && w.status === 'pending');
    if (hasPending) return;

    const wId = `WD-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const wRef = doc(db, 'withdrawals', wId);
    
    setDocumentNonBlocking(wRef, {
      id: wId,
      affiliateId: affId,
      affiliateName: aff.name,
      amount: amount,
      status: 'pending',
      createdAt: new Date().toISOString(),
      pixType: aff.pixType || 'N/A',
      pixKey: aff.pixKey || 'N/A',
      pixName: aff.pixName || 'N/A'
    }, { merge: true });
  }, [db, affiliates, withdrawals]);

  const updateWithdrawalStatus = useCallback((withdrawalId: string, status: 'paid' | 'rejected') => {
    const wReq = withdrawals.find(w => w.id === withdrawalId);
    if (!wReq) return;

    const wRef = doc(db, 'withdrawals', withdrawalId);
    updateDocumentNonBlocking(wRef, { status });

    if (status === 'paid') {
      const aff = affiliates.find(a => a.id === wReq.affiliateId);
      if (aff) {
        const affRef = doc(db, 'affiliates', aff.id);
        updateDocumentNonBlocking(affRef, {
          balance: (aff.balance || 0) - wReq.amount
        });
      }
    }
  }, [db, withdrawals, affiliates]);

  const getAffiliateByEmail = useCallback((email: string) => {
    return affiliates.find(a => a.email.toLowerCase() === email.toLowerCase());
  }, [affiliates]);

  return (
    <ProductsContext.Provider value={{ 
      products: products.sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0)), 
      orders,
      affiliates,
      webhookSettings,
      appSettings,
      withdrawals,
      isLoading,
      addProduct, 
      deleteProduct, 
      updateProduct, 
      updateProductsOrder,
      addCredential,
      removeCredential,
      sellCredential,
      addOrder,
      updateWebhookSettings,
      updateAppSettings,
      registerAffiliate,
      updateAffiliateStatus,
      updateAffiliatePix,
      requestWithdrawal,
      updateWithdrawalStatus,
      getAffiliateByEmail
    }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
}
