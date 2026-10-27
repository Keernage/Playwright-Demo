import { type FormEvent, useState } from 'react';
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE, formatPrice } from '../data';
import { navigate } from '../../router';
import { useStore } from '../StoreContext';
import { type CheckoutErrors, type CheckoutForm, EMPTY_CHECKOUT, validateCheckout } from '../validation';

const FIELDS: { name: keyof CheckoutForm; label: string; autoComplete: string; inputMode?: 'numeric'; placeholder?: string; wide?: boolean }[] = [
  { name: 'fullName', label: 'Full name', autoComplete: 'name', wide: true },
  { name: 'email', label: 'Email', autoComplete: 'email', wide: true },
  { name: 'address', label: 'Street address', autoComplete: 'street-address', wide: true },
  { name: 'city', label: 'City', autoComplete: 'address-level2' },
  { name: 'postalCode', label: 'Postal code', autoComplete: 'postal-code', inputMode: 'numeric' },
  { name: 'cardNumber', label: 'Card number', autoComplete: 'cc-number', inputMode: 'numeric', placeholder: '4242 4242 4242 4242', wide: true },
  { name: 'expiry', label: 'Expiry (MM/YY)', autoComplete: 'cc-exp', placeholder: 'MM/YY' },
  { name: 'cvc', label: 'CVC', autoComplete: 'cc-csc', inputMode: 'numeric' },
];

export function CheckoutPage() {
  const { cart, subtotal, placeOrder } = useStore();
  const [form, setForm] = useState<CheckoutForm>(EMPTY_CHECKOUT);
  const [errors, setErrors] = useState<CheckoutErrors>({});

  if (cart.length === 0) {
    return (
      <div className="empty" data-testid="checkout-empty">
        Your cart is empty. <a href="#/store/products" className="link">Browse products</a>
      </div>
    );
  }

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const found = validateCheckout(form);
    setErrors(found);
    if (Object.keys(found).length === 0) {
      placeOrder();
      navigate('/store/confirmation');
    }
  };

  const errorCount = Object.keys(errors).length;

  return (
    <section className="checkout">
      <form className="card" onSubmit={onSubmit} noValidate data-testid="checkout-form">
        <h1>Checkout</h1>
        {errorCount > 0 && (
          <p className="alert alert-error" role="alert" data-testid="checkout-error-summary">
            Please fix {errorCount} {errorCount === 1 ? 'field' : 'fields'} before placing your order.
          </p>
        )}
        <div className="form-grid">
          {FIELDS.map((f) => (
            <label key={f.name} className={`field${f.wide ? ' wide' : ''}`}>
              <span>{f.label}</span>
              <input
                name={f.name}
                autoComplete={f.autoComplete}
                inputMode={f.inputMode}
                placeholder={f.placeholder}
                data-testid={`checkout-${f.name}`}
                aria-invalid={errors[f.name] ? true : undefined}
                value={form[f.name]}
                onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
              />
              {errors[f.name] && (
                <small className="field-error" data-testid={`error-${f.name}`}>
                  {errors[f.name]}
                </small>
              )}
            </label>
          ))}
        </div>
        <button className="btn btn-primary btn-block" type="submit" data-testid="place-order">
          Place order · {formatPrice(subtotal + shipping)}
        </button>
        <p className="muted small">Demo only. No payment is processed and nothing leaves your browser.</p>
      </form>

      <aside className="card summary">
        <h2>Order summary</h2>
        <div className="summary-row">
          <span>Subtotal</span>
          <span data-testid="summary-subtotal">{formatPrice(subtotal)}</span>
        </div>
        <div className="summary-row">
          <span>Shipping</span>
          <span data-testid="summary-shipping">{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
        </div>
        <div className="summary-row total">
          <span>Total</span>
          <strong data-testid="summary-total">{formatPrice(subtotal + shipping)}</strong>
        </div>
      </aside>
    </section>
  );
}
