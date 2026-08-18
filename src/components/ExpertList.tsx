import React, { useState, useEffect } from 'react';
import { Star, Clock, Zap, ShieldCheck, Loader2, User } from 'lucide-react';
import { Expert } from '../types';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';

interface ExpertListProps {
  onSelect: (expert: Expert) => void;
  selectedCategory?: string;
  selectedSubcategory?: string;
}

export default function ExpertList({ onSelect, selectedCategory, selectedSubcategory }: ExpertListProps) {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExperts = async () => {
      try {
        let query = supabase
          .from('experts')
          .select('*')
          .eq('status', 'ACTIVE');
          
        if (selectedCategory) {
           query = query.contains('categories', [selectedCategory]);
        }
        
        if (selectedSubcategory) {
           query = query.contains('subcategories', [selectedSubcategory]);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;

        const formattedExperts: Expert[] = (data || []).map(e => ({
          id: e.id, 
          user_id: e.user_id,
          name: e.name || 'Ekspert',
          photo: e.photo || null,
          experience: e.experience || 'Brak opisu.',
          price: e.price || 0,
          categories: e.categories || [],
          subscriptionTiers: ['Standard', 'Premium'],
          maxResponseTime: '24h',
          avgResponseTime: '4h',
          rating: e.rating || 5.0
        }));

        setExperts(formattedExperts);
      } catch (err) {
        console.error('Error fetching experts:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExperts();
  }, [selectedCategory]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-bold">Wyszukiwanie najlepszych ekspertów...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto w-full px-4 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Dostępni Specjaliści</h1>
        <p className="text-slate-600 font-medium">Wybierz eksperta, który zajmie się Twoim problemem.</p>
      </div>

      <div className="grid gap-8">
        {experts.length === 0 ? (
          <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-[3rem] p-12 text-center">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Brak dostępnych ekspertów</h3>
            <p className="text-slate-500">Obecnie nie mamy aktywnych ekspertów w tej kategorii. Zapraszamy później!</p>
          </div>
        ) : (
          experts.map((expert, idx) => (
            <motion.div
              key={expert.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-[3rem] p-8 shadow-xl hover:bg-white/50 transition-all relative overflow-hidden group"
            >
              {/* Best Match Badge */}
              {idx === 0 && (
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-[11px] font-black uppercase tracking-[0.2em] py-2 px-6 rounded-bl-3xl shadow-lg">
                  Rekomendowany
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-8">
                <div className="relative shrink-0 self-center sm:self-start">
                  {expert.photo ? (
                      <img 
                        src={expert.photo} 
                        alt={expert.name}
                        className="w-32 h-32 sm:w-40 sm:h-40 rounded-[2.5rem] object-cover shadow-2xl ring-4 ring-white/50"
                      />
                  ) : (
                      <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-[2.5rem] bg-white/50 flex items-center justify-center shadow-2xl ring-4 ring-white/50">
                          <User className="w-16 h-16 text-slate-400" />
                      </div>
                  )}
                  <div className="absolute -bottom-3 -right-3 bg-blue-600 text-white p-3 rounded-2xl shadow-xl border-2 border-white">
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4">
                    <div>
                      <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">{expert.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex text-yellow-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < Math.floor(expert.rating) ? 'fill-current' : 'text-slate-300'}`} 
                            />
                          ))}
                        </div>
                        <span className="text-slate-500 font-bold text-sm">({expert.rating})</span>
                      </div>
                    </div>
                    <div className="bg-white/50 backdrop-blur-md border border-white/60 rounded-2xl px-5 py-2 text-center shadow-inner">
                      <span className="text-3xl font-black text-blue-600">{expert.price} zł</span>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">per porada</p>
                    </div>
                  </div>

                  <p className="text-slate-600 font-medium leading-relaxed mb-6 line-clamp-3">
                    {expert.experience}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-8">
                    {expert.subscriptionTiers.map(tier => (
                      <span key={tier} className="px-4 py-1.5 bg-blue-50/50 backdrop-blur-md text-blue-600 rounded-full text-xs font-bold border border-blue-100 flex items-center gap-1.5 shadow-sm">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        W pakiecie {tier}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-6 pt-6 border-t border-white/40">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/40 flex items-center justify-center text-slate-400">
                        <Clock className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Max oczekiwanie</p>
                        <p className="font-bold text-slate-700">{expert.maxResponseTime}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                        <Zap className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Średni czas</p>
                        <p className="font-bold text-slate-700">{expert.avgResponseTime}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onSelect(expert)}
                      className="sm:ml-auto px-10 py-4 bg-blue-600 text-white rounded-[1.5rem] font-bold text-lg hover:bg-blue-700 transition-all active:scale-[0.97] shadow-xl shadow-blue-500/20"
                      id={`select-expert-${expert.id}`}
                    >
                      Wybierz Profil
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
