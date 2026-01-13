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
import { Video, Play, Users, Heart, MessageSquare, Share2, Loader2, AlertCircle, Radio } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LiveSession {
  id: string;
  seller_id: string;
  seller_name: string;
  title: string;
  description: string;
  status: 'live' | 'scheduled' | 'ended';
  start_time: string;
  viewers_count: number;
  likes_count: number;
  featured_products: string[];
  thumbnail?: string;
}

const LiveShopping = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [liveStreams, setLiveStreams] = useState<LiveSession[]>([]);
  const [scheduledStreams, setScheduledStreams] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreatingStream, setIsCreatingStream] = useState(false);

  useEffect(() => {
    const fetchLiveStreams = async () => {
      try {
        // Fetch live streams
        const { data: live, error: liveError } = await supabase
          .from('live_shopping_sessions')
          .select('*')
          .eq('status', 'live')
          .order('start_time', { ascending: false });

        if (liveError) throw liveError;

        // Fetch scheduled streams
        const { data: scheduled, error: scheduledError } = await supabase
          .from('live_shopping_sessions')
          .select('*')
          .eq('status', 'scheduled')
          .order('start_time', { ascending: true });

        if (scheduledError) throw scheduledError;

        setLiveStreams(live || []);
        setScheduledStreams(scheduled || []);
      } catch (error) {
        console.error('Error fetching streams:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les lives",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLiveStreams();

    // Refresh every 30 seconds
    const interval = setInterval(fetchLiveStreams, 30000);
    return () => clearInterval(interval);
  }, [toast]);

  const handleStartLive = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setIsCreatingStream(true);

    try {
      const { data, error } = await supabase
        .from('live_shopping_sessions')
        .insert({
          seller_id: user.id,
          title: 'Mon Live Shopping',
          description: 'Découvrez mes meilleurs produits en direct !',
          status: 'live',
          start_time: new Date().toISOString(),
          viewers_count: 0,
          likes_count: 0,
          featured_products: [],
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Live démarré !",
        description: "Vous êtes maintenant en direct",
      });

      navigate(`/live-shopping/${data.id}`);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de démarrer le live",
        variant: "destructive",
      });
    } finally {
      setIsCreatingStream(false);
    }
  };

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
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold mb-2 flex items-center gap-2">
                <Video className="h-8 w-8 text-primary" />
                Live Shopping
              </h1>
              <p className="text-muted-foreground">
                Regardez les vendeurs présenter leurs produits en direct
              </p>
            </div>
            {user && (
              <Button
                onClick={handleStartLive}
                disabled={isCreatingStream}
                className="gradient-primary text-white"
              >
                {isCreatingStream ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Démarrage...
                  </>
                ) : (
                  <>
                    <Radio className="mr-2 h-4 w-4" />
                    Démarrer un Live
                  </>
                )}
              </Button>
            )}
          </div>

          <Tabs defaultValue="live" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="live" className="flex items-center gap-2">
                <Radio className="h-4 w-4" />
                En direct ({liveStreams.length})
              </TabsTrigger>
              <TabsTrigger value="scheduled" className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                Programmés ({scheduledStreams.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="live" className="space-y-6 mt-6">
              {liveStreams.length === 0 ? (
                <Card className="bg-muted/30 border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Video className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                    <p className="text-muted-foreground mb-2">Aucun live en ce moment</p>
                    <p className="text-sm text-muted-foreground">
                      Revenez plus tard ou programmez un live !
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {liveStreams.map((stream) => (
                    <LiveStreamCard key={stream.id} stream={stream} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="scheduled" className="space-y-6 mt-6">
              {scheduledStreams.length === 0 ? (
                <Card className="bg-muted/30 border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Play className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                    <p className="text-muted-foreground mb-2">Aucun live programmé</p>
                    <p className="text-sm text-muted-foreground">
                      Soyez le premier à programmer un live !
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {scheduledStreams.map((stream) => (
                    <LiveStreamCard key={stream.id} stream={stream} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Tips Section */}
          <Card className="mt-12 bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                Conseils pour un Live Shopping réussi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Présentez vos meilleurs produits avec des détails attrayants</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Interagissez avec votre audience via le chat en direct</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Offrez des réductions exclusives pendant le live</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Gardez le live court et dynamique (15-30 minutes)</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

interface LiveStreamCardProps {
  stream: LiveSession;
}

const LiveStreamCard = ({ stream }: LiveStreamCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-video bg-black">
        {stream.thumbnail ? (
          <img
            src={stream.thumbnail}
            alt={stream.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <Video className="h-12 w-12 text-primary/50" />
          </div>
        )}

        {stream.status === 'live' && (
          <div className="absolute top-3 left-3 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full animate-pulse">
            <Radio className="h-3 w-3" />
            <span className="text-xs font-bold">EN DIRECT</span>
          </div>
        )}

        <div className="absolute top-3 right-3">
          <Badge className="bg-black/50 text-white border-0">
            <Users className="h-3 w-3 mr-1" />
            {stream.viewers_count}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-bold mb-2 line-clamp-2">{stream.title}</h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {stream.description}
        </p>

        <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
          <span>{stream.seller_name}</span>
        </div>

        <div className="flex gap-2 mb-4">
          {stream.featured_products.slice(0, 3).map((product, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs">
              Produit {idx + 1}
            </Badge>
          ))}
        </div>

        <div className="flex gap-2 mb-4">
          <Button variant="ghost" size="sm" className="flex-1 gap-2 text-xs">
            <Heart className="h-4 w-4" />
            {stream.likes_count}
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 gap-2 text-xs">
            <MessageSquare className="h-4 w-4" />
            Chat
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 gap-2 text-xs">
            <Share2 className="h-4 w-4" />
            Partager
          </Button>
        </div>

        <Button className="w-full gradient-primary text-white">
          {stream.status === 'live' ? 'Regarder en direct' : 'Rappel'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default LiveShopping;
