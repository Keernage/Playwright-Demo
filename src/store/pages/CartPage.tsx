import { findProduct, formatPrice } from '../data';
import { navigate } from '../../router';
import { useStore } from '../StoreContext';

export function CartPage() {
  const { cart, subtotal, setQuantity, removeFromCart } = useStore();

  return (
    <section>
      <div className="page-head">
        <h1>Your cart</h1>
        <a href="#/store/products" className="link">
          ← Continue shopping
        </a>
      </div>

      {cart.length === 0 ? (
        <div className="empty" data-testid="empty-cart">
          Your cart is empty.
        </div>
      ) : (
        <ul className="cart-list">
          {cart.map((line) => {
            const product = findProduct(line.productId);
            if (!product) return null;
            return (
              <li key={line.productId} className="card cart-line" data-testid="cart-line" data-product-id={product.id}>
                <span className="cart-art" aria-hidden="true">
                  {product.emoji}
                </span>
                <div className="cart-info">
                  <strong data-testid="cart-line-name">{product.name}</strong>
                  <span className="muted small">{formatPrice(product.price)} each</span>
                </div>
                <div className="qty" role="group" aria-label={`Quantity for ${product.name}`}>
                  <button
                    type="button"
                    className="btn btn-icon"
                    aria-label="Decrease quantity"
                    data-testid="qty-decrease"
                    onClick={() => setQuantity(product.id, line.quantity - 1)}
                  >
                    −
                  </button>
                  <span data-testid="cart-line-qty">{line.quantity}</span>
                  <button
                    type="button"
                    className="btn btn-icon"
                    aria-label="Increase quantity"
                    data-testid="qty-increase"
                    onClick={() => setQuantity(product.id, line.quantity + 1)}
                  >
                    +
                  </button>
                </div>
                <span className="price" data-testid="cart-line-total">
                  {formatPrice(product.price * line.quantity)}
                </span>
                <button
                  type="button"
                  className="btn btn-ghost small"
                  data-testid="remove-line"
                  onClick={() => removeFromCart(product.id)}
                >
                  Remove
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="card summary">
        <div className="summary-row">
          <span>Subtotal</span>
          <strong data-testid="cart-subtotal">{formatPrice(subtotal)}</strong>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-block"
          data-testid="checkout-button"
          disabled={cart.length === 0}
          onClick={() => navigate('/store/checkout')}
        >
          Proceed to checkout
        </button>
      </div>
    </section>
  );
}
