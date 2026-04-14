"use client";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FaTrash, FaPlus, FaCommentAlt } from "react-icons/fa";
import WorkComments from "@/components/WorkComments";

interface Work { _id: string; title: string; description: string; imageUrl: string; serviceType?: string; price?: string; }
type ExpandedComments = Record<string, boolean>;

function AddWorkDialog({ onAdded }: { onAdded: (work: Work) => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageMode, setImageMode] = useState<"url" | "file">("url");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setImageUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !imageUrl) { toast.error("Title, description, and image are required"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/works", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, imageUrl, serviceType, price }),
      });
      if (!res.ok) { const d = await res.json(); toast.error(d.error || "Failed to add work"); return; }
      const work = await res.json();
      onAdded(work);
      toast.success("Work added!");
      setOpen(false);
      setTitle(""); setDescription(""); setServiceType(""); setPrice(""); setImageUrl("");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <Button variant="brand" onClick={() => setOpen(true)} className="rounded-full flex items-center gap-2">
        <FaPlus className="text-xs" /> Add Work
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[20px] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-[#c1c1c1] flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#222222]">Add Recent Work</h2>
          <button onClick={() => setOpen(false)} className="text-[#6a6a6a] hover:text-[#222222] text-xl">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-[#6a6a6a] mb-1 block">Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Pink Ombre Acrylic"
              className="w-full rounded-lg border border-[#c1c1c1] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff385c]" />
          </div>
          <div>
            <label className="text-xs font-medium text-[#6a6a6a] mb-1 block">Description *</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Brief description..."
              className="w-full rounded-lg border border-[#c1c1c1] px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#ff385c]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[#6a6a6a] mb-1 block">Service Type</label>
              <input value={serviceType} onChange={e => setServiceType(e.target.value)} placeholder="e.g. Acrylic"
                className="w-full rounded-lg border border-[#c1c1c1] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff385c]" />
            </div>
            <div>
              <label className="text-xs font-medium text-[#6a6a6a] mb-1 block">Price</label>
              <input value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. $45"
                className="w-full rounded-lg border border-[#c1c1c1] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff385c]" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-[#6a6a6a] mb-2 block">Image *</label>
            <div className="flex gap-2 mb-2">
              <button type="button" onClick={() => setImageMode("url")}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${imageMode === "url" ? "bg-[#ff385c] text-white border-[#ff385c]" : "border-[#c1c1c1] text-[#6a6a6a]"}`}>
                URL
              </button>
              <button type="button" onClick={() => setImageMode("file")}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${imageMode === "file" ? "bg-[#ff385c] text-white border-[#ff385c]" : "border-[#c1c1c1] text-[#6a6a6a]"}`}>
                Upload File
              </button>
            </div>
            {imageMode === "url" ? (
              <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..."
                className="w-full rounded-lg border border-[#c1c1c1] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff385c]" />
            ) : (
              <div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="w-full rounded-lg border-2 border-dashed border-[#c1c1c1] px-3 py-4 text-sm text-[#6a6a6a] hover:border-[#ff385c] transition-colors">
                  {imageUrl ? "✓ Image selected" : "Click to upload image"}
                </button>
              </div>
            )}
            {imageUrl && (
              <div className="mt-2 relative h-24 rounded-lg overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover rounded-lg" />
              </div>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="brand" className="flex-1" disabled={loading}>
              {loading ? "Adding..." : "Add Work"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function WorksPanel() {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<ExpandedComments>({});

  useEffect(() => {
    fetch("/api/works")
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setWorks(d); })
      .catch(() => setError("Failed to load works"))
      .finally(() => setLoading(false));
  }, []);

  const deleteWork = async (id: string) => {
    if (!confirm("Delete this work?")) return;
    try {
      const res = await fetch(`/api/works/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setWorks(w => w.filter(x => x._id !== id));
      toast.success("Work deleted");
    } catch {
      toast.error("Failed to delete work");
    }
  };

  if (loading) return <div className="text-center py-16 text-[#6a6a6a]">Loading works...</div>;
  if (error)   return <div className="text-center py-16 text-red-500">{error}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-[#222222]">Recent Works</h2>
          <Badge variant="secondary">{works.length}</Badge>
        </div>
        <AddWorkDialog onAdded={w => setWorks(prev => [w, ...prev])} />
      </div>

      {works.length === 0 ? (
        <div className="text-center py-16 text-[#6a6a6a]">No works yet. Add your first one!</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {works.map(w => (
            <Card key={w._id} className="group overflow-hidden">
              <div className="relative aspect-square overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={w.imageUrl} alt={w.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button onClick={() => deleteWork(w._id)} className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-red-600 transition-colors flex items-center gap-1">
                    <FaTrash className="text-xs" /> Delete
                  </button>
                </div>
              </div>
              <CardContent className="p-4">
                <p className="font-semibold text-[#222222] text-sm">{w.title}</p>
                <p className="text-xs text-[#6a6a6a] mt-1">{w.description}</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {w.serviceType && <Badge variant="secondary" className="text-xs">{w.serviceType}</Badge>}
                  {w.price && <Badge variant="brand" className="text-xs">{w.price}</Badge>}
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setExpanded(e => ({ ...e, [w._id]: !e[w._id] }))}
                    className="flex items-center gap-1 text-xs text-[#6a6a6a] hover:text-[#ff385c] transition-colors"
                  >
                    <FaCommentAlt className="text-xs" /> {expanded[w._id] ? "Hide" : "Comments"}
                  </button>
                </div>
                {expanded[w._id] && (
                  <div className="mt-2 border-t border-[#e8e8e8] pt-3">
                    <WorkComments workId={w._id} isAdmin />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
