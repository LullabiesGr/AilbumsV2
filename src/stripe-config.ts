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
    description: 'Professional studio plan with unlimited features and priority support',
    price: 34.99,
    currency: 'USD',
    mode: 'subscription',
    features: [
      '500 monthly credits',
      'Unlimited AI photo analysis',
      'Advanced face retouching',
      'AI edit & relighting',
      'Copy look & style transfer',
      'Priority support',
      'API access',
      'White-label options'
    ]
  },
  {
    id: 'prod_Sv5ftx1zUX7g1R',
    priceId: 'price_1RzFTkCtJc6njTYQ4RuFQ7xz',
    name: 'Pro',
    description: 'Professional plan for serious photographers with advanced AI features',
    price: 19.99,
    currency: 'USD',
    mode: 'subscription',
    features: [
      '200 monthly credits',
      'Deep AI analysis',
      'Event-specific prompts',
      'Face retouching',
      'AI edit & relighting',
      'Copy look & style transfer',
      'Priority support',
      'Advanced categorization'
    ]
  },
  {
    id: 'prod_Sv5acvIEHQe77L',
    priceId: 'price_1RzFPGCtJc6njTYQg5yLagWT',
    name: 'Starter',
    description: 'Perfect for getting started with AI photo culling and basic features',
    price: 9.99,
    currency: 'USD',
    mode: 'subscription',
    features: [
      '75 monthly credits',
      'Basic AI analysis',
      'Face detection',
      'Quality scoring',
      'Color labeling',
      'Standard support',
      'Duplicate detection'
    ]
  },
  {
    id: 'prod_Svn8TJ71J5WFhl',
    priceId: 'price_1RzvYOCtJc6njTYQhEjD0wVH',
    name: 'Extra Credits',
    description: 'Additional credits for your account - never expire',
    price: 4.49,
    currency: 'USD',
    mode: 'payment',
    features: [
      '50 additional credits',
      'No expiration date',
      'Add to existing plan',
      'Use for any feature'
    ]
  }
];

export const STRIPE_PRODUCTS = products.reduce((acc, product) => {
  acc[product.name.toLowerCase().replace(/\s+/g, '_')] = product;
  return acc;
}, {} as Record<string, Product>);

export const getProductByPriceId = (priceId: string): Product | undefined => {
  return products.find(product => product.priceId === priceId);
};

export const getProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id);
};

export const getSubscriptionProducts = (): Product[] => {
  return products.filter(product => product.mode === 'subscription');
};

export const getPaymentProducts = (): Product[] => {
  return products.filter(product => product.mode === 'payment');
};