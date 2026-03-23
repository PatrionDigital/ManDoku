import { describe, it, expect, vi, beforeEach } from 'vitest';
import { lookupIsbnOpenLibrary, parseOpenLibraryResponse } from '../lib/openLibrary';

// Sample Open Library API response for a manga volume
const sampleResponse = {
  'ISBN:9781421585116': {
    url: 'https://openlibrary.org/books/OL26404075M/My_Hero_Academia_Vol._8',
    key: '/books/OL26404075M',
    title: 'My Hero Academia, Vol. 8',
    authors: [{ url: '/authors/OL7231814A', name: 'Kohei Horikoshi' }],
    publishers: [{ name: 'VIZ Media LLC' }],
    publish_date: 'Nov 01, 2016',
    cover: {
      small: 'https://covers.openlibrary.org/b/id/8408875-S.jpg',
      medium: 'https://covers.openlibrary.org/b/id/8408875-M.jpg',
      large: 'https://covers.openlibrary.org/b/id/8408875-L.jpg',
    },
  },
};

const emptyResponse = {};

describe('parseOpenLibraryResponse', () => {
  it('extracts metadata from a valid response', () => {
    const result = parseOpenLibraryResponse(sampleResponse, '9781421585116');
    expect(result).not.toBeNull();
    expect(result!.title).toBe('My Hero Academia, Vol. 8');
    expect(result!.author).toBe('Kohei Horikoshi');
    expect(result!.publisher).toBe('VIZ Media LLC');
    expect(result!.thumbnailUrl).toContain('openlibrary.org');
  });

  it('extracts volume number from title', () => {
    const result = parseOpenLibraryResponse(sampleResponse, '9781421585116');
    expect(result!.volumeNumber).toBe(8);
  });

  it('extracts series name from title', () => {
    const result = parseOpenLibraryResponse(sampleResponse, '9781421585116');
    expect(result!.seriesName).toBe('My Hero Academia');
  });

  it('returns null for empty response', () => {
    expect(parseOpenLibraryResponse(emptyResponse, '9781421585116')).toBeNull();
  });

  it('handles missing authors gracefully', () => {
    const noAuthor = {
      'ISBN:9781421585116': {
        title: 'Some Manga',
        publishers: [{ name: 'Publisher' }],
      },
    };
    const result = parseOpenLibraryResponse(noAuthor, '9781421585116');
    expect(result).not.toBeNull();
    expect(result!.author).toBe('');
  });

  it('handles missing publishers gracefully', () => {
    const noPub = {
      'ISBN:9781421585116': {
        title: 'Some Manga',
        authors: [{ name: 'Author' }],
      },
    };
    const result = parseOpenLibraryResponse(noPub, '9781421585116');
    expect(result!.publisher).toBe('');
  });

  it('handles missing cover gracefully', () => {
    const noCover = {
      'ISBN:9781421585116': {
        title: 'Some Manga',
      },
    };
    const result = parseOpenLibraryResponse(noCover, '9781421585116');
    expect(result!.thumbnailUrl).toBeTruthy();
  });
});

describe('lookupIsbnOpenLibrary', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches and parses a valid ISBN', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(sampleResponse),
    } as Response);

    const result = await lookupIsbnOpenLibrary('9781421585116');
    expect(result).not.toBeNull();
    expect(result!.title).toBe('My Hero Academia, Vol. 8');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('9781421585116')
    );
  });

  it('returns null on network error', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));
    const result = await lookupIsbnOpenLibrary('9781421585116');
    expect(result).toBeNull();
  });

  it('returns null on non-ok response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
    } as Response);
    const result = await lookupIsbnOpenLibrary('9781421585116');
    expect(result).toBeNull();
  });

  it('returns null when ISBN not found in response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response);
    const result = await lookupIsbnOpenLibrary('9781421585116');
    expect(result).toBeNull();
  });
});
