import { describe, it, expect, vi, beforeEach } from 'vitest';
import { normalizeIsbn } from '../lib/isbn';
import { lookupIsbnWithFallback } from '../lib/lookup';
import * as ndl from '../lib/ndl';
import * as openLibrary from '../lib/openLibrary';

/**
 * Integration tests for the full scan-to-shelf pipeline.
 * Tests the complete flow: barcode → normalize → lookup → result handling
 */

const japaneseManga = {
  title: '鬼滅の刃 23',
  author: '吾峠呼世晴',
  publisher: '集英社',
  publishDate: '2020-12',
  volumeNumber: 23,
  seriesName: '鬼滅の刃',
  thumbnailUrl: '/api/ndl-thumb/9784088824994.jpg',
};

const englishManga = {
  title: 'My Hero Academia, Vol. 8',
  author: 'Kohei Horikoshi',
  publisher: 'VIZ Media LLC',
  volumeNumber: 8,
  seriesName: 'My Hero Academia',
  thumbnailUrl: 'https://covers.openlibrary.org/b/id/8408875-M.jpg',
};

describe('scan-to-shelf pipeline', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('step 1: barcode normalization', () => {
    it('normalizes a standard EAN-13 manga barcode', () => {
      expect(normalizeIsbn('9784088824994')).toBe('9784088824994');
    });

    it('fixes leading-zero bug from scanner (12 digits → 13)', () => {
      const result = normalizeIsbn('614141999996');
      expect(result).toBe('0614141999996');
      expect(result).toHaveLength(13);
    });

    it('converts ISBN-10 from manual input to ISBN-13', () => {
      const result = normalizeIsbn('4088820231');
      expect(result).toBe('9784088820231');
    });

    it('handles hyphenated ISBN from manual input', () => {
      expect(normalizeIsbn('978-4-08-882023-1')).toBe('9784088820231');
    });

    it('rejects garbage input', () => {
      expect(normalizeIsbn('not-an-isbn')).toBeNull();
      expect(normalizeIsbn('')).toBeNull();
    });
  });

  describe('step 2: metadata lookup with fallback', () => {
    it('finds Japanese manga via NDL (primary path)', async () => {
      vi.spyOn(ndl, 'lookupIsbn').mockResolvedValue(japaneseManga);
      vi.spyOn(openLibrary, 'lookupIsbnOpenLibrary');

      const result = await lookupIsbnWithFallback('9784088824994');

      expect(result).toEqual(japaneseManga);
      expect(ndl.lookupIsbn).toHaveBeenCalledWith('9784088824994');
      expect(openLibrary.lookupIsbnOpenLibrary).not.toHaveBeenCalled();
    });

    it('falls back to Open Library for English manga', async () => {
      vi.spyOn(ndl, 'lookupIsbn').mockResolvedValue(null);
      vi.spyOn(openLibrary, 'lookupIsbnOpenLibrary').mockResolvedValue(englishManga);

      const result = await lookupIsbnWithFallback('9781421585116');

      expect(result).toEqual(englishManga);
      expect(openLibrary.lookupIsbnOpenLibrary).toHaveBeenCalledWith('9781421585116');
    });

    it('falls back to Open Library when NDL errors', async () => {
      vi.spyOn(ndl, 'lookupIsbn').mockRejectedValue(new Error('fetch failed'));
      vi.spyOn(openLibrary, 'lookupIsbnOpenLibrary').mockResolvedValue(englishManga);

      const result = await lookupIsbnWithFallback('9781421585116');
      expect(result).toEqual(englishManga);
    });

    it('returns null when both NDL and OL find nothing', async () => {
      vi.spyOn(ndl, 'lookupIsbn').mockResolvedValue(null);
      vi.spyOn(openLibrary, 'lookupIsbnOpenLibrary').mockResolvedValue(null);

      const result = await lookupIsbnWithFallback('9999999999999');
      expect(result).toBeNull();
    });
  });

  describe('step 3: full pipeline (normalize → lookup)', () => {
    it('handles scan → normalize → NDL lookup for Japanese ISBN', async () => {
      vi.spyOn(ndl, 'lookupIsbn').mockResolvedValue(japaneseManga);

      const scannedBarcode = '9784088824994';
      const isbn = normalizeIsbn(scannedBarcode);
      expect(isbn).toBe('9784088824994');

      const metadata = await lookupIsbnWithFallback(isbn!);
      expect(metadata).not.toBeNull();
      expect(metadata!.title).toBe('鬼滅の刃 23');
      expect(metadata!.seriesName).toBe('鬼滅の刃');
      expect(metadata!.volumeNumber).toBe(23);
    });

    it('handles scan → normalize → OL fallback for English ISBN', async () => {
      vi.spyOn(ndl, 'lookupIsbn').mockResolvedValue(null);
      vi.spyOn(openLibrary, 'lookupIsbnOpenLibrary').mockResolvedValue(englishManga);

      const scannedBarcode = '9781421585116';
      const isbn = normalizeIsbn(scannedBarcode);
      expect(isbn).toBe('9781421585116');

      const metadata = await lookupIsbnWithFallback(isbn!);
      expect(metadata).not.toBeNull();
      expect(metadata!.title).toBe('My Hero Academia, Vol. 8');
      expect(metadata!.seriesName).toBe('My Hero Academia');
    });

    it('handles scan → normalize → both fail gracefully', async () => {
      vi.spyOn(ndl, 'lookupIsbn').mockResolvedValue(null);
      vi.spyOn(openLibrary, 'lookupIsbnOpenLibrary').mockResolvedValue(null);

      const isbn = normalizeIsbn('9784088824994');
      const metadata = await lookupIsbnWithFallback(isbn!);
      expect(metadata).toBeNull();
      // UI should show "not found" and allow manual entry or re-scan
    });
  });
});
