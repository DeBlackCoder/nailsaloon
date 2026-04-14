import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import RecentWork from "@/models/RecentWork";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try { await connectDB(); } catch { return NextResponse.json({ error: "DB error" }, { status: 500 }); }
  const work = await RecentWork.findByIdAndUpdate(id, { $inc: { likes: 1 } }, { new: true });
  if (!work) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ likes: work.likes });
}
