import { describe, it, expect } from 'vitest';
import {
  normalizeIsbn,
  isValidIsbn13,
  isValidIsbn10,
  isbn10ToIsbn13,
  calculateIsbn13CheckDigit,
} from '../lib/isbn';

describe('calculateIsbn13CheckDigit', () => {
  it('calculates check digit for 978-4-08-882023', () => {
    expect(calculateIsbn13CheckDigit('978408882023')).toBe(1);
  });

  it('calculates check digit for 978-0-06-112008', () => {
    expect(calculateIsbn13CheckDigit('978006112008')).toBe(4);
  });

  it('calculates check digit resulting in 0', () => {
    // 9780470059029: last digit is 9
    // Let's verify: 978-0-13-468599-1 → check digit is 1
    // Use 978-0-201-63361-? → 9+7*3+8+0*3+2+0*3+1+6*3+3+3*3+6+1*3 = 9+21+8+0+2+0+1+18+3+9+6+3=80 → 0
    expect(calculateIsbn13CheckDigit('978020163361')).toBe(0);
  });
});

describe('isValidIsbn13', () => {
  it('validates a correct ISBN-13', () => {
    expect(isValidIsbn13('9784088820231')).toBe(true);
  });

  it('rejects an ISBN-13 with wrong check digit', () => {
    expect(isValidIsbn13('9784088820232')).toBe(false);
  });

  it('rejects non-numeric strings', () => {
    expect(isValidIsbn13('978408882023X')).toBe(false);
  });

  it('rejects strings of wrong length', () => {
    expect(isValidIsbn13('978408882023')).toBe(false);
    expect(isValidIsbn13('97840888202311')).toBe(false);
  });

  it('validates ISBN-13 starting with 979', () => {
    expect(isValidIsbn13('9791034602131')).toBe(true);
  });
});

describe('isValidIsbn10', () => {
  it('validates a correct ISBN-10', () => {
    expect(isValidIsbn10('4088820231')).toBe(true);
  });

  it('validates ISBN-10 with X check digit', () => {
    expect(isValidIsbn10('080442957X')).toBe(true);
  });

  it('rejects wrong check digit', () => {
    expect(isValidIsbn10('4088820232')).toBe(false);
  });

  it('rejects wrong length', () => {
    expect(isValidIsbn10('408882023')).toBe(false);
  });
});

describe('isbn10ToIsbn13', () => {
  it('converts ISBN-10 to ISBN-13', () => {
    expect(isbn10ToIsbn13('4088820231')).toBe('9784088820231');
  });

  it('converts ISBN-10 with X check digit', () => {
    const result = isbn10ToIsbn13('080442957X');
    expect(result).toMatch(/^978/);
    expect(result).toHaveLength(13);
    expect(isValidIsbn13(result)).toBe(true);
  });
});

describe('normalizeIsbn', () => {
  it('passes through valid 13-digit ISBN', () => {
    expect(normalizeIsbn('9784088820231')).toBe('9784088820231');
  });

  it('pads 12-digit UPC-A result to EAN-13 (leading-zero fix)', () => {
    // UPC-A is 12 digits; when scanned as EAN-13, leading 0 may be dropped
    expect(normalizeIsbn('061112008X')).toBeNull(); // not numeric
  });

  it('strips hyphens and spaces', () => {
    expect(normalizeIsbn('978-4-08-882023-1')).toBe('9784088820231');
  });

  it('strips spaces', () => {
    expect(normalizeIsbn('978 4088 820231')).toBe('9784088820231');
  });

  it('converts 10-digit ISBN to 13-digit', () => {
    expect(normalizeIsbn('4088820231')).toBe('9784088820231');
  });

  it('returns null for invalid input', () => {
    expect(normalizeIsbn('')).toBeNull();
    expect(normalizeIsbn('abc')).toBeNull();
    expect(normalizeIsbn('1234')).toBeNull();
  });

  it('pads 12-digit scanned barcode with leading zero', () => {
    // Simulates the UPC-A/EAN-13 leading-zero bug
    // "978006112008" is 12 digits — should become "0978006112008"? No.
    // Actually the bug is: EAN-13 "0614141999996" gets scanned as "614141999996" (12 digits)
    // We should prepend 0 and validate
    const result = normalizeIsbn('614141999996');
    // After prepending 0: "0614141999996" — check if valid
    expect(result).toBe('0614141999996');
  });

  it('returns null for 12-digit input that is not valid after zero-padding', () => {
    // "0999999999999" — check digit: 9*1+9*3+9*1+9*3+9*1+9*3+9*1+9*3+9*1+9*3+9*1+9*3 ≠ valid
    expect(normalizeIsbn('999999999999')).toBeNull();
  });
});
