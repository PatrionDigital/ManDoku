import { describe, it, expect } from 'vitest';
import { extractVolumeNumber, extractSeriesName, getThumbnailUrl } from '../lib/ndl';

describe('extractVolumeNumber', () => {
  it('extracts from dcndl:volume', () => {
    expect(extractVolumeNumber('鬼滅の刃', '23')).toBe(23);
  });

  it('extracts trailing digits', () => {
    expect(extractVolumeNumber('ONE PIECE 104')).toBe(104);
  });

  it('extracts 第X巻 pattern', () => {
    expect(extractVolumeNumber('ドラゴンボール 第42巻')).toBe(42);
  });

  it('extracts X巻 pattern', () => {
    expect(extractVolumeNumber('NARUTO 72巻')).toBe(72);
  });

  it('extracts Vol.X pattern', () => {
    expect(extractVolumeNumber('Bleach Vol.74')).toBe(74);
  });

  it('defaults to 1 when no volume found', () => {
    expect(extractVolumeNumber('よつばと!')).toBe(1);
  });
});

describe('extractSeriesName', () => {
  it('strips trailing digits', () => {
    expect(extractSeriesName('ONE PIECE 104')).toBe('ONE PIECE');
  });

  it('strips 第X巻', () => {
    expect(extractSeriesName('ドラゴンボール 第42巻')).toBe('ドラゴンボール');
  });

  it('strips X巻', () => {
    expect(extractSeriesName('NARUTO 72巻')).toBe('NARUTO');
  });

  it('strips Vol.X', () => {
    expect(extractSeriesName('Bleach Vol.74')).toBe('Bleach');
  });

  it('returns title as-is when no volume indicator', () => {
    expect(extractSeriesName('よつばと!')).toBe('よつばと!');
  });
});

describe('getThumbnailUrl', () => {
  it('builds correct URL', () => {
    expect(getThumbnailUrl('9784088820231')).toBe('/api/ndl-thumb/9784088820231.jpg');
  });
});
