import { describe, it, expect, vi, beforeEach } from 'vitest';
import { lookupIsbnWithFallback } from '../lib/lookup';
import * as ndl from '../lib/ndl';
import * as openLibrary from '../lib/openLibrary';

const ndlResult = {
  title: '鬼滅の刃 23',
  author: '吾峠呼世晴',
  publisher: '集英社',
  publishDate: '2020-12',
  volumeNumber: 23,
  seriesName: '鬼滅の刃',
  thumbnailUrl: '/api/ndl-thumb/9784088824994.jpg',
};

const olResult = {
  title: 'My Hero Academia, Vol. 8',
  author: 'Kohei Horikoshi',
  publisher: 'VIZ Media LLC',
  volumeNumber: 8,
  seriesName: 'My Hero Academia',
  thumbnailUrl: 'https://covers.openlibrary.org/b/id/8408875-M.jpg',
};

describe('lookupIsbnWithFallback', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns NDL result when available (Japanese ISBN priority)', async () => {
    vi.spyOn(ndl, 'lookupIsbn').mockResolvedValue(ndlResult);
    vi.spyOn(openLibrary, 'lookupIsbnOpenLibrary').mockResolvedValue(olResult);

    const result = await lookupIsbnWithFallback('9784088824994');
    expect(result).toEqual(ndlResult);
    expect(ndl.lookupIsbn).toHaveBeenCalledWith('9784088824994');
    // OL should NOT be called when NDL succeeds
    expect(openLibrary.lookupIsbnOpenLibrary).not.toHaveBeenCalled();
  });

  it('falls back to Open Library when NDL returns null', async () => {
    vi.spyOn(ndl, 'lookupIsbn').mockResolvedValue(null);
    vi.spyOn(openLibrary, 'lookupIsbnOpenLibrary').mockResolvedValue(olResult);

    const result = await lookupIsbnWithFallback('9781421585116');
    expect(result).toEqual(olResult);
    expect(ndl.lookupIsbn).toHaveBeenCalled();
    expect(openLibrary.lookupIsbnOpenLibrary).toHaveBeenCalledWith('9781421585116');
  });

  it('returns null when both NDL and OL return null', async () => {
    vi.spyOn(ndl, 'lookupIsbn').mockResolvedValue(null);
    vi.spyOn(openLibrary, 'lookupIsbnOpenLibrary').mockResolvedValue(null);

    const result = await lookupIsbnWithFallback('9999999999999');
    expect(result).toBeNull();
  });

  it('falls back to Open Library when NDL throws', async () => {
    vi.spyOn(ndl, 'lookupIsbn').mockRejectedValue(new Error('Network error'));
    vi.spyOn(openLibrary, 'lookupIsbnOpenLibrary').mockResolvedValue(olResult);

    const result = await lookupIsbnWithFallback('9781421585116');
    expect(result).toEqual(olResult);
  });

  it('returns null when both NDL throws and OL returns null', async () => {
    vi.spyOn(ndl, 'lookupIsbn').mockRejectedValue(new Error('Network error'));
    vi.spyOn(openLibrary, 'lookupIsbnOpenLibrary').mockResolvedValue(null);

    const result = await lookupIsbnWithFallback('9999999999999');
    expect(result).toBeNull();
  });
});
