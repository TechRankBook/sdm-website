import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import AuthGuard from "./components/AuthGuard";
import Index from "./pages/Index";
import Services from "./pages/Services";
import Fleet from "./pages/Fleet";
import MobileApp from "./pages/MobileApp";
import HowItWorks from "./pages/HowItWorks";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Terms from "./pages/Terms";
import Booking from "./pages/Booking";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundPolicy from "./pages/RefundPolicy";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/" element={<Index />} />
            <Route path="/services" element={<AuthGuard><Services /></AuthGuard>} />
            <Route path="/fleet" element={<AuthGuard><Fleet /></AuthGuard>} />
            <Route path="/mobile-app" element={<AuthGuard><MobileApp /></AuthGuard>} />
            <Route path="/how-it-works" element={<AuthGuard><HowItWorks /></AuthGuard>} />
            <Route path="/contact" element={<AuthGuard><Contact /></AuthGuard>} />
            <Route path="/about" element={<AuthGuard><About /></AuthGuard>} />
            <Route path="/terms" element={<AuthGuard><Terms /></AuthGuard>} />
            <Route path="/booking" element={<AuthGuard><Booking /></AuthGuard>} />
            <Route path="/privacy-policy" element={<AuthGuard><PrivacyPolicy /></AuthGuard>} />
            <Route path="/refund-policy" element={<AuthGuard><RefundPolicy /></AuthGuard>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THIS LINE */}

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
