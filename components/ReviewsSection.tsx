"use client";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StarRating from "@/components/ui/StarRating";
import { toast } from "sonner";
import { AiFillStar } from "react-icons/ai";

interface Review { _id: string; name: string; message: string; rating?: number; createdAt: string; }

function getInitials(name: string) {
  return name.trim().charAt(0).toUpperCase();
}

const AVATAR_COLORS = [
  "bg-pink-400", "bg-purple-400", "bg-indigo-400",
  "bg-rose-400", "bg-fuchsia-400", "bg-violet-400",
];

function avatarColor(name: string) {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function ReviewCard({ r, onHold }: { r: Review; onHold: (v: boolean) => void }) {
  return (
    <div
      className="mx-2 w-[280px] sm:w-[300px] flex-shrink-0 select-none"
      onMouseEnter={() => onHold(true)}
      onMouseLeave={() => onHold(false)}
      onTouchStart={() => onHold(true)}
      onTouchEnd={() => onHold(false)}
    >
      <Card className="h-full shadow-md hover:shadow-lg transition-shadow duration-200 border border-[#e8e8e8]">
        <CardContent className="p-5 flex flex-col gap-3">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0 ${avatarColor(r.name)}`}>
              {getInitials(r.name)}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-[#222222] text-sm truncate">{r.name}</p>
              {r.createdAt && (
                <p className="text-xs text-[#6a6a6a]">
                  {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              )}
            </div>
            {r.rating && (
              <div className="flex gap-0.5 ml-auto flex-shrink-0">
                {[1,2,3,4,5].map(s => (
                  <AiFillStar key={s} className={`text-sm ${s <= r.rating! ? "text-amber-400" : "text-gray-200"}`} />
                ))}
              </div>
            )}
          </div>
          {/* Message */}
          <p className="text-sm text-[#6a6a6a] leading-relaxed line-clamp-3">{r.message}</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [nameErr, setNameErr] = useState("");
  const [msgErr, setMsgErr] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [paused, setPaused] = useState(false);
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/comments").then(r => r.json()).then(d => { if (Array.isArray(d)) setReviews(d); });
  }, []);

  // Pause/resume via CSS class
  useEffect(() => {
    const el = marqueeRef.current;
    if (!el) return;
    el.style.animationPlayState = paused ? "paused" : "running";
  }, [paused]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameErr(""); setMsgErr("");
    let valid = true;
    if (!name.trim()) { setNameErr("Name is required"); valid = false; }
    if (!message.trim()) { setMsgErr("Message is required"); valid = false; }
    if (!valid) return;
    setLoading(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message, rating }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Failed to submit review"); return; }
      toast.success("Review submitted! Thank you.");
      setReviews(r => [data, ...r]);
      setName(""); setMessage(""); setRating(null);
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const doubled = [...reviews, ...reviews];

  return (
    <section id="reviews" className="py-20 bg-[#f2f2f2]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#222222] mb-3">Reviews</h2>
          <p className="text-[#6a6a6a] text-lg">What our clients say</p>
        </div>

        {/* Auto-scrolling marquee — shown on all screen sizes above the form */}
        {reviews.length > 0 && (
          <div className="mb-10">
            {/* Gradient fade edges + overflow clip */}
            <div className="overflow-hidden marquee-wrapper">
              <div
                ref={marqueeRef}
                className="animate-marquee"
                style={{ animationDuration: `${Math.max(20, reviews.length * 6)}s` }}
              >
                {doubled.map((r, i) => (
                  <ReviewCard key={`${r._id}-${i}`} r={r} onHold={setPaused} />
                ))}
              </div>
            </div>

            {/* See All button */}
            <div className="flex justify-center mt-6">
              <Button
                variant="outline"
                className="rounded-full px-6 border-[#ff385c] text-[#ff385c] hover:bg-[#ff385c] hover:text-white transition-colors"
                onClick={() => setShowAll(true)}
              >
                See All Reviews ({reviews.length})
              </Button>
            </div>
          </div>
        )}

        {/* See All modal */}
        {showAll && (
          <div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowAll(false)}
          >
            <div
              className="bg-white w-full max-w-2xl rounded-[20px] max-h-[80vh] overflow-y-auto shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white px-6 py-4 border-b border-[#e8e8e8] flex items-center justify-between rounded-t-[20px]">
                <h3 className="font-bold text-lg text-[#222222]">All Reviews ({reviews.length})</h3>
                <button
                  onClick={() => setShowAll(false)}
                  className="w-8 h-8 rounded-full bg-[#f2f2f2] flex items-center justify-center text-[#6a6a6a] hover:bg-[#e8e8e8] transition-colors text-xl leading-none"
                >
                  &times;
                </button>
              </div>
              <div className="p-6 flex flex-col gap-4">
                {reviews.map(r => (
                  <Card key={r._id} className="border border-[#e8e8e8]">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0 ${avatarColor(r.name)}`}>
                          {getInitials(r.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-[#222222] text-sm">{r.name}</p>
                          <p className="text-xs text-[#6a6a6a]">
                            {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        </div>
                        {r.rating && (
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(s => (
                              <AiFillStar key={s} className={`text-sm ${s <= r.rating! ? "text-amber-400" : "text-gray-200"}`} />
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-[#6a6a6a] leading-relaxed">{r.message}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Leave a review form */}
        <div className="max-w-lg mx-auto">
          <Card>
            <CardHeader><CardTitle>Leave a Review</CardTitle></CardHeader>
            <CardContent>
              <form data-testid="review-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input type="hidden" data-testid="review-field-name" value={name} readOnly />
                <div className="relative">
                  <input
                    id="r-name"
                    value={name}
                    onChange={e => { setName(e.target.value); setNameErr(""); }}
                    placeholder=" "
                    className="peer w-full rounded-lg border border-[#c1c1c1] bg-white px-3 pt-5 pb-2 text-sm text-[#222222] focus:outline-none focus:ring-2 focus:ring-[#ff385c]"
                  />
                  <label htmlFor="r-name" className="absolute left-3 top-3 text-xs text-[#6a6a6a] transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-xs pointer-events-none">
                    Your Name *
                  </label>
                  {nameErr && <p className="text-xs text-red-500 mt-1">{nameErr}</p>}
                </div>
                <div>
                  <p className="text-xs text-[#6a6a6a] mb-1 font-medium">Rating</p>
                  <StarRating value={rating} onChange={setRating} />
                </div>
                <div className="relative">
                  <textarea
                    data-testid="review-field-message"
                    id="r-message"
                    value={message}
                    onChange={e => { setMessage(e.target.value); setMsgErr(""); }}
                    placeholder=" "
                    rows={4}
                    className="peer w-full rounded-lg border border-[#c1c1c1] bg-white px-3 pt-5 pb-2 text-sm text-[#222222] focus:outline-none focus:ring-2 focus:ring-[#ff385c] resize-none"
                  />
                  <label htmlFor="r-message" className="absolute left-3 top-3 text-xs text-[#6a6a6a] transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-xs pointer-events-none">
                    Your Review *
                  </label>
                  {msgErr && <p className="text-xs text-red-500 mt-1">{msgErr}</p>}
                </div>
                <Button data-testid="review-submit" type="submit" variant="brand" className="w-full rounded-full" disabled={loading}>
                  {loading ? "Submitting..." : "Submit Review"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
