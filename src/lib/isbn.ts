/**
 * ISBN validation, normalization, and conversion utilities.
 *
 * Handles the leading-zero EAN-13 bug (common in html5-qrcode / ZXing):
 * when both EAN-13 and UPC-A formats are enabled, barcodes starting with 0
 * may be returned as 12 digits (the leading zero is dropped).
 */

/**
 * Calculate the check digit for an ISBN-13 given the first 12 digits.
 */
export function calculateIsbn13CheckDigit(first12: string): number {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(first12[i], 10);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const remainder = sum % 10;
  return remainder === 0 ? 0 : 10 - remainder;
}

/**
 * Validate an ISBN-13 string (13 digits with correct check digit).
 */
export function isValidIsbn13(isbn: string): boolean {
  if (!/^\d{13}$/.test(isbn)) return false;
  const checkDigit = calculateIsbn13CheckDigit(isbn.slice(0, 12));
  return checkDigit === parseInt(isbn[12], 10);
}

/**
 * Validate an ISBN-10 string (9 digits + check digit which may be X).
 */
export function isValidIsbn10(isbn: string): boolean {
  if (!/^\d{9}[\dX]$/.test(isbn)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(isbn[i], 10) * (10 - i);
  }
  const last = isbn[9] === 'X' ? 10 : parseInt(isbn[9], 10);
  sum += last;
  return sum % 11 === 0;
}

/**
 * Convert an ISBN-10 to ISBN-13 by prepending 978 and recalculating check digit.
 */
export function isbn10ToIsbn13(isbn10: string): string {
  const base = '978' + isbn10.slice(0, 9);
  const checkDigit = calculateIsbn13CheckDigit(base);
  return base + checkDigit.toString();
}

/**
 * Normalize a scanned or typed ISBN to a valid 13-digit ISBN-13.
 *
 * Handles:
 * - Stripping hyphens and spaces
 * - 13-digit ISBN-13 passthrough with validation
 * - 10-digit ISBN-10 → ISBN-13 conversion
 * - 12-digit input → prepend leading zero (ZXing leading-zero bug fix)
 *
 * Returns null if the input cannot be normalized to a valid ISBN-13.
 */
export function normalizeIsbn(input: string): string | null {
  // Strip hyphens and spaces
  const cleaned = input.replace(/[-\s]/g, '');

  if (!cleaned) return null;

  // 13 digits: validate as ISBN-13
  if (/^\d{13}$/.test(cleaned)) {
    return isValidIsbn13(cleaned) ? cleaned : null;
  }

  // 10 characters: validate as ISBN-10 and convert
  if (/^\d{9}[\dX]$/.test(cleaned)) {
    return isValidIsbn10(cleaned) ? isbn10ToIsbn13(cleaned) : null;
  }

  // 12 digits: likely EAN-13 with leading zero dropped (ZXing bug)
  if (/^\d{12}$/.test(cleaned)) {
    const padded = '0' + cleaned;
    return isValidIsbn13(padded) ? padded : null;
  }

  return null;
}
