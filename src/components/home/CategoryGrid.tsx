import { Link } from 'react-router-dom';
import { CATEGORIES } from '@/types/database';
import {
  Smartphone,
  Car,
  Home,
  Shirt,
  Sofa,
  Dumbbell,
  Wrench,
  Briefcase,
  UtensilsCrossed,
  Package,
  Tv,
  PlayCircle
} from 'lucide-react';

const categoryIcons: Record<string, React.ReactNode> = {
  'Électronique': <Smartphone className="h-8 w-8" />,
  'Véhicules': <Car className="h-8 w-8" />,
  'Immobilier': <Home className="h-8 w-8" />,
  'Mode & Vêtements': <Shirt className="h-8 w-8" />,
  'Maison & Jardin': <Sofa className="h-8 w-8" />,
  'Sports & Loisirs': <Dumbbell className="h-8 w-8" />,
  'Services': <Wrench className="h-8 w-8" />,
  'Emploi': <Briefcase className="h-8 w-8" />,
  'Alimentation': <UtensilsCrossed className="h-8 w-8" />,
  'Netflix': <PlayCircle className="h-8 w-8" />,
  'Live TV': <Tv className="h-8 w-8" />,
  'Autres': <Package className="h-8 w-8" />,
};

const categoryColors: Record<string, string> = {
  'Électronique': 'from-blue-500/20 to-blue-600/10 hover:from-blue-500/30 hover:to-blue-600/20',
  'Véhicules': 'from-red-500/20 to-red-600/10 hover:from-red-500/30 hover:to-red-600/20',
  'Immobilier': 'from-green-500/20 to-green-600/10 hover:from-green-500/30 hover:to-green-600/20',
  'Mode & Vêtements': 'from-pink-500/20 to-pink-600/10 hover:from-pink-500/30 hover:to-pink-600/20',
  'Maison & Jardin': 'from-amber-500/20 to-amber-600/10 hover:from-amber-500/30 hover:to-amber-600/20',
  'Sports & Loisirs': 'from-purple-500/20 to-purple-600/10 hover:from-purple-500/30 hover:to-purple-600/20',
  'Services': 'from-cyan-500/20 to-cyan-600/10 hover:from-cyan-500/30 hover:to-cyan-600/20',
  'Emploi': 'from-indigo-500/20 to-indigo-600/10 hover:from-indigo-500/30 hover:to-indigo-600/20',
  'Alimentation': 'from-orange-500/20 to-orange-600/10 hover:from-orange-500/30 hover:to-orange-600/20',
  'Netflix': 'from-red-600/20 to-red-700/10 hover:from-red-600/30 hover:to-red-700/20',
  'Live TV': 'from-blue-600/20 to-blue-700/10 hover:from-blue-600/30 hover:to-blue-700/20',
  'Autres': 'from-gray-500/20 to-gray-600/10 hover:from-gray-500/30 hover:to-gray-600/20',
};

const iconColors: Record<string, string> = {
  'Électronique': 'text-blue-600 dark:text-blue-400',
  'Véhicules': 'text-red-600 dark:text-red-400',
  'Immobilier': 'text-green-600 dark:text-green-400',
  'Mode & Vêtements': 'text-pink-600 dark:text-pink-400',
  'Maison & Jardin': 'text-amber-600 dark:text-amber-400',
  'Sports & Loisirs': 'text-purple-600 dark:text-purple-400',
  'Services': 'text-cyan-600 dark:text-cyan-400',
  'Emploi': 'text-indigo-600 dark:text-indigo-400',
  'Alimentation': 'text-orange-600 dark:text-orange-400',
  'Netflix': 'text-red-600 dark:text-red-400',
  'Live TV': 'text-blue-600 dark:text-blue-400',
  'Autres': 'text-gray-600 dark:text-gray-400',
};

export const CategoryGrid = () => {
  return (
    <section className="container mx-auto px-4 py-8">
      <h2 className="font-display text-2xl font-bold mb-6">Catégories</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[...CATEGORIES, 'Netflix', 'Live TV'].map((category) => (
          <Link
            key={category}
            to={category === 'Live TV' ? '/live-tv' : `/search?category=${encodeURIComponent(category)}`}
            className={`group relative flex flex-col items-center justify-center p-6 rounded-xl bg-gradient-to-br ${categoryColors[category]} border border-border/50 transition-all duration-300 hover:scale-105 hover:shadow-lg`}
          >
            <div className={`mb-3 transition-transform duration-300 group-hover:scale-110 ${iconColors[category]}`}>
              {categoryIcons[category]}
            </div>
            <span className="text-sm font-medium text-center text-foreground">
              {category}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};
