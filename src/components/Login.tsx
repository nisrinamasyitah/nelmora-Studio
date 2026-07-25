import { useState, type FormEvent } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setSubmitting(false);
    if (signInError) {
      setError(signInError.message);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-shell">
        <div className="auth-brand-col">
          <div className="auth-brand-logo" aria-label="NelMora">
            <span>N</span>
            <span className="auth-brand-logo-divider" />
            <span>M</span>
          </div>
          <div className="auth-brand-tag">NELMORA SYSTEM</div>
          <div className="auth-brand-rule" />
          <p className="auth-brand-note">
           A Story in every Scents .
          </p>
        </div>

        <div className="auth-form-col">
          <h1 className="auth-heading">Sign in</h1>
          <p className="auth-sub">Enter your details to continue.</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="field">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@nelmora.com.my"
                autoComplete="username"
                required
              />
            </div>
            <div className="field">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
