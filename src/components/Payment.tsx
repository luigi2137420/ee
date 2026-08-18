import React, { useState } from 'react';
import { CreditCard, ShieldCheck, Lock, ChevronLeft, Loader2, User } from 'lucide-react';
import { Expert } from '../types';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';

interface PaymentProps {
  expert: Expert;
  draft: string;
  category?: string;
  subcategory?: string;
  onComplete: () => void;
  onBack: () => void;
}

export default function Payment({ expert, draft, category, subcategory, onComplete, onBack }: PaymentProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      // Immediate save if logged in
      try {
        const { error } = await supabase
          .from('consultations')
          .insert([{
            user_id: session.user.id,
            expert_id: expert.id,
            category: category || 'Ogólne',
            subcategory: subcategory || 'Ogólne',
            title: `Konsultacja: ${draft.slice(0, 30)}...`,
            draft_content: draft,
            status: 'PENDING'
          }]);
        
        if (error) {
          console.error('Supabase Insert Error:', error);
          alert('Błąd bazy danych: ' + error.message + '. Upewnij się, że tabele zostały utworzone w Supabase.');
          setIsLoading(false);
          return;
        }
        onComplete();
      } catch (err: any) {
        console.error('Unexpected error:', err);
        alert('Wystąpił nieoczekiwany błąd: ' + err.message);
      }
    } else {
      // Go to register first
      onComplete();
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto w-full px-4 py-12">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-10 transition-all group font-bold bg-white/30 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/50 w-fit shadow-sm"
        id="payment-back"
      >
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        Wybierz innego eksperta
      </button>

      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Kasa</h1>
        <p className="text-slate-600 font-medium font-sans">Przejrzyj szczegóły przed wysłaniem zapytania.</p>
      </div>

      <div className="space-y-8">
        {/* Order Summary */}
        <div className="bg-white/40 backdrop-blur-2xl rounded-[3rem] p-10 border border-white/60 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
          
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-white/40 relative z-10">
            {expert.photo ? (
                <img src={expert.photo} className="w-20 h-20 rounded-3xl object-cover shadow-lg border-2 border-white" />
            ) : (
                <div className="w-20 h-20 rounded-3xl bg-white/50 border-2 border-white shadow-lg flex items-center justify-center shrink-0">
                  <User className="w-8 h-8 text-slate-400" />
                </div>
            )}
            <div>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">Wybrany Specjalista {category ? `• ${category}` : ''}</p>
              <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">{expert.name}</h3>
            </div>
            <div className="ml-auto text-right">
              <p className="text-3xl font-black text-blue-600 tabular-nums">{expert.price} zł</p>
            </div>
          </div>

          <div className="bg-white/50 backdrop-blur-md rounded-3xl p-8 mb-10 shadow-inner border border-white/40 relative z-10">
            <p className="text-[10px] uppercase font-black text-slate-400 mb-4 tracking-[0.3em]">Treść konsultacji</p>
            <p className="text-slate-700 italic leading-relaxed text-sm lg:text-base font-medium whitespace-pre-wrap">
              "{draft}"
            </p>
          </div>

          <div className="flex items-center justify-between mb-10 px-4 relative z-10">
            <span className="text-lg font-bold text-slate-500">Podsumowanie koszyka</span>
            <span className="text-4xl font-black text-slate-900 tabular-nums">{expert.price} zł</span>
          </div>

          <div className="space-y-6 relative z-10">
            <button
              onClick={handlePayment}
              disabled={isLoading}
              className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-bold text-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-4 shadow-xl shadow-blue-500/30 active:scale-[0.98] disabled:opacity-70"
              id="pay-now-btn"
            >
              {isLoading ? <Loader2 className="w-7 h-7 animate-spin" /> : <CreditCard className="w-7 h-7" />}
              {isLoading ? 'Przetwarzanie...' : 'Opłać przez Stripe'}
            </button>
            
            <div className="flex items-center justify-center gap-3 text-slate-500 text-xs font-bold uppercase tracking-widest">
              <Lock className="w-4 h-4 text-blue-500" />
              <span>Bezpieczne połączenie szyfrowane</span>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded-3xl border border-neutral-100 flex flex-col gap-2">
            <ShieldCheck className="w-6 h-6 text-green-500" />
            <p className="text-xs font-bold">Gwarancja jakości</p>
            <p className="text-[10px] text-neutral-400">Pełny zwrot jeśli ekspert nie odpowie w terminie.</p>
          </div>
          <div className="p-4 bg-white rounded-3xl border border-neutral-100 flex flex-col gap-2">
            <Lock className="w-6 h-6 text-indigo-500" />
            <p className="text-xs font-bold">Poufność</p>
            <p className="text-[10px] text-neutral-400">Twoje dane są widoczne tylko dla wybranego eksperta.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
