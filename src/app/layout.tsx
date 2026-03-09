import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AppHeader } from "@/components/app-shell";
import { AppFooter } from "@/components/app-shell";

export const metadata: Metadata = {
  title: 'SheetSift',
  description: 'Analyze and summarize your Google Sheets data with AI.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen font-body antialiased flex flex-col bg-background text-foreground">
        <AppHeader />
        <div className="flex-1 flex flex-col">
          {children}
        </div>
        <AppFooter />
        <Toaster />
      </body>
    </html>
  );
}
