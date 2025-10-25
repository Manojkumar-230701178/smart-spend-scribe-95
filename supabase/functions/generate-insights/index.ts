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

    const summary = `Analyze these transactions and provide 3 concise financial insights: ${JSON.stringify(transactions.slice(0, 10))}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: summary }],
      }),
    });

    const data = await response.json();
    const insightText = data.choices[0].message.content;
    const insights = insightText.split('\n').filter((i: string) => i.trim()).slice(0, 3);

    return new Response(JSON.stringify({ insights }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ insights: ['Unable to generate insights at this time.'] }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
