"use client";

import {
  CurrencyDollarIcon,
  HouseSimpleIcon,
  ReceiptIcon,
} from "@phosphor-icons/react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@repo/ui/components/sidebar";
import Image from "next/image";
import { NavMain } from "@/modules/shared/components/sidebar/nav-main";

export function AppSidebar({ userName }: { userName?: string | null }) {
  const data = {
    navMain: [
      {
        title: "Dashboard",
        url: "dashboard",
        icon: HouseSimpleIcon,
      },
      {
        title: "Cards",
        url: "cards",
        icon: ReceiptIcon,
      },
      {
        title: "Transactions",
        url: "transactions",
        icon: CurrencyDollarIcon,
      },
    ],
  };

  // Create navigation items with dynamic URLs based on slug
  const navMainWithSlug = data.navMain.map((item) => ({
    ...item,
    url: `/${item.url}`,
  }));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center">
                <Image
                  src="/logo-black.png"
                  alt="shadow"
                  width={32}
                  height={32}
                  className="size-8 shrink-0 object-contain"
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate text-xs">
                  {userName || "Organization"}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>{" "}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainWithSlug} />
      </SidebarContent>
      <SidebarFooter>Logout</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
