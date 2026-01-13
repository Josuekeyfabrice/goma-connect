import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingBag, Shield, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Hero = () => {
  return (
    <section className="relative overflow-hidden gradient-hero">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4 py-16 md:py-24">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <h1 className="font-display text-4xl font-extrabold tracking-tight md:text-6xl lg:text-7xl leading-tight">
            Achetez & Vendez à{' '}
            <span className="relative inline-block">
              <span className="relative z-10 text-primary">Goma</span>
              <span className="absolute bottom-2 left-0 h-3 w-full bg-primary/20 -rotate-1" />
            </span>
            <br />
            <span className="text-foreground/90">en toute simplicité</span>
          </h1>
          <p className="mt-8 text-lg text-muted-foreground md:text-2xl font-medium max-w-2xl mx-auto leading-relaxed">
            La première marketplace de <span className="text-foreground font-semibold">Goma</span> et ses environs. 
            Trouvez ce dont vous avez besoin ou vendez vos articles en quelques clics.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" className="gap-2 gradient-primary text-primary-foreground shadow-warm" asChild>
              <Link to="/search">
                <ShoppingBag className="h-5 w-5" />
                Explorer les annonces
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="gap-2" asChild>
              <Link to="/sell">
                Publier une annonce
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16 grid gap-6 md:grid-cols-3"
        >
          <div className="rounded-2xl border bg-card p-6 text-center shadow-card">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
              <ShoppingBag className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="mt-4 font-semibold">Achat Simple</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Parcourez des milliers d'articles et contactez les vendeurs directement
            </p>
          </div>
          <div className="rounded-2xl border bg-card p-6 text-center shadow-card">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl gradient-secondary">
              <Shield className="h-6 w-6 text-secondary-foreground" />
            </div>
            <h3 className="mt-4 font-semibold">Transactions Sécurisées</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Profils vérifiés et système de signalement pour votre sécurité
            </p>
          </div>
          <div className="rounded-2xl border bg-card p-6 text-center shadow-card">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
              <MessageCircle className="h-6 w-6 text-accent-foreground" />
            </div>
            <h3 className="mt-4 font-semibold">Communication Directe</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Messagerie instantanée et appels vocaux intégrés
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
