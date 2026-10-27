import { type FormEvent, useState } from 'react';
import { navigate } from '../../router';
import { useStore } from '../StoreContext';

export function LoginPage() {
  const { login } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    // Simulated network latency: the tests rely on Playwright's auto-waiting,
    // not on fixed sleeps.
    window.setTimeout(() => {
      const result = login(email, password);
      setSubmitting(false);
      if (result.ok) navigate('/store/products');
      else setError(result.error);
    }, 400);
  };

  return (
    <section className="card auth-card">
      <h1>Sign in</h1>
      <p className="muted">Use a demo account to explore the store.</p>
      <form onSubmit={onSubmit} noValidate data-testid="login-form">
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            autoComplete="username"
            data-testid="login-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            autoComplete="current-password"
            data-testid="login-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && (
          <p className="alert alert-error" role="alert" data-testid="login-error">
            {error}
          </p>
        )}
        <button className="btn btn-primary btn-block" type="submit" disabled={submitting} data-testid="login-submit">
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <details className="hint">
        <summary>Demo accounts</summary>
        <ul>
          <li>
            <code>standard@shoplite.test</code> / <code>Password123!</code>
          </li>
          <li>
            <code>locked@shoplite.test</code> / <code>Password123!</code> (locked out)
          </li>
        </ul>
      </details>
    </section>
  );
}
