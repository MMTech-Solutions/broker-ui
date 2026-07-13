import { AppAreaBar } from "@/components/layout/app-area-bar";

export default function ClientAuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <AppAreaBar />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
