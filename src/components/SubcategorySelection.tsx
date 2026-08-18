import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Category, Subcategory } from '../types';
import { motion } from 'motion/react';

interface SubcategorySelectionProps {
  category: Category;
  onSelect: (subcategory: Subcategory) => void;
  onBack: () => void;
}

export default function SubcategorySelection({ category, onSelect, onBack }: SubcategorySelectionProps) {
  return (
    <div className="max-w-2xl mx-auto w-full px-4 py-12">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-10 transition-all group font-bold bg-white/30 backdrop-blur-md px-4 py-2 rounded-xl border border-white/50 w-fit"
        id="subcategory-back"
      >
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        Wróć do kategorii
      </button>

      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">{category.name}</h1>
        <p className="text-slate-600 font-medium font-sans">Wybierz specjalizację, której potrzebujesz.</p>
      </div>

      <div className="grid gap-4">
        {category.subcategories.map((sub, idx) => (
          <motion.button
            key={sub.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => onSelect(sub)}
            className="w-full text-left p-6 bg-white/30 backdrop-blur-md border border-white/50 rounded-3xl shadow-sm hover:shadow-xl hover:bg-white/50 hover:border-blue-300 transition-all group"
            id={`subcategory-${sub.id}`}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-800 text-2xl mb-1 tracking-tight group-hover:text-blue-700 transition-colors">{sub.name}</h3>
                <p className="text-slate-500 text-sm font-medium">{sub.description}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/40 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                <ChevronRight className="w-6 h-6 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
