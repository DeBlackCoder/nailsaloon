import { GiNails } from "react-icons/gi";
import { FaWhatsapp, FaInstagram, FaPhone } from "react-icons/fa";

const PHONE = "+1 (555) 123-4567";
const WHATSAPP_URL = "https://wa.me/15551234567";
const INSTAGRAM_URL = "https://instagram.com/luxenailsbysofia";
const INSTAGRAM_HANDLE = "@luxenailsbysofia";

const NAV_LINKS = [
  { label: "Home",     href: "#home" },
  { label: "Services", href: "#services" },
  { label: "Book",     href: "#booking" },
  { label: "Reviews",  href: "#reviews" },
  { label: "About",    href: "#about" },
  { label: "Contact",  href: "#contact" },
];

const SERVICES = [
  { name: "Acrylic Extensions", price: "$45" },
  { name: "Gel Polish",         price: "$35" },
  { name: "Pedicure",           price: "$40" },
  { name: "Nail Art",           price: "$55" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#222222] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">

        {/* Brand */}
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <GiNails className="text-2xl text-[#ff385c]" />
            <span className="text-white font-bold text-lg tracking-tight" style={{ letterSpacing: "-0.18px" }}>
              Nail Studio
            </span>
          </div>
          <p className="text-white/60 text-sm leading-relaxed mb-5">
            Premium nail care by Sofia — where beauty meets precision. Book your appointment today.
          </p>
          <div className="flex items-center gap-3">
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#ff385c] transition-colors duration-150"
              aria-label="WhatsApp">
              <FaWhatsapp className="text-base" />
            </a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#ff385c] transition-colors duration-150"
              aria-label="Instagram">
              <FaInstagram className="text-base" />
            </a>
            <a href={`tel:${PHONE.replace(/\D/g, "")}`}
              className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#ff385c] transition-colors duration-150"
              aria-label="Phone">
              <FaPhone className="text-base" />
            </a>
          </div>
        </div>

        {/* Navigation */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40 mb-4">Navigation</p>
          <ul className="flex flex-col gap-2.5">
            {NAV_LINKS.map(({ label, href }) => (
              <li key={href}>
                <a href={href} className="text-sm text-white/70 hover:text-white transition-colors duration-150">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Services */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40 mb-4">Services</p>
          <ul className="flex flex-col gap-2.5">
            {SERVICES.map(({ name, price }) => (
              <li key={name} className="flex items-center justify-between">
                <span className="text-sm text-white/70">{name}</span>
                <span className="text-xs text-[#ff385c] font-semibold">{price}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact + Hours */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40 mb-4">Contact</p>
          <div className="flex flex-col gap-2.5 mb-6">
            <a href={`tel:${PHONE.replace(/\D/g, "")}`} className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors duration-150">
              <FaPhone className="text-xs" /> {PHONE}
            </a>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors duration-150">
              <FaWhatsapp className="text-xs" /> WhatsApp
            </a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors duration-150">
              <FaInstagram className="text-xs" /> {INSTAGRAM_HANDLE}
            </a>
          </div>

          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40 mb-3">Hours</p>
          <div className="flex flex-col gap-1.5 text-sm">
            {[
              { day: "Mon – Fri", hours: "9 AM – 7 PM" },
              { day: "Saturday",  hours: "9 AM – 6 PM" },
              { day: "Sunday",    hours: "10 AM – 4 PM" },
            ].map(({ day, hours }) => (
              <div key={day} className="flex justify-between">
                <span className="text-white/50">{day}</span>
                <span className="text-white/80 font-medium">{hours}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/40 text-xs">© {year} Nail Studio by Sofia. All rights reserved.</p>
          <p className="text-white/30 text-xs">
            Powered by{" "}
            <a href="https://avulextech.site" target="_blank" rel="noopener noreferrer"
              className="text-white/50 font-medium hover:text-[#ff385c] transition-colors duration-150">
              Avulex Technologies
            </a>
          </p>
          <a href="/admin" className="text-white/20 text-xs hover:text-white/50 transition-colors duration-150">Admin</a>
        </div>
      </div>
    </footer>
  );
}
