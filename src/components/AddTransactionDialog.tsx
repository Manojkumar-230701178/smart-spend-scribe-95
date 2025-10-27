import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from "lucide-react";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  category: string;
  description: string | null;
  date: string;
}

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction | null;
  onSuccess?: () => void;
}

const AddTransactionDialog = ({ open, onOpenChange, transaction, onSuccess }: AddTransactionDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const { toast } = useToast();

  useEffect(() => {
    if (transaction) {
      setType(transaction.type as "income" | "expense");
      setAmount(transaction.amount.toString());
      setDescription(transaction.description || "");
      setDate(transaction.date);
    } else {
      setType("expense");
      setAmount("");
      setDescription("");
      setDate(new Date().toISOString().split("T")[0]);
    }
  }, [transaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let category = transaction?.category;

      // Call edge function to categorize with AI only if not editing or if description changed
      if (!transaction || transaction.description !== description) {
        const { data: aiData, error: aiError } = await supabase.functions.invoke("categorize-expense", {
          body: { description, type, amount: parseFloat(amount) },
        });

        if (aiError) throw aiError;
        category = aiData.category || "Other";
      }

      if (transaction) {
        // Update existing transaction
        const { error: updateError } = await supabase
          .from("transactions")
          .update({
            type,
            amount: parseFloat(amount),
            category,
            description,
            date,
          })
          .eq("id", transaction.id);

        if (updateError) throw updateError;

        toast({
          title: "Transaction updated!",
          description: `Successfully updated transaction.`,
        });
      } else {
        // Insert new transaction
        const { error: insertError } = await supabase.from("transactions").insert([{
          user_id: user.id,
          type,
          amount: parseFloat(amount),
          category,
          description,
          date,
        }]);

        if (insertError) throw insertError;

        toast({
          title: "Transaction added!",
          description: `Automatically categorized as "${category}" using AI.`,
        });
      }

      // Reset form
      setAmount("");
      setDescription("");
      setDate(new Date().toISOString().split("T")[0]);
      onOpenChange(false);
      
      // Trigger refresh callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: transaction ? "Error updating transaction" : "Error adding transaction",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {transaction ? "Edit Transaction" : "Add Transaction"}
          </DialogTitle>
          <DialogDescription>
            {transaction
              ? "Update your transaction details."
              : "Add a new transaction. AI will automatically categorize it for you."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={(value: "income" | "expense") => setType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="₹0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="e.g., Groceries at Whole Foods"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-primary hover:shadow-primary smooth-transition"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Processing..." : transaction ? "Update Transaction" : "Add Transaction"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTransactionDialog;
