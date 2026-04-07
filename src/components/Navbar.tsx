import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Leaf, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="fixed top-0 w-full bg-background/95 backdrop-blur-sm border-b border-border z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 text-primary font-bold text-xl">
            <Leaf className="h-6 w-6" />
            <span>AgroSense</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="/#features" className="text-foreground hover:text-primary transition-smooth">
  Features
</a>

<a href="/#how-it-works" className="text-foreground hover:text-primary transition-smooth">
  How It Works
</a>
            {user && isAuthenticated ? (
              <>
                <Link to={user?.user_type === "farmer" ? "/farmer-dashboard" : "/buyer-dashboard"}>
                  <Button variant="outline">Dashboard</Button>
                </Link>
                <Button onClick={logout} variant="destructive">Logout</Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link to="/register">
                  <Button className="gradient-blockchain shadow-glow">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <a href="/#features"
              className="block text-foreground hover:text-primary transition-smooth"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </a>
            <a href="/#how-it-works"
              className="block text-foreground hover:text-primary transition-smooth"
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </a>
            {isAuthenticated ? (
              <>
                <Link to={user?.user_type === "farmer" ? "/farmer-dashboard" : "/buyer-dashboard"}>
                  <Button variant="outline" className="w-full" onClick={() => setIsMenuOpen(false)}>
                    Dashboard
                  </Button>
                </Link>
                <Button onClick={() => { logout(); setIsMenuOpen(false); }} variant="destructive" className="w-full">
                  Logout
                </Button>
              </>
            ) : (
              <div className="space-y-2">
                <Link to="/login" className="block" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Login</Button>
                </Link>
                <Link to="/register" className="block" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full gradient-blockchain shadow-glow">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
