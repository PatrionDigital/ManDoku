/**
 * Open Library API integration — used as a fallback when NDL doesn't find results.
 * Primarily useful for non-Japanese ISBNs (English-language manga releases).
 */

import type { NdlMetadata } from './types';
import { extractVolumeNumber, extractSeriesName } from './ndl';

const OPEN_LIBRARY_API = 'https://openlibrary.org/api/books';

interface OpenLibraryBook {
  title?: string;
  authors?: Array<{ name: string; url?: string }>;
  publishers?: Array<{ name: string }>;
  publish_date?: string;
  cover?: {
    small?: string;
    medium?: string;
    large?: string;
  };
  url?: string;
  key?: string;
}

type OpenLibraryResponse = Record<string, OpenLibraryBook>;

/**
 * Parse an Open Library API response into NdlMetadata format.
 */
export function parseOpenLibraryResponse(
  data: OpenLibraryResponse,
  isbn: string
): NdlMetadata | null {
  const key = `ISBN:${isbn}`;
  const book = data[key];
  if (!book || !book.title) return null;

  const title = book.title;
  const author = book.authors?.[0]?.name ?? '';
  const publisher = book.publishers?.[0]?.name ?? '';
  const publishDate = book.publish_date;
  const thumbnailUrl =
    book.cover?.medium ??
    book.cover?.large ??
    book.cover?.small ??
    `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`;

  const volumeNumber = extractVolumeNumber(title);
  const seriesName = extractSeriesName(title);

  return {
    title,
    author,
    publisher,
    publishDate,
    volumeNumber,
    seriesName,
    thumbnailUrl,
  };
}

/**
 * Look up an ISBN via the Open Library Books API.
 * Returns NdlMetadata-compatible result, or null if not found.
 */
export async function lookupIsbnOpenLibrary(
  isbn: string
): Promise<NdlMetadata | null> {
  try {
    const url = `${OPEN_LIBRARY_API}?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data: OpenLibraryResponse = await res.json();
    return parseOpenLibraryResponse(data, isbn);
  } catch {
    return null;
  }
}
