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

type ScanState =
  | { phase: 'idle' }
  | { phase: 'scanning' }
  | { phase: 'lookup'; isbn: string }
  | { phase: 'found'; isbn: string }
  | { phase: 'not-found'; isbn: string }
  | { phase: 'added'; isbn: string; title: string }
  | { phase: 'duplicate'; isbn: string }
  | { phase: 'error'; isbn: string; message: string };

export function BarcodeScanner() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { addVolume, isAdding } = useCollection(profile?.householdId ?? null);
  const [state, setState] = useState<ScanState>({ phase: 'idle' });
  const [previewImgFailed, setPreviewImgFailed] = useState(false);

  // The ISBN currently being looked up (drives the query)
  const lookupIsbn = state.phase === 'lookup' || state.phase === 'found' ? state.isbn : null;

  const { data: metadata, isLoading: isLooking, error: lookupError } = useNdlLookup(lookupIsbn);

  // When lookup completes, transition state
  if (state.phase === 'lookup' && !isLooking && lookupIsbn) {
    if (lookupError) {
      setState({ phase: 'not-found', isbn: state.isbn });
    } else if (metadata) {
      setState({ phase: 'found', isbn: state.isbn });
    } else if (!metadata) {
      setState({ phase: 'not-found', isbn: state.isbn });
    }
  }

  const handleScan = useCallback((isbn: string) => {
    setState({ phase: 'lookup', isbn });
    setPreviewImgFailed(false);
  }, []);

  const { isScanning, error: scanError, startScanning, stopScanning } = useBarcodeScan({
    onScan: handleScan,
    elementId: 'barcode-reader',
  });

  const handleStartScan = () => {
    setState({ phase: 'scanning' });
    startScanning();
  };

  const handleAdd = async () => {
    if (!metadata || !profile?.householdId || !profile?.id || state.phase !== 'found') return;

    try {
      await addVolume({
        isbn: state.isbn,
        title: metadata.title,
        seriesName: metadata.seriesName,
        volumeNumber: metadata.volumeNumber,
        author: metadata.author,
        publisher: metadata.publisher,
        publishDate: metadata.publishDate,
        thumbnailUrl: metadata.thumbnailUrl,
        addedAt: new Date().toISOString(),
        addedBy: profile.id,
        householdId: profile.householdId,
      });
      setState({ phase: 'added', isbn: state.isbn, title: metadata.title });
    } catch (err) {
      if (err instanceof Error && err.message === DUPLICATE_ERROR) {
        setState({ phase: 'duplicate', isbn: state.isbn });
      } else {
        setState({ phase: 'error', isbn: state.isbn, message: String(err) });
      }
    }
  };

  const handleReset = () => {
    stopScanning();
    setState({ phase: 'idle' });
    setPreviewImgFailed(false);
  };

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-center text-xl font-medium text-[var(--color-text-primary)]">
        {t('scanner.title')}
      </h2>

      {/* Camera viewfinder */}
      <div className="mx-auto max-w-md overflow-hidden rounded-lg bg-[var(--color-bg-secondary)]">
        <div id="barcode-reader" className="w-full" />
      </div>

      {/* Scan / Stop button */}
      {(state.phase === 'idle' || state.phase === 'scanning') && (
        <div className="flex justify-center">
          {!isScanning ? (
            <button
              onClick={handleStartScan}
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
      )}

      {/* Camera error */}
      {scanError && (
        <p className="text-center text-sm text-red-400">{scanError}</p>
      )}

      {/* Scanned ISBN display */}
      {state.phase !== 'idle' && state.phase !== 'scanning' && (
        <p className="text-center font-mono text-sm text-[var(--color-text-secondary)]">
          ISBN: {state.isbn}
        </p>
      )}

      {/* Looking up... */}
      {state.phase === 'lookup' && isLooking && <LoadingSpinner />}

      {/* Metadata found — show details and Add button */}
      {state.phase === 'found' && metadata && (
        <div className="mx-auto max-w-md rounded-lg bg-[var(--color-bg-card)] p-4">
          <div className="flex gap-4">
            {!previewImgFailed && (
              <img
                src={metadata.thumbnailUrl}
                alt={metadata.title}
                className="h-32 w-auto rounded object-cover"
                onError={() => setPreviewImgFailed(true)}
              />
            )}
            <div className="flex-1">
              <h3 className="font-medium text-[var(--color-text-primary)]">{metadata.title}</h3>
              {metadata.author && (
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{metadata.author}</p>
              )}
              {metadata.publisher && (
                <p className="text-sm text-[var(--color-text-secondary)]">{metadata.publisher}</p>
              )}
              {metadata.seriesName && metadata.seriesName !== metadata.title && (
                <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                  {metadata.seriesName} — Vol. {metadata.volumeNumber}
                </p>
              )}
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleAdd}
              disabled={isAdding}
              className="flex-1 rounded-lg bg-[var(--color-accent)] py-2.5 font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
            >
              {isAdding ? t('scanner.processing') : t('scanner.add')}
            </button>
            <button
              onClick={handleReset}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-primary)] transition-colors"
            >
              {t('scanner.scanAgain')}
            </button>
          </div>
        </div>
      )}

      {/* Not found */}
      {state.phase === 'not-found' && (
        <div className="mx-auto max-w-md space-y-3 text-center">
          <p className="text-sm text-red-400">{t('scanner.notFound')}</p>
          <button
            onClick={handleReset}
            className="rounded-lg bg-[var(--color-accent)] px-6 py-2.5 font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
          >
            {t('scanner.scanAgain')}
          </button>
        </div>
      )}

      {/* Added successfully */}
      {state.phase === 'added' && (
        <div className="mx-auto max-w-md space-y-3 text-center">
          <p className="text-sm text-green-400">
            {t('scanner.addedSuccess', { title: state.title })}
          </p>
          <button
            onClick={handleReset}
            className="rounded-lg bg-[var(--color-accent)] px-6 py-2.5 font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
          >
            {t('scanner.scanAgain')}
          </button>
        </div>
      )}

      {/* Duplicate */}
      {state.phase === 'duplicate' && (
        <div className="mx-auto max-w-md space-y-3 text-center">
          <p className="text-sm text-amber-400">{t('scanner.alreadyOwned')}</p>
          <button
            onClick={handleReset}
            className="rounded-lg bg-[var(--color-accent)] px-6 py-2.5 font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
          >
            {t('scanner.scanAgain')}
          </button>
        </div>
      )}

      {/* Error */}
      {state.phase === 'error' && (
        <div className="mx-auto max-w-md space-y-3 text-center">
          <p className="text-sm text-red-400">{state.message}</p>
          <button
            onClick={handleReset}
            className="rounded-lg bg-[var(--color-accent)] px-6 py-2.5 font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
          >
            {t('scanner.scanAgain')}
          </button>
        </div>
      )}

      {/* Photo capture fallback */}
      <div className="border-t border-[var(--color-border)] pt-4">
        <PhotoCapture onScan={handleScan} />
      </div>

      {/* Manual ISBN input */}
      <div className="border-t border-[var(--color-border)] pt-4">
        <ManualIsbnInput onSubmit={handleScan} />
      </div>
    </div>
  );
}
