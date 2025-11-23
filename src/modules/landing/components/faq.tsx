"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/modules/shared/components/ui/accordion";
import { useScrollAnimation } from "@/modules/shared/hooks/use-scroll-animation";

const faqs = [
  {
    question: "What is a virtual card?",
    answer:
      "A virtual card is a unique 16-digit card number with a CVV code and expiration date that can be generated instantly and used to make purchases online or over the phone. Our virtual cards mask your actual payment information to keep your financial data private from merchants and fraudulent actors.",
  },
  {
    question: "How does it protect me from fraud?",
    answer:
      "Our virtual cards automatically lock to the first merchant they're used at and can never be used anywhere else if stolen or compromised. You can also set cards for one-time use, customize spending limits, and pause or close cards anytime to prevent unauthorized charges.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Absolutely. We're PCI-DSS compliant and SOC 2 Type II certified, held to the same security standards as banks. Your data is secured with 256-bit encryption, and we never sell your personal information—we generate revenue from merchant fees only.",
  },
  {
    question: "Does it affect my credit score?",
    answer:
      "No. We never conduct credit pulls, and using our virtual cards will not impact your credit score. Virtual cards won't show up on your credit report.",
  },
  {
    question: "What do I need to get started?",
    answer:
      "You need to be a US citizen or legal resident with a checking account at a US bank or credit union, and be 18+ years of age. We require basic personal information for mandatory bank verification (KYC) to comply with anti-money laundering laws.",
  },
];

function FAQItem({ faq, index }: { faq: (typeof faqs)[0]; index: number }) {
  const { ref: itemRef, isVisible: itemVisible } = useScrollAnimation();

  return (
    <div
      ref={itemRef as React.RefObject<HTMLDivElement>}
      className="transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
      style={{
        opacity: itemVisible ? 1 : 0,
        transform: itemVisible ? "translateY(0)" : "translateY(20px)",
        transitionDelay: `${index * 80}ms`,
      }}
    >
      <AccordionItem
        value={`item-${index}`}
        className="border border-border rounded-lg px-6 bg-background last:border-b"
      >
        <AccordionTrigger className="font-mono text-left hover:no-underline py-6">
          {faq.question}
        </AccordionTrigger>
        <AccordionContent className="font-mono text-sm text-foreground/60 leading-relaxed pb-6">
          {faq.answer}
        </AccordionContent>
      </AccordionItem>
    </div>
  );
}

export function FAQ() {
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation();

  return (
    <section id="faq" className="relative py-24 md:py-32">
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
            Frequently asked <i className="font-light">questions</i>
          </h2>
          <p className="font-mono text-foreground/60">
            Everything you need to know about secure virtual card payments
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <FAQItem key={faq.question} faq={faq} index={index} />
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
