import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Tv, 
  Play, 
  Lock, 
  Clock, 
  Film, 
  MonitorPlay, 
  TrendingUp,
  ChevronRight,
  Star,
  Zap,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { tmdbService } from '@/services/tmdb';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const FREE_LIMIT_SECONDS = 300; // 5 minutes gratuites

const LiveTV = () => {
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState(FREE_LIMIT_SECONDS);
  const [isLocked, setIsLocked] = useState(false);
  const [activeTab, setActiveTab] = useState("tv");
  const [movies, setMovies] = useState<any[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [showPaywall, setShowPaywall] = useState(false);
  const [hasPass, setHasPass] = useState(false);

  useEffect(() => {
    // Charger les données TMDB
    const loadData = async () => {
      const trendingMovies = await tmdbService.getTrendingMovies();
      const trendingTV = await tmdbService.getTrendingTV();
      setMovies(trendingMovies);
      setSeries(trendingTV);
    };
    loadData();

    // Timer pour la limitation gratuite
    let timer: NodeJS.Timeout;
    if (!hasPass) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsLocked(true);
            setShowPaywall(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [hasPass]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePay = (plan: string) => {
    const message = `Bonjour GOMACASCADE, je souhaite acheter le Pass TV/Ciné "${plan}".`;
    window.open(`https://wa.me/243893645600?text=${encodeURIComponent(message)}`, '_blank');
  };

  const channels = [
    { id: 1, name: "France 24", category: "Infos", url: "https://www.youtube.com/embed/wwNQsk7igpQ?autoplay=1", color: "bg-blue-600" },
    { id: 2, name: "Euronews", category: "Infos", url: "https://www.youtube.com/embed/PY_N1XS_m9E?autoplay=1", color: "bg-blue-800" },
    { id: 3, name: "Canal+ Sport", category: "Sports", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", color: "bg-red-600" },
    { id: 4, name: "Novelas TV", category: "Séries", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", color: "bg-pink-600" },
  ];

  const [currentChannel, setCurrentChannel] = useState(channels[0]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-white">
      <Header />
      
      <main className="flex-1 pb-20">
        {/* Hero Section / Player */}
        <div className="relative aspect-video w-full max-h-[70vh] bg-black overflow-hidden group">
          {isLocked && !hasPass ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl z-50 p-6 text-center">
              <div className="p-6 bg-primary/20 rounded-full mb-6 animate-pulse">
                <Lock className="h-16 w-16 text-primary" />
              </div>
              <h2 className="text-3xl font-black mb-4 font-display">Temps gratuit écoulé !</h2>
              <p className="text-gray-400 max-w-md mb-8">
                Pour continuer à regarder vos chaînes et films préférés en illimité, activez votre **Pass GOMACASCADE**.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                <Button onClick={() => setShowPaywall(true)} className="gradient-primary h-14 rounded-2xl font-bold text-lg flex-1">
                  Voir les Pass
                </Button>
              </div>
            </div>
          ) : (
            <>
              <iframe 
                src={activeTab === "tv" ? currentChannel.url : `https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1`}
                className="w-full h-full border-none"
                allow="autoplay; encrypted-media"
                allowFullScreen
              ></iframe>
              
              {/* Overlay Info */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
                <Badge className="bg-red-600 text-white border-none px-3 py-1 animate-pulse">
                  • EN DIRECT
                </Badge>
                <span className="text-sm font-bold bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                  {activeTab === "tv" ? currentChannel.name : "Cinéma Goma"}
                </span>
              </div>

              {!hasPass && (
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 border border-white/10">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="container mx-auto px-4 mt-8">
          <Tabs defaultValue="tv" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl mb-8">
              <TabsTrigger value="tv" className="rounded-xl gap-2 data-[state=active]:bg-primary">
                <Tv className="h-4 w-4" /> Live TV
              </TabsTrigger>
              <TabsTrigger value="movies" className="rounded-xl gap-2 data-[state=active]:bg-primary">
                <Film className="h-4 w-4" /> Cinéma
              </TabsTrigger>
              <TabsTrigger value="series" className="rounded-xl gap-2 data-[state=active]:bg-primary">
                <MonitorPlay className="h-4 w-4" /> Séries
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tv" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black font-display">Chaînes Disponibles</h3>
                <Badge variant="outline" className="border-white/10 text-gray-400">
                  {channels.length} Chaînes
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {channels.map((channel) => (
                  <motion.div 
                    key={channel.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setCurrentChannel(channel);
                      if (isLocked) setShowPaywall(true);
                    }}
                    className={`p-4 rounded-2xl cursor-pointer border-2 transition-all ${
                      currentChannel.id === channel.id 
                      ? 'border-primary bg-primary/10' 
                      : 'border-white/5 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold ${channel.color}`}>
                        {channel.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold">{channel.name}</p>
                        <p className="text-xs text-gray-500">{channel.category}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="movies" className="space-y-8">
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-black font-display flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-primary" /> Tendances Cinéma
                  </h3>
                  <Button variant="ghost" className="text-primary gap-1">
                    Voir tout <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {movies.map((movie) => (
                    <motion.div 
                      key={movie.id}
                      className="flex-none w-44 group cursor-pointer"
                      whileHover={{ y: -10 }}
                      onClick={() => isLocked ? setShowPaywall(true) : toast({ title: movie.title, description: "Chargement du film..." })}
                    >
                      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-3 shadow-xl">
                        <img 
                          src={tmdbService.getImageUrl(movie.poster_path)} 
                          alt={movie.title}
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        />
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 border border-white/10">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-[10px] font-bold">{movie.vote_average.toFixed(1)}</span>
                        </div>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Play className="h-12 w-12 text-white fill-white" />
                        </div>
                      </div>
                      <h4 className="font-bold text-sm line-clamp-1">{movie.title}</h4>
                      <p className="text-[10px] text-gray-500">{new Date(movie.release_date).getFullYear()}</p>
                    </motion.div>
                  ))}
                </div>
              </section>
            </TabsContent>

            <TabsContent value="series" className="space-y-8">
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-black font-display flex items-center gap-2">
                    <MonitorPlay className="h-6 w-6 text-primary" /> Séries Populaires
                  </h3>
                  <Button variant="ghost" className="text-primary gap-1">
                    Voir tout <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {series.map((show) => (
                    <motion.div 
                      key={show.id}
                      className="flex-none w-44 group cursor-pointer"
                      whileHover={{ y: -10 }}
                      onClick={() => isLocked ? setShowPaywall(true) : toast({ title: show.name, description: "Chargement de la série..." })}
                    >
                      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-3 shadow-xl">
                        <img 
                          src={tmdbService.getImageUrl(show.poster_path)} 
                          alt={show.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        />
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 border border-white/10">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-[10px] font-bold">{show.vote_average.toFixed(1)}</span>
                        </div>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Play className="h-12 w-12 text-white fill-white" />
                        </div>
                      </div>
                      <h4 className="font-bold text-sm line-clamp-1">{show.name}</h4>
                      <p className="text-[10px] text-gray-500">{new Date(show.first_air_date).getFullYear()}</p>
                    </motion.div>
                  ))}
                </div>
              </section>
            </TabsContent>
          </Tabs>
        </div>

        {/* Paywall Dialog */}
        <Dialog open={showPaywall} onOpenChange={setShowPaywall}>
          <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] bg-[#1a1a1a] border-white/10 text-white">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black text-center flex flex-col items-center gap-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Zap className="h-10 w-10 text-primary fill-current" />
                </div>
                GOMACASCADE TV Premium
              </DialogTitle>
              <DialogDescription className="text-center text-lg text-gray-400">
                Ne manquez plus rien ! Choisissez votre Pass TV/Ciné pour un accès illimité.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-6">
              {[
                { name: 'Pass Journalier', price: '1$', features: ['24h illimité', 'Films & Séries HD', 'Toutes les chaînes TV'] },
                { name: 'Pass Mensuel', price: '5$', features: ['30 jours illimité', 'Films & Séries HD', 'Toutes les chaînes TV', 'Sans Pubs'] },
              ].map((plan) => (
                <div key={plan.name} className="p-5 rounded-3xl border-2 border-white/10 hover:border-primary transition-all group cursor-pointer bg-white/5" onClick={() => handlePay(plan.name)}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-black text-xl">{plan.name}</h3>
                    <span className="text-2xl font-black text-primary">{plan.price}</span>
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-400">
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
            <p className="text-center text-xs text-gray-500">
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
