import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

interface Stats {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

const DashboardStats = () => {
  const [stats, setStats] = useState<Stats>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
  });

  useEffect(() => {
    fetchStats();

    // Set up realtime subscription
    const channel = supabase
      .channel('transactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions'
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    // Listen for custom transaction events as backup
    const handleTransactionChange = () => {
      fetchStats();
    };

    window.addEventListener('transactionChanged', handleTransactionChange);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('transactionChanged', handleTransactionChange);
    };
  }, []);

  const fetchStats = async () => {
    const { data: transactions } = await supabase
      .from("transactions")
      .select("type, amount");

    if (transactions) {
      const income = transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const expenses = transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      setStats({
        totalIncome: income,
        totalExpenses: expenses,
        balance: income - expenses,
      });
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      <Card className="glass-card border-border/50 smooth-transition hover:shadow-success">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Income</span>
            <div className="w-10 h-10 bg-gradient-success rounded-lg flex items-center justify-center shadow-success">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold text-success">
            ₹{stats.totalIncome.toFixed(2)}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-border/50 smooth-transition hover:shadow-danger">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Expenses</span>
            <div className="w-10 h-10 bg-gradient-danger rounded-lg flex items-center justify-center shadow-danger">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold text-danger">
            ₹{stats.totalExpenses.toFixed(2)}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-border/50 smooth-transition hover:shadow-primary">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Balance</span>
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-primary">
              <Wallet className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold">
            ₹{stats.balance.toFixed(2)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
