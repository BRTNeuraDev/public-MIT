import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import KitNavbar from "@/components/layout/KitNavbar";
import KitFooter from "@/components/layout/KitFooter";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BrtNeura Kit — Utility Tools That Just Work",
  description:
    "Browser-based tools for developers, MSMEs, and business operators. Built by BRTNeura Technology LLP.",
};

/**
 * Root layout wrapping every page with fonts, navbar, and footer.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${jetbrainsMono.variable} dark h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[#08080c] text-white">
        <KitNavbar />
        <main className="flex-1">{children}</main>
        <KitFooter />
      </body>
    </html>
  );
}
