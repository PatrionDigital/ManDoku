import { useTranslation } from 'react-i18next';
import NumberFlow from '@number-flow/react';
import type { MangaSeries } from '../../lib/types';

interface SeriesCardProps {
  series: MangaSeries;
  onClick?: () => void;
}

export function SeriesCard({ series, onClick }: SeriesCardProps) {
  const { t } = useTranslation();

  return (
    <button
      onClick={onClick}
      className="group w-full text-left transition-transform hover:scale-[1.02]"
    >
      <div className="overflow-hidden rounded-lg bg-[var(--color-bg-card)] shadow-sm">
        <div className="relative aspect-[2/3] w-full overflow-hidden bg-[var(--color-bg-secondary)]">
          <img
            src={series.latestVolume.thumbnailUrl}
            alt={`${series.seriesName} ${series.latestVolume.volumeNumber}`}
            className="h-full w-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement!.classList.add('flex', 'items-center', 'justify-center', 'p-4');
              const placeholder = document.createElement('span');
              placeholder.className = 'text-center text-sm font-medium text-[var(--color-text-secondary)]';
              placeholder.textContent = `${series.seriesName} ${series.latestVolume.volumeNumber}`;
              target.parentElement!.appendChild(placeholder);
            }}
          />
          <div className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
            <NumberFlow value={series.totalOwned} />
          </div>
        </div>
        <div className="p-3">
          <h3 className="truncate text-sm font-medium text-[var(--color-text-primary)]">
            {series.seriesName}
          </h3>
          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
            {t('collection.latest', { vol: series.latestVolume.volumeNumber })}
          </p>
        </div>
      </div>
    </button>
  );
}
