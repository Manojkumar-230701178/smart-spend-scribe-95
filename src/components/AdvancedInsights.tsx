import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, TrendingUp, PieChart } from "lucide-react";

type FinancialMetrics = {
  expenseToIncomeRatio: number;
  topCategory: { name: string; amount: number; percentage: number };
  predictedNextMonth: number;
  anomalyCount: number;
  healthGrade: string;
};

const AdvancedInsights = () => {
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const { data: transactions } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: false });

      if (!transactions || transactions.length === 0) return;

      const totalIncome = transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + parseFloat(String(t.amount)), 0);

      const totalExpenses = transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + parseFloat(String(t.amount)), 0);

      const expenseToIncomeRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

      const categoryTotals = transactions
        .filter((t) => t.type === "expense")
        .reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + parseFloat(String(t.amount));
          return acc;
        }, {} as Record<string, number>);

      const topCategoryEntry = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
      const topCategory = topCategoryEntry
        ? {
            name: topCategoryEntry[0],
            amount: topCategoryEntry[1],
            percentage: (topCategoryEntry[1] / totalExpenses) * 100,
          }
        : { name: "N/A", amount: 0, percentage: 0 };

      const expenseAmounts = transactions
        .filter((t) => t.type === "expense")
        .map((t) => parseFloat(String(t.amount)));
      const avgExpense = expenseAmounts.reduce((a, b) => a + b, 0) / expenseAmounts.length;
      const anomalyCount = transactions.filter(
        (t) => t.type === "expense" && parseFloat(String(t.amount)) > avgExpense * 2
      ).length;

      const monthlyAvg = totalExpenses / Math.max(1, new Set(transactions.map((t) => t.date.slice(0, 7))).size);

      const healthGrade =
        expenseToIncomeRatio < 50
          ? "Excellent"
          : expenseToIncomeRatio < 70
          ? "Good"
          : expenseToIncomeRatio < 90
          ? "Caution"
          : "Critical";

      setMetrics({
        expenseToIncomeRatio,
        topCategory,
        predictedNextMonth: monthlyAvg,
        anomalyCount,
        healthGrade,
      });
    } catch (error) {
      console.error("Error fetching metrics:", error);
    }
  };

  if (!metrics) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="glass-card border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <PieChart className="w-4 h-4 text-primary" />
            Financial Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.healthGrade}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {metrics.expenseToIncomeRatio.toFixed(1)}% expense-to-income ratio
          </p>
        </CardContent>
      </Card>

      <Card className="glass-card border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Predicted Spending
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{metrics.predictedNextMonth.toFixed(0)}</div>
          <p className="text-xs text-muted-foreground mt-1">Next month forecast</p>
        </CardContent>
      </Card>

      <Card className="glass-card border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-primary" />
            Anomalies Detected
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.anomalyCount}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Top category: {metrics.topCategory.name} ({metrics.topCategory.percentage.toFixed(0)}%)
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedInsights;
