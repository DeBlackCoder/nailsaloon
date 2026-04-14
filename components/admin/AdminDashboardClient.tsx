"use client";
import { useState } from "react";
import BookingsPanel from "@/components/admin/BookingsPanel";
import ReviewsPanel from "@/components/admin/ReviewsPanel";
import WorksPanel from "@/components/admin/WorksPanel";

type Tab = "bookings" | "reviews" | "works";

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: "bookings", label: "Bookings",     icon: "📅" },
  { id: "reviews",  label: "Reviews",      icon: "⭐" },
  { id: "works",    label: "Recent Works", icon: "🖼️" },
];

export default function AdminDashboardClient() {
  const [active, setActive] = useState<Tab>("bookings");

  return (
    <div className="min-h-screen bg-[#f2f2f2]">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#c1c1c1] shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💅</span>
            <span className="font-bold text-[#222222]">Admin Dashboard</span>
          </div>
          <a
            href="/"
            className="text-sm text-[#6a6a6a] hover:text-[#ff385c] transition-colors font-medium"
          >
            ← View Site
          </a>
        </div>
        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-1 pb-0 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                active === tab.id
                  ? "border-[#ff385c] text-[#ff385c]"
                  : "border-transparent text-[#6a6a6a] hover:text-[#222222]"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Panel */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {active === "bookings" && <BookingsPanel />}
        {active === "reviews"  && <ReviewsPanel />}
        {active === "works"    && <WorksPanel />}
      </main>
    </div>
  );
}
