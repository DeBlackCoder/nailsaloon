import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import WorkComment from "@/models/WorkComment";

type Params = { params: Promise<{ id: string; commentId: string }> };

// Like a comment
export async function PATCH(req: NextRequest, { params }: Params) {
  const { commentId } = await params;
  let body: { action?: string; adminReply?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }
  try { await connectDB(); } catch { return NextResponse.json({ error: "DB error" }, { status: 500 }); }

  if (body.action === "like") {
    const comment = await WorkComment.findByIdAndUpdate(commentId, { $inc: { likes: 1 } }, { new: true });
    if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(comment);
  }

  if (body.adminReply !== undefined) {
    const comment = await WorkComment.findByIdAndUpdate(commentId, { adminReply: body.adminReply }, { new: true });
    if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(comment);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

// Delete a comment (admin)
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { commentId } = await params;
  try { await connectDB(); } catch { return NextResponse.json({ error: "DB error" }, { status: 500 }); }
  await WorkComment.findByIdAndDelete(commentId);
  return NextResponse.json({ message: "Deleted" });
}
