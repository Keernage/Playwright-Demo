import type { ReactNode } from 'react';
import { navigate } from '../router';
import { useStore } from './StoreContext';

export function StoreLayout({ children }: { children: ReactNode }) {
  const { user, cartCount, logout } = useStore();

  return (
    <div className="store">
      <div className="store-header">
        <a className="store-logo" href={user ? '#/store/products' : '#/store/login'}>
          Shop<strong>Lite</strong>
          <span className="store-tag">demo store</span>
        </a>
        {user && (
          <div className="store-actions">
            <span className="store-user" data-testid="current-user">
              {user.name}
            </span>
            <a className="cart-link" href="#/store/cart" data-testid="cart-link">
              Cart
              <span className="cart-badge" data-testid="cart-count" aria-label={`${cartCount} items in cart`}>
                {cartCount}
              </span>
            </a>
            <button
              type="button"
              className="btn btn-ghost"
              data-testid="logout"
              onClick={() => {
                logout();
                navigate('/store/login');
              }}
            >
              Log out
            </button>
          </div>
        )}
      </div>
      <div className="store-body">{children}</div>
    </div>
  );
}
