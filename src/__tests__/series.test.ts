import { describe, it, expect } from 'vitest';
import { groupVolumesIntoSeries } from '../lib/series';
import type { MangaVolume } from '../lib/types';

function makeVolume(overrides: Partial<MangaVolume> = {}): MangaVolume {
  return {
    id: '1',
    isbn: '9784088820231',
    title: 'Test Manga 1',
    seriesName: 'Test Manga',
    volumeNumber: 1,
    author: 'Author',
    publisher: 'Publisher',
    thumbnailUrl: '/thumb/1.jpg',
    addedAt: '2024-01-01T00:00:00Z',
    addedBy: 'user1',
    householdId: 'h1',
    ...overrides,
  };
}

describe('groupVolumesIntoSeries', () => {
  it('returns empty array for no volumes', () => {
    expect(groupVolumesIntoSeries([])).toEqual([]);
  });

  it('groups volumes by seriesName', () => {
    const volumes = [
      makeVolume({ id: '1', seriesName: 'A', volumeNumber: 1 }),
      makeVolume({ id: '2', seriesName: 'A', volumeNumber: 2 }),
      makeVolume({ id: '3', seriesName: 'B', volumeNumber: 1 }),
    ];

    const series = groupVolumesIntoSeries(volumes);
    expect(series).toHaveLength(2);
    expect(series[0].seriesName).toBe('A');
    expect(series[0].totalOwned).toBe(2);
    expect(series[1].seriesName).toBe('B');
    expect(series[1].totalOwned).toBe(1);
  });

  it('sets latestVolume to highest volume number', () => {
    const volumes = [
      makeVolume({ id: '1', seriesName: 'A', volumeNumber: 3 }),
      makeVolume({ id: '2', seriesName: 'A', volumeNumber: 1 }),
      makeVolume({ id: '3', seriesName: 'A', volumeNumber: 5 }),
    ];

    const series = groupVolumesIntoSeries(volumes);
    expect(series[0].latestVolume.volumeNumber).toBe(5);
  });

  it('sorts series by name using Japanese locale', () => {
    const volumes = [
      makeVolume({ id: '1', seriesName: 'ワンピース', volumeNumber: 1 }),
      makeVolume({ id: '2', seriesName: 'あいうえお', volumeNumber: 1 }),
    ];

    const series = groupVolumesIntoSeries(volumes);
    expect(series[0].seriesName).toBe('あいうえお');
    expect(series[1].seriesName).toBe('ワンピース');
  });
});
