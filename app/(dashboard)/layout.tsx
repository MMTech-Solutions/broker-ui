import { FeatureAvailabilityProvider, FeaturePageGuard } from "@/features/feature-availability/components/feature-availability-provider";
import { AppAreaBar } from "@/components/layout/app-area-bar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <FeatureAvailabilityProvider>
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-h-svh min-w-0">
        <AppAreaBar />
        <FeaturePageGuard>{children}</FeaturePageGuard>
      </SidebarInset>
    </SidebarProvider>
    </FeatureAvailabilityProvider>
  );
}
