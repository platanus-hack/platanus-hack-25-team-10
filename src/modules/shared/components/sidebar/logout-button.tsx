"use client";

import { SignOut } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/modules/shared/components/ui/sidebar";
import { signOut } from "@/modules/shared/lib/auth-client";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOut();
      router.push("/sign-in");
    } catch (error) {
      console.error("Error during logout:", error);
      setIsLoading(false);
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          tooltip="Logout"
          onClick={handleLogout}
          disabled={isLoading}
        >
          <SignOut weight="duotone" />
          <span>{isLoading ? "Logging out..." : "Logout"}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
