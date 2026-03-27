import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import FeaturedCarousel from "@/components/sections/FeaturedCarousel";
import TrendingRow from "@/components/sections/TrendingRow";
import HowItWorks from "@/components/sections/HowItWorks";
import InstallCTA from "@/components/sections/InstallCTA";
import WhatsAppCommunity from "@/components/sections/WhatsAppCommunity";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-col">
        <Hero />

        <FeaturedCarousel />
        <TrendingRow />
        <HowItWorks />
        <InstallCTA />
        <WhatsAppCommunity />
      </main>
      <Footer />
    </>
  );
}