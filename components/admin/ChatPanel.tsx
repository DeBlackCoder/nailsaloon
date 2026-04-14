"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { FaPaperPlane, FaCircle } from "react-icons/fa";
import { GiNails } from "react-icons/gi";

interface Conversation {
  _id: string; // clientId
  clientName: string;
  lastMessage: string;
  lastSender: "client" | "admin";
  lastAt: string;
  unread: number;
}

interface Msg { _id: string; message: string; sender: "client" | "admin"; createdAt: string; type?: "text" | "image" | "sticker"; }

function getInitials(name: string) { return name.trim().charAt(0).toUpperCase(); }
const COLORS = ["bg-pink-400","bg-purple-400","bg-indigo-400","bg-rose-400","bg-fuchsia-400","bg-violet-400"];
function avatarColor(name: string) { return COLORS[name.charCodeAt(0) % COLORS.length]; }

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ChatPanel() {
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchConvos = useCallback(async () => {
    const res = await fetch("/api/chat?all=1");
    if (res.ok) setConvos(await res.json());
  }, []);

  const fetchMessages = useCallback(async (clientId: string) => {
    const res = await fetch(`/api/chat?clientId=${clientId}`);
    if (res.ok) {
      setMessages(await res.json());
      // Refresh convos to clear unread badge
      fetchConvos();
    }
  }, [fetchConvos]);

  useEffect(() => {
    fetchConvos();
    const id = setInterval(fetchConvos, 5000);
    return () => clearInterval(id);
  }, [fetchConvos]);

  useEffect(() => {
    if (!selected) return;
    fetchMessages(selected._id);
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => fetchMessages(selected._id), 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [selected, fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !selected || sending) return;
    setSending(true);
    const text = input.trim();
    setInput("");
    const optimistic: Msg = { _id: Date.now().toString(), message: text, sender: "admin", createdAt: new Date().toISOString() };
    setMessages(m => [...m, optimistic]);
    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: selected._id, clientName: selected.clientName, message: text, sender: "admin" }),
      });
      await fetchMessages(selected._id);
    } finally { setSending(false); }
  };

  const totalUnread = convos.reduce((s, c) => s + c.unread, 0);

  return (
    <div className="flex h-full min-h-[600px] rounded-[16px] overflow-hidden border border-[#333] shadow-sm bg-[#1a1a1a]">

      {/* Sidebar — conversation list */}
      <div className={`${selected ? "hidden sm:flex" : "flex"} w-full sm:w-72 border-r border-[#e8e8e8] flex-col`}>
        <div className="bg-[#222222] px-4 py-3 flex items-center gap-2">
          <GiNails className="text-white text-xl" />
          <span className="text-white font-semibold text-sm">Chats</span>
          {totalUnread > 0 && (
            <span className="ml-auto bg-[#222222] text-white text-xs font-bold px-2 py-0.5 rounded-full">{totalUnread}</span>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {convos.length === 0 && (
            <p className="text-xs text-[#6a6a6a] text-center py-8">No conversations yet</p>
          )}
          {convos.map(c => (
            <button
              key={c._id}
              onClick={() => setSelected(c)}
              className={`w-full flex items-center gap-3 px-4 py-3 border-b border-[#f0f0f0] hover:bg-[#f5f5f5] transition-colors text-left ${selected?._id === c._id ? "bg-[#f0f0f0]" : ""}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${avatarColor(c.clientName)}`}>
                {getInitials(c.clientName)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#222] truncate">{c.clientName}</span>
                  <span className="text-[10px] text-[#6a6a6a] flex-shrink-0 ml-1">{formatTime(c.lastAt)}</span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-xs text-[#6a6a6a] truncate">
                    {c.lastSender === "admin" ? "You: " : ""}{c.lastMessage}
                  </p>
                  {c.unread > 0 && (
                    <span className="ml-1 w-5 h-5 rounded-full bg-[#222222] text-white text-[10px] flex items-center justify-center font-bold flex-shrink-0">
                      {c.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      {!selected ? (
        <div className="hidden sm:flex flex-1 items-center justify-center bg-[#1a1a1a]">
          <div className="text-center text-[#6a6a6a]">
            <GiNails className="text-5xl text-[#c1c1c1] mx-auto mb-3" />
            <p className="text-sm">Select a conversation to start chatting</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          {/* Chat header */}
          <div className="bg-[#1a1a1a] px-4 py-3 flex items-center gap-3 border-b border-[#e8e8e8]">
            <button onClick={() => setSelected(null)} className="sm:hidden mr-1 text-white/80 hover:text-white flex items-center">
              ←
            </button>
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm ${avatarColor(selected.clientName)}`}>
              {getInitials(selected.clientName)}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#222]">{selected.clientName}</p>
              <p className="text-xs text-[#6a6a6a] flex items-center gap-1">
                <FaCircle className="text-[#aaaaaa] text-[8px]" /> Online
              </p>
            </div>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-4 flex flex-col gap-2"
            style={{ background: "#1a1a1a url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4c5b0' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
          >
            {messages.map(m => (
              <div key={m._id} className={`flex ${m.sender === "admin" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] px-3 py-2 rounded-2xl shadow-sm text-sm ${
                  m.sender === "admin"
                    ? "bg-[#222222] text-white rounded-br-sm"
                    : "bg-white text-[#222] rounded-bl-sm"
                }`}>
                  {m.type === "sticker" ? (
                    <img src={m.message} alt="sticker" className="w-24 h-24 object-contain" />
                  ) : m.type === "image" ? (
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
          <div className="bg-[#111111] px-3 py-2 flex items-center gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={`Reply to ${selected.clientName}...`}
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
      )}
    </div>
  );
}
