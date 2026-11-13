import type { Metadata } from "next";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";
import { InvestorContent } from "./InvestorContent";

export const metadata: Metadata = {
  title: "Grupo Invest - Seja Nosso Investidor",
  description: "Conheça nossa política de investimento, alocação dos recursos, controle de risco operacional, garantias e margem de segurança para investidores.",
};

export default function InvestorPage() {
  return (
    <>
      <Navbar />
      <InvestorContent />
      <Footer />
    </>
  );
}
