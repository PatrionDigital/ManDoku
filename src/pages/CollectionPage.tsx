import { useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCollection } from '../hooks/useCollection';
import { groupVolumesIntoSeries } from '../lib/series';
import { useCollectionStore } from '../stores/collectionStore';
import { CollectionGrid } from '../components/collection/CollectionGrid';
import { CollectionCarousel } from '../components/collection/CollectionCarousel';
import { ViewToggle } from '../components/collection/ViewToggle';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export function CollectionPage() {
  const { profile } = useAuth();
  const { volumes, isLoading } = useCollection(profile?.householdId ?? null);
  const { viewMode } = useCollectionStore();
  const series = useMemo(() => groupVolumesIntoSeries(volumes), [volumes]);

  if (isLoading) return <LoadingSpinner />;

  if (series.length === 0) return <EmptyState />;

  return (
    <div>
      <div className="flex items-center justify-end px-4 pt-4">
        <ViewToggle />
      </div>
      {viewMode === 'grid' ? (
        <CollectionGrid series={series} />
      ) : (
        <CollectionCarousel series={series} />
      )}
    </div>
  );
}
