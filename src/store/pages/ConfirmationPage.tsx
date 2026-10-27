import { useStore } from '../StoreContext';

export function ConfirmationPage() {
  const { lastOrderId } = useStore();

  return (
    <section className="card auth-card center" data-testid="order-confirmation">
      <div className="success-mark" aria-hidden="true">
        ✓
      </div>
      <h1>Thank you for your order!</h1>
      {lastOrderId ? (
        <p>
          Your order number is <strong data-testid="order-id">{lastOrderId}</strong>.
        </p>
      ) : (
        <p className="muted">No recent order found.</p>
      )}
      <a className="btn btn-primary" href="#/store/products">
        Continue shopping
      </a>
    </section>
  );
}
