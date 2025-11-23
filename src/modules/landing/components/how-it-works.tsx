"use client";

import { useScrollAnimation } from "@/modules/shared/hooks/use-scroll-animation";

const steps = [
  {
    number: "01",
    title: "Create Virtual Cards",
    description:
      "Generate unique 16-digit cards instantly for online purchases or subscriptions",
  },
  {
    number: "02",
    title: "Set Your Limits",
    description:
      "Control spending with customizable limits and merchant locks for each card",
  },
  {
    number: "03",
    title: "Shop Securely",
    description:
      "Your real payment info stays hidden, protected from breaches and fraud",
  },
  {
    number: "04",
    title: "Manage Easily",
    description: "Pause, close, or adjust cards anytime from your dashboard",
  },
];

function StepCard({ step, index }: { step: (typeof steps)[0]; index: number }) {
  const { ref: stepRef, isVisible: stepVisible } = useScrollAnimation();

  return (
    <div
      ref={stepRef as React.RefObject<HTMLDivElement>}
      className="relative transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
      style={{
        opacity: stepVisible ? 1 : 0,
        transform: stepVisible ? "translateY(0)" : "translateY(30px)",
        transitionDelay: `${index * 100}ms`,
      }}
    >
      <div className="text-6xl md:text-7xl font-sentient text-primary/20 mb-4">
        {step.number}
      </div>
      <h3 className="text-xl md:text-2xl font-sentient mb-3">{step.title}</h3>
      <p className="font-mono text-sm text-foreground/60 leading-relaxed">
        {step.description}
      </p>
    </div>
  );
}

export function HowItWorks() {
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation();

  return (
    <section id="how-it-works" className="relative py-24 md:py-32 bg-border/5">
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
            How it <i className="font-light">works</i>
          </h2>
          <p className="font-mono text-foreground/60">
            Get started in minutes with bank-level security and complete control
            over your payments
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <StepCard key={index} step={step} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
