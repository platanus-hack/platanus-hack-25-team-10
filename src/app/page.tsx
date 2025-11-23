import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CTA } from "@/modules/landing/components/cta";
import { FAQ } from "@/modules/landing/components/faq";
import { Features } from "@/modules/landing/components/features";
import { Header } from "@/modules/landing/components/header";
import { Hero } from "@/modules/landing/components/hero";
import { HowItWorks } from "@/modules/landing/components/how-it-works";
import { Stats } from "@/modules/landing/components/stats";
import { auth } from "@/modules/shared/lib/auth";

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      <Stats />
      <FAQ />
      <CTA />
    </div>
  );
}
