import { Link } from 'react-router-dom';
import { Heart, MapPin, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types/database';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onFavorite?: (productId: string) => void;
  isFavorite?: boolean;
}

export const ProductCard = ({ product, onFavorite, isFavorite }: ProductCardProps) => {
  const imageUrl = product.images?.[0] || '/placeholder.svg';

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-card animate-fade-in">
      <Link to={`/product/${product.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {product.category && (
            <Badge className="absolute left-3 top-3 bg-secondary text-secondary-foreground">
              {product.category}
            </Badge>
          )}
          {onFavorite && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
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
        </div>
      </Link>
      <CardContent className="p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-foreground line-clamp-1 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="mt-2 text-xl font-bold text-primary">
          {formatPrice(product.price)}
        </p>
        <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            <span>{product.city}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            <span>{product.views_count || 0}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
