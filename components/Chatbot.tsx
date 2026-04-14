"use client";
import { useState, useEffect, useRef } from "react";
import { X, MessageCircle, Send } from "lucide-react";

interface Message { role: "bot" | "user"; text: string; chips?: string[]; }

type BookingStep = "idle" | "service" | "date" | "time" | "name" | "phone" | "confirm" | "done";

interface BookingDraft { service: string; date: string; time: string; name: string; phone: string; }

const SERVICES = ["Acrylic ($45)", "Gel ($35)", "Pedicure ($40)", "Nail Art ($55)"];
const TIME_SLOTS = ["9:00 AM","10:00 AM","11:00 AM","12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM"];

function getIntent(text: string): string {
  const t = text.toLowerCase();
  if (/\b(hi|hello|hey|howdy|sup|good morning|good afternoon)\b/.test(t)) return "greeting";
  if (/\b(bye|goodbye|see you|later|cya)\b/.test(t)) return "farewell";
  if (/\b(thank|thanks|thx|ty)\b/.test(t)) return "thanks";
  if (/\b(book|appointment|reserve|schedule|slot)\b/.test(t)) return "book";
  if (/\b(service|services|offer|available|what do you)\b/.test(t)) return "services";
  if (/\b(price|cost|how much|fee|charge|rate)\b/.test(t)) return "price";
  if (/\b(acrylic)\b/.test(t)) return "acrylic";
  if (/\b(gel)\b/.test(t)) return "gel";
  if (/\b(pedicure|pedi)\b/.test(t)) return "pedicure";
  if (/\b(nail art|design|custom)\b/.test(t)) return "nailart";
  if (/\b(hour|open|close|when|time|schedule|available)\b/.test(t)) return "hours";
  if (/\b(phone|call|number|contact|reach|whatsapp)\b/.test(t)) return "contact";
  if (/\b(location|address|where|find you|directions)\b/.test(t)) return "location";
  if (/\b(sofia|owner|artist|who)\b/.test(t)) return "about";
  if (/\b(cancel|cancellation|reschedule)\b/.test(t)) return "cancel";
  if (/\b(how long|duration|take)\b/.test(t)) return "duration";
  if (/\b(walk.?in|walk in|without appointment)\b/.test(t)) return "walkin";
  if (/\b(payment|pay|cash|card|credit)\b/.test(t)) return "payment";
  if (/\b(review|rating|feedback|testimonial)\b/.test(t)) return "reviews";
  if (/\b(instagram|social|follow)\b/.test(t)) return "social";
  if (/\b(safe|hygiene|clean|sanit)\b/.test(t)) return "hygiene";
  if (/\b(gift|voucher|gift card)\b/.test(t)) return "gift";
  if (/\b(help|support|assist)\b/.test(t)) return "help";
  return "unknown";
}

