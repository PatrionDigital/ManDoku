import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

export function Header() {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const next = i18n.language === 'ja' ? 'en' : 'ja';
    i18n.changeLanguage(next);
  };

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-primary)] px-4 py-3">
      <Link to="/" className="font-[var(--font-display)] text-xl font-bold text-[var(--color-text-primary)] no-underline">
        {t('app.title')}
      </Link>
      <button
        onClick={toggleLanguage}
        className="rounded-md px-2 py-1 text-sm text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-secondary)]"
        aria-label="Toggle language"
      >
        {i18n.language === 'ja' ? '🇬🇧 EN' : '🇯🇵 JA'}
      </button>
    </header>
  );
}
