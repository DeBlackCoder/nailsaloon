"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FaHeart, FaRegHeart, FaReply, FaTrash } from "react-icons/fa";
import { BiComment } from "react-icons/bi";

export interface WorkComment {
  _id: string;
  workId: string;
  name: string;
  message: string;
  likes: number;
  adminReply?: string;
  createdAt: string;
}

function getInitials(name: string) { return name.trim().charAt(0).toUpperCase(); }
const COLORS = ["bg-pink-400","bg-purple-400","bg-indigo-400","bg-rose-400","bg-fuchsia-400","bg-violet-400"];
function avatarColor(name: string) { return COLORS[name.charCodeAt(0) % COLORS.length]; }
function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s/60)}m`;
  if (s < 86400) return `${Math.floor(s/3600)}h`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ── Inline Twitter-style action bar shown on each work card ──────────────────
export function WorkActionBar({ workId, initialLikes = 0, onCommentClick }: { workId: string; initialLikes?: number; onCommentClick: () => void }) {
  const [likes, setLikes] = useState(initialLikes);
  const [commentCount, setCommentCount] = useState(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    // Fetch comment count only (not likes — work-level likes come from the work object)
    fetch(`/api/works/${workId}/comments`)
      .then(r => r.json())
      .then((d: WorkComment[]) => {
        if (!Array.isArray(d)) return;
        setCommentCount(d.length);
      });
    // Check liked state from localStorage
    const key = `liked_work_${workId}`;
    if (localStorage.getItem(key)) setLiked(true);
  }, [workId]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (liked) return;
    // Optimistic
    setLikes(l => l + 1);
    setLiked(true);
    localStorage.setItem(`liked_work_${workId}`, "1");
    // Like the first comment or just track at work level via a dummy call
    // We store work-level likes separately via a dedicated endpoint
    await fetch(`/api/works/${workId}/like`, { method: "POST" });
  };

  return (
    <div className="flex items-center gap-4" onClick={e => e.stopPropagation()}>
      {/* Like */}
      <button
        onClick={handleLike}
        className={`flex items-center gap-1.5 text-sm font-medium transition-all group ${liked ? "text-[#ff385c]" : "text-white/80 hover:text-[#ff385c]"}`}
      >
        {liked
          ? <FaHeart className="text-base text-[#ff385c] scale-110" />
          : <FaRegHeart className="text-base group-hover:scale-110 transition-transform" />
        }
        <span>{likes}</span>
      </button>
      {/* Comment */}
      <button
        onClick={(e) => { e.stopPropagation(); onCommentClick(); }}
        className="flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-white transition-colors group"
      >
        <BiComment className="text-base group-hover:scale-110 transition-transform" />
        <span>{commentCount}</span>
      </button>
    </div>
  );
}

// ── Full comment thread (inside modal) ───────────────────────────────────────
export default function WorkComments({ workId, isAdmin = false }: { workId: string; isAdmin?: boolean }) {
  const [comments, setComments] = useState<WorkComment[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch(`/api/works/${workId}/comments`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setComments(d); });
    // Restore liked state
    const liked = new Set<string>();
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith(`liked_comment_`)) liked.add(k.replace("liked_comment_", ""));
    });
    setLikedIds(liked);
  }, [workId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/works/${workId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Failed"); return; }
      setComments(c => [data, ...c]);
      setName(""); setMessage("");
    } catch { toast.error("Something went wrong"); }
    finally { setLoading(false); }
  };

  const handleLike = async (id: string) => {
    if (likedIds.has(id)) return;
    const res = await fetch(`/api/works/${workId}/comments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "like" }),
    });
    if (res.ok) {
      const updated = await res.json();
      setComments(c => c.map(x => x._id === id ? updated : x));
      setLikedIds(s => { const n = new Set(s); n.add(id); return n; });
      localStorage.setItem(`liked_comment_${id}`, "1");
    }
  };

  const handleReply = async (id: string) => {
    if (!replyText.trim()) return;
    const res = await fetch(`/api/works/${workId}/comments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminReply: replyText }),
    });
    if (res.ok) {
      const updated = await res.json();
      setComments(c => c.map(x => x._id === id ? updated : x));
      setReplyId(null); setReplyText("");
      toast.success("Reply posted!");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this comment?")) return;
    const res = await fetch(`/api/works/${workId}/comments/${id}`, { method: "DELETE" });
    if (res.ok) {
      setComments(c => c.filter(x => x._id !== id));
      toast.success("Deleted");
    }
  };

  return (
    <div>
      {/* Compose box */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 pb-4 border-b border-[#e8e8e8] mb-4">
        <div className="flex gap-2">
          <div className="w-8 h-8 rounded-full bg-[#ff385c]/20 flex items-center justify-center text-[#ff385c] font-bold text-sm flex-shrink-0">
            ?
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-full border border-[#e8e8e8] bg-[#f7f7f7] px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff385c]"
            />
            <input
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Post your reply"
              className="w-full rounded-full border border-[#e8e8e8] bg-[#f7f7f7] px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff385c]"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" variant="brand" size="sm" className="rounded-full px-5 text-xs" disabled={loading || !name.trim() || !message.trim()}>
            {loading ? "Posting..." : "Reply"}
          </Button>
        </div>
      </form>

      {/* Thread */}
      <div className="flex flex-col divide-y divide-[#f0f0f0]">
        {comments.length === 0 && (
          <p className="text-sm text-[#6a6a6a] text-center py-6">No comments yet. Be the first!</p>
        )}
        {comments.map(c => (
          <div key={c._id} className="py-3 flex gap-3">
            {/* Avatar */}
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${avatarColor(c.name)}`}>
              {getInitials(c.name)}
            </div>

            <div className="flex-1 min-w-0">
              {/* Name + time */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm text-[#222]">{c.name}</span>
                <span className="text-xs text-[#6a6a6a]">· {timeAgo(c.createdAt)}</span>
                {isAdmin && (
                  <button onClick={() => handleDelete(c._id)} className="ml-auto text-[#6a6a6a] hover:text-red-500 transition-colors">
                    <FaTrash className="text-xs" />
                  </button>
                )}
              </div>

              {/* Message */}
              <p className="text-sm text-[#222] mt-0.5 leading-relaxed">{c.message}</p>

              {/* Admin reply */}
              {c.adminReply && (
                <div className="mt-2 pl-3 border-l-2 border-[#ff385c] bg-[#fff5f7] rounded-r-lg py-1.5 pr-2">
                  <p className="text-[11px] font-semibold text-[#ff385c] mb-0.5">Sofia ✓</p>
                  <p className="text-xs text-[#444]">{c.adminReply}</p>
                </div>
              )}

              {/* Twitter-style action row */}
              <div className="flex items-center gap-5 mt-2">
                {/* Like */}
                <button
                  onClick={() => handleLike(c._id)}
                  className={`flex items-center gap-1.5 text-xs transition-all group ${likedIds.has(c._id) ? "text-[#ff385c]" : "text-[#6a6a6a] hover:text-[#ff385c]"}`}
                >
                  {likedIds.has(c._id)
                    ? <FaHeart className="text-sm" />
                    : <FaRegHeart className="text-sm group-hover:scale-110 transition-transform" />
                  }
                  <span className="font-medium">{c.likes > 0 ? c.likes : ""}</span>
                </button>

                {/* Admin reply button */}
                {isAdmin && (
                  <button
                    onClick={() => { setReplyId(replyId === c._id ? null : c._id); setReplyText(""); }}
                    className="flex items-center gap-1.5 text-xs text-[#6a6a6a] hover:text-[#ff385c] transition-colors group"
                  >
                    <FaReply className="text-sm group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Reply</span>
                  </button>
                )}
              </div>

              {/* Admin reply input */}
              {isAdmin && replyId === c._id && (
                <div className="flex gap-2 mt-3">
                  <input
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Reply as Sofia..."
                    autoFocus
                    className="flex-1 rounded-full border border-[#e8e8e8] bg-[#f7f7f7] px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#ff385c]"
                  />
                  <Button size="sm" variant="brand" className="rounded-full text-xs px-4 h-7" onClick={() => handleReply(c._id)}>
                    Send
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
