"use client";

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/modules/shared/components/theme-toggle";
import { MobileMenu } from "./mobile-menu";

export const Header = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logoSrc =
    mounted && theme === "dark" ? "/logo-white.png" : "/logo-black.png";

  return (
    <div className="pt-4 md:pt-6">
      <header className="flex items-center justify-between w-full relative">
        <Link href="/">
          <Image src={logoSrc} alt="Shadow Logo" width={30} height={30} />
        </Link>
        <nav className="flex max-lg:hidden absolute left-1/2 -translate-x-1/2 items-center justify-center gap-x-10">
          {["Features", "How it Works", "FAQ"].map((item) => (
            <Link
              className="uppercase inline-block font-mono text-foreground/60 hover:text-foreground/100 duration-150 transition-colors ease-out"
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              key={item}
            >
              {item}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            className="uppercase max-lg:hidden transition-colors ease-out duration-150 font-mono text-primary hover:text-primary/80"
            href="/sign-in"
          >
            Get Started
          </Link>
          <MobileMenu />
        </div>
      </header>
    </div>
  );
};
