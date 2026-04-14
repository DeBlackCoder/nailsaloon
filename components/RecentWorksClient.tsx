"use client";
import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import WorkComments, { WorkActionBar } from "@/components/WorkComments";
import { FaTimes } from "react-icons/fa";

interface Work { _id: string; title: string; description: string; imageUrl: string; serviceType?: string; price?: string; likes?: number; }

export default function RecentWorksClient({ works }: { works: Work[] }) {
  const [selected, setSelected] = useState<Work | null>(null);

  return (
    <section id="works" className="py-20 bg-[#f2f2f2]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#222222] mb-3">Recent Works</h2>
          <p className="text-[#6a6a6a] text-lg">A glimpse of our latest creations</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 md:grid-rows-[auto_auto] gap-4">
          {works.map((work, i) => (
            <div
              key={work._id}
              className={`relative group rounded-[20px] overflow-hidden cursor-pointer ${i === 0 ? "col-span-2 md:col-span-2 md:row-span-2" : ""}`}
              style={{ aspectRatio: i === 0 ? "4/3" : "1/1" }}
              onClick={() => setSelected(work)}
            >
              <Image
                src={work.imageUrl}
                alt={work.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent flex flex-col justify-end p-4 md:opacity-0 md:bg-black/0 md:group-hover:opacity-100 md:group-hover:bg-black/50 transition-all duration-300">
                <h3 className="text-white font-bold text-sm drop-shadow">{work.title}</h3>
                <p className="text-white/80 text-xs mt-0.5 line-clamp-1">{work.description}</p>
                {work.price && <Badge variant="brand" className="mt-2 w-fit">{work.price}</Badge>}
                <div className="mt-2">
                  <WorkActionBar workId={work._id} initialLikes={work.likes ?? 0} onCommentClick={() => setSelected(work)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Work detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-[20px] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Image */}
            <div className="relative w-full aspect-video rounded-t-[20px] overflow-hidden">
              <Image src={selected.imageUrl} alt={selected.title} fill className="object-cover" sizes="600px" />
              <button
                onClick={() => setSelected(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>

            {/* Info + comments */}
            <div className="p-5">
              <div className="flex items-start justify-between gap-3 mb-1">
                <h3 className="font-bold text-lg text-[#222222]">{selected.title}</h3>
                {selected.price && <Badge variant="brand" className="flex-shrink-0">{selected.price}</Badge>}
              </div>
              <p className="text-sm text-[#6a6a6a] mb-1">{selected.description}</p>
              {selected.serviceType && (
                <Badge variant="secondary" className="text-xs mb-4">{selected.serviceType}</Badge>
              )}

              <div className="border-t border-[#e8e8e8] pt-4">
                <h4 className="text-sm font-semibold text-[#222222] mb-3">Comments</h4>
                <WorkComments workId={selected._id} />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
