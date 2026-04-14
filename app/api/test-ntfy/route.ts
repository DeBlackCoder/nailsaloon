import { NextResponse } from "next/server";

export async function GET() {
  const topic = process.env.NTFY_TOPIC;
  if (!topic) return NextResponse.json({ error: "NTFY_TOPIC not set" }, { status: 500 });

  try {
    const res = await fetch(`https://ntfy.sh/${topic}`, {
      method: "POST",
      headers: {
        "Title": "💅 Test notification",
        "Priority": "high",
        "Tags": "nail_care",
        "Content-Type": "text/plain",
      },
      body: "This is a test message from your nail studio chat!",
    });
    return NextResponse.json({ ok: res.ok, status: res.status, topic });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
