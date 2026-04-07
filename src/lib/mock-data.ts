
import { StreamingService, Order } from './types';

export const INITIAL_PRODUCTS: StreamingService[] = [
  {
    id: '1',
    name: 'Netflix Premium 4K',
    price: 19.90,
    description: 'Assista em 4 telas simultâneas com qualidade Ultra HD. O melhor do entretenimento sem anúncios.',
    features: ['4 Telas', 'Qualidade 4K HDR', 'Sem anúncios', 'Download disponível'],
    stock: 24,
    imageUrl: 'https://picsum.photos/seed/netflix/800/400',
    active: true,
  },
  {
    id: '2',
    name: 'Disney+ Anual',
    price: 15.00,
    description: 'A casa do Star Wars, Marvel, Pixar e muito mais. Magia ilimitada para toda a família.',
    features: ['2 Telas', 'Acesso Star+', 'Conteúdo exclusivo', 'Qualidade Full HD'],
    stock: 12,
    imageUrl: 'https://picsum.photos/seed/disney/800/400',
    active: true,
  },
  {
    id: '3',
    name: 'HBO Max Gold',
    price: 12.50,
    description: 'As melhores séries da HBO, sucessos do cinema e esportes ao vivo com a UEFA Champions League.',
    features: ['3 Telas', 'Futebol ao vivo', 'Lançamentos Warner', '4K disponível'],
    stock: 8,
    imageUrl: 'https://picsum.photos/seed/max/800/400',
    active: true,
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-001',
    productId: '1',
    productName: 'Netflix Premium 4K',
    customerEmail: 'cliente@exemplo.com',
    status: 'completed',
    date: '2024-03-20T10:30:00Z',
    total: 19.90,
    credentialsSent: true,
  },
  {
    id: 'ORD-002',
    productId: '2',
    productName: 'Disney+ Anual',
    customerEmail: 'marcos@email.com',
    status: 'pending',
    date: '2024-03-21T15:45:00Z',
    total: 15.00,
    credentialsSent: false,
  }
];
