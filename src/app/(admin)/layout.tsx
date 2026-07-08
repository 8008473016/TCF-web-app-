import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "TCF - Admin Control Panel",
  description: "Administrative console to manage catalog, CMS, media library, and leads for TCF Furniture.",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full bg-zinc-50 text-tcf-dark flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
