import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

interface UseBarcodeScanOptions {
  onScan: (isbn: string) => void;
  elementId: string;
}

const BARCODE_FORMATS = [
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.UPC_A,
];

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
      });
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 15, qrbox: { width: 300, height: 150 }, aspectRatio: 1.777 },
        (decodedText) => {
          // Validate EAN-13 format
          if (/^\d{13}$/.test(decodedText)) {
            if (navigator.vibrate) navigator.vibrate(100);
            // Stop scanner before invoking callback to prevent repeated fires
            scanner.stop().then(() => {
              scanner.clear();
              scannerRef.current = null;
              setIsScanning(false);
              onScanRef.current(decodedText);
            }).catch(() => {
              onScanRef.current(decodedText);
            });
          }
        },
        () => {
          // Scan failure — ignore, keep scanning
        }
      );
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
