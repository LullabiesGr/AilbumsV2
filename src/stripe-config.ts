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
    id: 'prod_S9fh5n5VWeslLF',
    priceId: 'price_1RFMLjCtJc6njTYQdhReQy8b',
    name: 'Studio',
    description: 'Professional studio plan with unlimited features',
    price: 49.00,
    currency: 'EUR',
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
    id: 'prod_S9fftm7cNl7rh6',
    priceId: 'price_1RFMKaCtJc6njTYQvFfgEt3N',
    name: 'Pro',
    description: 'Professional plan for serious photographers',
    price: 24.00,
    currency: 'EUR',
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
    id: 'prod_S9fefG7DklP0i7',
    priceId: 'price_1RFMJNCtJc6njTYQJUh6T8bQ',
    name: 'Starter',
    description: 'Perfect for getting started with AI photo culling',
    price: 9.00,
    currency: 'EUR',
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