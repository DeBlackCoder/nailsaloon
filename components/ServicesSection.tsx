import { Card, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GiHairStrands } from "react-icons/gi";
import { FaCut, FaMagic, FaSpa } from "react-icons/fa";
import { IconType } from "react-icons";

export interface Service {
  id: string;
  name: string;
  price: string;
  duration: string;
  description: string;
  icon: IconType;
  image: string;
}

export const services: Service[] = [
  {
    id: "Box Braids",
    name: "Box Braids",
    price: "$80",
    duration: "3–4 hrs",
    description: "Classic protective box braids in any size — small, medium, or large.",
    icon: GiHairStrands,
    image: "https://images.unsplash.com/photo-1590159983013-d4de8b5d4b8e?w=600&q=80",
  },
  {
    id: "Knotless Braids",
    name: "Knotless Braids",
    price: "$100",
    duration: "4–5 hrs",
    description: "Lightweight knotless braids for a natural, pain-free look.",
    icon: FaMagic,
    image: "https://images.unsplash.com/photo-1605980776566-0486c3ac7617?w=600&q=80",
  },
  {
    id: "Weave & Sew-In",
    name: "Weave & Sew-In",
    price: "$120",
    duration: "2–3 hrs",
    description: "Full sew-in weave with leave-out or closure for a flawless finish.",
    icon: FaCut,
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80",
  },
  {
    id: "Loc Styling",
    name: "Loc Styling",
    price: "$60",
    duration: "1–2 hrs",
    description: "Starter locs, retwist, and loc maintenance for all stages.",
    icon: FaSpa,
    image: "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=600&q=80",
  },
];

export default function ServicesSection() {
  return (
    <section id="services" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#222222] mb-3">Our Services</h2>
          <p className="text-[#6a6a6a] text-lg">Premium hair care tailored to you</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {services.map(service => (
            <Card
              key={service.id}
              data-testid="service-card"
              className="overflow-hidden transition-all duration-200 hover:-translate-y-1 cursor-pointer group p-0"
              style={{ boxShadow: "rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px" }}
            >
              {/* Service image */}
              <div className="relative w-full aspect-[4/3] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-2 left-2">
                  <service.icon className="text-xl text-white drop-shadow" />
                </div>
              </div>

              {/* Card body */}
              <div className="p-3 sm:p-4">
                <CardTitle data-testid="service-name" className="text-sm sm:text-base mb-1">{service.name}</CardTitle>
                <CardContent className="p-0 pb-2">
                  <p className="text-xs text-[#6a6a6a] line-clamp-2">{service.description}</p>
                </CardContent>
                <CardFooter className="p-0 flex items-center justify-between flex-wrap gap-1">
                  <div>
                    <span data-testid="service-price" className="text-base sm:text-lg font-bold text-[#ff385c]">{service.price}</span>
                    <span data-testid="service-duration" className="text-xs text-[#6a6a6a] ml-1">{service.duration}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">{service.duration}</Badge>
                </CardFooter>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
