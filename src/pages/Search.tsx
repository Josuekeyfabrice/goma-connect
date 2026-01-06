import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Product, CATEGORIES, CITIES } from '@/types/database';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/products/ProductCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Search as SearchIcon, Filter, X } from 'lucide-react';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number(searchParams.get('minPrice')) || 0,
    Number(searchParams.get('maxPrice')) || 10000000
  ]);

  const fetchProducts = async () => {
    setLoading(true);
    let queryBuilder = supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .eq('is_approved', true)
      .gte('price', priceRange[0])
      .lte('price', priceRange[1])
      .order('created_at', { ascending: false });

    if (query) {
      queryBuilder = queryBuilder.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
    }
    if (category) {
      queryBuilder = queryBuilder.eq('category', category);
    }
    if (city) {
      queryBuilder = queryBuilder.eq('city', city);
    }

    const { data, error } = await queryBuilder;

    if (error) {
      console.error('Error fetching products:', error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (category) params.set('category', category);
    if (city) params.set('city', city);
    if (priceRange[0] > 0) params.set('minPrice', priceRange[0].toString());
    if (priceRange[1] < 10000000) params.set('maxPrice', priceRange[1].toString());
    setSearchParams(params);
    fetchProducts();
  };

  const clearFilters = () => {
    setQuery('');
    setCategory('');
    setCity('');
    setPriceRange([0, 10000000]);
    setSearchParams({});
    fetchProducts();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-CD', {
      style: 'currency',
      currency: 'CDF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Recherche avancée</h1>
          
          {/* Search bar */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Rechercher un produit..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={() => setShowFilters(!showFilters)} variant="outline">
              <Filter className="w-5 h-5 mr-2" />
              Filtres
            </Button>
            <Button onClick={handleSearch}>
              Rechercher
            </Button>
          </div>

          {/* Filters panel */}
          {showFilters && (
            <div className="bg-card border rounded-lg p-6 mb-6 animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-foreground">Filtres</h3>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-1" />
                  Effacer tout
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Category filter */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Catégorie
                  </label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les catégories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Toutes les catégories</SelectItem>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* City filter */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Ville
                  </label>
                  <Select value={city} onValueChange={setCity}>
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les villes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Toutes les villes</SelectItem>
                      {CITIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price range */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Prix: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                  </label>
                  <Slider
                    value={priceRange}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                    min={0}
                    max={10000000}
                    step={10000}
                    className="mt-4"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-muted animate-pulse rounded-lg h-64" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <SearchIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Aucun résultat</h2>
            <p className="text-muted-foreground">Essayez de modifier vos critères de recherche</p>
          </div>
        ) : (
          <>
            <p className="text-muted-foreground mb-4">{products.length} résultat(s) trouvé(s)</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Search;
