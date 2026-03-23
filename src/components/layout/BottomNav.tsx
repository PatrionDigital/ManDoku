import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router';

export function BottomNav() {
  const { t } = useTranslation();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center gap-1 px-4 py-2 text-xs transition-colors ${
      isActive
        ? 'text-[var(--color-accent)]'
        : 'text-[var(--color-text-secondary)]'
    }`;

  return (
    <nav className="sticky bottom-0 z-10 flex items-center justify-around border-t border-[var(--color-border)] bg-[var(--color-bg-primary)] pb-[env(safe-area-inset-bottom)]">
      <NavLink to="/" className={linkClass} end>
        <span className="text-lg">📚</span>
        <span>{t('app.collection')}</span>
      </NavLink>
      <NavLink to="/scan" className={linkClass}>
        <span className="text-lg">📷</span>
        <span>{t('app.scan')}</span>
      </NavLink>
      <NavLink to="/settings" className={linkClass}>
        <span className="text-lg">⚙️</span>
        <span>{t('app.settings')}</span>
      </NavLink>
    </nav>
  );
}
