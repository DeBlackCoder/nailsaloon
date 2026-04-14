"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { FaTimes, FaCommentDots, FaPaperPlane } from "react-icons/fa";
import { GiNails } from "react-icons/gi";
import dynamic from "next/dynamic";
import data from "@emoji-mart/data";
import { toast } from "sonner";
const Picker = dynamic(() => import("@emoji-mart/react"), { ssr: false });

interface Msg { _id: string; message: string; type?: "text" | "image" | "sticker"; sender: "client" | "admin"; createdAt: string; }

interface Sticker { id: string; src: string; alt: string; }
const STICKERS: Sticker[] = [
  { id: "heart-eyes",     src: "/stickers/heart-eyes.webp",     alt: "Heart eyes" },
  { id: "sparkles",       src: "/stickers/sparkles.webp",       alt: "Sparkles" },
  { id: "nail-polish",    src: "/stickers/nail-polish.webp",    alt: "Nail polish" },
  { id: "fire",           src: "/stickers/fire.webp",           alt: "Fire" },
  { id: "crown",          src: "/stickers/crown.webp",          alt: "Crown" },
  { id: "rainbow",        src: "/stickers/rainbow.webp",        alt: "Rainbow" },
  { id: "star-struck",    src: "/stickers/star-struck.webp",    alt: "Star struck" },
  { id: "clapping",       src: "/stickers/clapping.webp",       alt: "Clapping" },
  { id: "love-letter",    src: "/stickers/love-letter.webp",    alt: "Love letter" },
  { id: "butterfly",      src: "/stickers/butterfly.webp",      alt: "Butterfly" },
  { id: "cherry-blossom", src: "/stickers/cherry-blossom.webp", alt: "Cherry blossom" },
  { id: "100",            src: "/stickers/100.webp",            alt: "100" },
];

