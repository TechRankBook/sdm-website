import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  price: string;
  features: string[];
  ctaText?: string;
  onBook?: () => void;
}

export const ServiceCard = ({ 
  icon: Icon, 
  title, 
  description, 
  price, 
  features, 
  ctaText = "Book Now",
  onBook 
}: ServiceCardProps) => {
  return (
    <Card className="glass p-6 hover:scale-105 transition-transform duration-300">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 rounded-xl bg-gradient-primary">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold">{title}</h3>
          <span className="text-2xl font-bold text-primary">{price}</span>
        </div>
      </div>
      
      <p className="text-muted-foreground mb-4">{description}</p>
      
      <div className="flex flex-wrap gap-2 mb-6">
        {features.map((feature) => (
          <Badge key={feature} variant="secondary" className="text-xs">
            {feature}
          </Badge>
        ))}
      </div>
      
      <Button 
        className="w-full bg-gradient-primary"
        onClick={onBook}
      >
        {ctaText}
      </Button>
    </Card>
  );
};