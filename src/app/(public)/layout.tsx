import type { Metadata } from "next";
import "../globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnalyticsTracker } from "@/components/layout/AnalyticsTracker";
import { FloatingCTA } from "@/components/layout/FloatingCTA";
import { QuoteRequestDialog } from "@/components/layout/QuoteRequestDialog";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Tenali Central Furniture (TCF) | Premium Wood Furniture in Tenali",
  description: "Experience premium solid wood furniture handcrafted in Tenali, Andhra Pradesh. Custom teak wood beds, cushion sofas, dining tables & more. Best furniture store in Tenali.",
  keywords: ["Tenali Furniture", "Tenali Furnitures", "Furniture in Tenali", "Furniture Store Tenali", "Teak Wood Furniture Tenali", "Tenali Central Furniture", "Custom Wood Furniture"],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/icon.png",
  },
  openGraph: {
    title: "Tenali Central Furniture (TCF) | Tenali Furniture",
    description: "Premium handcrafted solid wood furniture in Tenali, Andhra Pradesh. Custom built for generations.",
    images: ["https://www.tenalicentralfurnitures.com/cover-photo.jpg"],
  },
  other: {
    thumbnail: "https://www.tenalicentralfurnitures.com/cover-photo.jpg"
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
