"use client";
import { useState } from "react";
import BookingsPanel from "@/components/admin/BookingsPanel";
import ReviewsPanel from "@/components/admin/ReviewsPanel";
import WorksPanel from "@/components/admin/WorksPanel";
import ChatPanel from "@/components/admin/ChatPanel";
import { FaCalendarAlt, FaStar, FaImages, FaArrowLeft, FaSignOutAlt, FaComments } from "react-icons/fa";
import { GiNails } from "react-icons/gi";

type Tab = "bookings" | "reviews" | "works" | "chat";

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "bookings", label: "Bookings",     icon: FaCalendarAlt },
  { id: "reviews",  label: "Reviews",      icon: FaStar },
  { id: "works",    label: "Recent Works", icon: FaImages },
  { id: "chat",     label: "Chat",         icon: FaComments },
];

export default function AdminDashboardClient() {
  const [active, setActive] = useState<Tab>("bookings");

  const handleLogout = () => {
    sessionStorage.removeItem("admin_authed");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#f2f2f2]">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#c1c1c1] shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GiNails className="text-2xl text-[#ff385c]" />
            <span className="font-bold text-[#222222]">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-1 text-sm text-[#6a6a6a] hover:text-[#ff385c] transition-colors font-medium">
              <FaArrowLeft className="text-xs" /> View Site
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
            >
              <FaSignOutAlt className="text-xs" /> Logout
            </button>
          </div>
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
              <tab.icon className="text-sm" />
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
        {active === "chat"     && <ChatPanel />}
      </main>
    </div>
  );
}
