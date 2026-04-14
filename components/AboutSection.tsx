import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const specialties = ["Acrylic Extensions", "Gel Polish", "Nail Art", "Pedicure", "Ombre Nails", "Chrome Finish"];

export default function AboutSection() {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#222222] mb-3">About Sofia</h2>
          <p className="text-[#6a6a6a] text-lg">The artist behind every perfect nail</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Left: image */}
          <div className="relative rounded-[20px] overflow-hidden aspect-[4/5]">
            <Image
              src="/brushes.jpg"
              alt="Sofia's nail tools"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-pink-900/40 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <Badge variant="brand" className="text-sm px-4 py-1.5">✨ 5+ Years Experience</Badge>
            </div>
          </div>

          {/* Right: card */}
          <Card>
            <CardContent className="p-5 sm:p-8">
              <h3 className="text-2xl font-bold text-[#222222] mb-4">Hi, I&apos;m Sofia 👋</h3>
              <p className="text-[#6a6a6a] leading-relaxed mb-4">
                I&apos;m a certified nail technician with over 5 years of experience transforming nails into works of art.
                My passion is making every client feel confident and beautiful — one nail at a time.
              </p>
              <p className="text-[#6a6a6a] leading-relaxed mb-6">
                From classic gel manicures to intricate nail art, I bring precision, creativity, and care to every appointment.
                I use only premium, skin-safe products to ensure your nails look stunning and stay healthy.
              </p>

              <Separator className="mb-6" />

              <div>
                <p className="text-sm font-semibold text-[#222222] mb-3">Specialties</p>
                <div className="flex flex-wrap gap-2">
                  {specialties.map(s => (
                    <Badge key={s} variant="secondary">{s}</Badge>
                  ))}
                </div>
              </div>

              <Separator className="my-6" />

              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-sm px-4 py-2">🏆 Certified Nail Tech</Badge>
                <Badge variant="outline" className="text-sm px-4 py-2">⭐ 5-Star Rated</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
