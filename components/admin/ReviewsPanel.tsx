"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FaTrash } from "react-icons/fa";

interface Review { _id: string; name: string; message: string; rating?: number; createdAt: string; }

export default function ReviewsPanel() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/comments")
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setReviews(d); })
      .catch(() => setError("Failed to load reviews"))
      .finally(() => setLoading(false));
  }, []);

  const deleteReview = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    try {
      const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setReviews(r => r.filter(x => x._id !== id));
      toast.success("Review deleted");
    } catch {
      toast.error("Failed to delete review");
    }
  };

  if (loading) return <div className="text-center py-16 text-[#6a6a6a]">Loading reviews...</div>;
  if (error)   return <div className="text-center py-16 text-red-500">{error}</div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xl font-bold text-[#222222]">Reviews</h2>
        <Badge variant="secondary">{reviews.length}</Badge>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-16 text-[#6a6a6a]">No reviews yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.map(r => (
            <Card key={r._id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-[#222222]">{r.name}</p>
                    <p className="text-xs text-[#6a6a6a]">
                      {new Date(r.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </p>
                  </div>
                  {r.rating && (
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <span key={s} className={`text-sm ${s <= r.rating! ? "text-amber-400" : "text-gray-200"}`}>★</span>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-sm text-[#6a6a6a] leading-relaxed mb-4">{r.message}</p>
                <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 w-full" onClick={() => deleteReview(r._id)}>
                  <FaTrash className="mr-1 text-xs" /> Delete Review
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
