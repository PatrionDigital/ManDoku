import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../hooks/useAuth';

export function SignupPage() {
  const { t, i18n } = useTranslation();
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [locale, setLocale] = useState<'ja' | 'en'>(
    i18n.language.startsWith('ja') ? 'ja' : 'en'
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await signUp(email, password, displayName, locale);
    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      navigate('/onboarding');
    }
  };

  return (
    <div className="flex min-h-svh items-center justify-center bg-[var(--color-bg-primary)] px-4">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-center font-[var(--font-display)] text-3xl text-[var(--color-text-primary)]">
          {t('auth.signup')}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="displayName" className="mb-1 block text-sm text-[var(--color-text-secondary)]">
              {t('auth.displayName')}
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
            />
          </div>

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
              minLength={6}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-[var(--color-text-secondary)]">Language</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setLocale('ja')}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ${
                  locale === 'ja'
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white'
                    : 'border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]'
                }`}
              >
                🇯🇵 日本語
              </button>
              <button
                type="button"
                onClick={() => setLocale('en')}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ${
                  locale === 'en'
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white'
                    : 'border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]'
                }`}
              >
                🇬🇧 English
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[var(--color-accent)] py-2.5 font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
          >
            {t('auth.signup')}
          </button>
        </form>

        <p className="text-center text-sm text-[var(--color-text-secondary)]">
          {t('auth.hasAccount')}{' '}
          <Link to="/login" className="text-[var(--color-accent)] hover:underline">
            {t('auth.login')}
          </Link>
        </p>
      </div>
    </div>
  );
}
