"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Menu, X, Search } from "lucide-react";
import { GiNails } from "react-icons/gi";
import { FaHome, FaConciergeBell, FaCalendarAlt, FaImages, FaStar, FaInfoCircle, FaEnvelope } from "react-icons/fa";

const navLinks = [
  { id: "home",     label: "Home",     icon: FaHome,          href: "#home" },
  { id: "services", label: "Services", icon: FaConciergeBell, href: "#services" },
  { id: "booking",  label: "Book",     icon: FaCalendarAlt,   href: "#booking" },
  { id: "works",    label: "Works",    icon: FaImages,        href: "#works" },
  { id: "reviews",  label: "Reviews",  icon: FaStar,          href: "#reviews" },
  { id: "about",    label: "About",    icon: FaInfoCircle,    href: "#about" },
  { id: "contact",  label: "Contact",  icon: FaEnvelope,      href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [heroNameGone, setHeroNameGone] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [searchService, setSearchService] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchContact, setSearchContact] = useState("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const heroH1 = document.querySelector("[data-testid='hero-business-name']");
    if (!heroH1) return;
    const obs = new IntersectionObserver(
      ([entry]) => setHeroNameGone(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-64px 0px 0px 0px" }
    );
    obs.observe(heroH1);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const sections = navLinks.map(l => document.getElementById(l.id)).filter(Boolean) as HTMLElement[];
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) setActiveSection(entry.target.id); });
      },
      { threshold: 0.3 }
    );
    sections.forEach(s => observerRef.current?.observe(s));
    return () => observerRef.current?.disconnect();
  }, []);

  const scrollTo = (href: string) => {
    const id = href.replace("#", "");
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Main nav row */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => scrollTo("#home")} className="flex items-center gap-2 focus:outline-none">
            <GiNails className={`transition-all duration-300 ${scrolled ? "text-2xl text-[#ff385c]" : "text-4xl text-white"}`} />
            {(!scrolled || heroNameGone) && (
              <span className={`font-bold text-lg transition-all duration-300 ${scrolled ? "text-[#222222]" : "text-white"}`}>
                Nail Studio
              </span>
            )}
          </button>

          {/* Desktop center: tabs or search pill */}
          <nav className="hidden md:flex items-center">
            {!scrolled ? (
              <div className="flex items-center gap-1">
                {navLinks.map(link => (
                  <button
                    key={link.id}
                    onClick={() => scrollTo(link.href)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      activeSection === link.id
                        ? "bg-white/20 text-white"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <link.icon className="text-xs" />
                    <span>{link.label}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-1 bg-[#f2f2f2] rounded-full px-3 py-1.5 border border-[#c1c1c1]">
                <Search className="h-4 w-4 text-[#6a6a6a]" />
                <span className="text-sm text-[#6a6a6a] px-2">Quick search...</span>
                {navLinks.map(link => (
                  <button
                    key={link.id}
                    onClick={() => scrollTo(link.href)}
                    className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                      activeSection === link.id
                        ? "bg-[#ff385c] text-white"
                        : "text-[#6a6a6a] hover:text-[#222222]"
                    }`}
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            )}
          </nav>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => scrollTo("#about")}
              className={scrolled ? "text-[#222222]" : "text-white hover:bg-white/10"}>
              About us
            </Button>
            <Button variant="brand" size="sm" className="rounded-full" onClick={() => scrollTo("#booking")}>
              Book Now
            </Button>
          </div>

          {/* Mobile hamburger */}
          <Sheet>
            <SheetTrigger asChild>
              <button className={`md:hidden p-2 rounded-lg ${scrolled ? "text-[#222222]" : "text-white"}`}>
                <Menu className="h-6 w-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <GiNails className="text-2xl text-[#ff385c]" /> Nail Studio
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 p-4">
                {navLinks.map(link => (
                  <SheetClose asChild key={link.id}>
                    <button
                      onClick={() => scrollTo(link.href)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left ${
                        activeSection === link.id
                          ? "bg-[#ff385c]/10 text-[#ff385c]"
                          : "text-[#222222] hover:bg-[#f2f2f2]"
                      }`}
                    >
                      <link.icon className="text-lg" />
                      {link.label}
                    </button>
                  </SheetClose>
                ))}
                <div className="mt-4 pt-4 border-t border-[#c1c1c1]">
                  <SheetClose asChild>
                    <Button variant="brand" className="w-full rounded-full" onClick={() => scrollTo("#booking")}>
                      Book Now
                    </Button>
                  </SheetClose>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop expanded search bar (only when not scrolled) */}
        {!scrolled && (
          <div className="hidden md:flex items-center gap-0 bg-white rounded-full shadow-lg mb-3 overflow-hidden border border-[#e8e8e8] max-w-2xl mx-auto">
            <div className="flex-1 px-5 py-3 border-r border-[#e8e8e8]">
              <div className="text-xs font-semibold text-[#222222] mb-0.5">Service</div>
              <input
                value={searchService}
                onChange={e => setSearchService(e.target.value)}
                placeholder="Any service"
                className="w-full text-sm text-[#6a6a6a] outline-none bg-transparent"
              />
            </div>
            <div className="flex-1 px-5 py-3 border-r border-[#e8e8e8]">
              <div className="text-xs font-semibold text-[#222222] mb-0.5">Date</div>
              <input
                type="date"
                value={searchDate}
                onChange={e => setSearchDate(e.target.value)}
                className="w-full text-sm text-[#6a6a6a] outline-none bg-transparent"
              />
            </div>
            <div className="flex-1 px-5 py-3">
              <div className="text-xs font-semibold text-[#222222] mb-0.5">Contact</div>
              <input
                value={searchContact}
                onChange={e => setSearchContact(e.target.value)}
                placeholder="Your name"
                className="w-full text-sm text-[#6a6a6a] outline-none bg-transparent"
              />
            </div>
            <button
              onClick={() => scrollTo("#booking")}
              className="m-2 h-10 w-10 rounded-full bg-[#ff385c] flex items-center justify-center text-white hover:bg-[#e00b41] transition-colors flex-shrink-0"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
