import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { AppSidebar } from "@/modules/shared/components/sidebar/app-sidebar";
import { SidebarProvider, SidebarInset } from "@repo/ui/components/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <AppSidebar userName={session.user.name || session.user.email} />
      <SidebarInset>
        <div className="flex flex-col min-h-screen">
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

