import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TanVi | Crystal Ornaments & Healing Stones",
  description: "Where Crystal Meets Soul. Discover handpicked crystal rings, bracelets, necklaces, and raw healing stones designed for your spiritual journey.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background-dark text-text-ivory font-dm-sans relative flex flex-col selection:bg-primary/30 selection:text-accent">
        {/* Grain Overlay for background texture */}
        <div className="grain-overlay pointer-events-none" />
        
        {/* Custom Violet Glow Background */}
        <div className="fixed top-[20%] left-[50%] -translate-x-[50%] -translate-y-[50%] w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-[radial-gradient(circle,rgba(107,33,168,0.12)_0%,rgba(13,10,26,0)_70%)] z-[-1] pointer-events-none blur-[80px]" />
        
        <Providers>
          <div className="flex-1 flex flex-col z-10">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
