import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Zap, X, ShoppingCart, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

// Placeholder stories component - stories table not yet implemented
export const Stories = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleAddStory = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    navigate('/sell?type=flash');
  };

  return (
    <div className="relative">
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-2">
        {/* Add Story Button */}
        <div 
          className="flex-none flex flex-col items-center gap-2 cursor-pointer"
          onClick={handleAddStory}
        >
          <div className="relative h-20 w-20 rounded-full bg-white/5 border-2 border-dashed border-gray-600 flex items-center justify-center group hover:border-primary transition-colors">
            <Plus className="h-8 w-8 text-gray-400 group-hover:text-primary" />
            <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1 border-2 border-[#0a0a0a]">
              <Zap className="h-3 w-3 text-white fill-current" />
            </div>
          </div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Ma Story</span>
        </div>

        {/* Placeholder message */}
        <div className="flex items-center justify-center text-muted-foreground text-sm px-4">
          Les stories seront bientôt disponibles
        </div>
      </div>
    </div>
  );
};