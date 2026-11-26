import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";
import { publicPageMetadata } from "../../lib/seo";
import { InvestorContent } from "./InvestorContent";

export const metadata = publicPageMetadata("/investidor");

export default function InvestorPage() {
  return (
    <>
      <Navbar background="gradient" />
      <InvestorContent />
      <Footer />
    </>
  );
}
