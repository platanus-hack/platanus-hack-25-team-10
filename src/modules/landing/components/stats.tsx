"use client";

import { useScrollAnimation } from "@/modules/shared/hooks/use-scroll-animation";

const stats = [
  {
    value: "250K+",
    label: "Active Users",
  },
  {
    value: "$3B+",
    label: "Processed Securely",
  },
  {
    value: "100%",
    label: "Data Privacy",
  },
  {
    value: "24/7",
    label: "Protection",
  },
];

function StatCard({ stat, index }: { stat: (typeof stats)[0]; index: number }) {
  const { ref: statRef, isVisible: statVisible } = useScrollAnimation();

  return (
    <div
      ref={statRef as React.RefObject<HTMLDivElement>}
      className="text-center transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
      style={{
        opacity: statVisible ? 1 : 0,
        transform: statVisible
          ? "translateY(0) scale(1)"
          : "translateY(20px) scale(0.95)",
        transitionDelay: `${index * 80}ms`,
      }}
    >
      <div className="text-4xl md:text-5xl lg:text-6xl font-sentient text-primary mb-3">
        {stat.value}
      </div>
      <p className="font-mono text-sm text-foreground/60">{stat.label}</p>
    </div>
  );
}

export function Stats() {
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation();

  return (
    <section className="relative py-24 md:py-32">
      <div className="w-full">
        <div
          ref={sectionRef as React.RefObject<HTMLDivElement>}
          className="text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{
            opacity: sectionVisible ? 1 : 0,
            transform: sectionVisible ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <h2 className="text-3xl md:text-4xl font-sentient mb-6">
            Trusted by thousands,{" "}
            <i className="font-light">protected by design</i>
          </h2>
          <p className="font-mono text-foreground/60">
            We protect payments using bank-level security and encryption,
            helping users save money and avoid fraud
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <StatCard key={index} stat={stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
