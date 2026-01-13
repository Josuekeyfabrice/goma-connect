import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MessageSquare, ThumbsUp, Image as ImageIcon, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Review {
  id: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  buyer_name: string;
  buyer_avatar?: string;
  created_at: string;
  helpful_count?: number;
}

interface ReviewsListProps {
  productId?: string;
  sellerId?: string;
  limit?: number;
}

export const ReviewsList = ({ productId, sellerId, limit = 10 }: ReviewsListProps) => {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedImages, setExpandedImages] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        let query = supabase
          .from('reviews')
          .select('*')
          .order('created_at', { ascending: false });

        if (productId) {
          query = query.eq('product_id', productId);
        } else if (sellerId) {
          query = query.eq('seller_id', sellerId);
        }

        const { data, error } = await query.limit(limit);

        if (error) throw error;

        // Fetch buyer information
        if (data && data.length > 0) {
          const buyerIds = [...new Set(data.map(r => r.buyer_id))];
          const { data: buyersData } = await supabase
            .from('profiles')
            .select('user_id, full_name, avatar_url')
            .in('user_id', buyerIds);

          const reviewsWithBuyerInfo = data.map(review => ({
            ...review,
            buyer_name: buyersData?.find(b => b.user_id === review.buyer_id)?.full_name || 'Acheteur anonyme',
            buyer_avatar: buyersData?.find(b => b.user_id === review.buyer_id)?.avatar_url,
          }));

          setReviews(reviewsWithBuyerInfo);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les avis",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId, sellerId, limit, toast]);

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      distribution[r.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
          <p className="text-muted-foreground mb-2">Aucun avis pour le moment</p>
          <p className="text-sm text-muted-foreground">
            Soyez le premier à laisser un avis !
          </p>
        </CardContent>
      </Card>
    );
  }

  const avgRating = getAverageRating();
  const distribution = getRatingDistribution();

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Average Rating */}
            <div className="flex items-center gap-4">
              <div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold">{avgRating}</span>
                  <span className="text-muted-foreground">/5</span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.round(parseFloat(avgRating))
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Basé sur {reviews.length} avis
                </p>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-sm w-8">{rating}★</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400"
                      style={{
                        width: `${(distribution[rating as keyof typeof distribution] / reviews.length) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8">
                    {distribution[rating as keyof typeof distribution]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="pt-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {review.buyer_avatar && (
                    <img
                      src={review.buyer_avatar}
                      alt={review.buyer_name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="font-semibold">{review.buyer_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= review.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Title and Comment */}
              <h4 className="font-semibold mb-2">{review.title}</h4>
              <p className="text-sm text-muted-foreground mb-4">{review.comment}</p>

              {/* Images */}
              {review.images && review.images.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {review.images.map((image, idx) => (
                    <button
                      key={idx}
                      onClick={() =>
                        setExpandedImages(prev => ({
                          ...prev,
                          [`${review.id}-${idx}`]: !prev[`${review.id}-${idx}`],
                        }))
                      }
                      className="relative group"
                    >
                      <img
                        src={image}
                        alt={`Review image ${idx}`}
                        className="w-full h-20 object-cover rounded-lg hover:opacity-80 transition-opacity"
                      />
                      <ImageIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center gap-4 pt-4 border-t">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ThumbsUp className="h-4 w-4" />
                  Utile ({review.helpful_count || 0})
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
