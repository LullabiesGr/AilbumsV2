export interface Product {
  id: string;
  priceId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  mode: 'subscription' | 'payment';
  features?: string[];
}

export const products: Product[] = [
  {
    id: 'prod_Sv5gCm1B1lo20T',
    priceId: 'price_1RzFV8CtJc6njTYQjpSGsjex',
    name: 'Studio',
    description: 'Professional studio plan with unlimited features',
    price: 34.99,
    currency: 'USD',
    mode: 'subscription',
    features: [
      'Unlimited photo analysis',
      'Advanced AI features',
      'Priority support',
      'API access',
      'White-label options'
    ]
  },
  {
    id: 'prod_Sv5ftx1zUX7g1R',
    priceId: 'price_1RzFTkCtJc6njTYQ4RuFQ7xz',
    name: 'Pro',
    description: 'Professional plan for serious photographers',
    price: 19.99,
    currency: 'USD',
    mode: 'subscription',
    features: [
      'Deep AI analysis',
      'Event-specific prompts',
      'Advanced features',
      'Priority support',
      'Face retouching'
    ]
  },
  {
    id: 'prod_Sv5acvIEHQe77L',
    priceId: 'price_1RzFPGCtJc6njTYQg5yLagWT',
    name: 'Starter',
    description: 'Perfect for getting started with AI photo culling',
    price: 9.99,
    currency: 'USD',
    mode: 'subscription',
    features: [
      'Basic AI analysis',
      'Face detection',
      'Quality scoring',
      'Standard support'
    ]
  },
  {
    id: 'prod_S8XTzYuxaHId3q',
    priceId: 'price_1REGOlCtJc6njTYQF3WdxPX6',
    name: 'Ailbums Credits',
    description: 'Extra Credits',
    price: 4.00,
    currency: 'EUR',
    mode: 'payment',
    features: [
      'Additional credits',
      'No expiration',
      'Add to existing plan'
    ]
  }
];

export const getProductByPriceId = (priceId: string): Product | undefined => {
  return products.find(product => product.priceId === priceId);
};

export const getProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id);
};