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
          <div className="relative min-h-[100svh] overflow-hidden">
            <AppHeader />
            <main className="!min-h-[calc(100svh-80px)] md:!min-h-[calc(100svh-100px)] overflow-y-auto">
              {children}
            </main>
          </div>
          <Toaster richColors position="top-center" />
        </AllProviders>
      </body>
    </html>
  );
}
