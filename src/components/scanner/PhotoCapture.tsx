import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Html5Qrcode } from 'html5-qrcode';
import { normalizeIsbn } from '../../lib/isbn';

interface PhotoCaptureProps {
  onScan: (isbn: string) => void;
}

/**
 * Photo capture fallback for iOS and devices where live scanning is unreliable.
 * Uses the device camera to take a photo, then decodes the barcode from the image.
 */
export function PhotoCapture({ onScan }: PhotoCaptureProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsProcessing(true);

    try {
      const result = await Html5Qrcode.scanFile(file, false);
      const isbn = normalizeIsbn(result);
      if (isbn) {
        if (navigator.vibrate) navigator.vibrate(100);
        onScan(isbn);
      } else {
        setError(t('scanner.notFound'));
      }
    } catch {
      setError(t('scanner.notFound'));
    } finally {
      setIsProcessing(false);
      // Reset input so the same file can be re-selected
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm text-[var(--color-text-secondary)]">
        {t('scanner.photoCapture')}
      </p>
      <label
        className={`cursor-pointer rounded-lg border border-dashed border-[var(--color-border)] px-6 py-3 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-accent)] ${isProcessing ? 'opacity-50' : ''}`}
      >
        {isProcessing ? t('scanner.processing') : t('scanner.takePhoto')}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          disabled={isProcessing}
          className="hidden"
        />
      </label>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
