import type { Metadata } from "next";
import "../globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnalyticsTracker } from "@/components/layout/AnalyticsTracker";
import { FloatingCTA } from "@/components/layout/FloatingCTA";
import { QuoteRequestDialog } from "@/components/layout/QuoteRequestDialog";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Tenali Central Furniture",
  description: "Experience premium solid wood furniture handcrafted in Tenali, Andhra Pradesh. Beautiful designs, termite warranty, custom specifications.",
  keywords: ["Furniture Store", "Teak Wood Furniture", "Custom Furniture", "Tenali Central Furniture", "Vijayawada", "Guntur"],
  openGraph: {
    title: "Tenali Central Furniture",
    description: "Premium handcrafted solid wood furniture in Andhra Pradesh.",
    images: ["/cover-photo.jpeg"],
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
      className="h-full antialiased"
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
