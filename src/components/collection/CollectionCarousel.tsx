import { useTranslation } from 'react-i18next';
import NumberFlow from '@number-flow/react';
import type { MangaSeries } from '../../lib/types';

interface CollectionCarouselProps {
  series: MangaSeries[];
}

export function CollectionCarousel({ series }: CollectionCarouselProps) {
  const { t } = useTranslation();

  return (
    <div
      className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 py-6"
      style={{ scrollSnapType: 'x mandatory' }}
    >
      {series.map((s) => (
        <div
          key={s.seriesName}
          className="w-[300px] flex-shrink-0 snap-center"
        >
          <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-[var(--color-bg-secondary)]">
            <img
              src={s.latestVolume.thumbnailUrl}
              alt={`${s.seriesName} ${s.latestVolume.volumeNumber}`}
              className="h-full w-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-sm font-medium text-white">
              <NumberFlow value={s.totalOwned} />
            </div>
          </div>
          <h3 className="mt-3 text-center text-lg font-medium text-[var(--color-text-primary)]">
            {s.seriesName}
          </h3>
          <p className="text-center text-sm text-[var(--color-text-secondary)]">
            {t('collection.latest', { vol: s.latestVolume.volumeNumber })}
          </p>
        </div>
      ))}
    </div>
  );
}
