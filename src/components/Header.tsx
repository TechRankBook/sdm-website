import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Car, 
  Menu, 
  X, 
  Moon, 
  Sun, 
  MapPin, 
  Bell,
  User,
  ChevronDown,
  Info,
  Wrench,
  Phone,
  Users,
  Route,
  Clock,
  FileText
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import sdmLogo from "@/assets/logo.png";

interface HeaderProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const Header = ({ isDarkMode, toggleDarkMode }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <header className="glass fixed top-0 w-full z-50 border-b border-glass-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img 
              src={sdmLogo} 
              alt="SDM E-Mobility" 
              className="h-10 w-auto"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Button 
              onClick={() => handleNavigation('/booking')}
              className="micro-bounce bg-gradient-primary"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Book a Ride
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="micro-bounce">
                  More
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass">
                <DropdownMenuItem onClick={() => handleNavigation('/about')}>
                  <Info className="w-4 h-4 mr-2" />
                  About
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigation('/services')}>
                  <Wrench className="w-4 h-4 mr-2" />
                  Services
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigation('/fleet')}>
                  <Car className="w-4 h-4 mr-2" />
                  Fleet
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigation('/how-it-works')}>
                  <Route className="w-4 h-4 mr-2" />
                  How It Works
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigation('/mobile-app')}>
                  <Phone className="w-4 h-4 mr-2" />
                  Mobile App
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigation('/contact')}>
                  <Phone className="w-4 h-4 mr-2" />
                  Contact
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigation('/terms')}>
                  <FileText className="w-4 h-4 mr-2" />
                  Terms
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="ghost" className="micro-bounce">
              <Bell className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleDarkMode}
              className="micro-bounce"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button variant="default" className="micro-bounce bg-gradient-primary">
              <User className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-glass-border">
            <nav className="flex flex-col gap-3 pt-4">
              <Button 
                onClick={() => handleNavigation('/booking')}
                className="justify-start bg-gradient-primary"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Book a Ride
              </Button>
              <Button 
                onClick={() => handleNavigation('/about')}
                variant="ghost" 
                className="justify-start"
              >
                <Info className="w-4 h-4 mr-2" />
                About
              </Button>
              <Button 
                onClick={() => handleNavigation('/services')}
                variant="ghost" 
                className="justify-start"
              >
                <Wrench className="w-4 h-4 mr-2" />
                Services
              </Button>
              <Button 
                onClick={() => handleNavigation('/fleet')}
                variant="ghost" 
                className="justify-start"
              >
                <Car className="w-4 h-4 mr-2" />
                Fleet
              </Button>
              <Button 
                onClick={() => handleNavigation('/how-it-works')}
                variant="ghost" 
                className="justify-start"
              >
                <Route className="w-4 h-4 mr-2" />
                How It Works
              </Button>
              <Button 
                onClick={() => handleNavigation('/mobile-app')}
                variant="ghost" 
                className="justify-start"
              >
                <Phone className="w-4 h-4 mr-2" />
                Mobile App
              </Button>
              <Button 
                onClick={() => handleNavigation('/contact')}
                variant="ghost" 
                className="justify-start"
              >
                <Phone className="w-4 h-4 mr-2" />
                Contact
              </Button>
              <Button 
                onClick={() => handleNavigation('/terms')}
                variant="ghost" 
                className="justify-start"
              >
                <FileText className="w-4 h-4 mr-2" />
                Terms
              </Button>
              <Button variant="ghost" className="justify-start">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>
              <div className="flex items-center gap-2 pt-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={toggleDarkMode}
                >
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
                <Button variant="default" className="flex-1 bg-gradient-primary">
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};