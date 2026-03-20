import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SupabaseAdapter } from '../lib/storage';
import type { MangaVolume } from '../lib/types';

const adapter = new SupabaseAdapter();

export function useCollection(householdId: string | null) {
  const queryClient = useQueryClient();

  const volumesQuery = useQuery({
    queryKey: ['volumes', householdId],
    queryFn: () => adapter.getAllVolumes(householdId!),
    enabled: !!householdId,
    staleTime: 1000 * 60 * 5,
  });

  const addMutation = useMutation({
    mutationFn: (volume: Omit<MangaVolume, 'id'>) => adapter.addVolume(volume),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['volumes', householdId] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => adapter.removeVolume(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['volumes', householdId] });
    },
  });

  return {
    volumes: volumesQuery.data ?? [],
    isLoading: volumesQuery.isLoading,
    error: volumesQuery.error,
    addVolume: addMutation.mutateAsync,
    removeVolume: removeMutation.mutateAsync,
    isAdding: addMutation.isPending,
    isRemoving: removeMutation.isPending,
  };
}
