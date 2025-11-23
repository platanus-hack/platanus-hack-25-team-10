import type { ReactNode } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/modules/shared/components/ui/breadcrumb";
import { SidebarTrigger } from "@/modules/shared/components/ui/sidebar";
import { cn } from "@/modules/shared/lib/utils";

interface BreadcrumbItemType {
  label: string;
  href: string;
}

interface ContainerProps {
  children: ReactNode;
  breadcrumbItems?: BreadcrumbItemType[];
  className?: string;
}

export function AdminContainer({
  children,
  breadcrumbItems,
  className,
}: ContainerProps) {
  return (
    <>
      <header className="flex h-16 w-full shrink-0 items-center gap-2">
        <div className="flex w-full items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbItems
                ? breadcrumbItems.map((item, index) => (
                    <div key={item.href} className="flex items-center">
                      <BreadcrumbItem>
                        <BreadcrumbLink href={item.href}>
                          {item.label}
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      {index < breadcrumbItems.length - 1 && (
                        <BreadcrumbSeparator />
                      )}
                    </div>
                  ))
                : null}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className={cn("flex flex-1 flex-col px-4 pb-4", className)}>
        {children}
      </div>
    </>
  );
}
