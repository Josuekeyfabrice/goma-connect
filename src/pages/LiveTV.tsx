import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Tv, 
  Globe,
  Trophy,
  Film,
  Newspaper,
  ExternalLink,
  Lock,
  Clock,
  Zap,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const CATEGORIES = [
  { id: 'all', name: 'Toutes', icon: <Tv className="h-4 w-4" /> },
  { id: 'news', name: 'Infos', icon: <Newspaper className="h-4 w-4" /> },
  { id: 'sports', name: 'Sports', icon: <Trophy className="h-4 w-4" /> },
  { id: 'cinema', name: 'Cinéma', icon: <Film className="h-4 w-4" /> },
  { id: 'world', name: 'Monde', icon: <Globe className="h-4 w-4" /> },
];

const CHANNELS = [
  { 
    id: 1, 
    name: 'France 24', 
    category: 'news', 
    subCat: 'International', 
    status: 'En direct', 
    color: 'bg-blue-600', 
    viewers: '5.4k',
    url: 'https://www.youtube.com/embed/wwNQskZ56yA?autoplay=1'
  },
  { 
    id: 2, 
    name: 'RTNC (YouTube)', 
    category: 'news', 
    subCat: 'Généraliste', 
    status: 'En direct', 
    color: 'bg-blue-500', 
    viewers: '1.2k',
    url: 'https://www.youtube.com/embed/live_stream?channel=UCv_f3p8f_v7m6z_Y_Xv_f3p'
  },
  { 
    id: 3, 
    name: 'Euronews', 
    category: 'news', 
    subCat: 'Infos', 
    status: 'En direct', 
    color: 'bg-blue-800', 
    viewers: '1.1k',
    url: 'https://www.youtube.com/embed/sPg27S3L3Uo?autoplay=1'
  },
  { 
    id: 4, 
    name: 'Canal+ Sport', 
    category: 'sports', 
    subCat: 'Sport', 
    status: 'En direct', 
    color: 'bg-red-600', 
    viewers: '12.3k',
    url: 'https://www.youtube.com/embed/live_stream?channel=UCv_f3p8f_v7m6z_Y_Xv_f3p'
  },
  { 
    id: 5, 
    name: 'Novelas TV', 
    category: 'cinema', 
    subCat: 'Séries', 
    status: 'En direct', 
    color: 'bg-pink-600', 
    viewers: '8.2k',
    url: 'https://www.youtube.com/embed/live_stream?channel=UCv_f3p8f_v7m6z_Y_Xv_f3p'
  }
];

const FREE_LIMIT_SECONDS = 300; // 5 minutes gratuites

