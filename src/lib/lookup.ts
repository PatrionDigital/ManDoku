/**
 * Combined ISBN lookup strategy.
 * Priority: NDL (Japanese) → Open Library (international fallback).
 */

import type { NdlMetadata } from './types';
import { lookupIsbn } from './ndl';
import { lookupIsbnOpenLibrary } from './openLibrary';

/**
 * Look up an ISBN, trying NDL first (best for Japanese manga),
 * then falling back to Open Library for international ISBNs.
 */
export async function lookupIsbnWithFallback(
  isbn: string
): Promise<NdlMetadata | null> {
  // Try NDL first — primary source for Japanese ISBNs (978-4-xxx)
  try {
    const ndlResult = await lookupIsbn(isbn);
    if (ndlResult) return ndlResult;
  } catch {
    // NDL failed — continue to fallback
  }

  // Fallback to Open Library for non-Japanese or NDL-missing titles
  return lookupIsbnOpenLibrary(isbn);
}
