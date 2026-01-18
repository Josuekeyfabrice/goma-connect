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
  Check,
  X,
  Info
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

const FREE_LIMIT_SECONDS = 23 * 60 * 60; // 23 heures gratuites

const LiveTV = () => {
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState(FREE_LIMIT_SECONDS);
  const [isLocked, setIsLocked] = useState(false);
  const [activeTab, setActiveTab] = useState("tv");
  const [movies, setMovies] = useState<any[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [showPaywall, setShowPaywall] = useState(false);
  const [hasPass, setHasPass] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [playerUrl, setPlayerUrl] = useState<string | null>(null);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);

  useEffect(() => {
    const loadData = async () => {
      try {
        const trendingMovies = await tmdbService.getTrendingMovies();
        const trendingTV = await tmdbService.getTrendingTV();
        setMovies(trendingMovies);
        setSeries(trendingTV);
      } catch (error) {
        console.error("Erreur TMDB:", error);
      }
    };
    loadData();

    const timer = setInterval(() => {
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

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };

  const handlePay = (plan: string) => {
    const message = `Bonjour GOMACASCADE, je souhaite acheter le Pass TV/Ciné "${plan}".`;
    window.open(`https://wa.me/243893645600?text=${encodeURIComponent(message)}`, '_blank');
  };

  const channels = [
    { id: 1, name: "France 24", category: "Infos", url: "https://www.youtube.com/embed/wwNQsk7igpQ?autoplay=1", color: "bg-blue-600" },
    { id: 2, name: "Euronews (FR)", category: "Infos", url: "https://www.youtube.com/embed/PY_N1XS_m9E?autoplay=1", color: "bg-blue-800" },
    { id: 3, name: "Africa24", category: "Infos", url: "https://www.youtube.com/embed/live_stream?channel=UCv_f3p8f_v7m6z_Y_Xv_f3p", color: "bg-yellow-600" },
    { id: 4, name: "TV5 Monde", category: "Divertissement", url: "https://www.youtube.com/embed/live_stream?channel=UCv_f3p8f_v7m6z_Y_Xv_f3p", color: "bg-red-600" },
    { id: 5, name: "TRT Français", category: "Infos", url: "https://www.youtube.com/embed/live_stream?channel=UCv_f3p8f_v7m6z_Y_Xv_f3p", color: "bg-green-600" },
    { id: 6, name: "Al Jazeera (EN)", category: "Infos", url: "https://www.youtube.com/embed/gCNeDWCI0vo?autoplay=1", color: "bg-orange-600" },
    { id: 7, name: "Sky News", category: "Infos", url: "https://www.youtube.com/embed/9Auq9mYxFEE?autoplay=1", color: "bg-sky-600" },
    { id: 8, name: "DW News", category: "Infos", url: "https://www.youtube.com/embed/v_f3p8f_v7m6z_Y_Xv_f3p", color: "bg-gray-600" },
  ];

  const [currentChannel, setCurrentChannel] = useState(channels[0]);

  const playMedia = (media: any, type: 'movie' | 'tv') => {
    if (isLocked && !hasPass) {
      setShowPaywall(true);
      return;
    }
    setSelectedMedia({ ...media, type });
    
    let baseUrl = "";
    if (type === 'movie') {
      baseUrl = `https://vidsrc.to/embed/movie/${media.id}`;
    } else {
      baseUrl = `https://vidsrc.to/embed/tv/${media.id}/${season}/${episode}`;
    }
    
    setPlayerUrl(baseUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateEpisode = (newSeason: number, newEpisode: number) => {
    if (!selectedMedia || selectedMedia.type !== 'tv') return;
    setSeason(newSeason);
    setEpisode(newEpisode);
    setPlayerUrl(`https://vidsrc.to/embed/tv/${selectedMedia.id}/${newSeason}/${newEpisode}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-white">
      <Header />
      
      <main className="flex-1 pb-20">
        {/* Hero Section / Player */}
        <div className="relative aspect-video w-full max-h-[80vh] bg-black overflow-hidden group shadow-2xl">
          {isLocked && !hasPass ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 backdrop-blur-2xl z-50 p-6 text-center">
              <div className="p-8 bg-primary/20 rounded-full mb-8 animate-bounce">
                <Lock className="h-20 w-20 text-primary" />
              </div>
              <h2 className="text-4xl font-black mb-4 font-display tracking-tighter">Votre essai de 23h est terminé !</h2>
              <p className="text-gray-400 max-w-md mb-10 text-lg">
                Pour continuer à profiter du meilleur du cinéma et de la TV à Goma, activez votre accès illimité.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 w-full max-w-lg">
                <Button onClick={() => setShowPaywall(true)} className="gradient-primary h-16 rounded-2xl font-bold text-xl flex-1 shadow-lg shadow-primary/20">
                  Activer mon Pass
                </Button>
              </div>
            </div>
          ) : (
            <>
              {playerUrl ? (
                <div className="relative w-full h-full">
                  <iframe 
                    src={playerUrl}
                    className="w-full h-full border-none"
                    allowFullScreen
                    title="Video Player"
                  ></iframe>
                  <div className="absolute top-4 right-4 flex gap-2 z-20">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="bg-black/50 hover:bg-red-600 text-white rounded-full"
                      onClick={() => {
                        setPlayerUrl(null);
                        setSelectedMedia(null);
                      }}
                    >
                      <X className="h-6 w-6" />
                    </Button>
                  </div>
                </div>
              ) : (
                <iframe 
                  src={currentChannel.url}
                  className="w-full h-full border-none"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  title="TV Player"
                ></iframe>
              )}
              
              {/* Overlay Info */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
                <Badge className="bg-red-600 text-white border-none px-4 py-1.5 font-black animate-pulse shadow-lg shadow-red-600/20">
                  • {playerUrl ? "CINÉMA" : "EN DIRECT"}
                </Badge>
                <span className="text-sm font-black bg-black/60 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/10 shadow-xl">
                  {playerUrl ? (selectedMedia?.title || selectedMedia?.name) : currentChannel.name}
                </span>
              </div>

              {!hasPass && (
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-primary/90 backdrop-blur-xl px-5 py-2 rounded-full flex items-center gap-3 border border-white/20 shadow-2xl">
                    <Clock className="h-5 w-5 text-white animate-spin-slow" />
                    <span className="font-mono font-black text-white">{formatTime(timeLeft)}</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* TV Controls for Series */}
        {selectedMedia?.type === 'tv' && playerUrl && (
          <div className="bg-white/5 border-b border-white/10 p-4">
            <div className="container mx-auto flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-400">Saison:</span>
                <input 
                  type="number" 
                  value={season} 
                  onChange={(e) => updateEpisode(parseInt(e.target.value), episode)}
                  className="bg-black/40 border border-white/10 rounded px-2 py-1 w-16 text-center"
                  min="1"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-400">Épisode:</span>
                <input 
                  type="number" 
                  value={episode} 
                  onChange={(e) => updateEpisode(season, parseInt(e.target.value))}
                  className="bg-black/40 border border-white/10 rounded px-2 py-1 w-16 text-center"
                  min="1"
                />
              </div>
              <p className="text-xs text-gray-500 italic ml-auto">
                <Info className="h-3 w-3 inline mr-1" /> Les liens sont mis à jour automatiquement en haute qualité (1080p).
              </p>
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 mt-10">
          <Tabs defaultValue="tv" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="bg-white/5 border border-white/10 p-1.5 rounded-[2rem] mb-12 max-w-md mx-auto flex">
              <TabsTrigger value="tv" className="rounded-[1.5rem] gap-2 flex-1 py-3 data-[state=active]:bg-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30">
                <Tv className="h-5 w-5" /> Live TV
              </TabsTrigger>
              <TabsTrigger value="movies" className="rounded-[1.5rem] gap-2 flex-1 py-3 data-[state=active]:bg-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30">
                <Film className="h-5 w-5" /> Cinéma
              </TabsTrigger>
              <TabsTrigger value="series" className="rounded-[1.5rem] gap-2 flex-1 py-3 data-[state=active]:bg-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30">
                <MonitorPlay className="h-5 w-5" /> Séries
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tv" className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-3xl font-black font-display tracking-tight">Chaînes IPTV Goma</h3>
                <Badge variant="outline" className="border-white/10 text-gray-400 px-4 py-1">
                  {channels.length} Canaux
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {channels.map((channel) => (
                  <motion.div 
                    key={channel.id}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setCurrentChannel(channel);
                      setPlayerUrl(null);
                      if (isLocked) setShowPaywall(true);
                    }}
                    className={`p-6 rounded-[2rem] cursor-pointer border-2 transition-all shadow-xl ${
                      currentChannel.id === channel.id && !playerUrl
                      ? 'border-primary bg-primary/10 shadow-primary/10' 
                      : 'border-white/5 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-5">
                      <div className={`h-16 w-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-2xl ${channel.color}`}>
                        {channel.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-lg">{channel.name}</p>
                        <p className="text-sm text-gray-500 font-medium">{channel.category}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="movies" className="space-y-10">
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-3xl font-black font-display flex items-center gap-3">
                    <TrendingUp className="h-8 w-8 text-primary" /> Blockbusters du Moment
                  </h3>
                  <Button variant="ghost" className="text-primary font-bold gap-2 hover:bg-primary/10 rounded-full px-6">
                    Voir tout <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide px-2">
                  {movies.map((movie) => (
                    <motion.div 
                      key={movie.id}
                      className="flex-none w-56 group cursor-pointer"
                      whileHover={{ y: -15 }}
                      onClick={() => playMedia(movie, 'movie')}
                    >
                      <div className="relative aspect-[2/3] rounded-[2rem] overflow-hidden mb-4 shadow-2xl border border-white/5">
                        <img 
                          src={tmdbService.getImageUrl(movie.poster_path)} 
                          alt={movie.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-xl px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-white/10">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs font-black">{movie.vote_average.toFixed(1)}</span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-6 text-center">
                          <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center mb-4 shadow-2xl shadow-primary/50">
                            <Play className="h-8 w-8 text-white fill-white" />
                          </div>
                          <p className="font-black text-white text-lg uppercase tracking-tighter">Regarder</p>
                        </div>
                      </div>
                      <h4 className="font-black text-base line-clamp-1 group-hover:text-primary transition-colors">{movie.title}</h4>
                      <p className="text-xs text-gray-500 font-bold mt-1">{new Date(movie.release_date).getFullYear()} • Film</p>
                    </motion.div>
                  ))}
                </div>
              </section>
            </TabsContent>

            <TabsContent value="series" className="space-y-10">
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-3xl font-black font-display flex items-center gap-3">
                    <MonitorPlay className="h-8 w-8 text-primary" /> Séries Incontournables
                  </h3>
                  <Button variant="ghost" className="text-primary font-bold gap-2 hover:bg-primary/10 rounded-full px-6">
                    Voir tout <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide px-2">
                  {series.map((show) => (
                    <motion.div 
                      key={show.id}
                      className="flex-none w-56 group cursor-pointer"
                      whileHover={{ y: -15 }}
                      onClick={() => playMedia(show, 'tv')}
                    >
                      <div className="relative aspect-[2/3] rounded-[2rem] overflow-hidden mb-4 shadow-2xl border border-white/5">
                        <img 
                          src={tmdbService.getImageUrl(show.poster_path)} 
                          alt={show.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-xl px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-white/10">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs font-black">{show.vote_average.toFixed(1)}</span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-6 text-center">
                          <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center mb-4 shadow-2xl shadow-primary/50">
                            <Play className="h-8 w-8 text-white fill-white" />
                          </div>
                          <p className="font-black text-white text-lg uppercase tracking-tighter">Regarder</p>
                        </div>
                      </div>
                      <h4 className="font-black text-base line-clamp-1 group-hover:text-primary transition-colors">{show.name}</h4>
                      <p className="text-xs text-gray-500 font-bold mt-1">{new Date(show.first_air_date).getFullYear()} • Série</p>
                    </motion.div>
                  ))}
                </div>
              </section>
            </TabsContent>
          </Tabs>
        </div>

        {/* Paywall Dialog */}
        <Dialog open={showPaywall} onOpenChange={setShowPaywall}>
          <DialogContent className="sm:max-w-[550px] rounded-[3rem] bg-[#121212] border-white/10 text-white p-8 shadow-[0_0_50px_rgba(var(--primary),0.2)]">
            <DialogHeader>
              <DialogTitle className="text-4xl font-black text-center flex flex-col items-center gap-6">
                <div className="p-6 bg-primary/20 rounded-full shadow-2xl shadow-primary/20">
                  <Zap className="h-12 w-12 text-primary fill-current animate-pulse" />
                </div>
                GOMACASCADE TV Premium
              </DialogTitle>
              <DialogDescription className="text-center text-xl text-gray-400 mt-4">
                Votre essai de 23h est terminé. Passez en Premium pour un accès illimité à Goma !
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-8">
              {[
                { name: 'Pass Journalier', price: '1$', features: ['24h illimité', 'Films & Séries 1080p', 'Toutes les chaînes TV', 'Support 24/7'] },
                { name: 'Pass Mensuel', price: '5$', features: ['30 jours illimité', 'Films & Séries 1080p', 'Toutes les chaînes TV', 'Sans Publicités', 'Accès Prioritaire'] },
              ].map((plan) => (
                <div key={plan.name} className="p-6 rounded-[2.5rem] border-2 border-white/10 hover:border-primary transition-all group cursor-pointer bg-white/5 hover:bg-white/10 shadow-xl" onClick={() => handlePay(plan.name)}>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-black text-2xl">{plan.name}</h3>
                    <span className="text-3xl font-black text-primary">{plan.price}</span>
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center gap-3 text-sm text-gray-300 font-medium">
                        <Check className="h-5 w-5 text-primary" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-8 h-14 rounded-2xl font-black text-lg group-hover:gradient-primary shadow-lg">
                    Activer maintenant
                  </Button>
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-gray-500 font-bold">
              Paiement instantané via M-Pesa, Airtel Money et Orange Money.
            </p>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
};

export default LiveTV;
