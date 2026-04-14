import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import BookingSection from "@/components/BookingSection";
import AboutSection from "@/components/AboutSection";
import RecentWorksSection from "@/components/RecentWorksSection";
import ReviewsSection from "@/components/ReviewsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import Chatbot from "@/components/Chatbot";
import ClientChat from "@/components/ClientChat";
export default function Home() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <ServicesSection />
      <BookingSection />
      <AboutSection />
      <RecentWorksSection />
      <ReviewsSection />
      <ContactSection />
      <Footer />
      <ScrollToTop />
      <Chatbot />
      <ClientChat />
    </>
  );
}
