import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import RecentWorksClient from "@/components/RecentWorksClient";

interface Work { _id: string; title: string; description: string; imageUrl: string; serviceType?: string; price?: string; }

async function getWorks(): Promise<Work[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/works`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function RecentWorksSection() {
  const works = await getWorks();
  if (!works || works.length === 0) return null;
  return <RecentWorksClient works={works} />;
}
