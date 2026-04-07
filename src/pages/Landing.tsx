import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Shield, Users, TrendingUp, Link as LinkIcon, Leaf, ShoppingCart } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import blockchainNetwork from "@/assets/blockchain-network.png";
import { Navbar } from "@/components/Navbar";

const Landing = () => {
  const location = useLocation();

useEffect(() => {
  if (location.hash) {
    const element = document.querySelector(location.hash);
    if (element) {
      setTimeout(() => {
        element.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }
}, [location]);
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section
        className="relative pt-32 pb-20 px-4 min-h-[90vh] flex items-center"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 gradient-hero" />
        <div className="container mx-auto relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-primary-foreground">
              Empowering Indian Farmers with Blockchain Technology
            </h1>
            <p className="text-xl mb-8 text-primary-foreground/90">
              Connect directly with buyers, ensure transparency, and trace your produce on the Polygon blockchain.
              Join the agricultural revolution today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register?type=farmer">
                <Button size="lg" className="gradient-blockchain shadow-glow text-lg">
                  I'm a Farmer
                </Button>
              </Link>
              <Link to="/register?type=buyer">
                <Button size="lg" variant="outline" className="bg-background/90 text-lg">
                  I'm a Buyer
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-foreground">Why Choose AgroSense?</h2>
            <p className="text-xl text-muted-foreground">Blockchain-powered features designed for modern agriculture</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="shadow-card border-2 hover:border-primary transition-smooth">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full gradient-blockchain flex items-center justify-center mb-4">
                  <Shield className="text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground">Blockchain Traceability</h3>
                <p className="text-muted-foreground">
                  Every batch recorded on Polygon blockchain. Verify authenticity with QR codes. Complete transparency from farm to table.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card border-2 hover:border-primary transition-smooth">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mb-4">
                  <Users className="text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground">Community Network</h3>
                <p className="text-muted-foreground">
                  Share knowledge, get advice, and connect with fellow farmers and buyers. Build trust through verified profiles and reviews.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card border-2 hover:border-primary transition-smooth">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4">
                  <TrendingUp className="text-secondary-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground">Direct Marketplace</h3>
                <p className="text-muted-foreground">
                  Eliminate middlemen. Set your own prices. Receive offers directly. Track all transactions on the blockchain.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-foreground">How It Works</h2>
            <p className="text-xl text-muted-foreground">Simple steps to get started with AgroSense</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src={blockchainNetwork}
                alt="Blockchain Network"
                className="rounded-lg shadow-card"
              />
            </div>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-foreground flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-primary" />
                    Register & Verify
                  </h3>
                  <p className="text-muted-foreground">
                    Create your account as a farmer or buyer. Complete your profile with verified credentials for trust.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-foreground flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-primary" />
                    Create or Browse Batches
                  </h3>
                  <p className="text-muted-foreground">
                    Farmers list produce with details. Buyers browse verified batches with complete traceability.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-foreground flex items-center gap-2">
                    <LinkIcon className="w-5 h-5 text-primary" />
                    Blockchain Verification
                  </h3>
                  <p className="text-muted-foreground">
                    All transactions recorded on Polygon blockchain. Scan QR codes for instant verification and full history.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 gradient-blockchain">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-primary-foreground">
            Ready to Transform Your Agricultural Business?
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
            Join thousands of farmers and buyers already using AgroSense for transparent, blockchain-verified trade.
          </p>
          <Link to="/register">
            <Button size="lg" variant="outline" className="bg-background text-primary text-lg shadow-glow">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-muted">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2025-2026 AgroSense. Powered by Polygon Blockchain.</p>
          <p className="mt-2 text-sm">Contract: 0xBBfde68C6eCe076b4b3Bc5b3d4b2fCe6A848d82A</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
