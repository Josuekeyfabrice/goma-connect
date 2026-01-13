import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Eye, ShoppingCart, DollarSign, Zap, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  totalProducts: number;
  activeListings: number;
  totalViews: number;
  totalSales: number;
  totalRevenue: number;
  boostedProducts: number;
}

interface BoostHistory {
  id: string;
  product_name: string;
  package_id: string;
  amount: number;
  expires_at: string;
  status: string;
}

const SellerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeListings: 0,
    totalViews: 0,
    totalSales: 0,
    totalRevenue: 0,
    boostedProducts: 0,
  });
  const [boostHistory, setBoostHistory] = useState<BoostHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        // Fetch products stats
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('id, is_active, views_count, sales_count, price')
          .eq('seller_id', user.id);

        if (productsError) throw productsError;

        const activeProducts = products?.filter(p => p.is_active) || [];
        const totalViews = products?.reduce((sum, p) => sum + (p.views_count || 0), 0) || 0;
        const totalSales = products?.reduce((sum, p) => sum + (p.sales_count || 0), 0) || 0;
        const totalRevenue = products?.reduce((sum, p) => sum + (p.price * (p.sales_count || 0)), 0) || 0;

        // Fetch boost history
        const { data: boosts, error: boostsError } = await supabase
          .from('product_boosts')
          .select('id, product_id, package_id, amount, expires_at, status')
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (boostsError) throw boostsError;

        // Fetch product names for boosts
        let boostsWithNames: BoostHistory[] = [];
        if (boosts && boosts.length > 0) {
          const productIds = [...new Set(boosts.map(b => b.product_id))];
          const { data: productData } = await supabase
            .from('products')
            .select('id, name')
            .in('id', productIds);

          boostsWithNames = boosts.map(boost => ({
            id: boost.id,
            product_name: productData?.find(p => p.id === boost.product_id)?.name || 'Produit supprimé',
            package_id: boost.package_id,
            amount: boost.amount,
            expires_at: boost.expires_at,
            status: boost.status,
          }));
        }

        const activeBoosted = boostsWithNames.filter(b => b.status === 'active').length;

        setStats({
          totalProducts: products?.length || 0,
          activeListings: activeProducts.length,
          totalViews,
          totalSales,
          totalRevenue,
          boostedProducts: activeBoosted,
        });
        setBoostHistory(boostsWithNames);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger vos statistiques",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, navigate, toast]);

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
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold mb-2">Tableau de Bord Vendeur</h1>
            <p className="text-muted-foreground">Gérez vos annonces et suivez vos performances</p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Annonces actives</p>
                    <p className="text-3xl font-bold">{stats.activeListings}</p>
                    <p className="text-xs text-muted-foreground mt-1">sur {stats.totalProducts} total</p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-blue-600 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Vues totales</p>
                    <p className="text-3xl font-bold">{stats.totalViews}</p>
                    <p className="text-xs text-muted-foreground mt-1">cette semaine</p>
                  </div>
                  <Eye className="h-8 w-8 text-green-600 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Revenu total</p>
                    <p className="text-3xl font-bold">{stats.totalRevenue}$</p>
                    <p className="text-xs text-muted-foreground mt-1">{stats.totalSales} ventes</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-amber-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Boost Stats */}
          <Card className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-600" />
                Annonces Boostées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Annonces actuellement boostées</p>
                  <p className="text-3xl font-bold text-amber-600">{stats.boostedProducts}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Taux de conversion moyen</p>
                  <p className="text-3xl font-bold text-amber-600">+45%</p>
                </div>
                <div className="flex items-end">
                  <Button className="w-full gradient-primary text-white">
                    <Zap className="mr-2 h-4 w-4" />
                    Booster une annonce
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="boosts" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="boosts">
                Historique des boosts ({boostHistory.length})
              </TabsTrigger>
              <TabsTrigger value="insights">
                Insights
              </TabsTrigger>
            </TabsList>

            <TabsContent value="boosts" className="space-y-4 mt-6">
              {boostHistory.length === 0 ? (
                <Card className="bg-muted/30 border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Zap className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                    <p className="text-muted-foreground mb-2">Aucune annonce boostée</p>
                    <p className="text-sm text-muted-foreground">
                      Boostez vos annonces pour augmenter leur visibilité.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                boostHistory.map((boost) => (
                  <Card key={boost.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold">{boost.product_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Boost {boost.package_id.toUpperCase()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">{boost.amount}$</p>
                          <Badge className={boost.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                            {boost.status === 'active' ? 'Actif' : 'Expiré'}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Expire le {new Date(boost.expires_at).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="insights" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Recommandations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stats.activeListings < 5 && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900">Augmentez vos annonces</p>
                        <p className="text-sm text-blue-700">Vous avez peu d'annonces actives. Ajoutez plus de produits pour augmenter vos ventes.</p>
                      </div>
                    </div>
                  )}

                  {stats.boostedProducts === 0 && (
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-3">
                      <Zap className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-900">Boostez vos meilleures annonces</p>
                        <p className="text-sm text-amber-700">Les annonces boostées reçoivent 45% plus de vues. Essayez pour augmenter vos ventes.</p>
                      </div>
                    </div>
                  )}

                  {stats.totalRevenue > 500 && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200 flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-900">Excellent travail !</p>
                        <p className="text-sm text-green-700">Vous êtes un vendeur de confiance. Continuez à offrir une excellente expérience client.</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SellerDashboard;
