"use client";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { FaHeart, FaRegHeart, FaTrash } from "react-icons/fa";
import { BiComment } from "react-icons/bi";

export interface WorkComment {
  _id: string;
  workId: string;
  name: string;
  message: string;
  likes: number;
  adminReply?: string;
  createdAt: string;
  parentId?: string;
}

const NAME_KEY = "bb_commenter_name";

function getInitials(n: string) { return n.trim().charAt(0).toUpperCase(); }
const COLORS = ["bg-pink-400","bg-purple-400","bg-indigo-400","bg-rose-400","bg-fuchsia-400","bg-violet-400"];
function avatarColor(n: string) { return COLORS[n.charCodeAt(0) % COLORS.length]; }
function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ── WorkActionBar — unchanged ─────────────────────────────────────────────────
export function WorkActionBar({
  workId,
  initialLikes = 0,
  onCommentClick,
}: {
  workId: string;
  initialLikes?: number;
  onCommentClick: () => void;
}) {
  const [likes, setLikes] = useState(initialLikes);
  const [commentCount, setCommentCount] = useState(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    fetch(`/api/works/${workId}/comments`)
      .then(r => r.json())
      .then((d: WorkComment[]) => { if (Array.isArray(d)) setCommentCount(d.length); });
    if (localStorage.getItem(`liked_work_${workId}`)) setLiked(true);
  }, [workId]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (liked) return;
    setLikes(l => l + 1);
    setLiked(true);
    localStorage.setItem(`liked_work_${workId}`, "1");
    await fetch(`/api/works/${workId}/like`, { method: "POST" });
  };

  return (
    <div className="flex items-center gap-4" onClick={e => e.stopPropagation()}>
      <button
        onClick={handleLike}
        className={`flex items-center gap-1.5 text-sm font-medium transition-all group ${liked ? "text-[#ff385c]" : "text-white/80 hover:text-[#ff385c]"}`}
      >
        {liked
          ? <FaHeart className="text-base text-[#ff385c] scale-110" />
          : <FaRegHeart className="text-base group-hover:scale-110 transition-transform" />}
        <span>{likes}</span>
      </button>
      <button
        onClick={e => { e.stopPropagation(); onCommentClick(); }}
        className="flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-white transition-colors group"
      >
        <BiComment className="text-base group-hover:scale-110 transition-transform" />
        <span>{commentCount}</span>
      </button>
    </div>
  );
}

