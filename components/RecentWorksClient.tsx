"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import WorkComments, { WorkActionBar } from "@/components/WorkComments";
import { FaTimes } from "react-icons/fa";

interface Work {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  serviceType?: string;
  price?: string;
  likes?: number;
}

export default function RecentWorksClient({ works }: { works: Work[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const commentRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const toggleComments = (workId: string) => {
    setOpenId(prev => {
      const next = prev === workId ? null : workId;
      if (next) {
        // Scroll to the comment section after animation starts
        setTimeout(() => {
          commentRefs.current[next]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 50);
      }
      return next;
    });
  };

  return (
    <section id="works" className="py-20 bg-[#f2f2f2]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#222222] mb-3">Recent Works</h2>
          <p className="text-[#6a6a6a] text-lg">A glimpse of our latest creations</p>
        </div>

        <div className="flex flex-col gap-6">
          {works.length === 0 && (
            <div className="text-center py-16 text-[#aaa]">
              <p className="text-4xl mb-3">✂️</p>
              <p className="text-sm">No works posted yet. Check back soon!</p>
            </div>
          )}
          {works.map((work, i) => (
            <div key={work._id} className="bg-white rounded-[20px] overflow-hidden shadow-sm">
              {/* Image */}
              <div
                className={`relative group cursor-pointer ${i === 0 ? "aspect-[16/7]" : "aspect-[16/9]"}`}
                onClick={() => toggleComments(work._id)}
              >
                <Image
                  src={work.imageUrl}
                  alt={work.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 900px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                {/* Info overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
                  <div>
                    <h3 className="text-white font-bold text-base drop-shadow">{work.title}</h3>
                    <p className="text-white/80 text-xs mt-0.5 line-clamp-1">{work.description}</p>
                    {work.price && <Badge variant="brand" className="mt-1.5 w-fit">{work.price}</Badge>}
                  </div>
                  <div onClick={e => e.stopPropagation()}>
                    <WorkActionBar
                      workId={work._id}
                      initialLikes={work.likes ?? 0}
                      onCommentClick={() => toggleComments(work._id)}
                    />
                  </div>
                </div>
              </div>

              {/* Slide-down comment section */}
              <SlideDown open={openId === work._id}>
                <div
                  ref={el => { commentRefs.current[work._id] = el; }}
                  className="px-4 pt-4 pb-5 border-t border-[#f0f0f0]"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-[#222]">Comments</h4>
                    <button
                      onClick={() => setOpenId(null)}
                      className="w-6 h-6 rounded-full bg-[#f2f2f2] flex items-center justify-center text-[#999] hover:bg-[#e8e8e8] transition-colors"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  </div>
                  <WorkComments workId={work._id} />
                </div>
              </SlideDown>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Smooth slide-down wrapper ─────────────────────────────────────────────────
function SlideDown({ open, children }: { open: boolean; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
      // Measure after render
      requestAnimationFrame(() => {
        if (ref.current) setHeight(ref.current.scrollHeight);
      });
    } else {
      setHeight(0);
      const t = setTimeout(() => setVisible(false), 320);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!visible && !open) return null;

  return (
    <div
      style={{
        height: open ? height || "auto" : 0,
        overflow: "hidden",
        transition: "height 300ms ease-in-out",
      }}
    >
      <div ref={ref}>{children}</div>
    </div>
  );
}
