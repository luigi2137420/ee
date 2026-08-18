import { useState } from 'react';
import { Search, ChevronRight, Stethoscope, Scale, Book, Beef, Dumbbell, Trophy, Fish } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { Category } from '../types';
import { motion } from 'motion/react';

const iconMap: Record<string, any> = {
  Stethoscope, Scale, Book, Beef, Dumbbell, Trophy, Fish
};

interface CategorySelectionProps {
  onSelect: (category: Category) => void;
}

export default function CategorySelection({ onSelect }: CategorySelectionProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = CATEGORIES.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.subcategories.some(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-2xl mx-auto w-full px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Jakiej porady potrzebujesz?</h1>
        <p className="text-slate-600 font-medium">Wybierz dziedzinę, aby połączyć się z ekspertem.</p>
      </div>

      <div className="relative mb-10 group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6 group-focus-within:text-blue-500 transition-colors" />
        <input
          type="text"
          placeholder="Wpisz czego potrzebujesz (np. kardiolog, prawo...)"
          className="w-full pl-14 pr-6 py-5 bg-white/40 border border-white/60 backdrop-blur-xl rounded-3xl shadow-lg shadow-black/5 placeholder-slate-400 focus:bg-white/60 focus:border-blue-400/50 transition-all outline-none text-xl"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          id="category-search"
        />
      </div>

      <div className="space-y-4">
        {filteredCategories.map((category, idx) => {
          const Icon = iconMap[category.icon] || Info;
          return (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => onSelect(category)}
              className="w-full flex items-center justify-between p-6 bg-white/30 backdrop-blur-md border border-white/50 rounded-3xl shadow-sm hover:shadow-xl hover:bg-white/50 hover:border-blue-300 transition-all group"
              id={`category-${category.id}`}
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-600 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                  <Icon className="w-8 h-8" />
                </div>
                <div className="text-left font-sans">
                  <h3 className="font-bold text-slate-800 text-2xl mb-0.5 tracking-tight">{category.name}</h3>
                  <p className="text-slate-500 text-sm font-medium">
                    {category.subcategories.length} podkategorii
                  </p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                <ChevronRight className="w-6 h-6" />
              </div>
            </motion.button>
          );
        })}
        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-neutral-400">Nie znaleziono kategorii pasującej do "{searchTerm}"</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Info(props: any) {
    return <Search {...props} />
}
