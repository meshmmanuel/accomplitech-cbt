import { ClientConnectionRoot } from "@/components/student/client-connection-root";
import { BRAND } from "@/lib/brand";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: BRAND.productName,
  description: `${BRAND.tagline} — built by ${BRAND.companyName}`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <ClientConnectionRoot>{children}</ClientConnectionRoot>
      </body>
    </html>
  );
}
