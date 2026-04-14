"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { GiNails } from "react-icons/gi";
import { FaCalendarAlt, FaClock, FaTrash, FaCheck, FaUndo } from "react-icons/fa";

interface Booking {
  _id: string; name: string; phone: string; service: string;
  date: string; time: string; notes?: string; status: "pending" | "completed";
}

export function LoadingState() {
  return <div className="text-center py-16 text-[#6a6a6a]">Loading bookings...</div>;
}
export function ErrorState({ message }: { message: string }) {
  return <div className="text-center py-16 text-red-500">{message}</div>;
}
export function EmptyState() {
  return <div className="text-center py-16 text-[#6a6a6a]">No bookings yet.</div>;
}
export function SectionHeader({ title, count }: { title: string; count: number }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <h2 className="text-xl font-bold text-[#222222]">{title}</h2>
      <Badge variant="secondary">{count}</Badge>
    </div>
  );
}

export default function BookingsPanel() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings");
      if (!res.ok) throw new Error("Failed to load bookings");
      setBookings(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error loading bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const updateStatus = async (id: string, status: "pending" | "completed") => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      setBookings(b => b.map(x => x._id === id ? { ...x, status } : x));
      toast.success(`Booking marked as ${status}`);
    } catch {
      toast.error("Failed to update booking");
    }
  };

  const deleteBooking = async (id: string) => {
    if (!confirm("Delete this booking?")) return;
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setBookings(b => b.filter(x => x._id !== id));
      toast.success("Booking deleted");
    } catch {
      toast.error("Failed to delete booking");
    }
  };

  if (loading) return <LoadingState />;
  if (error)   return <ErrorState message={error} />;

  return (
    <div>
      <SectionHeader title="Bookings" count={bookings.length} />
      {bookings.length === 0 ? <EmptyState /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookings.map(b => (
            <Card key={b._id} data-testid="booking-card">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p data-testid="booking-name" className="font-semibold text-[#222222]">{b.name}</p>
                    <p data-testid="booking-phone" className="text-sm text-[#6a6a6a]">{b.phone}</p>
                  </div>
                  <Badge data-testid="booking-status" variant={b.status === "completed" ? "success" : "pending"}>
                    {b.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2 mb-3 text-sm">
                  <span data-testid="booking-service" className="flex items-center gap-1 text-[#222222]">
                    <GiNails className="text-[#ff385c]" /> <span>{b.service}</span>
                  </span>
                  <span data-testid="booking-date" className="flex items-center gap-1 text-[#6a6a6a]">
                    <FaCalendarAlt className="text-xs" /> {b.date}
                  </span>
                  <span data-testid="booking-time" className="flex items-center gap-1 text-[#6a6a6a]">
                    <FaClock className="text-xs" /> {b.time}
                  </span>
                </div>
                {b.notes && (
                  <p data-testid="booking-notes" className="text-xs text-[#6a6a6a] mb-3 italic">&ldquo;{b.notes}&rdquo;</p>
                )}
                <div className="flex gap-2 flex-wrap">
                  {b.status === "pending" ? (
                    <Button data-testid="mark-completed-button" size="sm" variant="secondary" onClick={() => updateStatus(b._id, "completed")}>
                      <FaCheck className="mr-1 text-xs" /> Mark Completed
                    </Button>
                  ) : (
                    <Button data-testid="mark-pending-button" size="sm" variant="outline" onClick={() => updateStatus(b._id, "pending")}>
                      <FaUndo className="mr-1 text-xs" /> Mark Pending
                    </Button>
                  )}
                  <Button data-testid="delete-booking-button" size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => deleteBooking(b._id)}>
                    <FaTrash className="mr-1 text-xs" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
