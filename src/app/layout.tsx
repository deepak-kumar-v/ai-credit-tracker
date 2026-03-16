import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const rootFont = JetBrains_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Credit Tracker",
  description: "Terminal-styled AI model cooldown tracker",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${rootFont.className} bg-[#0b0b0b] text-[#e5e5e5] antialiased selection:bg-[#333] selection:text-white`}>{children}</body>
    </html>
  );
}
