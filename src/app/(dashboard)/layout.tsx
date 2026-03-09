import { AppHeader } from '@/components/app-shell';
import { AppFooter } from '@/components/app-shell';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppHeader />
      <div className="flex-1 flex flex-col">{children}</div>
      <AppFooter />
    </>
  );
}
