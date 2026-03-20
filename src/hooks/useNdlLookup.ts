import { useQuery } from '@tanstack/react-query';
import { lookupIsbn } from '../lib/ndl';

export function useNdlLookup(isbn: string | null) {
  return useQuery({
    queryKey: ['ndl', isbn],
    queryFn: () => lookupIsbn(isbn!),
    enabled: !!isbn && isbn.length === 13,
    staleTime: 1000 * 60 * 60 * 24, // 24h — bibliographic data doesn't change
    retry: 2,
  });
}
