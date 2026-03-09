import Link from 'next/link';
import Image from 'next/image';
import { BarChart2, LogOut } from 'lucide-react';
import { auth, signOut } from '@/lib/auth';
import { Button } from '@/components/ui/button';

const SITE_NAME = 'SheetSift';

export async function AppHeader() {
  const session = await auth();

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      role="banner"
    >
      <div className="container mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-foreground no-underline hover:text-primary transition-colors"
          aria-label={`${SITE_NAME} home`}
        >
          <BarChart2 className="h-6 w-6 shrink-0 text-primary" aria-hidden />
          <span>{SITE_NAME}</span>
        </Link>

        {session?.user && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              {session.user.image && (
                <Image
                  src={session.user.image}
                  alt=""
                  width={28}
                  height={28}
                  className="rounded-full"
                />
              )}
              <span className="text-sm text-muted-foreground truncate max-w-[180px]">
                {session.user.email}
              </span>
            </div>
            <form
              action={async () => {
                'use server';
                await signOut({ redirectTo: '/login' });
              }}
            >
              <Button type="submit" variant="ghost" size="sm">
                <LogOut className="h-4 w-4" aria-hidden />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </form>
          </div>
        )}
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
