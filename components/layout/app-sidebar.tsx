"use client";

import Link from "next/link";
import { useFeatureAvailability } from "@/features/feature-availability/components/feature-availability-provider";
import { featureForPage } from "@/features/feature-availability/types";
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
  MessageSquareWarningIcon,
  FilePenLineIcon,
  FileChartColumnIcon,
  PercentIcon,
  ScaleIcon,
  Settings2Icon,
  ShieldIcon,
  TrophyIcon,
  TagsIcon,
  UsersIcon,
  WalletIcon,
  RefreshCwIcon,
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
    title: "Trading migrations",
    href: "/trading-migrations",
    icon: RefreshCwIcon,
  },
  {
    title: "Positions",
    href: "/positions",
    icon: HistoryIcon,
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
  {
    title: "Symbol categories",
    href: "/symbol-categories",
    icon: TagsIcon,
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
    title: "Progression templates",
    href: "/ib-progression-templates",
    icon: WorkflowIcon,
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
    title: "Bonus logs",
    href: "/bonus-assignment-logs",
    icon: HistoryIcon,
  },
] as const;

const reportsNavigation = [
  {
    title: "Positions report",
    href: "/reports/positions",
    icon: FileChartColumnIcon,
  },
  {
    title: "IB reward trades",
    href: "/reports/ib-volume-reward-trades",
    icon: FileChartColumnIcon,
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
  {
    title: "Contest settings",
    href: "/contest-settings",
    icon: Settings2Icon,
  },
] as const;

const systemNavigation = [
  {
    title: "Configuration",
    href: "/configuration",
    icon: Settings2Icon,
  },
  {
    title: "Scheduling",
    href: "/scheduled-commands",
    icon: CalendarClockIcon,
  },
  {
    title: "Rejection templates",
    href: "/rejection-templates",
    icon: MessageSquareWarningIcon,
  },
  {
    title: "Forms",
    href: "/forms",
    icon: FilePenLineIcon,
  },
] as const;

export function AppSidebar() {
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
          <p className="text-xs text-muted-foreground">Basic UI</p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Finance</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {[
                { title: "Internas (legado)", href: "/finance/internal-transactions" },
                { title: "Movimientos de saldo", href: "/finance/account-balance-transactions" },
              ].map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton render={<Link href={item.href} />} isActive={pathname.startsWith(item.href)}>
                    <CoinsIcon /><span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>


        {states.trading ? (
          <SidebarGroup>
            <SidebarGroupLabel>Trading</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {tradingNavigation.filter(visible).map((item) => (
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
        ) : null}

        {states.ib ? (
          <SidebarGroup>
            <SidebarGroupLabel>IB</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {ibNavigation.filter(visible).map((item) => (
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
        ) : null}

        {states.bonus ? (
          <SidebarGroup>
            <SidebarGroupLabel>Bonuses</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {bonusNavigation.filter(visible).map((item) => (
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
        ) : null}

        <SidebarGroup>
          <SidebarGroupLabel>Reports</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {reportsNavigation.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton render={<Link href={item.href} />} isActive={pathname.startsWith(item.href)}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {states.insurance ? (
          <SidebarGroup>
            <SidebarGroupLabel>Insurance</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {insuranceNavigation.filter(visible).map((item) => (
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
        ) : null}

        {states.contests ? (
          <SidebarGroup>
            <SidebarGroupLabel>Contests</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {contestsNavigation.filter(visible).map((item) => (
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
        ) : null}

        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemNavigation.filter(visible).map((item) => (
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
