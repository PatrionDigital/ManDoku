import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import NumberFlow from '@number-flow/react';
import type { MangaSeries } from '../../lib/types';

interface CollectionCarouselProps {
  series: MangaSeries[];
}

function CarouselItem({ s }: { s: MangaSeries }) {
  const { t } = useTranslation();
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className="w-[300px] flex-shrink-0 snap-center">
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-[var(--color-bg-secondary)]">
        {imgFailed ? (
          <div className="flex h-full items-center justify-center p-4">
            <span className="text-center font-medium text-[var(--color-text-secondary)]">
              {s.seriesName} {s.latestVolume.volumeNumber}
            </span>
          </div>
        ) : (
          <img
            src={s.latestVolume.thumbnailUrl}
            alt={`${s.seriesName} ${s.latestVolume.volumeNumber}`}
            className="h-full w-full object-cover"
            onError={() => setImgFailed(true)}
          />
        )}
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
  );
}

export function CollectionCarousel({ series }: CollectionCarouselProps) {
  return (
    <div
      className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 py-6"
      style={{ scrollSnapType: 'x mandatory' }}
    >
      {series.map((s) => (
        <CarouselItem key={s.seriesName} s={s} />
      ))}
    </div>
  );
}
