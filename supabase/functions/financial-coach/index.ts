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

    const { question } = await req.json();

    // Fetch user's transaction data
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
      .limit(100);

    if (!transactions || transactions.length === 0) {
      return new Response(
        JSON.stringify({ answer: 'Please add some transactions first so I can help you better!' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate financial metrics
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const categoryBreakdown = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + parseFloat(t.amount);
        return acc;
      }, {} as Record<string, number>);

    const context = `
User's Financial Data:
- Total Income: ${totalIncome}
- Total Expenses: ${totalExpenses}
- Net Savings: ${totalIncome - totalExpenses}
- Expense by Category: ${JSON.stringify(categoryBreakdown)}

Transaction History (last 100):
${JSON.stringify(transactions.slice(0, 20))}

User Question: ${question}

Provide a helpful, personalized answer based on their actual financial data. Include specific numbers and actionable advice.
`;

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
            content: 'You are a knowledgeable financial advisor. Provide clear, actionable advice based on the user\'s transaction data. Be encouraging and helpful.'
          },
          { role: 'user', content: context }
        ],
      }),
    });

    const data = await response.json();
    const answer = data.choices[0].message.content;

    return new Response(JSON.stringify({ answer }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in financial-coach:', error);
    return new Response(
      JSON.stringify({ answer: 'Sorry, I encountered an error. Please try again.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
