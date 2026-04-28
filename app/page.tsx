import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/layout/Hero";
import Features from "@/components/layout/Features";
import Pricing from "@/components/layout/Pricing";
import Testimonials from "@/components/layout/Testimonials";
import FAQ from "@/components/layout/FAQ";
import Footer from "@/components/layout/Footer";
import { auth } from "@/lib/auth/options";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

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