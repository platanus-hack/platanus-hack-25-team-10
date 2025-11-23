import type { Metadata } from "next";
import SignUp from "@/modules/shared/components/sign-up";

export const metadata: Metadata = {
  title: "Sign Up",
  description:
    "Create your Shadow account and start protecting your financial data with secure virtual cards.",
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4">
      <SignUp />
    </div>
  );
}
