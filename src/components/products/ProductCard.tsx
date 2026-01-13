import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MapPin, Eye, GitCompare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types/database';
import { formatPrice } from '@/lib/utils';
import { useCompare } from '@/components/compare/CompareContext';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
  onFavorite?: (productId: string) => void;
  isFavorite?: boolean;
  distance?: string | null;
}

export const ProductCard = ({ product, onFavorite, isFavorite, distance }: ProductCardProps) => {
  const imageUrl = product.images?.[0] || '/placeholder.svg';
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const { toast } = useToast();
  const inCompare = isInCompare(product.id);

  const hasDiscount = product.original_price && product.discount_percentage && product.discount_percentage > 0;

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inCompare) {
      removeFromCompare(product.id);
      toast({ title: 'Retiré de la comparaison' });
    } else {
      addToCompare(product);
      toast({ title: 'Ajouté à la comparaison' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group overflow-hidden transition-all hover:shadow-card h-full">
        <Link to={`/product/${product.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute left-3 top-3 flex flex-col gap-1">
            {product.category && (
              <Badge className="bg-secondary text-secondary-foreground">
                {product.category}
              </Badge>
            )}
            {hasDiscount && (
              <Badge className="bg-destructive text-destructive-foreground">
                -{product.discount_percentage}%
              </Badge>
            )}
          </div>
          <div className="absolute right-2 top-2 flex flex-col gap-1">
            {onFavorite && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                onClick={(e) => {
                  e.preventDefault();
                  onFavorite(product.id);
                }}
              >
                <Heart
                  className={`h-4 w-4 ${isFavorite ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
                />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 rounded-full backdrop-blur-sm ${inCompare ? 'bg-primary text-primary-foreground' : 'bg-background/80 hover:bg-background'}`}
              onClick={handleCompare}
            >
              <GitCompare className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Link>
      <CardContent className="p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-foreground line-clamp-1 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-xl font-bold text-primary">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-sm line-through text-muted-foreground">
              {formatPrice(product.original_price!)}
            </span>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            <span>{distance || product.city}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            <span>{product.views_count || 0}</span>
          </div>
        </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
