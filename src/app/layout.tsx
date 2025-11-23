import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/modules/shared/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://shadow.commet.co",
  ),
  title: {
    default: "Shadow - Privacy and Security Built Into Your Payments",
    template: "%s | Shadow",
  },
  description:
    "Protect your financial data with virtual cards that shield your payment information from breaches and fraud. Privacy by default, secure by design.",
  keywords: [
    "virtual cards",
    "payment privacy",
    "financial security",
    "virtual credit cards",
    "secure payments",
    "fraud protection",
    "payment protection",
    "online privacy",
    "secure transactions",
    "digital wallet",
    "subscription management",
  ],
  authors: [{ name: "Shadow" }],
  creator: "Shadow",
  publisher: "Shadow",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Shadow",
    title: "Shadow - Privacy and Security Built Into Your Payments",
    description:
      "Protect your financial data with virtual cards that shield your payment information from breaches and fraud. Privacy by default, secure by design.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shadow - Privacy and Security Built Into Your Payments",
    description:
      "Protect your financial data with virtual cards that shield your payment information from breaches and fraud.",
    site: "@shadow",
    creator: "@shadow",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: "/",
  },
  category: "finance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
