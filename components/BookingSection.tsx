"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { services } from "@/components/ServicesSection";
import { toast } from "sonner";
import { FaBolt, FaLock, FaWhatsapp, FaPaintBrush } from "react-icons/fa";
import { IconType } from "react-icons";

interface FormState {
  name: string; phone: string; service: string; date: string; time: string; notes: string;
}
interface FormErrors {
  name?: string; phone?: string; service?: string; date?: string; time?: string;
}

const timeSlots = ["9:00 AM","10:00 AM","11:00 AM","12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM"];

const perks: { icon: IconType; title: string; desc: string }[] = [
  { icon: FaBolt,       title: "Instant Confirmation", desc: "Get confirmed right away" },
  { icon: FaLock,       title: "No Account Needed",    desc: "Just fill and book" },
  { icon: FaWhatsapp,   title: "WhatsApp Updates",     desc: "We'll keep you posted" },
  { icon: FaPaintBrush, title: "Custom Requests",      desc: "Tell us your vision" },
];

export default function BookingSection() {
  const [form, setForm] = useState<FormState>({ name: "", phone: "", service: "", date: "", time: "", notes: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const set = (k: keyof FormState, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: undefined }));
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.name.trim())    e.name    = "Name is required";
    if (!form.phone.trim())   e.phone   = "Phone is required";
    if (!form.service)        e.service = "Please select a service";
    if (!form.date)           e.date    = "Date is required";
    if (!form.time)           e.time    = "Time is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Booking failed"); return; }
      toast.success("Booking confirmed! We'll be in touch.");
      setForm({ name: "", phone: "", service: "", date: "", time: "", notes: "" });
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="booking" className="py-20 bg-[#f2f2f2]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#222222] mb-3">Book an Appointment</h2>
          <p className="text-[#6a6a6a] text-lg">Reserve your spot in minutes</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Card>
              <CardHeader><CardTitle>Why Book With Us</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 gap-4">
                {perks.map(p => (
                  <div key={p.title} className="flex items-start gap-3">
                    <p.icon className="text-xl text-[#ff385c] mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-sm text-[#222222]">{p.title}</div>
                      <div className="text-xs text-[#6a6a6a]">{p.desc}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="rounded-[20px] bg-[#222222] p-6 text-white">
              <h3 className="font-bold text-base mb-4">Services & Pricing</h3>
              <div className="flex flex-col gap-3">
                {services.map(s => (
                  <div key={s.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <s.icon className="text-[#ff385c]" />
                      <span className="text-sm">{s.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[#ff385c] font-bold text-sm">{s.price}</span>
                      <span className="text-white/50 text-xs ml-1">{s.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: form */}
          <Card className="lg:col-span-3">
            <CardContent className="p-6">
              <form data-testid="booking-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="relative">
                  <input
                    data-testid="field-name"
                    id="b-name"
                    value={form.name}
                    onChange={e => set("name", e.target.value)}
                    placeholder=" "
                    className="peer w-full rounded-lg border border-[#c1c1c1] bg-white px-3 pt-5 pb-2 text-sm text-[#222222] focus:outline-none focus:ring-2 focus:ring-[#ff385c]"
                  />
                  <label htmlFor="b-name" className="absolute left-3 top-3 text-xs text-[#6a6a6a] transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-xs pointer-events-none">
                    Full Name *
                  </label>
                  {errors.name && <p data-testid="error-name" className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                <div className="relative">
                  <input
                    data-testid="field-phone"
                    id="b-phone"
                    value={form.phone}
                    onChange={e => set("phone", e.target.value)}
                    placeholder=" "
                    className="peer w-full rounded-lg border border-[#c1c1c1] bg-white px-3 pt-5 pb-2 text-sm text-[#222222] focus:outline-none focus:ring-2 focus:ring-[#ff385c]"
                  />
                  <label htmlFor="b-phone" className="absolute left-3 top-3 text-xs text-[#6a6a6a] transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-xs pointer-events-none">
                    Phone Number *
                  </label>
                  {errors.phone && <p data-testid="error-phone" className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <p className="text-xs text-[#6a6a6a] mb-2 font-medium">Select Service *</p>
                  <input type="hidden" data-testid="field-service" value={form.service} readOnly />
                  <div className="grid grid-cols-2 gap-2">
                    {services.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => set("service", s.id)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                          form.service === s.id
                            ? "border-[#ff385c] bg-[#ff385c]/5 text-[#ff385c]"
                            : "border-[#c1c1c1] bg-white text-[#222222] hover:border-[#ff385c]/50"
                        }`}
                      >
                        <s.icon className="text-base flex-shrink-0" />
                        <div className="text-left">
                          <div className="text-xs font-semibold">{s.name}</div>
                          <div className="text-xs text-[#6a6a6a]">{s.price} · {s.duration}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  {errors.service && <p data-testid="error-service" className="text-xs text-red-500 mt-1">{errors.service}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <input
                      data-testid="field-date"
                      id="b-date"
                      type="date"
                      value={form.date}
                      onChange={e => set("date", e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="peer w-full rounded-lg border border-[#c1c1c1] bg-white px-3 pt-5 pb-2 text-sm text-[#222222] focus:outline-none focus:ring-2 focus:ring-[#ff385c]"
                    />
                    <label htmlFor="b-date" className="absolute left-3 top-1.5 text-xs text-[#6a6a6a] pointer-events-none">Date *</label>
                    {errors.date && <p data-testid="error-date" className="text-xs text-red-500 mt-1">{errors.date}</p>}
                  </div>
                  <div className="relative">
                    <select
                      data-testid="field-time"
                      id="b-time"
                      value={form.time}
                      onChange={e => set("time", e.target.value)}
                      className="peer w-full rounded-lg border border-[#c1c1c1] bg-white px-3 pt-5 pb-2 text-sm text-[#222222] focus:outline-none focus:ring-2 focus:ring-[#ff385c] appearance-none"
                    >
                      <option value="">Select time</option>
                      {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <label htmlFor="b-time" className="absolute left-3 top-1.5 text-xs text-[#6a6a6a] pointer-events-none">Time *</label>
                    {errors.time && <p data-testid="error-time" className="text-xs text-red-500 mt-1">{errors.time}</p>}
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    data-testid="field-notes"
                    id="b-notes"
                    value={form.notes}
                    onChange={e => set("notes", e.target.value)}
                    placeholder=" "
                    rows={3}
                    className="peer w-full rounded-lg border border-[#c1c1c1] bg-white px-3 pt-5 pb-2 text-sm text-[#222222] focus:outline-none focus:ring-2 focus:ring-[#ff385c] resize-none"
                  />
                  <label htmlFor="b-notes" className="absolute left-3 top-3 text-xs text-[#6a6a6a] transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-xs pointer-events-none">
                    Special Requests (optional)
                  </label>
                </div>

                <Button
                  data-testid="submit-button"
                  type="submit"
                  variant="brand"
                  size="lg"
                  className="w-full rounded-full"
                  disabled={loading}
                >
                  {loading ? "Booking..." : "Confirm Booking"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
