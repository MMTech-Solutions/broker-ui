"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarClockIcon,
  CircleDollarSignIcon,
  ClipboardListIcon,
  CoinsIcon,
  GaugeIcon,
  GiftIcon,
  HandshakeIcon,
  HistoryIcon,
  LayersIcon,
  LayoutTemplateIcon,
  MedalIcon,
  PercentIcon,
  ScaleIcon,
  ShieldIcon,
  TrophyIcon,
  UsersIcon,
  WalletIcon,
  WorkflowIcon,
} from "lucide-react";

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

const tradingNavigation = [
  {
    title: "Platforms",
    href: "/platforms",
    icon: LayersIcon,
  },
  {
    title: "Trading accounts",
    href: "/trading-accounts",
    icon: WalletIcon,
  },
  {
    title: "Leverages",
    href: "/leverages",
    icon: GaugeIcon,
  },
  {
    title: "Default amounts",
    href: "/initial-amounts",
    icon: CircleDollarSignIcon,
  },
] as const;

const ibNavigation = [
  {
    title: "IB Plans",
    href: "/ib-plans",
    icon: HandshakeIcon,
  },
  {
    title: "IB Programs",
    href: "/ib-programs",
    icon: WorkflowIcon,
  },
  {
    title: "Payment templates",
    href: "/ib-payment-templates",
    icon: PercentIcon,
  },
  {
    title: "IB Subscriptions",
    href: "/ib-subscriptions",
    icon: ClipboardListIcon,
  },
  {
    title: "Program payment rules",
    href: "/ib-program-payment-rules",
    icon: ScaleIcon,
  },
  {
    title: "IB Reward logs",
    href: "/ib-reward-logs",
    icon: HistoryIcon,
  },
  {
    title: "IB Rewards",
    href: "/ib-rewards",
    icon: CoinsIcon,
  },
] as const;

const bonusNavigation = [
  {
    title: "Bonus offers",
    href: "/bonus-offers",
    icon: GiftIcon,
  },
  {
    title: "Bonus offer templates",
    href: "/bonus-offer-templates",
    icon: LayoutTemplateIcon,
  },
  {
    title: "Bonus assignment logs",
    href: "/bonus-assignment-logs",
    icon: HistoryIcon,
  },
] as const;

const insuranceNavigation = [
  {
    title: "Insurance plans",
    href: "/insurance/plans",
    icon: ShieldIcon,
  },
  {
    title: "Account insurances",
    href: "/insurance/account-insurances",
    icon: HistoryIcon,
  },
] as const;

const contestsNavigation = [
  {
    title: "Contests",
    href: "/contests",
    icon: TrophyIcon,
  },
  {
    title: "Contest conditions",
    href: "/contest-conditions",
    icon: ClipboardListIcon,
  },
  {
    title: "Contest awards",
    href: "/contest-awards",
    icon: MedalIcon,
  },
  {
    title: "Contest subscriptions",
    href: "/contest-subscriptions",
    icon: UsersIcon,
  },
] as const;

const systemNavigation = [
  {
    title: "Scheduling",
    href: "/scheduled-commands",
    icon: CalendarClockIcon,
  },
] as const;

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-sidebar-foreground">
            MMT Broker
          </p>
          <p className="text-xs text-muted-foreground">Basic UI</p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Trading</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {tradingNavigation.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={pathname.startsWith(item.href)}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>IB</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {ibNavigation.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={pathname.startsWith(item.href)}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Bonuses</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {bonusNavigation.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={pathname.startsWith(item.href)}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Insurance</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {insuranceNavigation.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={pathname.startsWith(item.href)}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Contests</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {contestsNavigation.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={pathname.startsWith(item.href)}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemNavigation.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={pathname.startsWith(item.href)}
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
