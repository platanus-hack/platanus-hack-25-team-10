"use client";

import { CreditCard, Lock, Shield } from "lucide-react";
import { useScrollAnimation } from "@/modules/shared/hooks/use-scroll-animation";

const features = [
  {
    icon: Shield,
    title: "Privacy by Default",
    description:
      "Virtual cards shield your payment information with unique, anonymized 16-digit cards that mask your actual financial data",
  },
  {
    icon: Lock,
    title: "Secure by Design",
    description:
      "Cards lock to a single merchant and can't be used elsewhere if stolen. PCI-DSS compliant with 256-bit encryption",
  },
  {
    icon: CreditCard,
    title: "Complete Control",
    description:
      "Set spend limits, pause or close cards anytime. Perfect for managing subscriptions and protecting against unauthorized charges",
  },
];

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[0];
  index: number;
}) {
  const { ref: cardRef, isVisible: cardVisible } = useScrollAnimation();
  const Icon = feature.icon;

  return (
    <div
      ref={cardRef as React.RefObject<HTMLDivElement>}
      className="text-center transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
      style={{
        opacity: cardVisible ? 1 : 0,
        transform: cardVisible ? "translateY(0)" : "translateY(30px)",
        transitionDelay: `${index * 100}ms`,
      }}
    >
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 mb-6">
        <Icon className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-xl md:text-2xl font-sentient mb-4">
        {feature.title}
      </h3>
      <p className="font-mono text-sm text-foreground/60 leading-relaxed">
        {feature.description}
      </p>
    </div>
  );
}

export function Features() {
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation();

  return (
    <section id="features" className="relative py-24 md:py-32">
      <div className="w-full">
        <div
          ref={sectionRef as React.RefObject<HTMLDivElement>}
          className="text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{
            opacity: sectionVisible ? 1 : 0,
            transform: sectionVisible ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <h2 className="text-4xl md:text-5xl font-sentient mb-6">
            Your privacy is our <i className="font-light">priority</i>
          </h2>
          <p className="font-mono text-foreground/60">
            The security of your personal data always comes first. We generate
            revenue from merchant fees—never by selling your information.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
