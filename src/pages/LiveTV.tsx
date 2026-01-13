import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Tv, Radio, Info, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const CHANNELS = [
  { id: 1, name: 'RTNC', category: 'Généraliste', status: 'En direct', color: 'bg-blue-500' },
  { id: 2, name: 'Digital Congo', category: 'Infos', status: 'En direct', color: 'bg-red-500' },
  { id: 3, name: 'B-One TV', category: 'Divertissement', status: 'En direct', color: 'bg-purple-500' },
  { id: 4, name: 'France 24', category: 'International', status: 'En direct', color: 'bg-orange-500' },
  { id: 5, name: 'TV5 Monde', category: 'Culture', status: 'En direct', color: 'bg-green-500' },
  { id: 6, name: 'Euronews', category: 'Infos', status: 'En direct', color: 'bg-blue-700' },
];

const LiveTV = () => {
  const [selectedChannel, setSelectedChannel] = useState(CHANNELS[0]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Player Section */}
          <div className="flex-1 space-y-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative group"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Tv className="h-16 w-16 text-white/20 mx-auto" />
                  <p className="text-white/60 font-medium">Flux en cours de chargement pour {selectedChannel.name}...</p>
                  <div className="h-1 w-48 bg-white/10 mx-auto rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                      className="h-full w-full bg-primary"
                    />
                  </div>
                </div>
              </div>
              
              {/* Overlay info */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full animate-pulse ${selectedChannel.color}`} />
                    <h2 className="text-white font-bold text-xl">{selectedChannel.name}</h2>
                    <Badge variant="outline" className="text-white border-white/20">
                      {selectedChannel.category}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Badge className="bg-red-600 text-white border-none">LIVE</Badge>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="bg-card border rounded-2xl p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                  <Info className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">À propos de ce service</h3>
                  <p className="text-muted-foreground mt-1">
                    GOMACASCADE Live TV vous permet de suivre vos chaînes préférées en direct. 
                    Ce service est optimisé pour une consommation de données réduite.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Channel List */}
          <div className="w-full lg:w-80 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Radio className="h-5 w-5 text-primary" />
              <h2 className="font-bold text-xl">Chaînes Disponibles</h2>
            </div>
            
            <div className="grid gap-3">
              {CHANNELS.map((channel) => (
                <motion.button
                  key={channel.id}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedChannel(channel)}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    selectedChannel.id === channel.id 
                      ? 'bg-primary/10 border-primary shadow-md' 
                      : 'bg-card hover:bg-accent border-border'
                  }`}
                >
                  <div className={`h-12 w-12 rounded-lg flex items-center justify-center text-white font-bold text-lg ${channel.color}`}>
                    {channel.name.charAt(0)}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-sm">{channel.name}</p>
                    <p className="text-xs text-muted-foreground">{channel.category}</p>
                  </div>
                  {selectedChannel.id === channel.id && (
                    <Play className="h-4 w-4 text-primary fill-primary" />
                  )}
                </motion.button>
              ))}
            </div>

            <Card className="bg-amber-500/10 border-amber-500/20">
              <CardContent className="p-4 flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                <p className="text-xs text-amber-800">
                  Certains flux peuvent être indisponibles selon votre zone géographique ou votre connexion.
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
