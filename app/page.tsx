import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import InsuranceCarousel from "@/components/InsuranceCarousel";
import WholeWorldQuote from "@/components/WholeWorldQuote";
import LifeGoesOn from "@/components/LifeGoesOn";
import ProcessSteps from "@/components/ProcessSteps";
import TogetherSection from "@/components/TogetherSection";
import LifestyleGrid from "@/components/LifestyleGrid";
import ClosingCta from "@/components/ClosingCta";
import ComparisonTable from "@/components/ComparisonTable";
import FinalCtaFooter from "@/components/FinalCtaFooter";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <InsuranceCarousel />
        <WholeWorldQuote />
        <LifeGoesOn />
        <ProcessSteps />
        <TogetherSection />
        <LifestyleGrid />
        <ClosingCta />
        <ComparisonTable />
        <FinalCtaFooter />
      </main>
    </>
  );
}
