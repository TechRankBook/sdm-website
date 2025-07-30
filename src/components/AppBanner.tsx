import { Button } from "@/components/ui/button";
import { Download, Smartphone, X } from "lucide-react";
import { useState } from "react";

export const AppBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-glass-border p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <Smartphone className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm sm:text-base">Get the SDM E-Mobility App</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Book rides faster with our mobile app
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button size="sm" className="bg-gradient-primary text-xs sm:text-sm">
            <Download className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Download</span>
            <span className="sm:hidden">Get</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsVisible(false)}
            className="p-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};