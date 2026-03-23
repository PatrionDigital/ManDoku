import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';

export function SettingsPage() {
  const { t } = useTranslation();
  const { profile, signOut } = useAuth();

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-xl font-medium text-[var(--color-text-primary)]">
        {t('app.settings')}
      </h2>

      {profile && (
        <div className="rounded-lg bg-[var(--color-bg-card)] p-4">
          <p className="text-[var(--color-text-primary)]">{profile.displayName}</p>
          <p className="text-sm text-[var(--color-text-secondary)]">{profile.locale}</p>
        </div>
      )}

      <button
        onClick={signOut}
        className="w-full rounded-lg border border-red-400/50 py-2.5 font-medium text-red-400 transition-colors hover:bg-red-400/10"
      >
        {t('auth.logout')}
      </button>
    </div>
  );
}
