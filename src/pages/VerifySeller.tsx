import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ShieldCheck, TrendingUp, Zap, Smartphone, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

const VerifySeller = () => {
  const plans = [
    {
      name: "Mensuel",
      price: "5",
      duration: "mois",
      description: "Idéal pour tester l'impact sur vos ventes.",
      features: ["Badge Vendeur Vérifié", "Priorité dans les recherches", "Support WhatsApp 24/7"],
      recommended: false
    },
    {
      name: "Trimestriel",
      price: "12",
      duration: "3 mois",
      description: "Le meilleur rapport qualité-prix pour les pros.",
      features: ["Badge Vendeur Vérifié", "Priorité dans les recherches", "Support WhatsApp 24/7", "Statistiques de vues avancées"],
      recommended: true
    },
    {
      name: "Annuel",
      price: "40",
      duration: "an",
      description: "Pour les entreprises établies à Goma.",
      features: ["Badge Vendeur Vérifié", "Priorité maximale", "Support dédié", "Publicité sur la page d'accueil"],
      recommended: false
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 bg-primary/5 border-b">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto space-y-4"
            >
              <Badge className="bg-primary/10 text-primary border-primary/20 mb-2">Programme de Confiance</Badge>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                Devenez un Vendeur <span className="text-primary">Vérifié</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Augmentez vos ventes et gagnez la confiance de milliers d'acheteurs à Goma.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4 text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold">Confiance Instantanée</h3>
              <p className="text-muted-foreground">Le badge rassure les clients sur votre sérieux et réduit les hésitations à l'achat.</p>
            </div>
            <div className="space-y-4 text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold">Plus de Visibilité</h3>
              <p className="text-muted-foreground">Vos annonces apparaissent avant celles des vendeurs non vérifiés dans les résultats.</p>
            </div>
            <div className="space-y-4 text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold">Ventes Accélérées</h3>
              <p className="text-muted-foreground">Les vendeurs vérifiés vendent en moyenne 3x plus vite que les autres sur GOMACASCADE.</p>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Choisissez votre forfait</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {plans.map((plan, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -10 }}
                  className="relative"
                >
                  {plan.recommended && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                      <Badge className="bg-primary text-primary-foreground px-4 py-1">Recommandé</Badge>
                    </div>
                  )}
                  <Card className={`h-full flex flex-col ${plan.recommended ? 'border-primary shadow-lg ring-1 ring-primary' : ''}`}>
                    <CardHeader>
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold">{plan.price}$</span>
                        <span className="text-muted-foreground">/{plan.duration}</span>
                      </div>
                      <ul className="space-y-3">
                        {plan.features.map((feature, fIndex) => (
                          <li key={fIndex} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button className={`w-full ${plan.recommended ? 'gradient-primary' : ''}`} variant={plan.recommended ? 'default' : 'outline'}>
                        Choisir ce forfait
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Payment Methods */}
        <section className="py-16 container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-8">Modes de paiement acceptés à Goma</h2>
          <div className="flex flex-wrap justify-center gap-8 opacity-70">
            <div className="flex items-center gap-2">
              <Smartphone className="w-6 h-6" />
              <span className="font-semibold">M-Pesa</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="w-6 h-6" />
              <span className="font-semibold">Airtel Money</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="w-6 h-6" />
              <span className="font-semibold">Orange Money</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-6 h-6" />
              <span className="font-semibold">Cartes Bancaires</span>
            </div>
          </div>
          <p className="mt-8 text-muted-foreground max-w-xl mx-auto">
            Après le choix de votre forfait, vous recevrez les instructions pour le transfert Mobile Money. 
            Votre badge sera activé dans les 2 heures suivant la confirmation.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default VerifySeller;
