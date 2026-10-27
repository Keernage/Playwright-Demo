import { type ComponentType, useEffect } from 'react';
import { Dashboard } from './dashboard/Dashboard';
import { navigate, useRoute } from './router';
import { useStore } from './store/StoreContext';
import { StoreLayout } from './store/StoreLayout';
import { LoginPage } from './store/pages/LoginPage';
import { ProductsPage } from './store/pages/ProductsPage';
import { CartPage } from './store/pages/CartPage';
import { CheckoutPage } from './store/pages/CheckoutPage';
import { ConfirmationPage } from './store/pages/ConfirmationPage';

const PROTECTED: Record<string, ComponentType> = {
  '/store/products': ProductsPage,
  '/store/cart': CartPage,
  '/store/checkout': CheckoutPage,
  '/store/confirmation': ConfirmationPage,
};

function StoreRoutes({ path }: { path: string }) {
  const { user } = useStore();
  const Page = PROTECTED[path];

  useEffect(() => {
    if (Page && !user) navigate('/store/login');
    else if (path === '/store/login' && user) navigate('/store/products');
    else if (!Page && path !== '/store/login') navigate(user ? '/store/products' : '/store/login');
  }, [Page, path, user]);

  if (Page && user) return <Page />;
  return <LoginPage />;
}

export function App() {
  const path = useRoute();
  const inStore = path.startsWith('/store');

  useEffect(() => {
    document.title = inStore ? 'ShopLite · Demo Store' : 'QA Studio · Test Dashboard';
  }, [inStore]);

  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href="#/">
          <span className="brand-mark" aria-hidden="true">✓</span>
          QA Studio
        </a>
        <nav className="topnav" aria-label="Primary">
          <a href="#/" aria-current={!inStore ? 'page' : undefined}>Dashboard</a>
          <a href="#/store/login" aria-current={inStore ? 'page' : undefined}>Demo store</a>
        </nav>
      </header>
      <main className="main">
        {inStore ? (
          <StoreLayout>
            <StoreRoutes path={path} />
          </StoreLayout>
        ) : (
          <Dashboard />
        )}
      </main>
      <footer className="footer">
        Portfolio demo · React + TypeScript + Playwright · all data is fictional
      </footer>
    </div>
  );
}
