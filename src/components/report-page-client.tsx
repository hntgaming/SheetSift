
'use client';

import { useState, useEffect, useTransition, useRef } from 'react';
import { Download, Loader2, FileUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ReportTable } from '@/components/report-table';
import { type ReportRow } from '@/lib/data';
import { exportToCsv } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type ReportPageClientProps = {
  mainSheetData: ReportRow[];
};

export function ReportPageClient({ mainSheetData }: ReportPageClientProps) {
  const [partnerNetworkIds, setPartnerNetworkIds] = useState<string[]>([]);
  const [filteredData, setFilteredData] = useState<ReportRow[]>([]);
  const [isFiltering, startFilterTransition] = useTransition();
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (partnerNetworkIds.length === 0) {
      setFilteredData([]);
      return;
    }

    startFilterTransition(() => {
      const partnerNetworkIdsSet = new Set(partnerNetworkIds.map(id => String(id).trim()));
      const mainSheetIdsClean = mainSheetData.map(row => ({
          ...row,
          networkId: String(row.networkId).trim()
      }));

      const data = mainSheetIdsClean.filter(row => partnerNetworkIdsSet.has(row.networkId));
      
      setFilteredData(data);
      if (data.length === 0) {
        toast({
          title: 'No Matches Found',
          description: 'No matching records were found based on the provided Network IDs.',
        });
      } else {
          toast({
          title: 'Report Generated',
          description: `${data.length} records found.`,
        });
      }
    });
  }, [partnerNetworkIds, mainSheetData, toast]);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const ids = content.split(/[\s,]+/).filter(id => id.trim() !== '');
        setPartnerNetworkIds(ids);
      };
      reader.onerror = () => {
        toast({
          variant: 'destructive',
          title: 'Error reading file',
          description: 'Could not read the selected file.',
        });
      };
      reader.readAsText(file);
    }
  };

  const handleExport = () => {
    if (filteredData.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No data to export',
        description: 'Please generate a report with data to export.',
      });
      return;
    }
    const filename = `report-${fileName?.split('.')[0] || 'export'}-${new Date().toISOString().slice(0, 10)}`;
    exportToCsv(filteredData, filename);
  };
  
  const handleClear = () => {
    setPartnerNetworkIds([]);
    setFileName(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
    toast({
        title: 'Filter Cleared',
        description: 'Ready for a new file.',
    });
  }

  return (
    <>
      <section className="flex flex-col gap-6" aria-label="Partner report">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Partner Report
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              type="file"
              id="file-upload"
              ref={fileInputRef}
              className="hidden"
              accept=".csv,.txt"
              onChange={handleFileChange}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              disabled={isFiltering}
            >
              {isFiltering ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 shrink-0" aria-hidden />
                  <span>Filtering...</span>
                </>
              ) : (
                <>
                  <FileUp className="h-4 w-4 shrink-0" aria-hidden />
                  <span>{fileName ? `Loaded: ${fileName}` : 'Upload ID File'}</span>
                </>
              )}
            </Button>
            {fileName && (
              <Button
                onClick={handleClear}
                variant="ghost"
                size="icon"
                disabled={isFiltering}
                aria-label="Clear filter"
              >
                <X className="h-4 w-4" aria-hidden />
              </Button>
            )}
            <Button
              onClick={handleExport}
              variant="outline"
              disabled={filteredData.length === 0 || isFiltering}
            >
              <Download className="h-4 w-4 shrink-0" aria-hidden />
              <span>Export</span>
            </Button>
          </div>
        </div>
        <ReportTable data={filteredData} isLoading={isFiltering} />
      </section>
    </>
  );
}
