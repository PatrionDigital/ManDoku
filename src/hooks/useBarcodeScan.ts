import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { normalizeIsbn } from '../lib/isbn';

interface UseBarcodeScanOptions {
  onScan: (isbn: string) => void;
  elementId: string;
}

/**
 * Only enable EAN_13 to avoid the leading-zero bug when EAN-13 + UPC-A
 * are both enabled. We normalize scanned results via normalizeIsbn() which
 * handles 12-digit UPC-A results by prepending the leading zero.
 */
const BARCODE_FORMATS = [
  Html5QrcodeSupportedFormats.EAN_13,
];

/**
 * Compute a wide rectangular scan region that adapts to the video stream.
 * A ~3:1 aspect ratio matches the shape of 1D barcodes like EAN-13.
 */
function computeQrBox(viewfinderWidth: number, viewfinderHeight: number) {
  const width = Math.min(Math.floor(viewfinderWidth * 0.8), 400);
  const height = Math.min(Math.floor(viewfinderHeight * 0.25), 150);
  return { width, height };
}

/**
 * Try to apply continuous autofocus and 2x zoom on the active camera track.
 * Best-effort — many devices/browsers don't support these constraints.
 */
async function applyOptimalCameraSettings(scanner: Html5Qrcode) {
  try {
    const capabilities = scanner.getRunningTrackCameraCapabilities();
    const zoomCapability = capabilities.zoomFeature();
    if (zoomCapability.isSupported()) {
      const maxZoom = zoomCapability.max();
      const targetZoom = Math.min(2.0, maxZoom);
      await zoomCapability.apply(targetZoom);
    }
  } catch {
    // Best-effort — ignore if not supported
  }
}

export function useBarcodeScan({ onScan, elementId }: UseBarcodeScanOptions) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const onScanRef = useRef(onScan);
  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  const startScanning = useCallback(async () => {
    try {
      setError(null);
      const scanner = new Html5Qrcode(elementId, {
        formatsToSupport: BARCODE_FORMATS,
        verbose: false,
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true,
        },
      });
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: computeQrBox,
          aspectRatio: 1.777,
        },
        (decodedText) => {
          // Normalize: handles leading-zero bug, ISBN-10 conversion, etc.
          const isbn = normalizeIsbn(decodedText);
          if (isbn) {
            if (navigator.vibrate) navigator.vibrate(100);
            scanner.stop().then(() => {
              scanner.clear();
              scannerRef.current = null;
              setIsScanning(false);
              onScanRef.current(isbn);
            }).catch(() => {
              onScanRef.current(isbn);
            });
          }
        },
        () => {
          // Scan failure — ignore, keep scanning
        }
      );

      // Apply optimal camera settings after scanner starts
      await applyOptimalCameraSettings(scanner);

      setIsScanning(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Camera access denied');
      setIsScanning(false);
    }
  }, [elementId]);

  const stopScanning = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {
        // Ignore stop errors
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  }, []);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return { isScanning, error, startScanning, stopScanning };
}
