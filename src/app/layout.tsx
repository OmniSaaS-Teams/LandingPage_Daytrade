import type { Metadata } from "next";
import { Suspense } from "react";
import { SpecialistContactModal } from "../components/contact/SpecialistContact";
import { GoogleAnalytics } from "../components/integrations/GoogleAnalytics";
import { Leads2B } from "../components/integrations/Leads2B";
import { PageViewTracker } from "../components/integrations/PageViewTracker";
import { brand } from "../data/brand";
import { metadataBase } from "../lib/seo";
import "./globals.css";

const googleAnalyticsId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();

export const metadata: Metadata = {
  metadataBase,
  title: brand.name,
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <Suspense fallback={null}><Leads2B /></Suspense>
        <Suspense fallback={null}><PageViewTracker /></Suspense>
        {googleAnalyticsId && /^G-[A-Z0-9]+$/.test(googleAnalyticsId) && (
          <Suspense fallback={null}><GoogleAnalytics measurementId={googleAnalyticsId} /></Suspense>
        )}
        <SpecialistContactModal />
      </body>
    </html>
  );
}
