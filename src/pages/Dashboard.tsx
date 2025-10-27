import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, LogOut, Plus, Sparkles } from "lucide-react";
import { User } from "@supabase/supabase-js";
import DashboardStats from "@/components/DashboardStats";
import AIInsights from "@/components/AIInsights";
import AdvancedInsights from "@/components/AdvancedInsights";
import FinancialCoachChat from "@/components/FinancialCoachChat";
import ExpenseChart from "@/components/ExpenseChart";
import RecentTransactions from "@/components/RecentTransactions";
import AddTransactionDialog from "@/components/AddTransactionDialog";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
    navigate("/");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-primary">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  ExpenseAI
                </h1>
                <p className="text-xs text-muted-foreground">Welcome back!</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-gradient-primary hover:shadow-primary smooth-transition"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Transaction
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <DashboardStats />
            <AdvancedInsights />
            <ExpenseChart />
            <RecentTransactions />
          </div>
          <div className="space-y-8">
            <AIInsights />
            <FinancialCoachChat />
          </div>
        </div>
      </main>

      {/* Add Transaction Dialog */}
      <AddTransactionDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
};

export default Dashboard;
