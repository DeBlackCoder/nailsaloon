import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ChatMessage from "@/models/ChatMessage";

// GET /api/chat?clientId=xxx  — fetch messages for a client
// GET /api/chat?all=1          — fetch all conversations (admin)
export async function GET(req: NextRequest) {
  try { await connectDB(); } catch { return NextResponse.json({ error: "DB error" }, { status: 500 }); }

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");
  const all = searchParams.get("all");

  if (all) {
    // Return latest message per client + unread count
    const msgs = await ChatMessage.aggregate([
      { $sort: { createdAt: -1 } },
      { $group: {
        _id: "$clientId",
        clientName: { $first: "$clientName" },
        lastMessage: { $first: "$message" },
        lastSender: { $first: "$sender" },
        lastAt: { $first: "$createdAt" },
        unread: { $sum: { $cond: [{ $and: [{ $eq: ["$sender", "client"] }, { $eq: ["$read", false] }] }, 1, 0] } },
      }},
      { $sort: { lastAt: -1 } },
    ]);
    return NextResponse.json(msgs);
  }

  if (clientId) {
    const messages = await ChatMessage.find({ clientId }).sort({ createdAt: 1 });
    // Mark client messages as read
    await ChatMessage.updateMany({ clientId, sender: "client", read: false }, { read: true });
    return NextResponse.json(messages);
  }

  return NextResponse.json({ error: "Missing clientId or all param" }, { status: 400 });
}

// POST /api/chat — send a message
export async function POST(req: NextRequest) {
  let body: { clientId?: string; clientName?: string; message?: string; sender?: string; type?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }

  if (!body.clientId || !body.clientName || !body.message || !body.sender)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  try { await connectDB(); } catch { return NextResponse.json({ error: "DB error" }, { status: 500 }); }

  const msg = await ChatMessage.create({
    clientId: body.clientId,
    clientName: body.clientName,
    message: body.message.trim(),
    sender: body.sender,
    type: body.type || "text",
  });
  return NextResponse.json(msg, { status: 201 });
}
