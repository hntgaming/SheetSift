'use client';

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableFooter,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { type ReportRow } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';

type ReportTableProps = {
  data: ReportRow[];
  isLoading?: boolean;
};

export function ReportTable({ data, isLoading = false }: ReportTableProps) {
  const totals = data.reduce(
    (acc, row) => {
      acc.totalRevenue += row.totalRevenue;
      acc.parentToParentCommission += row.parentToParentCommission;
      return acc;
    },
    { totalRevenue: 0, parentToParentCommission: 0 }
  );

  const tableContent = () => {
    if (isLoading) {
      return Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={`loading-${i}`} className="hover:bg-transparent">
          <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
          <TableCell><Skeleton className="h-5 w-1/2" /></TableCell>
          <TableCell><Skeleton className="h-5 w-1/2" /></TableCell>
          <TableCell><Skeleton className="h-5 w-1/2" /></TableCell>
        </TableRow>
      ));
    }

    if (data.length > 0) {
      return data.map((row, index) => (
        <TableRow
          key={`${row.networkId}-${index}`}
          className="hover:bg-muted/50 animate-row-in opacity-0"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <TableCell className="font-medium">{row.publisher}</TableCell>
          <TableCell>{row.networkId}</TableCell>
          <TableCell className="text-right">{formatCurrency(row.totalRevenue)}</TableCell>
          <TableCell className="text-right">{formatCurrency(row.parentToParentCommission)}</TableCell>
        </TableRow>
      ));
    }

    return (
      <TableRow>
        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
          No results. Select a partner to generate a report.
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="rounded-lg border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Publisher</TableHead>
            <TableHead>Network ID</TableHead>
            <TableHead className="text-right">Total Revenue</TableHead>
            <TableHead className="text-right">Parent to Parent Commission</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableContent()}
        </TableBody>
        {data.length > 0 && !isLoading && (
          <TableFooter>
            <TableRow className="bg-muted/50 hover:bg-muted/80 border-border">
              <TableCell colSpan={2} className="font-bold">Totals</TableCell>
              <TableCell className="text-right font-bold">{formatCurrency(totals.totalRevenue)}</TableCell>
              <TableCell className="text-right font-bold">{formatCurrency(totals.parentToParentCommission)}</TableCell>
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </div>
  );
}
