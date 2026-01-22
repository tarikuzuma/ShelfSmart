import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Leaf, 
  TrendingUp, 
  Truck, 
  ShoppingBag, 
  BarChart3, 
  ArrowRight,
  CheckCircle,
  Users,
  Building2
} from "lucide-react";

export default function LandingPage() {
  const features = [
    {
      icon: BarChart3,
      title: "AI-Powered Forecasting",
      description: "Predict spoilage before it happens with 95% accuracy using advanced ML models.",
    },
    {
      icon: TrendingUp,
      title: "Dynamic Pricing",
      description: "Automatically adjust prices based on expiry dates and demand signals.",
    },
    {
      icon: Truck,
      title: "Smart Logistics",
      description: "Optimize delivery routes to minimize waste and maximize freshness.",
    },
    {
      icon: Leaf,
      title: "Sustainability First",
      description: "Track your environmental impact and food waste reduction metrics.",
    },
  ];

  const stats = [
    { value: "40%", label: "Waste Reduction" },
    { value: "₱2.5M", label: "Saved Monthly" },
    { value: "500+", label: "Partner Stores" },
    { value: "50K", label: "Kg Food Saved" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo />
          <div className="hidden md:flex items-center gap-8">
            <Link to="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link to="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </Link>
            <Link to="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button variant="hero" size="sm" asChild>
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-warning/5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-warning/10 rounded-full blur-3xl" />
        
        <div className="container relative mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="sustainability" className="mb-6 animate-fade-in">
              <Leaf className="h-3 w-3 mr-1" />
              AI-Powered Freshness Management
            </Badge>
            
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 animate-fade-in-up">
              Save Fresh. <span className="text-gradient-primary">Sell Smart.</span>
              <br />Waste Less.
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              The first perishable-first AI platform that helps supermarkets reduce waste 
              while connecting consumers with fresh, discounted products near expiry.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <Button variant="hero" size="xl" asChild>
                <Link to="/dashboard">
                  <Building2 className="h-5 w-5" />
                  For Retailers
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="heroOutline" size="xl" asChild>
                <Link to="/marketplace">
                  <ShoppingBag className="h-5 w-5" />
                  Shop Fresh Deals
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div 
                key={stat.label} 
                className="text-center p-6 rounded-2xl bg-card border border-border/50 hover-lift animate-fade-in-up"
                style={{ animationDelay: `${0.3 + index * 0.1}s` }}
              >
                <div className="font-display text-3xl md:text-4xl font-bold text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Features</Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Fight Food Waste
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From AI-powered predictions to seamless consumer engagement, 
              our platform covers the entire perishable lifecycle.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={feature.title}
                  className="group p-6 rounded-2xl bg-card border border-border/50 hover-lift animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Two-Sided Platform */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Retailer Card */}
            <div className="group p-8 rounded-3xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 hover-lift">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-6">
                <Building2 className="h-7 w-7 text-primary-foreground" />
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground mb-3">
                For Retailers & Supermarkets
              </h3>
              <p className="text-muted-foreground mb-6">
                Take control of your perishable inventory with AI-powered insights, 
                dynamic pricing, and optimized logistics.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Real-time spoilage prediction",
                  "Automated discount recommendations",
                  "Route optimization for freshness",
                  "Sustainability reporting dashboard",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button variant="hero" asChild>
                <Link to="/dashboard">
                  Access Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Consumer Card */}
            <div className="group p-8 rounded-3xl bg-gradient-to-br from-warning/5 to-warning/10 border border-warning/20 hover-lift">
              <div className="w-14 h-14 rounded-2xl bg-warning flex items-center justify-center mb-6">
                <Users className="h-7 w-7 text-warning-foreground" />
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground mb-3">
                For Conscious Consumers
              </h3>
              <p className="text-muted-foreground mb-6">
                Find amazing deals on fresh products near their best-by date 
                while helping reduce food waste in your community.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Browse nearby discounted fresh items",
                  "Real-time countdown timers",
                  "Recipe kits from near-expiry items",
                  "Track your sustainability impact",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-warning" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button variant="warning" asChild>
                <Link to="/marketplace">
                  Start Shopping
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Transform Your Perishable Management?
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Join 500+ retailers already using FreshPath Market to reduce waste, 
            increase profits, and build a more sustainable future.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="xl" className="bg-white text-primary hover:bg-white/90">
              Schedule a Demo
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button size="xl" variant="ghost" className="text-primary-foreground border-primary-foreground/30 border hover:bg-primary-foreground/10">
              View Documentation
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Logo />
            <p className="text-sm text-muted-foreground">
              © 2024 FreshPath Market. Fighting food waste with AI.
            </p>
            <div className="flex items-center gap-4">
              <Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy</Link>
              <Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Terms</Link>
              <Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
