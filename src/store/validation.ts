export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface CheckoutForm {
  fullName: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
}

export type CheckoutErrors = Partial<Record<keyof CheckoutForm, string>>;

export const EMPTY_CHECKOUT: CheckoutForm = {
  fullName: '',
  email: '',
  address: '',
  city: '',
  postalCode: '',
  cardNumber: '',
  expiry: '',
  cvc: '',
};

function passesLuhn(digits: string): boolean {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

export function validateCheckout(form: CheckoutForm, now: Date = new Date()): CheckoutErrors {
  const errors: CheckoutErrors = {};

  if (!form.fullName.trim()) errors.fullName = 'Full name is required';

  if (!form.email.trim()) errors.email = 'Email is required';
  else if (!EMAIL_PATTERN.test(form.email.trim())) errors.email = 'Enter a valid email address';

  if (!form.address.trim()) errors.address = 'Address is required';
  if (!form.city.trim()) errors.city = 'City is required';

  if (!form.postalCode.trim()) errors.postalCode = 'Postal code is required';
  else if (!/^\d{5}$/.test(form.postalCode.trim())) errors.postalCode = 'Postal code must be 5 digits';

  const card = form.cardNumber.replace(/[\s-]/g, '');
  if (!card) errors.cardNumber = 'Card number is required';
  else if (!/^\d{16}$/.test(card) || !passesLuhn(card)) errors.cardNumber = 'Enter a valid 16-digit card number';

  const expiry = form.expiry.trim().match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
  if (!form.expiry.trim()) errors.expiry = 'Expiry date is required';
  else if (!expiry) errors.expiry = 'Use MM/YY format';
  else {
    const month = Number(expiry[1]);
    const year = 2000 + Number(expiry[2]);
    // A card is valid until the end of its expiry month.
    if (new Date(year, month, 1) <= now) errors.expiry = 'Card has expired';
  }

  if (!form.cvc.trim()) errors.cvc = 'CVC is required';
  else if (!/^\d{3}$/.test(form.cvc.trim())) errors.cvc = 'CVC must be 3 digits';

  return errors;
}
