import { useQuery } from '@tanstack/react-query';
import { lookupIsbnWithFallback } from '../lib/lookup';

export function useNdlLookup(isbn: string | null) {
  return useQuery({
    queryKey: ['isbn-lookup', isbn],
    queryFn: () => lookupIsbnWithFallback(isbn!),
    enabled: !!isbn && isbn.length === 13,
    staleTime: 1000 * 60 * 60 * 24, // 24h — bibliographic data doesn't change
    retry: 2,
  });
}