// ── TikTok-style single comment row ──────────────────────────────────────────
function TikTokComment({
  comment,
  replies,
  workId,
  savedName,
  likedIds,
  onLike,
  onDelete,
  onReplyPosted,
  isAdmin,
  isReply = false,
}: {
  comment: WorkComment;
  replies: WorkComment[];
  workId: string;
  savedName: string;
  likedIds: Set<string>;
  onLike: (id: string) => void;
  onDelete: (id: string) => void;
  onReplyPosted: (reply: WorkComment) => void;
  isAdmin: boolean;
  isReply?: boolean;
}) {
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [posting, setPosting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const submitReply = async () => {
    const name = isAdmin ? "Bright Beautician" : savedName;
    if (!replyText.trim() || !name) return;
    setPosting(true);
    try {
      // Admin uses adminReply patch, users post a new comment with parentId
      if (isAdmin) {
        const res = await fetch(`/api/works/${workId}/comments/${comment._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ adminReply: replyText.trim() }),
        });
        if (res.ok) { toast.success("Reply posted!"); setReplyText(""); setShowReplyInput(false); }
      } else {
        const res = await fetch(`/api/works/${workId}/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, message: replyText.trim(), parentId: comment._id }),
        });
        const data = await res.json();
        if (!res.ok) { toast.error(data.error || "Failed"); return; }
        onReplyPosted(data);
        setReplyText(""); setShowReplyInput(false);
        setShowReplies(true);
      }
    } catch { toast.error("Something went wrong"); }
    finally { setPosting(false); }
  };

  const isLiked = likedIds.has(comment._id);
  const canDelete = isAdmin || comment.name === savedName;

  return (
    <div className={`${isReply ? "pl-10" : ""}`}>
      {/* Main comment row */}
      <div className="flex items-start gap-3 py-3">
        {/* Avatar */}
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${avatarColor(comment.name)}`}>
          {getInitials(comment.name)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-semibold text-[13px] text-[#111]">{comment.name}</span>
            {comment.name === "Bright Beautician" && (
              <span className="text-[10px] bg-[#ff385c] text-white px-1.5 py-0.5 rounded-full font-medium">Owner</span>
            )}
            <span className="text-[11px] text-[#999]">{timeAgo(comment.createdAt)}</span>
          </div>
          <p className="text-[14px] text-[#222] leading-snug">{comment.message}</p>

          {/* Admin reply shown inline */}
          {comment.adminReply && (
            <div className="mt-2 flex items-start gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0 ${avatarColor("Bright Beautician")}`}>
                B
              </div>
              <div>
                <span className="text-[12px] font-semibold text-[#111] mr-1.5">Bright Beautician</span>
                <span className="text-[10px] bg-[#ff385c] text-white px-1.5 py-0.5 rounded-full font-medium mr-1.5">Owner</span>
                <p className="text-[13px] text-[#333] mt-0.5">{comment.adminReply}</p>
              </div>
            </div>
          )}

          {/* Action row */}
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() => { setShowReplyInput(s => !s); setTimeout(() => inputRef.current?.focus(), 50); }}
              className="text-[12px] text-[#999] hover:text-[#ff385c] font-medium transition-colors"
            >
              Reply
            </button>
            {!isReply && replies.length > 0 && (
              <button
                onClick={() => setShowReplies(s => !s)}
                className="text-[12px] text-[#ff385c] font-medium flex items-center gap-1"
              >
                {showReplies ? "▴" : "▾"} {showReplies ? "Hide" : `View ${replies.length}`} {replies.length === 1 ? "reply" : "replies"}
              </button>
            )}
            {canDelete && (
              <button onClick={() => onDelete(comment._id)} className="text-[#ddd] hover:text-red-400 transition-colors ml-auto">
                <FaTrash className="text-[11px]" />
              </button>
            )}
          </div>

          {/* Inline reply input */}
          {showReplyInput && (
            <div className="flex items-center gap-2 mt-2">
              <input
                ref={inputRef}
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitReply(); } }}
                placeholder={isAdmin ? "Reply as Bright Beautician..." : `Reply as ${savedName}...`}
                className="flex-1 bg-transparent border-b border-[#e0e0e0] focus:border-[#ff385c] outline-none text-[13px] py-1 text-[#222] placeholder:text-[#bbb] transition-colors"
              />
              <button
                onClick={submitReply}
                disabled={posting || !replyText.trim()}
                className="text-[#ff385c] text-[13px] font-semibold disabled:opacity-40 transition-opacity"
              >
                {posting ? "..." : "Post"}
              </button>
              <button onClick={() => setShowReplyInput(false)} className="text-[#bbb] text-[13px]">✕</button>
            </div>
          )}
        </div>

        {/* Heart — far right, TikTok style */}
        <button
          onClick={() => onLike(comment._id)}
          className="flex flex-col items-center gap-0.5 flex-shrink-0 ml-2"
        >
          {isLiked
            ? <FaHeart className="text-[#ff385c] text-base" />
            : <FaRegHeart className="text-[#999] text-base hover:text-[#ff385c] transition-colors" />}
          {comment.likes > 0 && <span className="text-[10px] text-[#999]">{comment.likes}</span>}
        </button>
      </div>

      {/* Nested replies */}
      {!isReply && showReplies && replies.length > 0 && (
        <div className="border-l-2 border-[#f0f0f0] ml-4 pl-2">
          {replies.map(r => (
            <TikTokComment
              key={r._id}
              comment={r}
              replies={[]}
              workId={workId}
              savedName={savedName}
              likedIds={likedIds}
              onLike={onLike}
              onDelete={onDelete}
              onReplyPosted={onReplyPosted}
              isAdmin={isAdmin}
              isReply
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main WorkComments component ───────────────────────────────────────────────
export default function WorkComments({
  workId,
  isAdmin = false,
}: {
  workId: string;
  isAdmin?: boolean;
}) {
  const [comments, setComments] = useState<WorkComment[]>([]);
  const [savedName, setSavedName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(NAME_KEY);
    if (stored) setSavedName(stored);
    fetch(`/api/works/${workId}/comments`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setComments(d); });
    const liked = new Set<string>();
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith("liked_comment_")) liked.add(k.replace("liked_comment_", ""));
    });
    setLikedIds(liked);
  }, [workId]);

  const saveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    localStorage.setItem(NAME_KEY, nameInput.trim());
    setSavedName(nameInput.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || (!savedName && !isAdmin)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/works/${workId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: isAdmin ? "Bright Beautician" : savedName, message: message.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Failed"); return; }
      setComments(c => [data, ...c]);
      setMessage("");
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

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this comment?")) return;
    const res = await fetch(`/api/works/${workId}/comments/${id}`, { method: "DELETE" });
    if (res.ok) { setComments(c => c.filter(x => x._id !== id)); toast.success("Deleted"); }
  };

  const handleReplyPosted = (reply: WorkComment) => {
    setComments(c => [...c, reply]);
  };

  // Separate top-level from replies
  const topLevel = comments.filter(c => !c.parentId);
  const getReplies = (parentId: string) => comments.filter(c => c.parentId === parentId);

  const displayName = isAdmin ? "Bright Beautician" : savedName;

  return (
    <div>
      {/* Name setup — first time only */}
      {!savedName && !isAdmin && (
        <form onSubmit={saveName} className="flex items-center gap-2 mb-3 pb-3 border-b border-[#f5f5f5]">
          <div className="w-8 h-8 rounded-full bg-[#f0f0f0] flex items-center justify-center text-[#999] text-lg flex-shrink-0">?</div>
          <input
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            placeholder="Enter your name to comment..."
            autoFocus
            className="flex-1 bg-transparent border-b border-[#e0e0e0] focus:border-[#ff385c] outline-none text-[13px] py-1 text-[#222] placeholder:text-[#bbb] transition-colors"
          />
          <button
            type="submit"
            disabled={!nameInput.trim()}
            className="text-[#ff385c] text-[13px] font-semibold disabled:opacity-40"
          >
            Done
          </button>
        </form>
      )}

      {/* Compose box */}
      {(savedName || isAdmin) && (
        <form onSubmit={handleSubmit} className="flex items-center gap-3 mb-3 pb-3 border-b border-[#f5f5f5]">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 ${avatarColor(displayName)}`}>
            {getInitials(displayName)}
          </div>
          <input
            ref={inputRef}
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e as unknown as React.FormEvent); } }}
            placeholder={`Add a comment as ${displayName}...`}
            className="flex-1 bg-transparent border-b border-[#e0e0e0] focus:border-[#ff385c] outline-none text-[13px] py-1 text-[#222] placeholder:text-[#bbb] transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="text-[#ff385c] text-[13px] font-semibold disabled:opacity-40 flex-shrink-0"
          >
            {loading ? "..." : "Post"}
          </button>
          {savedName && !isAdmin && (
            <button
              type="button"
              onClick={() => { localStorage.removeItem(NAME_KEY); setSavedName(""); }}
              className="text-[#ccc] hover:text-[#999] text-[11px] flex-shrink-0"
              title="Change name"
            >✎</button>
          )}
        </form>
      )}

      {/* Comment thread */}
      <div className="divide-y divide-[#f8f8f8]">
        {topLevel.length === 0 && (
          <p className="text-[13px] text-[#bbb] text-center py-6">No comments yet. Be the first! 💬</p>
        )}
        {topLevel.map(c => (
          <TikTokComment
            key={c._id}
            comment={c}
            replies={getReplies(c._id)}
            workId={workId}
            savedName={savedName}
            likedIds={likedIds}
            onLike={handleLike}
            onDelete={handleDelete}
            onReplyPosted={handleReplyPosted}
            isAdmin={isAdmin}
          />
        ))}
      </div>
    </div>
  );
}
