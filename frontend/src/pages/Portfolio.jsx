import Navbar from "@/components/site/Navbar";
import Hero from "@/components/site/Hero";
import NowRunning from "@/components/site/NowRunning";
import ClientMarquee from "@/components/site/ClientMarquee";
import About from "@/components/site/About";
import Gallery from "@/components/site/Gallery";
import Services from "@/components/site/Services";
import Experience from "@/components/site/Experience";
import Testimonials from "@/components/site/Testimonials";
import Contact from "@/components/site/Contact";
import Footer from "@/components/site/Footer";

export default function Portfolio() {
  return (
    <main data-testid="portfolio-page" className="bg-[#fdfbf7] text-[#141517] min-h-screen">
      <Navbar />
      <Hero />
      <NowRunning />
      <ClientMarquee />
      <About />
      <Gallery />
      <Services />
      <Experience />
      <Testimonials />
      <Contact />
      <Footer />
    </main>
  );
}
