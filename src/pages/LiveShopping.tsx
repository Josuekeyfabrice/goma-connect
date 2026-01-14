import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Video, Play, Users, Heart, MessageSquare, Share2, AlertCircle, Radio } from 'lucide-react';
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

  // Placeholder data - live shopping sessions will be added when the table is created
  const [liveStreams] = useState<LiveSession[]>([]);
  const [scheduledStreams] = useState<LiveSession[]>([]);

  const handleStartLive = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    toast({
      title: "Bientôt disponible",
      description: "La fonctionnalité Live Shopping sera disponible prochainement !",
    });
  };

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
                className="gradient-primary text-white"
              >
                <Radio className="mr-2 h-4 w-4" />
                Démarrer un Live
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
              <Card className="bg-muted/30 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Video className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                  <p className="text-muted-foreground mb-2">Aucun live en ce moment</p>
                  <p className="text-sm text-muted-foreground">
                    Revenez plus tard ou programmez un live !
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="scheduled" className="space-y-6 mt-6">
              <Card className="bg-muted/30 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Play className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                  <p className="text-muted-foreground mb-2">Aucun live programmé</p>
                  <p className="text-sm text-muted-foreground">
                    Soyez le premier à programmer un live !
                  </p>
                </CardContent>
              </Card>
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

export default LiveShopping;
