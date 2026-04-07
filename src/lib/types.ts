
export type AccountCredential = {
  id: string;
  email: string;
  password: string;
  screenName: string;
  screenPassword?: string;
  addedAt: string;
  sold: boolean;
};

export type StreamingService = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  description: string;
  features: string[];
  stock: number;
  imageUrl: string;
  active: boolean;
  isPromotion: boolean;
  isRevenda?: boolean;
  sortOrder?: number;
  credentials?: AccountCredential[];
};

export type OrderStatus = 'pending' | 'completed' | 'cancelled';

export type DeliveredCredential = {
  productName: string;
  email: string;
  pass: string;
  screen: string;
  screenPass?: string;
  isRevenda?: boolean;
};

export type Order = {
  id: string;
  customerName: string;
  customerPhone: string;
  status: OrderStatus;
  date: string;
  total: number;
  items: DeliveredCredential[];
  affiliateId?: string | null;
};

export type WebhookConfig = {
  url: string;
  enabled: boolean;
  fields: {
    orderId: boolean;
    customerName: boolean;
    customerPhone: boolean;
    total: boolean;
    items: boolean;
  };
};

export type AffiliateStatus = 'pending' | 'active' | 'rejected';

export type Affiliate = {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  password: string;
  status: AffiliateStatus;
  balance: number;
  totalSalesVolume: number;
  commissionRate?: number;
  createdAt: string;
  pixType?: string;
  pixKey?: string;
  pixName?: string;
};

export type WithdrawalStatus = 'pending' | 'paid' | 'rejected';

export type WithdrawalRequest = {
  id: string;
  affiliateId: string;
  affiliateName: string;
  amount: number;
  status: WithdrawalStatus;
  createdAt: string;
  pixType: string;
  pixKey: string;
  pixName: string;
};

export type Commission = {
  id: string;
  affiliateId: string;
  orderId: string;
  amount: number;
  date: string;
};

export type AppSettings = {
  defaultCommissionRate: number;
};
