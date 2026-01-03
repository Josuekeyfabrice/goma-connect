import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/home/Hero';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { CategoryFilter } from '@/components/products/CategoryFilter';
import { useState } from 'react';

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        
        {/* Categories */}
        <section className="container mx-auto px-4 py-8">
          <h2 className="font-display text-2xl font-bold mb-6">Catégories</h2>
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </section>

        <FeaturedProducts />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
