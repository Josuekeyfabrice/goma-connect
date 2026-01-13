import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Transaction, Product } from '@/types/database';
import { Shield, Clock, CheckCircle2, AlertCircle, Loader2, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Transactions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<{ [key: string]: Product }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchTransactions = async () => {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setTransactions(data || []);

        // Fetch product details
        if (data && data.length > 0) {
          const productIds = [...new Set(data.map(t => t.product_id))];
          const { data: productsData } = await supabase
            .from('products')
            .select('*')
            .in('id', productIds);

          if (productsData) {
            const productsMap = productsData.reduce((acc, p) => {
              acc[p.id] = p;
              return acc;
            }, {} as { [key: string]: Product });
            setProducts(productsMap);
          }
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger vos transactions",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user, toast]);

  const confirmDelivery = async (transactionId: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({
          status: 'completed',
          escrow_status: 'released',
          updated_at: new Date().toISOString(),
        })
        .eq('id', transactionId);

      if (error) throw error;

      setTransactions(prev =>
        prev.map(t =>
          t.id === transactionId
            ? { ...t, status: 'completed', escrow_status: 'released' }
            : t
        )
      );

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'pending':
      case 'paid':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Shield className="h-4 w-4 text-primary" />;
    }
  };

  const buyerTransactions = transactions.filter(t => t.buyer_id === user?.id);
  const sellerTransactions = transactions.filter(t => t.seller_id === user?.id);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold mb-2">Mes Transactions</h1>
            <p className="text-muted-foreground">Gérez vos achats et ventes sécurisés avec notre système de séquestre.</p>
          </div>

          {transactions.length === 0 ? (
            <Card className="bg-muted/30 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <TrendingUp className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                <p className="text-muted-foreground mb-2">Aucune transaction pour le moment.</p>
                <p className="text-sm text-muted-foreground">Commencez à acheter ou vendre des produits sur GOMACASCADE.</p>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">
                  Toutes ({transactions.length})
                </TabsTrigger>
                <TabsTrigger value="buyer">
                  Achats ({buyerTransactions.length})
                </TabsTrigger>
                <TabsTrigger value="seller">
                  Ventes ({sellerTransactions.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4 mt-6">
                {transactions.map((transaction) => (
                  <TransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    product={products[transaction.product_id]}
                    isBuyer={transaction.buyer_id === user?.id}
                    onConfirmDelivery={confirmDelivery}
                  />
                ))}
              </TabsContent>

              <TabsContent value="buyer" className="space-y-4 mt-6">
                {buyerTransactions.length === 0 ? (
                  <Card className="bg-muted/30 border-dashed">
                    <CardContent className="flex items-center justify-center py-8 text-center">
                      <p className="text-muted-foreground">Aucun achat pour le moment.</p>
                    </CardContent>
                  </Card>
                ) : (
                  buyerTransactions.map((transaction) => (
                    <TransactionCard
                      key={transaction.id}
                      transaction={transaction}
                      product={products[transaction.product_id]}
                      isBuyer={true}
                      onConfirmDelivery={confirmDelivery}
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="seller" className="space-y-4 mt-6">
                {sellerTransactions.length === 0 ? (
                  <Card className="bg-muted/30 border-dashed">
                    <CardContent className="flex items-center justify-center py-8 text-center">
                      <p className="text-muted-foreground">Aucune vente pour le moment.</p>
                    </CardContent>
                  </Card>
                ) : (
                  sellerTransactions.map((transaction) => (
                    <TransactionCard
                      key={transaction.id}
                      transaction={transaction}
                      product={products[transaction.product_id]}
                      isBuyer={false}
                      onConfirmDelivery={confirmDelivery}
                    />
                  ))
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

interface TransactionCardProps {
  transaction: Transaction;
  product?: Product;
  isBuyer: boolean;
  onConfirmDelivery: (id: string) => void;
}

const TransactionCard = ({ transaction, product, isBuyer, onConfirmDelivery }: TransactionCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'paid':
        return 'bg-blue-50 border-blue-200';
      case 'cancelled':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      pending: 'En attente',
      paid: 'Payé',
      delivered: 'Livré',
      completed: 'Complété',
      cancelled: 'Annulé',
      disputed: 'Litigieux',
    };
    return labels[status] || status;
  };

  return (
    <Card className={`border-l-4 border-l-primary overflow-hidden ${getStatusColor(transaction.status)}`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">{product?.name || 'Produit supprimé'}</h3>
            <p className="text-sm text-muted-foreground">
              {isBuyer ? 'Achat' : 'Vente'} • {new Date(transaction.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{transaction.amount}$</p>
            <Badge className="mt-2 capitalize">{getStatusLabel(transaction.status)}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">
              {transaction.escrow_status === 'held' ? 'Fonds bloqués' : 'Fonds libérés'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {transaction.payment_method || 'Mobile Money'}
            </span>
          </div>
        </div>

        {isBuyer && transaction.status === 'paid' && (
          <Button
            onClick={() => onConfirmDelivery(transaction.id)}
            className="w-full gradient-primary text-white"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Confirmer la réception
          </Button>
        )}

        {!isBuyer && transaction.status === 'paid' && (
          <div className="bg-primary/5 p-3 rounded-lg border border-primary/20 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-primary">
              Les fonds sont bloqués en toute sécurité. Ils seront libérés dès que l'acheteur confirmera la réception.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Transactions;
