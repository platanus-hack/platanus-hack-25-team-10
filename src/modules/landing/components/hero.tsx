"use client";

import Link from "next/link";
import { Button } from "@/modules/shared/components/ui/button";
import { useScrollAnimation } from "@/modules/shared/hooks/use-scroll-animation";

export function Hero() {
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation();
  const { ref: descRef, isVisible: descVisible } = useScrollAnimation();
  const { ref: buttonRef, isVisible: buttonVisible } = useScrollAnimation();

  return (
    <div className="flex flex-col justify-between">
      <div className="mt-16 md:mt-24 text-center relative">
        <h1
          ref={titleRef as React.RefObject<HTMLHeadingElement>}
          className="text-5xl sm:text-6xl md:text-7xl font-sentient transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{
            opacity: titleVisible ? 1 : 0,
            transform: titleVisible ? "translateY(0)" : "translateY(30px)",
          }}
        >
          Privacy and security <br />
          <i className="font-light">built into</i> your payments
        </h1>
        <p
          ref={descRef as React.RefObject<HTMLParagraphElement>}
          className="font-mono text-sm sm:text-base text-foreground/60 text-balance mt-8 max-w-[520px] mx-auto transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] delay-150"
          style={{
            opacity: descVisible ? 1 : 0,
            transform: descVisible ? "translateY(0)" : "translateY(20px)",
          }}
        >
          Protect your financial data with virtual cards that shield your
          payment information from breaches and fraud
        </p>

        <div
          ref={buttonRef as React.RefObject<HTMLDivElement>}
          className="transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] delay-300"
          style={{
            opacity: buttonVisible ? 1 : 0,
            transform: buttonVisible ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <Link className="contents max-sm:hidden" href="/sign-in">
            <Button className="mt-14">Get Started</Button>
          </Link>
          <Link className="contents sm:hidden" href="/sign-in">
            <Button size="sm" className="mt-14">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
