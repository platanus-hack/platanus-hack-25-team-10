"use client";

import Link from "next/link";
import { Button } from "@/modules/shared/components/ui/button";
import { useScrollAnimation } from "@/modules/shared/hooks/use-scroll-animation";

export function CTA() {
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation();
  const { ref: descRef, isVisible: descVisible } = useScrollAnimation();
  const { ref: buttonRef, isVisible: buttonVisible } = useScrollAnimation();

  return (
    <section id="get-started" className="relative py-24 md:py-32 bg-border/5">
      <div className="w-full">
        <div className="max-w-3xl mx-auto text-center">
          <h2
            ref={titleRef as React.RefObject<HTMLHeadingElement>}
            className="text-4xl md:text-5xl lg:text-6xl font-sentient mb-6 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{
              opacity: titleVisible ? 1 : 0,
              transform: titleVisible ? "translateY(0)" : "translateY(30px)",
            }}
          >
            Ready to protect <br />
            <i className="font-light">your payments?</i>
          </h2>
          <p
            ref={descRef as React.RefObject<HTMLParagraphElement>}
            className="font-mono text-foreground/60 mb-10 text-balance transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] delay-150"
            style={{
              opacity: descVisible ? 1 : 0,
              transform: descVisible ? "translateY(0)" : "translateY(20px)",
            }}
          >
            Join 250K+ users who trust us to secure their online transactions
            with virtual cards and bank-level encryption
          </p>
          <div
            ref={buttonRef as React.RefObject<HTMLDivElement>}
            className="transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] delay-300"
            style={{
              opacity: buttonVisible ? 1 : 0,
              transform: buttonVisible ? "translateY(0)" : "translateY(20px)",
            }}
          >
            <Link href="/sign-in">
              <Button size="lg" className="text-base">
                Get Started Free
              </Button>
            </Link>
          </div>
          <p className="font-mono text-xs text-foreground/40 mt-6">
            © 2025 Shadow. All rights reserved.
          </p>
        </div>
      </div>
    </section>
  );
}
