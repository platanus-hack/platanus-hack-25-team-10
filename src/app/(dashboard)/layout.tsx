import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { AppSidebar } from "@/modules/shared/components/sidebar/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/modules/shared/components/ui/sidebar";
import { auth } from "@/modules/shared/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/sign-in");
  }

  return (
    <NuqsAdapter>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </NuqsAdapter>
  );
}
