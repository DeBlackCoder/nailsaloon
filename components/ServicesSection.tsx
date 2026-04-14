import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface Service {
  id: string;
  name: string;
  price: string;
  duration: string;
  description: string;
  emoji: string;
}

export const services: Service[] = [
  { id: "Acrylic",  name: "Acrylic",   price: "$45", duration: "75 min", description: "Long-lasting acrylic extensions with a flawless finish.", emoji: "💎" },
  { id: "Gel",      name: "Gel",       price: "$35", duration: "60 min", description: "Glossy gel polish that stays chip-free for weeks.",       emoji: "✨" },
  { id: "Pedicure", name: "Pedicure",  price: "$40", duration: "60 min", description: "Relaxing pedicure with exfoliation and polish.",           emoji: "🦶" },
  { id: "Nail Art", name: "Nail Art",  price: "$55", duration: "90 min", description: "Custom nail art designs tailored to your style.",          emoji: "🎨" },
];

export default function ServicesSection() {
  return (
    <section id="services" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#222222] mb-3">Our Services</h2>
          <p className="text-[#6a6a6a] text-lg">Premium nail care tailored to you</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {services.map(service => (
            <Card
              key={service.id}
              data-testid="service-card"
              className="transition-all duration-200 hover:-translate-y-1 cursor-pointer group"
              style={{ boxShadow: "rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px" }}
            >
              <CardHeader className="pb-2 sm:pb-3">
                <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">{service.emoji}</div>
                <CardTitle data-testid="service-name" className="text-base sm:text-lg">{service.name}</CardTitle>
              </CardHeader>
              <CardContent className="pb-2 sm:pb-3">
                <p className="text-xs sm:text-sm text-[#6a6a6a]">{service.description}</p>
              </CardContent>
              <CardFooter className="flex items-center justify-between pt-0 flex-wrap gap-1">
                <div>
                  <span data-testid="service-price" className="text-lg sm:text-xl font-bold text-[#ff385c]">{service.price}</span>
                  <span data-testid="service-duration" className="text-xs text-[#6a6a6a] ml-1 sm:ml-2">{service.duration}</span>
                </div>
                <Badge variant="secondary" className="text-xs">{service.duration}</Badge>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
