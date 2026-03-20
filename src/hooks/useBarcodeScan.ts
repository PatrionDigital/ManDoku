import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface UseBarcodeScanOptions {
  onScan: (isbn: string) => void;
  elementId: string;
}

export function useBarcodeScan({ onScan, elementId }: UseBarcodeScanOptions) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const startScanning = useCallback(async () => {
    try {
      setError(null);
      const scanner = new Html5Qrcode(elementId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 100 } },
        (decodedText) => {
          // Validate EAN-13 format
          if (/^\d{13}$/.test(decodedText)) {
            if (navigator.vibrate) navigator.vibrate(100);
            onScan(decodedText);
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
  }, [elementId, onScan]);

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
