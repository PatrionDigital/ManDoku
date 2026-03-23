import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useBarcodeScan } from '../../hooks/useBarcodeScan';
import { useNdlLookup } from '../../hooks/useNdlLookup';
import { useCollection } from '../../hooks/useCollection';
import { useAuth } from '../../hooks/useAuth';
import { DUPLICATE_ERROR } from '../../lib/storage';
import { ManualIsbnInput } from '../search/ManualIsbnInput';
import { PhotoCapture } from './PhotoCapture';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export function BarcodeScanner() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { addVolume, isAdding } = useCollection(profile?.householdId ?? null);
  const [scannedIsbn, setScannedIsbn] = useState<string | null>(null);
  const [addedMessage, setAddedMessage] = useState<string | null>(null);
  const [previewImgFailed, setPreviewImgFailed] = useState(false);

  const handleScan = useCallback((isbn: string) => {
    setScannedIsbn(isbn);
    setAddedMessage(null);
    setPreviewImgFailed(false);
  }, []);

  const { isScanning, error: scanError, startScanning, stopScanning } = useBarcodeScan({
    onScan: handleScan,
    elementId: 'barcode-reader',
  });

  const { data: ndlData, isLoading: isLooking, error: lookupError } = useNdlLookup(scannedIsbn);

  const handleAdd = async () => {
    if (!ndlData || !profile?.householdId || !profile?.id || !scannedIsbn) return;

    try {
      await addVolume({
        isbn: scannedIsbn,
        title: ndlData.title,
        seriesName: ndlData.seriesName,
        volumeNumber: ndlData.volumeNumber,
        author: ndlData.author,
        publisher: ndlData.publisher,
        publishDate: ndlData.publishDate,
        thumbnailUrl: ndlData.thumbnailUrl,
        addedAt: new Date().toISOString(),
        addedBy: profile.id,
        householdId: profile.householdId,
      });
      setAddedMessage(t('scanner.found'));
      setScannedIsbn(null);
    } catch (err) {
      if (err instanceof Error && err.message === DUPLICATE_ERROR) {
        setAddedMessage(t('scanner.alreadyOwned'));
      }
    }
  };

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-center text-xl font-medium text-[var(--color-text-primary)]">
        {t('scanner.title')}
      </h2>

      <div className="mx-auto max-w-md overflow-hidden rounded-lg bg-[var(--color-bg-secondary)]">
        <div id="barcode-reader" className="w-full" />
      </div>

      <div className="flex justify-center">
        {!isScanning ? (
          <button
            onClick={startScanning}
            className="rounded-lg bg-[var(--color-accent)] px-6 py-3 font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
          >
            {t('app.scan')}
          </button>
        ) : (
          <button
            onClick={stopScanning}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-6 py-3 font-medium text-[var(--color-text-primary)] transition-colors"
          >
            {t('scanner.scanning')}
          </button>
        )}
      </div>

      {scanError && (
        <p className="text-center text-sm text-red-400">{scanError}</p>
      )}

      {addedMessage && (
        <p className="text-center text-sm text-[var(--color-accent)]">{addedMessage}</p>
      )}

      {isLooking && <LoadingSpinner />}

      {ndlData && !isLooking && (
        <div className="mx-auto max-w-md rounded-lg bg-[var(--color-bg-card)] p-4">
          <div className="flex gap-4">
            {!previewImgFailed && (
              <img
                src={ndlData.thumbnailUrl}
                alt={ndlData.title}
                className="h-32 w-auto rounded object-cover"
                onError={() => setPreviewImgFailed(true)}
              />
            )}
            <div className="flex-1">
              <h3 className="font-medium text-[var(--color-text-primary)]">{ndlData.title}</h3>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{ndlData.author}</p>
              <p className="text-sm text-[var(--color-text-secondary)]">{ndlData.publisher}</p>
            </div>
          </div>
          <button
            onClick={handleAdd}
            disabled={isAdding}
            className="mt-4 w-full rounded-lg bg-[var(--color-accent)] py-2.5 font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
          >
            {t('scanner.add')}
          </button>
        </div>
      )}

      {lookupError && (
        <p className="text-center text-sm text-red-400">{t('scanner.notFound')}</p>
      )}

      <div className="border-t border-[var(--color-border)] pt-4">
        <PhotoCapture onScan={handleScan} />
      </div>

      <div className="border-t border-[var(--color-border)] pt-4">
        <ManualIsbnInput onSubmit={handleScan} />
      </div>
    </div>
  );
}
