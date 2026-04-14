import { connectDB } from "@/lib/mongodb";
import RecentWork from "@/models/RecentWork";
import RecentWorksClient from "@/components/RecentWorksClient";

interface Work { _id: string; title: string; description: string; imageUrl: string; serviceType?: string; price?: string; likes?: number; }

async function getWorks(): Promise<Work[]> {
  try {
    await connectDB();
    const works = await RecentWork.find({}).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(works));
  } catch {
    return [];
  }
}

export default async function RecentWorksSection() {
  const works = await getWorks();
  return <RecentWorksClient works={works} />;
}
