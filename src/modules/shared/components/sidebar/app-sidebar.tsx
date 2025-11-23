"use client";

import {
  CreditCardIcon,
  CurrencyDollarIcon,
  HouseSimpleIcon,
  ReceiptIcon,
} from "@phosphor-icons/react";

import Image from "next/image";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/modules/shared/components/ui/sidebar";
import { LogoutButton } from "./logout-button";
import { NavMain } from "./nav-main";

export function AppSidebar() {
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
        icon: CreditCardIcon,
      },
      {
        title: "Virtual Cards",
        url: "virtual-cards",
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
                  className="size-8 shrink-0 object-contain dark:hidden"
                />
                <Image
                  src="/logo-white.png"
                  alt="shadow"
                  width={32}
                  height={32}
                  className="size-8 shrink-0 object-contain hidden dark:block"
                />
              </div>
              Shadow by Commet
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>{" "}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainWithSlug} />
      </SidebarContent>
      <SidebarFooter>
        <LogoutButton />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
