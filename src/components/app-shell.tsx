'use client';

import Link from 'next/link';
import { BarChart2 } from 'lucide-react';

const SITE_NAME = 'SheetSift';

export function AppHeader() {
  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      role="banner"
    >
      <div className="container mx-auto flex h-14 max-w-6xl items-center px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-foreground no-underline hover:text-primary transition-colors"
          aria-label={`${SITE_NAME} home`}
        >
          <BarChart2 className="h-6 w-6 shrink-0 text-primary" aria-hidden />
          <span>{SITE_NAME}</span>
        </Link>
      </div>
    </header>
  );
}

export function AppFooter() {
  return (
    <footer
      className="mt-auto border-t border-border bg-background"
      role="contentinfo"
    >
      <div className="container mx-auto max-w-6xl px-4 py-4 sm:px-6">
        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} {SITE_NAME}. Partner report tool.
        </p>
      </div>
    </footer>
  );
}
