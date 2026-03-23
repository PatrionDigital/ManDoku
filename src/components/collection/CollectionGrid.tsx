import type { MangaSeries } from '../../lib/types';
import { SeriesCard } from './SeriesCard';
import { useCollectionStore } from '../../stores/collectionStore';

interface CollectionGridProps {
  series: MangaSeries[];
}

export function CollectionGrid({ series }: CollectionGridProps) {
  const { setExpandedSeries } = useCollectionStore();

  return (
    <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {series.map((s) => (
        <SeriesCard
          key={s.seriesName}
          series={s}
          onClick={() => setExpandedSeries(s.seriesName)}
        />
      ))}
    </div>
  );
}
