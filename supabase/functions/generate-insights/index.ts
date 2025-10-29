import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: transactions } = await supabase.from('transactions').select('*').order('date', { ascending: false }).limit(20);

    if (!transactions || transactions.length === 0) {
      return new Response(JSON.stringify({ insights: ['Add transactions to get personalized insights!'] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate comprehensive financial metrics
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const expenseToIncomeRatio = totalIncome > 0 ? (totalExpenses / totalIncome * 100).toFixed(1) : 0;
    
    // Category breakdown
    const categoryTotals = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + parseFloat(t.amount);
        return acc;
      }, {} as Record<string, number>);

    const topCategoryEntry = Object.entries(categoryTotals).sort((a, b) => (b[1] as number) - (a[1] as number))[0];
    const topCategory = topCategoryEntry ? topCategoryEntry[0] : 'N/A';
    const topCategoryAmount = topCategoryEntry ? topCategoryEntry[1] as number : 0;
    const topCategoryPercent = totalExpenses > 0 ? (topCategoryAmount / totalExpenses * 100).toFixed(1) : 0;

    // Anomaly detection - find unusually high transactions
    const expenseAmounts = transactions.filter(t => t.type === 'expense').map(t => parseFloat(t.amount));
    const avgExpense = expenseAmounts.reduce((a, b) => a + b, 0) / expenseAmounts.length;
    const anomalies = transactions.filter(t => t.type === 'expense' && parseFloat(t.amount) > avgExpense * 2);

    // Calculate trend-based prediction
    const monthlyTotals: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const month = t.date.slice(0, 7);
        monthlyTotals[month] = (monthlyTotals[month] || 0) + parseFloat(t.amount);
      });

    const sortedMonths = Object.entries(monthlyTotals).sort((a, b) => a[0].localeCompare(b[0]));
    const recentMonths = sortedMonths.slice(-3); // Last 3 months
    
    let predictedNextMonth = 0;
    if (recentMonths.length >= 2) {
      // Calculate weighted average with trend
      const weights = [1, 1.5, 2]; // More weight to recent months
      const weightedSum = recentMonths.reduce((sum, [, amount], idx) => {
        const weight = weights[weights.length - recentMonths.length + idx] || 1;
        return sum + amount * weight;
      }, 0);
      const totalWeight = weights.slice(-recentMonths.length).reduce((a, b) => a + b, 0);
      const weightedAvg = weightedSum / totalWeight;

      // Calculate growth trend
      const firstMonth = recentMonths[0][1];
      const lastMonth = recentMonths[recentMonths.length - 1][1];
      const growthRate = recentMonths.length > 1 ? (lastMonth - firstMonth) / firstMonth : 0;
      
      // Apply trend to prediction (cap at 20% growth)
      predictedNextMonth = weightedAvg * (1 + Math.min(Math.max(growthRate, -0.2), 0.2));
    } else {
      predictedNextMonth = totalExpenses / Math.max(1, sortedMonths.length);
    }

    const monthlyAvg = totalExpenses / Math.max(1, new Set(transactions.map(t => t.date.slice(0, 7))).size);

    const prompt = `Analyze this financial data and provide 5-6 insights (all amounts are in Indian Rupees ₹):

Financial Overview:
- Total Income: ₹${totalIncome}
- Total Expenses: ₹${totalExpenses}
- Expense-to-Income Ratio: ${expenseToIncomeRatio}%
- Top Spending Category: ${topCategory} (${topCategoryPercent}% of expenses)
- Average Monthly Spending: ₹${monthlyAvg.toFixed(2)}
- Predicted Next Month Spending: ₹${predictedNextMonth.toFixed(2)} (trend-adjusted)
- Unusual Transactions Detected: ${anomalies.length}

Recent Transactions: ${JSON.stringify(transactions.slice(0, 10))}

Provide insights covering:
1. Expense-to-income ratio health assessment
2. Top spending category analysis
3. Specific savings recommendations
4. Next month spending forecast
5. Any anomalies or unusual patterns
6. Actionable tips

IMPORTANT: Always mention amounts with ₹ (Indian Rupees) symbol.
Format each insight as a clear, actionable sentence. Start each with an emoji.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a financial analyst. Provide clear, specific insights based on the data. Be encouraging but honest about financial health. Always use ₹ (Indian Rupees) symbol when mentioning amounts.'
          },
          { role: 'user', content: prompt }
        ],
      }),
    });

    const data = await response.json();
    const insightText = data.choices[0].message.content;
    const insights = insightText.split('\n').filter((i: string) => i.trim()).slice(0, 6);

    return new Response(JSON.stringify({ insights }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ insights: ['Unable to generate insights at this time.'] }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
