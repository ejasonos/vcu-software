import React from "react"
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import { TelemetryProvider } from "@/components/telemetry-provider";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "VCU Monitor - EV Control System",
  description:
    "Vehicle Control Unit monitoring dashboard for Electric Vehicle telemetry, battery analysis, and AI-powered fault prediction.",
};

export const viewport: Viewport = {
  themeColor: "#0f1318",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <TelemetryProvider>
          <div className="flex h-screen overflow-hidden">
            <AppSidebar />
            <main className="flex flex-1 flex-col overflow-hidden">
              {children}
            </main>
          </div>
        </TelemetryProvider>
      </body>
    </html>
  );
}
