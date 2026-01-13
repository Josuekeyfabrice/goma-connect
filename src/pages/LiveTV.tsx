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
  Newspaper,
  ExternalLink
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
    url: 'https://www.youtube.com/embed/live_stream?channel=UCv_f3p8f_v7m6z_Y_Xv_f3p' // Placeholder for RTNC live
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
    name: 'Africa 24', 
    category: 'news', 
    subCat: 'Afrique', 
    status: 'En direct', 
    color: 'bg-red-600', 
    viewers: '2.3k',
    url: 'https://www.youtube.com/embed/live_stream?channel=UCv_f3p8f_v7m6z_Y_Xv_f3p'
  },
  { 
    id: 5, 
    name: 'TV5 Monde', 
    category: 'world', 
    subCat: 'Culture', 
    status: 'En direct', 
    color: 'bg-green-600', 
    viewers: '3.2k',
    url: 'https://www.youtube.com/embed/live_stream?channel=UCv_f3p8f_v7m6z_Y_Xv_f3p'
  }
];

const LiveTV = () => {
  const [selectedChannel, setSelectedChannel] = useState(CHANNELS[0]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isPlaying, setIsPlaying] = useState(false);

  const filteredChannels = activeCategory === 'all' 
    ? CHANNELS 
    : CHANNELS.filter(c => c.category === activeCategory);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display flex items-center gap-3">
            <Tv className="h-8 w-8 text-primary" />
            GOMACASCADE Live TV
          </h1>
          <p className="text-muted-foreground mt-2">Le meilleur du streaming en direct à Goma.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            <motion.div 
              layoutId="player"
              className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl relative group border-4 border-card"
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
                  <div className="text-center space-y-6">
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
                  </div>
                </div>
              )}
              
              <div className="absolute top-4 left-4 flex items-center gap-3 pointer-events-none">
                <div className={`h-3 w-3 rounded-full animate-pulse ${selectedChannel.color}`} />
                <Badge className="bg-red-600 text-white border-none px-3 py-1">LIVE</Badge>
              </div>
            </motion.div>

            <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm">
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
                <div className="hidden md:flex gap-2">
                  <Button variant="outline" className="rounded-full gap-2">
                    <ExternalLink className="h-4 w-4" /> Ouvrir
                  </Button>
                </div>
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

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-2 text-primary">
                  <Info className="h-5 w-5" />
                  <h4 className="font-bold text-sm">Info GOMACASCADE</h4>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Les flux TV sont diffusés via des plateformes sécurisées. Si une chaîne ne se charge pas, essayez de rafraîchir la page.
                </p>
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