const LiveTV = () => {
  const [selectedChannel, setSelectedChannel] = useState(CHANNELS[0]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isPlaying, setIsPlaying] = useState(false);
  const [watchTime, setWatchTime] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [hasPass, setHasPass] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && !hasPass) {
      interval = setInterval(() => {
        setWatchTime((prev) => {
          if (prev >= FREE_LIMIT_SECONDS) {
            setIsPlaying(false);
            setShowPaywall(true);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, hasPass]);

  const handlePay = (plan: string) => {
    const message = `Bonjour GOMACASCADE, je souhaite acheter le Pass TV "${plan}".`;
    window.open(`https://wa.me/243893645600?text=${encodeURIComponent(message)}`, '_blank');
  };

  const filteredChannels = activeCategory === 'all' 
    ? CHANNELS 
    : CHANNELS.filter(c => c.category === activeCategory);

  const timeLeft = Math.max(0, FREE_LIMIT_SECONDS - watchTime);
  const minutesLeft = Math.floor(timeLeft / 60);
  const secondsLeft = timeLeft % 60;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display flex items-center gap-3">
              <Tv className="h-8 w-8 text-primary" />
              GOMACASCADE Live TV
            </h1>
            <p className="text-muted-foreground mt-2">Le meilleur du streaming en direct à Goma.</p>
          </div>
          
          {!hasPass && (
            <Badge variant="outline" className="px-4 py-2 border-primary/30 bg-primary/5 flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="font-bold">Temps gratuit restant : {minutesLeft}:{secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}</span>
            </Badge>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            <motion.div 
              layoutId="player"
              className="aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl relative group border-4 border-card"
            >
              {isPlaying ? (
                <iframe
                  src={selectedChannel.url}
                  title={selectedChannel.name}
                  className="w-full h-full border-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-black">
                  <div className="text-center space-y-6 px-4">
                    {showPaywall ? (
                      <div className="space-y-6">
                        <div className="mx-auto w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
                          <Lock className="h-10 w-10 text-primary" />
                        </div>
                        <div className="space-y-2">
                          <h2 className="text-2xl font-black text-white">Temps gratuit écoulé !</h2>
                          <p className="text-white/60 max-w-sm mx-auto">Abonnez-vous pour continuer à regarder vos chaînes préférées en illimité.</p>
                        </div>
                        <Button 
                          onClick={() => setShowPaywall(true)}
                          className="gradient-primary h-12 px-8 rounded-xl font-bold"
                        >
                          Voir les abonnements
                        </Button>
                      </div>
                    ) : (
                      <>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button 
                            onClick={() => setIsPlaying(true)}
                            className="h-20 w-20 rounded-full gradient-primary shadow-[0_0_30px_rgba(var(--primary),0.5)]"
                          >
                            <Play className="h-10 w-10 fill-white text-white" />
                          </Button>
                        </motion.div>
                        <div className="space-y-2">
                          <p className="text-white font-bold text-xl">Prêt à diffuser : {selectedChannel.name}</p>
                          <p className="text-white/40 text-sm">Cliquez pour lancer le direct</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
              
              <div className="absolute top-4 left-4 flex items-center gap-3 pointer-events-none">
                <div className={`h-3 w-3 rounded-full animate-pulse ${selectedChannel.color}`} />
                <Badge className="bg-red-600 text-white border-none px-3 py-1">LIVE</Badge>
              </div>
            </motion.div>

            <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm rounded-3xl">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`h-16 w-16 rounded-2xl ${selectedChannel.color} flex items-center justify-center text-white text-2xl font-black shadow-inner`}>
                    {selectedChannel.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{selectedChannel.name}</h3>
                    <p className="text-muted-foreground flex items-center gap-2">
                      <Globe className="h-3 w-3" /> {selectedChannel.subCat} • {selectedChannel.viewers} spectateurs
                    </p>
                  </div>
                </div>
                <Button variant="outline" className="rounded-full gap-2 hidden md:flex" onClick={() => handlePay('Journalier')}>
                  <Zap className="h-4 w-4 text-primary" /> Passer en Premium
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="w-full lg:w-96 space-y-6">
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat.id}
                  variant={activeCategory === cat.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveCategory(cat.id)}
                  className="rounded-full gap-2 whitespace-nowrap"
                >
                  {cat.icon}
                  {cat.name}
                </Button>
              ))}
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {filteredChannels.map((channel) => (
                  <motion.button
                    key={channel.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ x: 8 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedChannel(channel);
                      setIsPlaying(false);
                    }}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                      selectedChannel.id === channel.id 
                        ? 'bg-primary/10 border-primary shadow-md ring-1 ring-primary/20' 
                        : 'bg-card hover:bg-accent border-border'
                    }`}
                  >
                    <div className={`h-14 w-14 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg ${channel.color}`}>
                      {channel.name.charAt(0)}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-bold text-base">{channel.name}</p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                        {channel.subCat}
                      </p>
                    </div>
                    {selectedChannel.id === channel.id && (
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                        <Play className="h-4 w-4 text-white fill-white" />
                      </div>
                    )}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Paywall Dialog */}
        <Dialog open={showPaywall} onOpenChange={setShowPaywall}>
          <DialogContent className="sm:max-w-[500px] rounded-[2.5rem]">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black text-center flex flex-col items-center gap-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Zap className="h-10 w-10 text-primary fill-current" />
                </div>
                GOMACASCADE TV Premium
              </DialogTitle>
              <DialogDescription className="text-center text-lg">
                Ne manquez plus rien ! Choisissez votre Pass TV pour un accès illimité.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-6">
              {[
                { name: 'Pass Journalier', price: '1$', features: ['24h illimité', 'Toutes les chaînes', 'Qualité HD'] },
                { name: 'Pass Mensuel', price: '5$', features: ['30 jours illimité', 'Toutes les chaînes', 'Support Prioritaire', 'Sans Pubs'] },
              ].map((plan) => (
                <div key={plan.name} className="p-5 rounded-3xl border-2 border-border hover:border-primary transition-all group cursor-pointer" onClick={() => handlePay(plan.name)}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-black text-xl">{plan.name}</h3>
                    <span className="text-2xl font-black text-primary">{plan.price}</span>
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-primary" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-6 rounded-xl font-bold group-hover:gradient-primary">
                    Acheter maintenant
                  </Button>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-muted-foreground">
              Paiement sécurisé via M-Pesa, Airtel Money et Orange Money.
            </p>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
};

export default LiveTV;
