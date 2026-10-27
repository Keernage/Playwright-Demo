// Central place for test data. When adapting the suite to a real site, point
// these at dedicated test accounts and load secrets from environment variables.
export const USERS = {
  standard: {
    email: process.env.E2E_USER_EMAIL ?? 'standard@shoplite.test',
    password: process.env.E2E_USER_PASSWORD ?? 'Password123!',
    name: 'Sam Standard',
  },
  locked: { email: 'locked@shoplite.test', password: 'Password123!' },
} as const;

/** An expiry date safely in the future, so tests don't start failing on a calendar date. */
function futureExpiry(): string {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String((d.getFullYear() + 3) % 100).padStart(2, '0')}`;
}

export const VALID_CHECKOUT = {
  fullName: 'Alex Tester',
  email: 'alex.tester@example.com',
  address: '1 Quality Street',
  city: 'Springfield',
  postalCode: '12345',
  // Standard public test card number: passes the Luhn check, never charged.
  cardNumber: '4242 4242 4242 4242',
  expiry: futureExpiry(),
  cvc: '123',
};

export const PRODUCTS = {
  headphones: { id: 'aurora-headphones', name: 'Aurora Wireless Headphones', price: 129 },
  mouse: { id: 'glide-mouse', name: 'Glide Wireless Mouse', price: 39.99 },
  bottle: { id: 'summit-bottle', name: 'Summit Water Bottle', price: 24 },
} as const;
