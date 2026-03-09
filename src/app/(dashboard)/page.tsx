import { Suspense } from 'react';
import { ReportPageClient } from '@/components/report-page-client';
import { getMainSheetData } from '@/lib/google-sheets';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export default async function Home() {
  let mainSheetData: Awaited<ReturnType<typeof getMainSheetData>>;
  let error: string | null = null;
  try {
    mainSheetData = await getMainSheetData();
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : 'An unknown error occurred.';
    mainSheetData = [];
  }

  return (
    <main className="container mx-auto max-w-6xl flex-1 px-4 py-8 sm:px-6" role="main">
      <Suspense fallback={<p className="text-muted-foreground">Loading report data...</p>}>
        {error ? (
          <Alert variant="destructive" className="mb-8">
            <Terminal className="h-4 w-4" aria-hidden />
            <AlertTitle>Error Fetching Data</AlertTitle>
            <AlertDescription>
              <p>Could not load data from the Google Sheet.</p>
              <p className="font-mono text-xs mt-2">Error: {error}</p>
            </AlertDescription>
          </Alert>
        ) : (
          <ReportPageClient mainSheetData={mainSheetData} />
        )}
      </Suspense>
    </main>
  );
}
