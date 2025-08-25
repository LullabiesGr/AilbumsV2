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
    price: 45.49,
    currency: 'USD',
    mode: 'subscription',
    features: [
      'Unlimited photo analysis',
      'Advanced AI features',
      'Priority support',
      '500 Credits',
      'White-label options'
    ]
  },
  {
    id: 'prod_Sv5ftx1zUX7g1R',
    priceId: 'price_1RzFTkCtJc6njTYQ4RuFQ7xz',
    name: 'Pro',
    description: 'Professional plan for serious photographers',
    price: 23.99,
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
    price: 11.49,
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
    id: 'prod_Svn8TJ71J5WFhl',
    priceId: 'price_1RzvYOCtJc6njTYQhEjD0wVH',
    name: 'Ailbums Credits',
    description: 'Extra Credits',
    price: 4.49,
    currency: 'USD',
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