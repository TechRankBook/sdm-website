import { Header } from "@/components/Header";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Car, 
  Users, 
  Zap, 
  Shield, 
  Snowflake, 
  Wifi,
  MapPin,
  Battery,
  Gauge,
  Fuel
} from "lucide-react";

const Fleet = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const vehicles = [
    {
      id: "hatchback",
      name: "Electric Hatchback",
      category: "City Ride",
      seating: 4,
      price: "₹8/km",
      image: "🚗",
      specs: {
        range: "250 km",
        charging: "30 min",
        topSpeed: "120 km/h",
        acceleration: "0-60 in 8.2s"
      },
      features: ["Air Conditioning", "GPS Navigation", "USB Charging", "Safety Airbags"],
      ideal: ["Daily commute", "Short trips", "City travel", "Budget-friendly"]
    },
    {
      id: "sedan",
      name: "Electric Sedan",
      category: "Premium City & Airport",
      seating: 4,
      price: "₹12/km",
      image: "🚙",
      specs: {
        range: "350 km",
        charging: "45 min",
        topSpeed: "140 km/h",
        acceleration: "0-60 in 6.8s"
      },
      features: ["Premium Interior", "Climate Control", "Phone Integration", "Rear Entertainment"],
      ideal: ["Airport transfers", "Business meetings", "Comfortable rides", "Professional travel"]
    },
    {
      id: "suv",
      name: "Electric SUV",
      category: "Outstation & Rental",
      seating: 6,
      price: "₹15/km",
      image: "🚐",
      specs: {
        range: "400 km",
        charging: "60 min",
        topSpeed: "160 km/h",
        acceleration: "0-60 in 7.5s"
      },
      features: ["Spacious Interior", "Luggage Space", "All-Terrain", "Premium Sound"],
      ideal: ["Family trips", "Outstation travel", "Group rides", "Long distance"]
    },
    {
      id: "luxury",
      name: "Luxury Electric",
      category: "Executive & VIP",
      seating: 4,
      price: "₹25/km",
      image: "🏎️",
      specs: {
        range: "500 km",
        charging: "30 min",
        topSpeed: "200 km/h",
        acceleration: "0-60 in 4.2s"
      },
      features: ["Leather Seats", "Panoramic Roof", "Massage Seats", "Premium Audio"],
      ideal: ["Executive travel", "Special occasions", "VIP service", "Luxury experience"]
    },
    {
      id: "shared",
      name: "Shared Electric",
      category: "Ride Sharing",
      seating: 6,
      price: "₹4/km",
      image: "🚌",
      specs: {
        range: "300 km",
        charging: "40 min",
        topSpeed: "100 km/h",
        acceleration: "0-60 in 10s"
      },
      features: ["Multiple Seats", "Individual AC", "USB Ports", "Safety Features"],
      ideal: ["Budget travel", "Eco-friendly", "Social rides", "Cost sharing"]
    }
  ];

  const fleetStats = [
    { label: "Total Vehicles", value: "500+", icon: Car },
    { label: "Cities Covered", value: "25+", icon: MapPin },
    { label: "Zero Emissions", value: "100%", icon: Zap },
    { label: "Customer Rating", value: "4.8★", icon: Shield }
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gradient-main text-foreground">
        <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        
        <div className="container mx-auto px-4 py-20">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text">
              Our Electric Fleet
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience the future of mobility with our 100% electric vehicle fleet. 
              Zero emissions, maximum comfort, and cutting-edge technology.
            </p>
          </div>

          {/* Fleet Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {fleetStats.map((stat) => (
              <Card key={stat.label} className="glass p-6 text-center">
                <stat.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            ))}
          </div>

          {/* Vehicle Grid */}
          <div className="grid gap-8">
            {vehicles.map((vehicle, index) => (
              <Card key={vehicle.id} className={`glass p-8 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''} md:flex items-center gap-8`}>
                <div className="md:w-1/2">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-6xl">{vehicle.image}</div>
                    <div>
                      <h3 className="text-3xl font-bold">{vehicle.name}</h3>
                      <Badge variant="secondary" className="mb-2">{vehicle.category}</Badge>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <span className="text-2xl font-bold text-primary">{vehicle.price}</span>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {vehicle.seating} seats
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Specs */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <Battery className="w-4 h-4 text-primary" />
                      <span className="text-sm">{vehicle.specs.range} range</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary" />
                      <span className="text-sm">{vehicle.specs.charging} charging</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-primary" />
                      <span className="text-sm">{vehicle.specs.topSpeed} top speed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Fuel className="w-4 h-4 text-primary" />
                      <span className="text-sm">{vehicle.specs.acceleration}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Features
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {vehicle.features.map((feature) => (
                          <Badge key={feature} variant="secondary">{feature}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Ideal For
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {vehicle.ideal.map((use) => (
                          <Badge key={use} variant="outline">{use}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button className="w-full md:w-auto mt-6 bg-gradient-primary">
                    <Car className="w-4 h-4 mr-2" />
                    Book This Vehicle
                  </Button>
                </div>

                <div className="md:w-1/2 mt-8 md:mt-0">
                  <div className="aspect-video rounded-2xl bg-gradient-surface flex items-center justify-center relative overflow-hidden">
                    <div className="text-8xl opacity-20">{vehicle.image}</div>
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-accent/10"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Environmental Impact */}
          <Card className="glass p-8 mt-16 text-center">
            <Zap className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-2xl font-bold mb-4">Environmental Impact</h3>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-primary mb-2">Zero</div>
                <p className="text-muted-foreground">CO₂ Emissions</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">50,000+</div>
                <p className="text-muted-foreground">Trees Equivalent Saved</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">90%</div>
                <p className="text-muted-foreground">Quieter Than ICE Vehicles</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Fleet;