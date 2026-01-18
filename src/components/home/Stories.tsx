import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Zap } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/VerifiedBadge"; // Utilisation de l'avatar existant si possible ou fallback

const mockStories = [
  { id: 1, user: "Boutique Chic", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=200&auto=format&fit=crop", isLive: true },
  { id: 2, user: "Goma Tech", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=200&auto=format&fit=crop", isLive: false },
  { id: 3, user: "Mama Africa", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=200&auto=format&fit=crop", isLive: true },
  { id: 4, user: "Kivu Mode", image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=200&auto=format&fit=crop", isLive: false },
  { id: 5, user: "Espace Digital", image: "https://images.unsplash.com/photo-1585333127302-72921726398a?q=80&w=200&auto=format&fit=crop", isLive: false },
];

export const Stories = () => {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-2">
      {/* Add Story Button */}
      <motion.div 
        whileHover={{ scale: 1.05 }}
        className="flex-none flex flex-col items-center gap-2 cursor-pointer"
      >
        <div className="relative h-20 w-20 rounded-full bg-white/5 border-2 border-dashed border-gray-600 flex items-center justify-center group hover:border-primary transition-colors">
          <Plus className="h-8 w-8 text-gray-400 group-hover:text-primary" />
          <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1 border-2 border-[#0a0a0a]">
            <Zap className="h-3 w-3 text-white fill-current" />
          </div>
        </div>
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Ma Story</span>
      </motion.div>

      {/* Mock Stories */}
      {mockStories.map((story) => (
        <motion.div 
          key={story.id}
          whileHover={{ scale: 1.05 }}
          className="flex-none flex flex-col items-center gap-2 cursor-pointer"
        >
          <div className={`h-20 w-20 rounded-full p-1 border-2 ${story.isLive ? 'border-primary animate-pulse' : 'border-gray-700'}`}>
            <div className="h-full w-full rounded-full overflow-hidden border-2 border-[#0a0a0a]">
              <img 
                src={story.image} 
                alt={story.user} 
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <span className="text-[10px] font-black text-white uppercase tracking-tighter line-clamp-1 w-20 text-center">
            {story.user}
          </span>
        </motion.div>
      ))}
    </div>
  );
};
