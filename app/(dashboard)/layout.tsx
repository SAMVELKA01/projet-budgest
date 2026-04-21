import Sidebar from "@/components/layout/Sidebar";
import DashboardHeader from "@/components/layout/DashboardHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-neutral overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 pt-16 lg:pt-6">
          {children}
        </main>
      </div>
    </div>
  );
}