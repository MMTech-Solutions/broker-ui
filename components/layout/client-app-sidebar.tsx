"use client";

import Link from "next/link";
import { useFeatureAvailability } from "@/features/feature-availability/components/feature-availability-provider";
import { featureForPage } from "@/features/feature-availability/types";
import { usePathname } from "next/navigation";
import { CircleHelpIcon, GiftIcon, HandshakeIcon, HomeIcon, ShieldCheckIcon, TrophyIcon, WalletIcon } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const clientNavigation = [
  { title: "Reportes IB", href: "/client/ib/analytics", icon: HandshakeIcon, match: (pathname: string) => pathname.startsWith("/client/ib/analytics") },
  {
    title: "Inicio",
    href: "/client",
    icon: HomeIcon,
    match: (pathname: string) => pathname === "/client",
  },
  {
    title: "Cuentas de trading",
    href: "/client/accounts",
    icon: WalletIcon,
    match: (pathname: string) => pathname.startsWith("/client/accounts"),
  },
  {
    title: "IB Dashboard",
    href: "/client/ib",
    icon: HandshakeIcon,
    match: (pathname: string) => pathname.startsWith("/client/ib") && !pathname.startsWith("/client/ib/analytics"),
  },
  {
    title: "Bonos",
    href: "/client/bonuses",
    icon: GiftIcon,
    match: (pathname: string) => pathname.startsWith("/client/bonuses"),
  },
  {
    title: "Seguros",
    href: "/client/insurance",
    icon: ShieldCheckIcon,
    match: (pathname: string) => pathname.startsWith("/client/insurance"),
  },
  {
    title: "Concursos",
    href: "/client/contests",
    icon: TrophyIcon,
    match: (pathname: string) => pathname.startsWith("/client/contests"),
  },
  {
    title: "Ayuda",
    href: "/client/help",
    icon: CircleHelpIcon,
    match: (pathname: string) => pathname.startsWith("/client/help"),
  },
] as const;

export function ClientAppSidebar() {
  const pathname = usePathname();
  const { states, canManageConfigs } = useFeatureAvailability();
  const visible = (item: { href: string }) => {
    if (item.href === "/configuration") return canManageConfigs;
    const feature = featureForPage(item.href);
    return feature === null || states[feature];
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-sidebar-foreground">
            MMT Broker
          </p>
          <p className="text-xs text-muted-foreground">Área de cliente</p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {clientNavigation.filter(visible).map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={item.match(pathname)}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
