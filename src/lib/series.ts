import type { MangaSeries, MangaVolume } from './types';

/**
 * Group a flat list of volumes into series, sorted by series name.
 */
export function groupVolumesIntoSeries(volumes: MangaVolume[]): MangaSeries[] {
  const seriesMap = new Map<string, MangaVolume[]>();

  for (const vol of volumes) {
    const existing = seriesMap.get(vol.seriesName);
    if (existing) {
      existing.push(vol);
    } else {
      seriesMap.set(vol.seriesName, [vol]);
    }
  }

  const series: MangaSeries[] = [];

  for (const [seriesName, vols] of seriesMap) {
    const sorted = vols.sort((a, b) => a.volumeNumber - b.volumeNumber);
    series.push({
      seriesName,
      volumes: sorted,
      latestVolume: sorted[sorted.length - 1],
      totalOwned: sorted.length,
    });
  }

  return series.sort((a, b) => a.seriesName.localeCompare(b.seriesName, 'ja'));
}
