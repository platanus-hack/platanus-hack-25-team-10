import type { Metadata } from "next";
import SignIn from "@/modules/shared/components/sign-in";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to your Shadow account to manage your virtual cards and protect your financial data.",
};

export default function SignInPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4">
      <SignIn />
    </div>
  );
}
