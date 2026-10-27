import { useMemo, useState } from 'react';
import { formatPrice, searchProducts } from '../data';
import { useStore } from '../StoreContext';

export function ProductsPage() {
  const { cart, addToCart } = useStore();
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchProducts(query), [query]);

  return (
    <section>
      <div className="page-head">
        <h1>Products</h1>
        <input
          type="search"
          className="search"
          placeholder="Search products or categories…"
          aria-label="Search products"
          data-testid="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <p className="muted" data-testid="result-count" aria-live="polite">
        {results.length} {results.length === 1 ? 'product' : 'products'}
      </p>

      {results.length === 0 ? (
        <div className="empty" data-testid="no-results">
          No products match “{query.trim()}”.
        </div>
      ) : (
        <ul className="product-grid">
          {results.map((p) => {
            const inCart = cart.find((l) => l.productId === p.id)?.quantity ?? 0;
            return (
              <li key={p.id} className="card product" data-testid="product-card" data-product-id={p.id}>
                <div className="product-art" aria-hidden="true">
                  {p.emoji}
                </div>
                <span className="chip">{p.category}</span>
                <h2 data-testid="product-name">{p.name}</h2>
                <p className="muted small">{p.description}</p>
                <div className="product-foot">
                  <span className="price" data-testid="product-price">
                    {formatPrice(p.price)}
                  </span>
                  <button
                    type="button"
                    className="btn btn-primary"
                    data-testid="add-to-cart"
                    onClick={() => addToCart(p.id)}
                  >
                    {inCart ? `Add another (${inCart})` : 'Add to cart'}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
