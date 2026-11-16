import type { Metadata } from "next";
import Script from "next/script";
import { Suspense } from "react";
import { SpecialistContactModal } from "../components/contact/SpecialistContact";
import { Leads2B } from "../components/integrations/Leads2B";
import "./globals.css";

export const metadata: Metadata = {
  title: "DayTrade Invest | Crédito Inteligente",
  description:
    "Site institucional para uma empresa do setor financeiro.",
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
        <Script id="leads2b-config" strategy="beforeInteractive">
          {`window.l2bConfig = { token: 'Yzc4ODE2MjUtNWIxZi00NzgzLWFjZmQtMjYwZmI0YTE0ZmNk', workerUrl: 'https://js.app.leads2b.com' };`}
        </Script>
        {children}
        <Suspense fallback={null}><Leads2B /></Suspense>
        <SpecialistContactModal />
      </body>
    </html>
  );
}
