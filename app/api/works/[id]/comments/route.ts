import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import WorkComment from "@/models/WorkComment";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try { await connectDB(); } catch { return NextResponse.json({ error: "DB error" }, { status: 500 }); }
  const comments = await WorkComment.find({ workId: id }).sort({ createdAt: -1 });
  return NextResponse.json(comments);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body: { name?: string; message?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }
  if (!body.name?.trim() || !body.message?.trim())
    return NextResponse.json({ error: "Name and message are required" }, { status: 400 });
  try { await connectDB(); } catch { return NextResponse.json({ error: "DB error" }, { status: 500 }); }
  const comment = await WorkComment.create({ workId: id, name: body.name.trim(), message: body.message.trim() });
  return NextResponse.json(comment, { status: 201 });
}
