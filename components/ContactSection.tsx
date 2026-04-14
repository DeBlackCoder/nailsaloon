"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FaPhone, FaWhatsapp, FaInstagram, FaClock } from "react-icons/fa";

export default function ContactSection() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [nameErr, setNameErr] = useState("");
  const [msgErr, setMsgErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameErr(""); setMsgErr("");
    let valid = true;
    if (!name.trim()) { setNameErr("Name is required"); valid = false; }
    if (!message.trim()) { setMsgErr("Message is required"); valid = false; }
    if (!valid) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    toast.success("Message sent! We'll get back to you soon.");
    setName(""); setMessage("");
    setLoading(false);
  };

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#222222] mb-3">Get in Touch</h2>
          <p className="text-[#6a6a6a] text-lg">We&apos;d love to hear from you</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader><CardTitle>Contact Us</CardTitle></CardHeader>
              <CardContent className="flex flex-col gap-4">
                <a href="tel:+1234567890" className="flex items-center gap-3 text-[#222222] hover:text-[#ff385c] transition-colors">
                  <FaPhone className="text-xl text-[#ff385c]" />
                  <div>
                    <div className="font-medium text-sm">Phone</div>
                    <div className="text-[#6a6a6a] text-sm">+1 (234) 567-890</div>
                  </div>
                </a>
                <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[#222222] hover:text-[#ff385c] transition-colors">
                  <FaWhatsapp className="text-xl text-[#25D366]" />
                  <div>
                    <div className="font-medium text-sm">WhatsApp</div>
                    <div className="text-[#6a6a6a] text-sm">Chat with us directly</div>
                  </div>
                </a>
                <a href="https://instagram.com/nailstudio" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[#222222] hover:text-[#ff385c] transition-colors">
                  <FaInstagram className="text-xl text-[#E1306C]" />
                  <div>
                    <div className="font-medium text-sm">Instagram</div>
                    <div className="text-[#6a6a6a] text-sm">@nailstudio</div>
                  </div>
                </a>
              </CardContent>
            </Card>

            <div className="rounded-[20px] bg-[#222222] p-6 text-white">
              <h3 className="font-bold text-base mb-4 flex items-center gap-2">
                <FaClock className="text-[#ff385c]" /> Business Hours
              </h3>
              <div className="flex flex-col gap-2 text-sm">
                {[
                  { day: "Monday – Friday", hours: "9:00 AM – 6:00 PM" },
                  { day: "Saturday",        hours: "9:00 AM – 5:00 PM" },
                  { day: "Sunday",          hours: "Closed" },
                ].map(h => (
                  <div key={h.day} className="flex justify-between">
                    <span className="text-white/70">{h.day}</span>
                    <span className={h.hours === "Closed" ? "text-[#ff385c]" : "text-white"}>{h.hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Card>
            <CardHeader><CardTitle>Send a Message</CardTitle></CardHeader>
            <CardContent>
              <form data-testid="contact-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="relative">
                  <input
                    data-testid="contact-field-name"
                    id="c-name"
                    value={name}
                    onChange={e => { setName(e.target.value); setNameErr(""); }}
                    placeholder=" "
                    className="peer w-full rounded-lg border border-[#c1c1c1] bg-white px-3 pt-5 pb-2 text-sm text-[#222222] focus:outline-none focus:ring-2 focus:ring-[#ff385c]"
                  />
                  <label htmlFor="c-name" className="absolute left-3 top-3 text-xs text-[#6a6a6a] transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-xs pointer-events-none">
                    Your Name *
                  </label>
                  {nameErr && <p data-testid="contact-error-name" className="text-xs text-red-500 mt-1">{nameErr}</p>}
                </div>

                <div className="relative">
                  <textarea
                    data-testid="contact-field-message"
                    id="c-message"
                    value={message}
                    onChange={e => { setMessage(e.target.value); setMsgErr(""); }}
                    placeholder=" "
                    rows={5}
                    className="peer w-full rounded-lg border border-[#c1c1c1] bg-white px-3 pt-5 pb-2 text-sm text-[#222222] focus:outline-none focus:ring-2 focus:ring-[#ff385c] resize-none"
                  />
                  <label htmlFor="c-message" className="absolute left-3 top-3 text-xs text-[#6a6a6a] transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-xs pointer-events-none">
                    Your Message *
                  </label>
                  {msgErr && <p data-testid="contact-error-message" className="text-xs text-red-500 mt-1">{msgErr}</p>}
                </div>

                <Button data-testid="contact-submit" type="submit" variant="brand" className="w-full rounded-full" disabled={loading}>
                  {loading ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
