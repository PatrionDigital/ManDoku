import { useTranslation } from 'react-i18next';
import { useCollectionStore } from '../../stores/collectionStore';

export function ViewToggle() {
  const { t } = useTranslation();
  const { viewMode, setViewMode } = useCollectionStore();

  return (
    <div className="inline-flex rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
      <button
        onClick={() => setViewMode('grid')}
        className={`rounded-l-lg px-4 py-1.5 text-sm font-medium transition-colors ${
          viewMode === 'grid'
            ? 'bg-[var(--color-accent)] text-white'
            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
        }`}
      >
        {t('collection.grid')}
      </button>
      <button
        onClick={() => setViewMode('carousel')}
        className={`rounded-r-lg px-4 py-1.5 text-sm font-medium transition-colors ${
          viewMode === 'carousel'
            ? 'bg-[var(--color-accent)] text-white'
            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
        }`}
      >
        {t('collection.carousel')}
      </button>
    </div>
  );
}
