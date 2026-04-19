import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/layout/Hero";
import Features from "@/components/layout/Features";
import Pricing from "@/components/layout/Pricing";
import Testimonials from "@/components/layout/Testimonials";
import FAQ from "@/components/layout/FAQ";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Features />
      <Pricing />
      <Testimonials />
      <FAQ />
      <Footer />
    </main>
  );
}