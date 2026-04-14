"use client";
import { Button } from "@/components/ui/button";
import { FaTrophy, FaCheckCircle } from "react-icons/fa";
import { AiFillStar } from "react-icons/ai";

export default function HeroSection() {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ height: "100dvh", paddingTop: "120px" }}
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center animate-hero-fade-in"
        style={{ backgroundImage: "url('/hero-nail.jpg')" }}
      />
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-3xl mx-auto">
        <h1
          data-testid="hero-business-name"
          className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 animate-hero-slide-up"
          style={{ animationDelay: "0.1s" }}
        >
          Nail Studio
        </h1>
        <p
          data-testid="hero-tagline"
          className="text-lg md:text-2xl text-white/90 mb-8 animate-hero-slide-up"
          style={{ animationDelay: "0.25s" }}
        >
          Where Beauty Meets Precision
        </p>

        <div
          className="flex flex-col sm:flex-row gap-3 justify-center mb-12 animate-hero-slide-up"
          style={{ animationDelay: "0.4s" }}
        >
          <Button
            data-testid="hero-cta"
            variant="brand"
            size="lg"
            className="rounded-full px-8 text-base font-semibold shadow-lg w-full sm:w-auto"
            onClick={() => scrollTo("booking")}
          >
            Book Now
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="rounded-full px-8 text-base font-semibold bg-white/10 border-white/40 text-white hover:bg-white/20 w-full sm:w-auto"
            onClick={() => scrollTo("services")}
          >
            Explore Services
          </Button>
        </div>

        {/* Social proof strip */}
        <div
          className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/80 animate-fade-in"
          style={{ animationDelay: "0.6s" }}
        >
          <div className="flex items-center gap-1.5">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => <AiFillStar key={i} />)}
            </div>
            <span>5-star rated</span>
          </div>
          <div className="w-px h-4 bg-white/30 hidden sm:block" />
          <div className="flex items-center gap-1.5">
            <FaTrophy className="text-amber-400" />
            <span>5+ years experience</span>
          </div>
          <div className="w-px h-4 bg-white/30 hidden sm:block" />
          <div className="flex items-center gap-1.5">
            <FaCheckCircle className="text-green-400" />
            <span>No account needed</span>
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/60">
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <div className="w-5 h-8 rounded-full border border-white/40 flex items-start justify-center pt-1.5">
          <div className="w-1 h-1.5 rounded-full bg-white/80 animate-scroll-dot" />
        </div>
      </div>
    </section>
  );
}
