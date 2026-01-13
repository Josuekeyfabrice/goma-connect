import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/database';
import { Shield, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EscrowStatusProps {
  userId: string;
}

export const EscrowStatus = ({ userId }: EscrowStatusProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setTransactions(data || []);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [userId]);

  const confirmDelivery = async (transactionId: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ 
          status: 'completed',
          escrow_status: 'released',
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId);

      if (error) throw error;

      setTransactions(prev => prev.map(t => 
        t.id === transactionId ? { ...t, status: 'completed', escrow_status: 'released' } : t
      ));

      toast({
        title: "Succès",
        description: "Les fonds ont été libérés au vendeur.",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de confirmer la réception",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Shield className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
          <p className="text-muted-foreground">Aucune transaction sécurisée en cours.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" />
        Transactions Sécurisées (Séquestre)
      </h2>
      
      <div className="grid gap-4">
        {transactions.map((transaction) => {
          const isBuyer = transaction.buyer_id === userId;
          
          return (
            <Card key={transaction.id} className="overflow-hidden border-l-4 border-l-primary">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {isBuyer ? "Achat sécurisé" : "Vente sécurisée"}
                    </p>
                    <p className="text-lg font-bold">{transaction.amount}$</p>
                  </div>
                  <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'} className="capitalize">
                    {transaction.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="h-4 w-4 text-primary" />
                    {transaction.escrow_status === 'held' ? "Fonds bloqués" : "Fonds libérés"}
                  </div>
                </div>

                {isBuyer && transaction.status === 'paid' && (
                  <Button 
                    onClick={() => confirmDelivery(transaction.id)}
                    className="w-full gradient-primary text-white"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Confirmer la réception
                  </Button>
                )}

                {!isBuyer && transaction.status === 'paid' && (
                  <div className="bg-primary/5 p-3 rounded-lg border border-primary/20 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-primary mt-0.5" />
                    <p className="text-xs text-primary">
                      Les fonds sont bloqués en toute sécurité. Ils seront libérés dès que l'acheteur confirmera la réception.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