const CLIENT_ID_KEY = "nail_chat_client_id";
const CLIENT_NAME_KEY = "nail_chat_client_name";

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function ClientChat() {
  const [open, setOpen] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);
  const [clientName, setClientName] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [pendingImage, setPendingImage] = useState<{ file: File; preview: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load identity from localStorage
  useEffect(() => {
    const id = localStorage.getItem(CLIENT_ID_KEY);
    const name = localStorage.getItem(CLIENT_NAME_KEY);
    if (id && name) { setClientId(id); setClientName(name); }
  }, []);

  const fetchMessages = useCallback(async (id: string) => {
    const res = await fetch(`/api/chat?clientId=${id}`);
    if (!res.ok) return;
    const data: Msg[] = await res.json();
    setMessages(prev => {
      const newAdminMsgs = data.filter(m => m.sender === "admin" && !prev.find(p => p._id === m._id));
      if (!open && newAdminMsgs.length > 0) setUnread(u => u + newAdminMsgs.length);
      return data;
    });
  }, [open]);

  // Poll when chat is open or we have an identity
  useEffect(() => {
    if (!clientId) return;
    fetchMessages(clientId);
    pollRef.current = setInterval(() => fetchMessages(clientId), 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [clientId, fetchMessages]);

  // Clear unread on open
  useEffect(() => { if (open) setUnread(0); }, [open]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    const id = genId();
    localStorage.setItem(CLIENT_ID_KEY, id);
    localStorage.setItem(CLIENT_NAME_KEY, nameInput.trim());
    setClientId(id);
    setClientName(nameInput.trim());
  };

  const handleEmojiSelect = (emoji: { native: string }) => {
    const el = inputRef.current;
    if (!el) { setInput(prev => prev + emoji.native); setShowEmojiPicker(false); return; }
    const start = el.selectionStart ?? input.length;
    const end = el.selectionEnd ?? input.length;
    const newVal = input.slice(0, start) + emoji.native + input.slice(end);
    setInput(newVal);
    requestAnimationFrame(() => {
      el.setSelectionRange(start + emoji.native.length, start + emoji.native.length);
      el.focus();
    });
    setShowEmojiPicker(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmojiPicker]);

  const sendMessage = async ({ message, type = "text" }: { message: string; type?: string }) => {
    if (!clientId || !clientName || sending) return;
    setSending(true);
    const optimistic: Msg = { _id: Date.now().toString(), message, type: type as "text" | "image" | "sticker", sender: "client", createdAt: new Date().toISOString() };
    setMessages(m => [...m, optimistic]);
    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, clientName, message, type, sender: "client" }),
      });
      await fetchMessages(clientId);
    } finally { setSending(false); }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput("");
    await sendMessage({ message: text, type: "text" });
  };

  const handleStickerSelect = async (sticker: Sticker) => {
    setShowStickerPicker(false);
    await sendMessage({ message: sticker.src, type: "sticker" });
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: fd }
    );
    if (!res.ok) throw new Error("Cloudinary upload failed");
    const json = await res.json();
    return json.secure_url as string;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    const preview = URL.createObjectURL(file);
    setPendingImage({ file, preview });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageSend = async () => {
    if (!pendingImage || uploading) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(pendingImage.file);
      URL.revokeObjectURL(pendingImage.preview);
      setPendingImage(null);
      await sendMessage({ message: url, type: "image" });
    } catch {
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`fixed bottom-24 right-6 z-50 h-14 w-14 rounded-full bg-[#222222] text-white shadow-lg ${open ? "hidden sm:flex" : "flex"} items-center justify-center hover:bg-[#444444] transition-all`}
        aria-label="Open chat"
      >
        {open ? <FaTimes className="h-5 w-5" /> : <FaCommentDots className="h-6 w-6" />}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
            {unread}
          </span>
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col overflow-hidden shadow-2xl border border-[#333] rounded-none h-full sm:inset-auto sm:bottom-44 sm:right-6 sm:w-[340px] sm:h-[480px] sm:rounded-[16px]">

          {/* Header — WhatsApp green */}
          <div className="bg-[#222222] px-4 py-3 flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-[#333333] flex items-center justify-center">
              <GiNails className="text-white text-lg" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Nail Studio</p>
              <p className="text-white/70 text-xs">Sofia · Usually replies fast</p>
            </div>
            <button onClick={() => setOpen(false)} className="ml-auto text-white/70 hover:text-white">
              <FaTimes />
            </button>
          </div>

          {/* Body */}
          {!clientId ? (
            /* Registration form */
            <div className="flex-1 bg-[#1a1a1a] flex items-center justify-center p-6">
              <div className="bg-white rounded-2xl p-5 shadow w-full">
                <p className="text-sm font-semibold text-[#222222] mb-1">Welcome! 👋</p>
                <p className="text-xs text-[#6a6a6a] mb-4">Enter your name to start chatting with us.</p>
                <form onSubmit={handleRegister} className="flex flex-col gap-3">
                  <input
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    placeholder="Your name"
                    autoFocus
                    className="w-full rounded-lg border border-[#c1c1c1] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#222222]"
                  />
                  <button
                    type="submit"
                    className="w-full bg-[#222222] text-white rounded-full py-2 text-sm font-semibold hover:bg-[#444444] transition-colors"
                  >
                    Start Chat
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2" style={{ background: "#1a1a1a url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4c5b0' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}>
                {messages.length === 0 && (
                  <div className="flex justify-center">
                    <div className="bg-[#FFF3CD] text-[#856404] text-xs px-3 py-1.5 rounded-full shadow-sm">
                      Say hi to Sofia! 👋
                    </div>
                  </div>
                )}
                {messages.map(m => (
                  <div key={m._id} className={`flex ${m.sender === "client" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] px-3 py-2 rounded-2xl shadow-sm text-sm relative ${
                      m.sender === "client"
                        ? "bg-[#222222] text-white rounded-br-sm"
                        : "bg-white text-[#222] rounded-bl-sm"
                    }`}>
                      {m.sender === "admin" && (
                        <p className="text-[10px] font-semibold text-[#222222] mb-0.5">Sofia</p>
                      )}
                      {m.type === "sticker" ? (
                        <img src={m.message} alt="sticker" className="w-24 h-24 object-contain" />
                      ) : m.type === "image" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.message} alt="shared image" className="max-w-full rounded-lg max-h-48 object-cover" />
                      ) : (
                        <p className="leading-relaxed">{m.message}</p>
                      )}
                      <p className="text-[10px] text-[#6a6a6a] text-right mt-1">{formatTime(m.createdAt)}</p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="bg-[#F0F0F0] px-3 py-2 flex-shrink-0">
                <div className="relative flex items-center gap-2">
                  {showEmojiPicker && (
                    <div ref={emojiPickerRef} className="absolute bottom-full left-0 right-0 z-10 mb-1">
                      <Picker data={data} onEmojiSelect={handleEmojiSelect} theme="dark" previewPosition="none" skinTonePosition="none" />
                    </div>
                  )}
                  {showStickerPicker && (
                    <div className="absolute bottom-full left-0 right-0 z-10 mb-1 bg-[#222] border border-[#444] rounded-xl p-2 shadow-xl">
                      <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                        {STICKERS.map(s => (
                          <button key={s.id} type="button" onClick={() => handleStickerSelect(s)} className="flex items-center justify-center p-1 rounded-lg hover:bg-[#333] transition-colors">
                            <img src={s.src} alt={s.alt} className="w-12 h-12 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {pendingImage && (
                    <div className="absolute bottom-full left-0 right-0 z-10 mb-1 bg-[#222] border border-[#444] rounded-xl p-2 shadow-xl">
                      <div className="relative inline-block">
                        <img src={pendingImage.preview} alt="preview" className="max-h-32 rounded-lg object-cover" />
                        <button
                          type="button"
                          onClick={() => { URL.revokeObjectURL(pendingImage.preview); setPendingImage(null); }}
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center"
                        >×</button>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button
                          type="button"
                          onClick={handleImageSend}
                          disabled={uploading}
                          className="flex-1 bg-[#222222] text-white rounded-full py-1.5 text-xs font-semibold hover:bg-[#444] transition-colors disabled:opacity-50"
                        >
                          {uploading ? "Uploading..." : "Send Image"}
                        </button>
                      </div>
                    </div>
                  )}
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                  <button type="button" onClick={() => setShowEmojiPicker(s => !s)} className="text-xl text-[#888] hover:text-[#222] transition-colors flex-shrink-0">😊</button>
                  <button type="button" onClick={() => setShowStickerPicker(s => !s)} className="text-xl text-[#888] hover:text-[#222] transition-colors flex-shrink-0">🎭</button>
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xl text-[#888] hover:text-[#222] transition-colors flex-shrink-0">📎</button>
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder="Type a message"
                    className="flex-1 rounded-full bg-white border border-[#e8e8e8] px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#222222]"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || sending}
                    className="w-9 h-9 rounded-full bg-[#222222] text-white flex items-center justify-center hover:bg-[#444444] transition-colors disabled:opacity-50"
                  >
                    <FaPaperPlane className="text-sm" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
