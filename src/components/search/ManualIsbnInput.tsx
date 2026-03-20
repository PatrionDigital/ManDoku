import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ManualIsbnInputProps {
  onSubmit: (isbn: string) => void;
}

export function ManualIsbnInput({ onSubmit }: ManualIsbnInputProps) {
  const { t } = useTranslation();
  const [isbn, setIsbn] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = isbn.replace(/[-\s]/g, '');
    if (!/^\d{13}$/.test(cleaned)) {
      setError('ISBN must be 13 digits');
      return;
    }
    setError(null);
    onSubmit(cleaned);
    setIsbn('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3">
      <label htmlFor="manual-isbn" className="text-sm text-[var(--color-text-secondary)]">
        {t('scanner.manual')}
      </label>
      <div className="flex w-full max-w-xs gap-2">
        <input
          id="manual-isbn"
          type="text"
          inputMode="numeric"
          value={isbn}
          onChange={(e) => setIsbn(e.target.value)}
          placeholder="978-4-08-882..."
          maxLength={17}
          className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-center font-mono text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
        />
        <button
          type="submit"
          className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
        >
          OK
        </button>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </form>
  );
}
