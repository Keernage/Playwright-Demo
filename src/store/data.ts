export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  emoji: string;
}

export interface Account {
  email: string;
  password: string;
  name: string;
  locked?: boolean;
}

export const PRODUCTS: Product[] = [
  { id: 'aurora-headphones', name: 'Aurora Wireless Headphones', category: 'Audio', price: 129, emoji: '🎧', description: 'Over-ear, 30h battery, active noise cancelling.' },
  { id: 'nimbus-speaker', name: 'Nimbus Bluetooth Speaker', category: 'Audio', price: 79.5, emoji: '🔊', description: 'Pocket-sized speaker with a surprisingly big sound.' },
  { id: 'trailblazer-backpack', name: 'Trailblazer Backpack', category: 'Outdoor', price: 64.99, emoji: '🎒', description: '28L, water resistant, padded laptop sleeve.' },
  { id: 'summit-bottle', name: 'Summit Water Bottle', category: 'Outdoor', price: 24, emoji: '🧴', description: 'Insulated steel, keeps drinks cold for 24 hours.' },
  { id: 'pixel-keyboard', name: 'Pixel Mechanical Keyboard', category: 'Computing', price: 99, emoji: '⌨️', description: 'Hot-swappable switches, compact 75% layout.' },
  { id: 'glide-mouse', name: 'Glide Wireless Mouse', category: 'Computing', price: 39.99, emoji: '🖱️', description: 'Silent clicks, 70-day battery life.' },
  { id: 'lumen-lamp', name: 'Lumen Desk Lamp', category: 'Home', price: 45, emoji: '💡', description: 'Dimmable LED with adjustable colour temperature.' },
  { id: 'brew-grinder', name: 'Brew Pro Coffee Grinder', category: 'Home', price: 89, emoji: '☕', description: 'Conical burr grinder with 40 grind settings.' },
];

// Fictional demo accounts. Never put real credentials in a demo app.
export const ACCOUNTS: Account[] = [
  { email: 'standard@shoplite.test', password: 'Password123!', name: 'Sam Standard' },
  { email: 'locked@shoplite.test', password: 'Password123!', name: 'Lee Locked', locked: true },
];

export const FREE_SHIPPING_THRESHOLD = 100;
export const SHIPPING_FEE = 5.99;

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
export const formatPrice = (value: number) => currency.format(value);

export function findProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function searchProducts(query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return PRODUCTS;
  return PRODUCTS.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
}
