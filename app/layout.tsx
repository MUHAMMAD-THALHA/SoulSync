import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "SoulSync",
  description: "Connections built on trust, not vanity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 font-sans overflow-x-hidden">
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_#2d2a4a_0%,_#121214_100%)]" />
        <div className="fixed top-0 left-0 right-0 h-96 -z-10 animate-ethereal pointer-events-none opacity-40 bg-[radial-gradient(circle_at_center,_#a78bfa_0%,_transparent_70%)]" />
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
