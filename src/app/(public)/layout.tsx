import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "../globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnalyticsTracker } from "@/components/layout/AnalyticsTracker";
import { FloatingCTA } from "@/components/layout/FloatingCTA";
import { QuoteRequestDialog } from "@/components/layout/QuoteRequestDialog";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TCF - Tenali Central Furniture | Premium Wooden Furniture Store",
  description: "Experience premium solid wood furniture handcrafted in Tenali, Andhra Pradesh. Beautiful designs, termite warranty, custom specifications.",
  keywords: ["Furniture Store", "Teak Wood Furniture", "Custom Furniture", "Tenali Central Furniture", "Vijayawada", "Guntur"],
  openGraph: {
    title: "TCF - Tenali Central Furniture",
    description: "Premium handcrafted solid wood furniture in Andhra Pradesh.",
    images: ["/logo.jpg"],
  }
};

export default function PublicLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal?: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-tcf-light text-tcf-dark selection:bg-tcf-red selection:text-white pb-16 md:pb-0">
        <AnalyticsTracker />
        <Navbar />
        <main className="flex-1 flex flex-col relative w-full">
          {children}
          {modal}
        </main>
        <Footer />
        <FloatingCTA />
        <QuoteRequestDialog />
      </body>
    </html>
  );
}
