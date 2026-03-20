import type { NdlMetadata } from './types';

const OPENSEARCH_BASE = '/api/ndl/opensearch';
const THUMBNAIL_BASE = '/api/ndl-thumb';

/**
 * Extract volume number from a manga title string.
 * Handles patterns: 巻X, 第X巻, Vol.X, trailing digits, X巻
 */
export function extractVolumeNumber(title: string, dcndlVolume?: string): number {
  if (dcndlVolume) {
    const num = parseInt(dcndlVolume, 10);
    if (!isNaN(num)) return num;
  }

  const patterns = [
    /第(\d+)巻/,
    /巻(\d+)/,
    /[Vv]ol\.?\s*(\d+)/,
    /(\d+)巻/,
    /\s(\d+)$/,
    /\s(\d+)\s*$/,
  ];

  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) {
      return parseInt(match[1], 10);
    }
  }

  return 1;
}

/**
 * Extract series name by stripping volume indicators from title.
 */
export function extractSeriesName(title: string): string {
  let name = title
    .replace(/第\d+巻/, '')
    .replace(/巻\d+/, '')
    .replace(/\d+巻/, '')
    .replace(/[Vv]ol\.?\s*\d+/, '')
    .replace(/\s+\d+\s*$/, '')
    .trim();

  // Remove trailing punctuation artifacts
  name = name.replace(/[\s　]+$/, '').replace(/[,、，]\s*$/, '');

  return name || title;
}

/**
 * Build thumbnail URL for a given ISBN.
 */
export function getThumbnailUrl(isbn: string): string {
  return `${THUMBNAIL_BASE}/${isbn}.jpg`;
}

/**
 * Fetch metadata for a manga volume from NDL OpenSearch API.
 */
export async function lookupIsbn(isbn: string): Promise<NdlMetadata | null> {
  const res = await fetch(`${OPENSEARCH_BASE}?isbn=${isbn}`);
  if (!res.ok) return null;

  const text = await res.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'application/xml');

  const item = doc.querySelector('item');
  if (!item) return null;

  const getTextContent = (selector: string): string => {
    const el = item.querySelector(selector);
    return el?.textContent?.trim() ?? '';
  };

  // Use namespace-aware querying for DC elements
  const getNsTextContent = (localName: string): string => {
    const els = item.getElementsByTagName(localName);
    if (els.length > 0) return els[0].textContent?.trim() ?? '';
    // Try with dc: prefix
    const dcEls = item.getElementsByTagName(`dc:${localName}`);
    if (dcEls.length > 0) return dcEls[0].textContent?.trim() ?? '';
    return '';
  };

  const title = getTextContent('title') || getNsTextContent('title');
  const author = getNsTextContent('creator') || getTextContent('author');
  const publisher = getNsTextContent('publisher');

  // dcndl:volume
  const volumeEls = item.getElementsByTagName('dcndl:volume');
  const dcndlVolume = volumeEls.length > 0 ? volumeEls[0].textContent?.trim() : undefined;

  // dcterms:issued
  const issuedEls = item.getElementsByTagName('dcterms:issued');
  const publishDate = issuedEls.length > 0 ? issuedEls[0].textContent?.trim() : undefined;

  if (!title) return null;

  const volumeNumber = extractVolumeNumber(title, dcndlVolume);
  const seriesName = extractSeriesName(title);

  return {
    title,
    author,
    publisher,
    publishDate,
    volumeNumber,
    seriesName,
    thumbnailUrl: getThumbnailUrl(isbn),
  };
}
