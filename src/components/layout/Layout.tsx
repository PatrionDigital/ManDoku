import type { ReactNode } from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-svh flex-col bg-[var(--color-bg-primary)]">
      <Header />
      <main className="flex-1">{children}</main>
      <BottomNav />
    </div>
  );
}
