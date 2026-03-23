import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

export function EmptyState() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <div className="text-6xl">📚</div>
      <p className="text-lg text-[var(--color-text-secondary)]">
        {t('collection.empty')}
      </p>
      <Link
        to="/scan"
        className="rounded-lg bg-[var(--color-accent)] px-6 py-3 font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
      >
        {t('app.scan')}
      </Link>
    </div>
  );
}
