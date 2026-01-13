import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Tv, 
  Radio, 
  Info, 
  AlertCircle, 
  Volume2, 
  Maximize, 
  Settings,
  Globe,
  Trophy,
  Film,
  Newspaper
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  { id: 'all', name: 'Toutes', icon: <Tv className="h-4 w-4" /> },
  { id: 'news', name: 'Infos', icon: <Newspaper className="h-4 w-4" /> },
  { id: 'sports', name: 'Sports', icon: <Trophy className="h-4 w-4" /> },
  { id: 'cinema', name: 'Cinéma', icon: <Film className="h-4 w-4" /> },
  { id: 'world', name: 'Monde', icon: <Globe className="h-4 w-4" /> },
];

const CHANNELS = [
  { id: 1, name: 'RTNC', category: 'news', subCat: 'Généraliste', status: 'En direct', color: 'bg-blue-600', viewers: '1.2k' },
  { id: 2, name: 'Digital Congo', category: 'news', subCat: 'Infos', status: 'En direct', color: 'bg-red-600', viewers: '850' },
  { id: 3, name: 'B-One TV', category: 'cinema', subCat: 'Divertissement', status: 'En direct', color: 'bg-purple-600', viewers: '2.1k' },
  { id: 4, name: 'France 24', category: 'world', subCat: 'International', status: 'En direct', color: 'bg-orange-600', viewers: '5.4k' },
  { id: 5, name: 'TV5 Monde', category: 'world', subCat: 'Culture', status: 'En direct', color: 'bg-green-600', viewers: '3.2k' },
  { id: 6, name: 'Canal+ Sport', category: 'sports', subCat: 'Sports', status: 'En direct', color: 'bg-black', viewers: '12k' },
  { id: 7, name: 'Euronews', category: 'news', subCat: 'Infos', status: 'En direct', color: 'bg-blue-800', viewers: '1.1k' },
  { id: 8, name: 'Novelas TV', category: 'cinema', subCat: 'Séries', status: 'En direct', color: 'bg-pink-600', viewers: '8.5k' },
];

const LiveTV = () => {
  const [selectedChannel, setSelectedChannel] = useState(CHANNELS[0]);
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredChannels = activeCategory === 'all' 
    ? CHANNELS 
    : CHANNELS.filter(c => c.category === activeCategory);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display flex items-center gap-3">
            <Tv className="h-8 w-8 text-primary" />
            GOMACASCADE Live TV
          </h1>
          <p className="text-muted-foreground mt-2">Le meilleur du streaming en direct à Goma.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Player Section */}
          <div className="flex-1 space-y-6">
            <motion.div 
              layoutId="player"
              className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl relative group border-4 border-card"
            >
              {/* Fake Video Content */}
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-black">
                <div className="text-center space-y-6">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ repeat: Infinity, duration: 3 }}
                  >
                    <Tv className="h-24 w-24 text-white mx-auto" />
                  </motion.div>
                  <div className="space-y-2">
                    <p className="text-white font-bold text-xl">Connexion au flux sécurisé...</p>
                    <p className="text-white/40 text-sm">Optimisation pour votre connexion à Goma</p>
                  </div>
                  <div className="h-1.5 w-64 bg-white/10 mx-auto rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      className="h-full w-full bg-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]"
                    />
                  </div>
                </div>
              </div>
              
              {/* Player Controls Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-between p-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={`h-4 w-4 rounded-full animate-pulse ${selectedChannel.color} shadow-[0_0_10px_rgba(255,255,255,0.5)]`} />
                    <div>
                      <h2 className="text-white font-bold text-2xl">{selectedChannel.name}</h2>
                      <p className="text-white/70 text-xs uppercase tracking-widest">{selectedChannel.subCat}</p>
                    </div>
                  </div>
                  <Badge className="bg-red-600 text-white border-none px-3 py-1 animate-pulse">LIVE</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <Button size="icon" variant="ghost" className="text-white hover:bg-white/20 rounded-full">
                      <Play className="h-8 w-8 fill-current" />
                    </Button>
                    <div className="flex items-center gap-3 group/vol">
                      <Volume2 className="h-6 w-6 text-white" />
                      <div className="w-24 h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div className="w-3/4 h-full bg-white" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-white/80 text-sm font-mono">{selectedChannel.viewers} spectateurs</span>
                    <Button size="icon" variant="ghost" className="text-white hover:bg-white/20">
                      <Settings className="h-5 w-5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="text-white hover:bg-white/20">
                      <Maximize className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Channel Info Card */}
            <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`h-16 w-16 rounded-2xl ${selectedChannel.color} flex items-center justify-center text-white text-2xl font-black shadow-inner`}>
                    {selectedChannel.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{selectedChannel.name}</h3>
                    <p className="text-muted-foreground">Diffusion haute qualité • Faible latence</p>
                  </div>
                </div>
                <div className="hidden md:flex gap-2">
                  <Button variant="outline" className="rounded-full">Partager</Button>
                  <Button className="rounded-full gradient-primary">S'abonner</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Section */}
          <div className="w-full lg:w-96 space-y-6">
            {/* Categories Selector */}
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

            {/* Channel List */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
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
                    onClick={() => setSelectedChannel(channel)}
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
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-base">{channel.name}</p>
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          {channel.viewers}
                        </span>
                      </div>
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

            {/* Info Box */}
            <Card className="bg-primary/5 border-primary/20 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-2 opacity-10">
                <Tv className="h-12 w-12" />
              </div>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-2 text-primary">
                  <Info className="h-5 w-5" />
                  <h4 className="font-bold">Info GOMACASCADE</h4>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Pour une expérience optimale, utilisez une connexion 4G ou Fibre. 
                  Le service Live TV est inclus dans votre abonnement Premium.
                </p>
                <Button variant="link" className="p-0 h-auto text-xs text-primary font-bold">
                  Besoin d'aide ? Contactez le support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LiveTV;
