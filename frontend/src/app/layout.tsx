import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "APM Job Finder",
  description: "Find the best Associate Product Manager jobs.",
};

import Navbar from "@/components/Navbar";

import { Suspense } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-black">
          <Suspense fallback={<div className="h-16 w-full border-b border-zinc-200 dark:border-zinc-800" />}>
            <Navbar />
          </Suspense>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
