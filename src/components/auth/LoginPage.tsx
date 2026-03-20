import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../hooks/useAuth';

export function LoginPage() {
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await signIn(email, password);
    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="flex min-h-svh items-center justify-center bg-[var(--color-bg-primary)] px-4">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-center font-[var(--font-display)] text-3xl text-[var(--color-text-primary)]">
          {t('auth.login')}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm text-[var(--color-text-secondary)]">
              {t('auth.email')}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm text-[var(--color-text-secondary)]">
              {t('auth.password')}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[var(--color-accent)] py-2.5 font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
          >
            {t('auth.login')}
          </button>
        </form>

        <p className="text-center text-sm text-[var(--color-text-secondary)]">
          {t('auth.noAccount')}{' '}
          <Link to="/signup" className="text-[var(--color-accent)] hover:underline">
            {t('auth.signup')}
          </Link>
        </p>
      </div>
    </div>
  );
}