function getBotReply(intent: string): { text: string; chips?: string[] } {
  switch (intent) {
    case "greeting":   return { text: "Hey there! 💅 Welcome to Nail Studio. How can I help you today?", chips: ["Book appointment", "See services", "Pricing", "Hours"] };
    case "farewell":   return { text: "Bye! Come back anytime for gorgeous nails. 💖" };
    case "thanks":     return { text: "You're so welcome! 😊 Anything else I can help with?", chips: ["Book appointment", "See services"] };
    case "services":   return { text: "We offer 4 services:\n💎 Acrylic Extensions\n✨ Gel Polish\n🦶 Pedicure\n🎨 Nail Art\n\nWant details on any of these?", chips: ["Acrylic", "Gel", "Pedicure", "Nail Art"] };
    case "price":      return { text: "Here's our pricing:\n💎 Acrylic — $45\n✨ Gel — $35\n🦶 Pedicure — $40\n🎨 Nail Art — $55\n\nReady to book?", chips: ["Book now", "More info"] };
    case "acrylic":    return { text: "💎 Acrylic Extensions — $45 (75 min)\nLong-lasting extensions with a flawless finish. Perfect for length and strength!", chips: ["Book Acrylic", "See all services"] };
    case "gel":        return { text: "✨ Gel Polish — $35 (60 min)\nGlossy, chip-free gel that lasts for weeks. A client favourite!", chips: ["Book Gel", "See all services"] };
    case "pedicure":   return { text: "🦶 Pedicure — $40 (60 min)\nRelaxing pedicure with exfoliation, massage, and polish. Treat your feet!", chips: ["Book Pedicure", "See all services"] };
    case "nailart":    return { text: "🎨 Nail Art — $55 (90 min)\nCustom designs tailored to your style. From minimalist to bold — you dream it, Sofia creates it!", chips: ["Book Nail Art", "See all services"] };
    case "hours":      return { text: "🕐 Our hours:\nMon–Fri: 9 AM – 6 PM\nSaturday: 9 AM – 5 PM\nSunday: Closed\n\nWant to book a slot?", chips: ["Book appointment"] };
    case "contact":    return { text: "📞 Phone: +1 (234) 567-890\n💬 WhatsApp: +1 (234) 567-890\n📸 Instagram: @nailstudio\n\nFeel free to reach out anytime!" };
    case "location":   return { text: "📍 We're located in the heart of the city. Check the Contact section on our website for the full address and map!" };
    case "about":      return { text: "👩‍🎨 Sofia is a certified nail technician with 5+ years of experience. She's passionate about making every client feel confident and beautiful — one nail at a time! ✨" };
    case "cancel":     return { text: "To cancel or reschedule, please contact us via WhatsApp or phone at least 24 hours in advance. We'll be happy to find you a new slot! 📅" };
    case "duration":   return { text: "⏱️ Service durations:\n💎 Acrylic — 75 min\n✨ Gel — 60 min\n🦶 Pedicure — 60 min\n🎨 Nail Art — 90 min" };
    case "walkin":     return { text: "We recommend booking in advance to secure your preferred time. Walk-ins are welcome based on availability, but slots fill up fast! 🏃‍♀️", chips: ["Book appointment"] };
    case "payment":    return { text: "💳 We accept cash and all major credit/debit cards. Payment is due at the time of service." };
    case "reviews":    return { text: "⭐ We're proud of our 5-star reviews! You can read them on our website and leave your own after your visit. 💖" };
    case "social":     return { text: "📸 Follow us on Instagram @nailstudio for nail inspo, behind-the-scenes, and special offers!" };
    case "hygiene":    return { text: "🧼 Your safety is our priority. We use hospital-grade sterilization, single-use files, and premium skin-safe products for every client." };
    case "gift":       return { text: "🎁 Gift cards are available! Contact us via WhatsApp or phone to purchase one for someone special. 💝" };
    case "help":       return { text: "I can help with bookings, service info, pricing, hours, and more! What do you need?", chips: ["Book appointment", "Services", "Pricing", "Hours", "Contact"] };
    default:           return { text: "Hmm, I'm not sure about that one. 🤔 Here's what I can help with:", chips: ["Book appointment", "Services", "Pricing", "Hours", "Contact"] };
  }
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Hi! 💅 I'm your Nail Studio assistant. How can I help you today?", chips: ["Book appointment", "See services", "Pricing", "Hours"] }
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [bookingStep, setBookingStep] = useState<BookingStep>("idle");
  const [draft, setDraft] = useState<BookingDraft>({ service: "", date: "", time: "", name: "", phone: "" });
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => { if (!open) setShowBubble(true); }, 5000);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const addBot = (text: string, chips?: string[]) => {
    setMessages(m => [...m, { role: "bot", text, chips }]);
  };

  const addUser = (text: string) => {
    setMessages(m => [...m, { role: "user", text }]);
  };

  const simulateTyping = (fn: () => void | Promise<void>) => {
    setTyping(true);
    setTimeout(async () => { setTyping(false); await fn(); }, 700 + Math.random() * 400);
  };

  const handleBookingFlow = (userText: string) => {
    const t = userText.trim();
    if (bookingStep === "service") {
      // Match against service names (case-insensitive), preserve original casing for API
      const SERVICE_NAMES = ["Acrylic", "Gel", "Pedicure", "Nail Art"];
      const matched = SERVICE_NAMES.find(s =>
        t.toLowerCase().includes(s.toLowerCase())
      );
      const svcName = matched || t;
      setDraft(d => ({ ...d, service: svcName }));
      setBookingStep("date");
      simulateTyping(() => addBot(`Great choice! 💅 What date would you like? (e.g. ${new Date().toISOString().split("T")[0]})`));
    } else if (bookingStep === "date") {
      setDraft(d => ({ ...d, date: t }));
      setBookingStep("time");
      simulateTyping(() => addBot("What time works for you?", TIME_SLOTS));
    } else if (bookingStep === "time") {
      // Convert "9:00 AM" → "09:00" for API compatibility
      const timeMap: Record<string, string> = {
        "9:00 AM": "09:00", "10:00 AM": "10:00", "11:00 AM": "11:00",
        "12:00 PM": "12:00", "1:00 PM": "13:00", "2:00 PM": "14:00",
        "3:00 PM": "15:00", "4:00 PM": "16:00", "5:00 PM": "17:00",
      };
      const normalizedTime = timeMap[t] || t;
      setDraft(d => ({ ...d, time: normalizedTime }));
      setBookingStep("name");
      simulateTyping(() => addBot("What's your full name?"));
    } else if (bookingStep === "name") {
      setDraft(d => ({ ...d, name: t }));
      setBookingStep("phone");
      simulateTyping(() => addBot("And your phone number?"));
    } else if (bookingStep === "phone") {
      const newDraft = { ...draft, phone: t };
      setDraft(newDraft);
      setBookingStep("confirm");
      simulateTyping(() => addBot(
        `Here's your booking summary:\n📋 Service: ${newDraft.service}\n📅 Date: ${newDraft.date}\n🕐 Time: ${newDraft.time}\n👤 Name: ${newDraft.name}\n📞 Phone: ${t}\n\nConfirm booking?`,
        ["Yes, confirm!", "No, cancel"]
      ));
    } else if (bookingStep === "confirm") {
      if (/yes|confirm|ok|sure|yep|yeah/i.test(t)) {
        // Capture draft before any state changes
        const finalDraft = { ...draft };
        setBookingStep("done");
        simulateTyping(async () => {
          try {
            const res = await fetch("/api/bookings", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: finalDraft.name,
                phone: finalDraft.phone,
                service: finalDraft.service,
                date: finalDraft.date,
                time: finalDraft.time,
                notes: "Booked via chatbot",
              }),
            });
            if (res.ok) {
              addBot("🎉 Booking confirmed! We'll see you soon. 💖");
              setTimeout(() => document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" }), 1000);
            } else {
              const data = await res.json();
              if (res.status === 409) {
                addBot("That time slot is already taken. 😔 Want to pick a different time?", TIME_SLOTS);
                setBookingStep("time");
                return;
              }
              addBot(`Oops! ${data.error || "Something went wrong."} Please try the booking form on the page or call us directly.`);
            }
          } catch {
            addBot("Couldn't connect right now. Please use the booking form on the page or call us!");
          }
          setBookingStep("idle");
          setDraft({ service: "", date: "", time: "", name: "", phone: "" });
        });
      } else {
        setBookingStep("idle");
        setDraft({ service: "", date: "", time: "", name: "", phone: "" });
        simulateTyping(() => addBot("No worries! Booking cancelled. Anything else I can help with?", ["Book appointment", "Services", "Pricing"]));
      }
    }
  };

  const handleSend = (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg) return;
    setInput("");
    addUser(msg);

    if (bookingStep !== "idle" && bookingStep !== "done") {
      handleBookingFlow(msg);
      return;
    }

    const intent = getIntent(msg);
    if (intent === "book" || msg.toLowerCase().includes("book")) {
      setBookingStep("service");
      simulateTyping(() => addBot("Let's get you booked! 📅 Which service would you like?", SERVICES));
      return;
    }

    const reply = getBotReply(intent);
    simulateTyping(() => addBot(reply.text, reply.chips));
  };

  const handleChip = (chip: string) => {
    if (chip.toLowerCase().startsWith("book ")) {
      const svc = chip.replace(/^book /i, "");
      addUser(chip);
      setDraft(d => ({ ...d, service: svc }));
      setBookingStep("date");
      simulateTyping(() => addBot(`Great! ${svc} it is. 💅 What date would you like? (e.g. 2025-08-15)`));
      return;
    }
    if (chip === "Book now" || chip === "Book appointment") {
      addUser(chip);
      setBookingStep("service");
      simulateTyping(() => addBot("Which service would you like?", SERVICES));
      return;
    }
    handleSend(chip);
  };

  return (
    <>
      {/* Floating bubble */}
      {showBubble && !open && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => { setOpen(true); setShowBubble(false); }}
          onKeyDown={e => { if (e.key === "Enter") { setOpen(true); setShowBubble(false); } }}
          className="fixed bottom-24 left-6 z-50 animate-bubble-in cursor-pointer"
          aria-label="Open chat"
        >
          <div className="relative bg-white rounded-2xl shadow-xl px-4 py-3 max-w-[200px] border border-[#e8e8e8]">
            <button
              onClick={e => { e.stopPropagation(); setShowBubble(false); }}
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-[#6a6a6a] text-white text-xs flex items-center justify-center hover:bg-[#222222]"
              aria-label="Dismiss bubble"
            >
              ×
            </button>
            <p className="text-xs text-[#222222] font-medium">👋 Need help booking?</p>
            <p className="text-xs text-[#6a6a6a] mt-0.5">Chat with me!</p>
          </div>
          <div className="absolute -bottom-1 left-6 w-3 h-3 bg-white border-b border-r border-[#e8e8e8] rotate-45" />
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => { setOpen(o => !o); setShowBubble(false); }}
        className="fixed bottom-6 left-6 z-50 h-14 w-14 rounded-full bg-[#ff385c] text-white shadow-lg flex items-center justify-center hover:bg-[#e00b41] transition-all"
        aria-label="Toggle chat"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 left-2 right-2 sm:left-6 sm:right-auto z-50 sm:w-80 max-h-[70vh] sm:max-h-[520px] flex flex-col rounded-[20px] bg-white shadow-2xl border border-[#e8e8e8] animate-bubble-in overflow-hidden">
          {/* Header */}
          <div className="bg-[#ff385c] px-4 py-3 flex items-center gap-3">
            <span className="text-2xl">💅</span>
            <div>
              <p className="text-white font-semibold text-sm">Nail Studio Assistant</p>
              <p className="text-white/80 text-xs">Usually replies instantly</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0">
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-[#ff385c] text-white rounded-br-sm"
                    : "bg-[#f2f2f2] text-[#222222] rounded-bl-sm"
                }`}>
                  {m.text}
                </div>
                {m.chips && m.role === "bot" && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {m.chips.map(c => (
                      <button
                        key={c}
                        onClick={() => handleChip(c)}
                        className="px-3 py-1 rounded-full border border-[#ff385c] text-[#ff385c] text-xs font-medium hover:bg-[#ff385c] hover:text-white transition-colors"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {typing && (
              <div className="flex items-start">
                <div className="bg-[#f2f2f2] rounded-2xl rounded-bl-sm px-3 py-2 flex gap-1 items-center">
                  {[0, 0.2, 0.4].map((d, i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#6a6a6a] animate-typing-dot" style={{ animationDelay: `${d}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-[#e8e8e8] flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSend(); }}
              placeholder="Type a message..."
              className="flex-1 rounded-full border border-[#c1c1c1] px-4 py-2 text-sm text-[#222222] focus:outline-none focus:ring-2 focus:ring-[#ff385c]"
            />
            <button
              onClick={() => handleSend()}
              className="h-9 w-9 rounded-full bg-[#ff385c] text-white flex items-center justify-center hover:bg-[#e00b41] transition-colors flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
