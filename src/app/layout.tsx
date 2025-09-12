import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";

import { AllProviders } from "@/contexts";
import AppHeader from "@/components/ui/app-header";

import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const DMSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cash or Cut",
  description: "Play cash or cut and win fast cash",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${DMSans.className} antialiased`}
        style={{
          background: `url('/app-bg.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <AllProviders>
          <div className="relative h-dvh overflow-hidden">
            <AppHeader />
            <main className="!h-[calc(100dvh-80px)] md:!h-[calc(100dvh-100px)] overflow-y-auto">
              {children}
            </main>
          </div>
          <Toaster />
        </AllProviders>
      </body>
    </html>
  );
}
