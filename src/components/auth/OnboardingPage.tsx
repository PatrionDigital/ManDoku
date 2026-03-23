import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

export function OnboardingPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose');
  const [householdName, setHouseholdName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [resultCode, setResultCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError(null);

    const { data, error: dbError } = await supabase
      .from('households')
      .insert({ name: householdName, created_by: user.id })
      .select()
      .single();

    if (dbError) {
      setError(dbError.message);
      setLoading(false);
      return;
    }

    await supabase
      .from('profiles')
      .update({ household_id: data.id })
      .eq('id', user.id);

    setResultCode(data.invite_code);
    setLoading(false);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError(null);

    const { error: rpcError } = await supabase.rpc('join_household', {
      code: inviteCode.toLowerCase(),
    });

    if (rpcError) {
      setError(rpcError.message);
      setLoading(false);
      return;
    }

    navigate('/');
  };

  if (resultCode) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-[var(--color-bg-primary)] px-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <h1 className="font-[var(--font-display)] text-2xl text-[var(--color-text-primary)]">
            {t('onboarding.yourCode', { code: resultCode.toUpperCase() })}
          </h1>
          <p className="text-[var(--color-text-secondary)]">{t('onboarding.shareCode')}</p>
          <button
            onClick={() => navigate('/')}
            className="w-full rounded-lg bg-[var(--color-accent)] py-2.5 font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
          >
            {t('app.collection')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-[var(--color-bg-primary)] px-4">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-center font-[var(--font-display)] text-2xl text-[var(--color-text-primary)]">
          {t('onboarding.title')}
        </h1>

        {mode === 'choose' && (
          <div className="space-y-3">
            <button
              onClick={() => setMode('create')}
              className="w-full rounded-lg bg-[var(--color-accent)] py-3 font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
            >
              {t('onboarding.createHousehold')}
            </button>
            <button
              onClick={() => setMode('join')}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] py-3 font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-bg-card)]"
            >
              {t('onboarding.joinHousehold')}
            </button>
          </div>
        )}

        {mode === 'create' && (
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label htmlFor="householdName" className="mb-1 block text-sm text-[var(--color-text-secondary)]">
                {t('onboarding.householdName')}
              </label>
              <input
                id="householdName"
                type="text"
                value={householdName}
                onChange={(e) => setHouseholdName(e.target.value)}
                required
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[var(--color-accent)] py-2.5 font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
            >
              {t('onboarding.createHousehold')}
            </button>
          </form>
        )}

        {mode === 'join' && (
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label htmlFor="inviteCode" className="mb-1 block text-sm text-[var(--color-text-secondary)]">
                {t('onboarding.inviteCode')}
              </label>
              <input
                id="inviteCode"
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                required
                maxLength={8}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-center font-mono text-lg uppercase tracking-widest text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[var(--color-accent)] py-2.5 font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
            >
              {t('onboarding.joinHousehold')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
