import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
});

export const metadata: Metadata = {
  // Browser tab title
  title: "Your personal round hydration plan | Hydracaddie",
  description: "Personalised round hydration plan for golfers. Built on the Galpin equation.",
  openGraph: {
    // What shows when someone shares the link on WhatsApp, Twitter, LinkedIn etc.
    title: "Your personal round hydration plan",
    description: "Personalised round hydration plan for golfers. Built on the Galpin equation.",
    url: "https://hydracaddie-plan.vercel.app",
    siteName: "Hydracaddie",
    images: [{ url: "/hydracaddie-logo.png", width: 260, height: 60 }],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Your personal round hydration plan",
    description: "Personalised round hydration plan for golfers. Built on the Galpin equation.",
    images: ["/hydracaddie-logo.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-GB">
      <body className={nunito.className}>{children}</body>
    </html>
  );
}