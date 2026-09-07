import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AuthProvider } from "../lib/auth-context";
import { SoilProvider } from "../lib/soil-context";
import DevSwCleaner from "../components/DevSwCleaner";

import "./globals.css";

export const metadata: Metadata = {
  title: "Soil Health",
  description: "Farmer Soil Health Assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <DevSwCleaner />
        <AuthProvider>
          <SoilProvider>{children}</SoilProvider>
        </AuthProvider>
      </body>
    </html>
  );
}