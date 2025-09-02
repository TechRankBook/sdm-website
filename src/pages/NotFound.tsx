import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-main text-foreground morphing-bg ev-particles">
      <div className="text-center p-8 glass rounded-2xl max-w-md mx-4 card-hover-lift">
        <div className="text-8xl mb-6 electric-glow charging-animation">⚡</div>
        <h1 className="text-6xl font-bold mb-4 gradient-text">404</h1>
        <p className="text-xl text-muted-foreground mb-6">Oops! This page went off the grid</p>
        <a 
          href="/" 
          className="inline-flex items-center px-6 py-3 bg-gradient-primary text-white rounded-lg hover:shadow-glow transition-all duration-300 btn-electric energy-flow"
        >
          ⚡ Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
