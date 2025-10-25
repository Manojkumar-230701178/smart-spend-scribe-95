import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AIInsights = () => {
  const [insights, setInsights] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchInsights = async () => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-insights");

      if (error) throw error;

      setInsights(data.insights || []);
    } catch (error: any) {
      toast({
        title: "Error generating insights",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Auto-fetch insights on mount
    fetchInsights();
  }, []);

  return (
    <Card className="glass-card border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-primary">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">AI Financial Insights</h3>
              <p className="text-sm text-muted-foreground">Personalized recommendations based on your spending</p>
            </div>
          </div>
          <Button
            onClick={fetchInsights}
            variant="outline"
            size="sm"
            disabled={isLoading}
            className="border-primary/20 hover:bg-primary/5"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
        </div>

        {isLoading && insights.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Analyzing your spending patterns...
          </div>
        ) : insights.length > 0 ? (
          <ul className="space-y-3">
            {insights.map((insight, index) => (
              <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                <span className="text-primary mt-0.5">•</span>
                <span className="text-sm">{insight}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center py-4 text-muted-foreground">
            Add more transactions to receive personalized insights.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default AIInsights;
