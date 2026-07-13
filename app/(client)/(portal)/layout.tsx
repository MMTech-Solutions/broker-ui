import { ClientAppSidebar } from "@/components/layout/client-app-sidebar";
import { AppAreaBar } from "@/components/layout/app-area-bar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function ClientPortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <ClientAppSidebar />
      <SidebarInset className="min-h-svh">
        <AppAreaBar />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
