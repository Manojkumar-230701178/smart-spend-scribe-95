import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TrendingUp, Sparkles, Shield, Zap, ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000" />
        
        {/* Navbar */}
        <nav className="relative z-10 container mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-primary">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              ExpenseAI
            </span>
          </div>
          <Link to="/auth">
            <Button className="bg-gradient-primary hover:shadow-primary smooth-transition">
              Get Started
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8 smooth-transition hover:scale-105">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Powered by Advanced AI</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Smart Expense Tracking
              <span className="bg-gradient-to-r from-primary via-primary-glow to-purple-500 bg-clip-text text-transparent"> with AI</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Automatically categorize expenses, analyze spending patterns, and get personalized financial insights powered by artificial intelligence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="bg-gradient-primary hover:shadow-primary smooth-transition w-full sm:w-auto">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-primary/20 hover:bg-primary/5 smooth-transition w-full sm:w-auto">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="glass-card rounded-2xl p-8 smooth-transition hover:scale-105 hover:shadow-primary">
            <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center mb-6 shadow-primary">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3">AI Categorization</h3>
            <p className="text-muted-foreground">
              Automatically categorize your expenses using advanced AI. No manual tagging needed.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-8 smooth-transition hover:scale-105 hover:shadow-success">
            <div className="w-14 h-14 bg-gradient-success rounded-xl flex items-center justify-center mb-6 shadow-success">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3">Smart Insights</h3>
            <p className="text-muted-foreground">
              Get personalized financial insights and recommendations to optimize your spending.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-8 smooth-transition hover:scale-105 hover:shadow-card">
            <div className="w-14 h-14 bg-secondary rounded-xl flex items-center justify-center mb-6 border border-border">
              <Shield className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Secure & Private</h3>
            <p className="text-muted-foreground">
              Your financial data is encrypted and secure. We never share your information.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="glass-card rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-primary opacity-10" />
          <div className="relative z-10">
            <Zap className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-4">Ready to take control?</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of users who are already managing their finances smarter with AI.
            </p>
            <Link to="/auth">
              <Button size="lg" className="bg-gradient-primary hover:shadow-primary smooth-transition">
                Get Started for Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
