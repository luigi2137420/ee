import React from 'react';
import { Shield, Check, CreditCard, ChevronLeft, Zap, Star } from 'lucide-react';
import { motion } from 'motion/react';

interface SubscriptionProps {
  onBack: () => void;
}

const tiers = [
  {
    name: 'Basic',
    price: '0 zł',
    features: ['1 darmowa porada miesięcznie', 'Dostęp do bazy wiedzy', 'Standardowy czas odpowiedzi'],
    icon: Shield,
    color: 'bg-slate-100',
    textColor: 'text-slate-600'
  },
  {
    name: 'Premium',
    price: '49 zł',
    features: ['5 porad miesięcznie', 'Priorytetowe odpowiedzi', 'Dostęp do ekspertów Gold', 'Zniżki na dodatkowe pakiety'],
    icon: Zap,
    color: 'bg-blue-600',
    textColor: 'text-white',
    popular: true
  },
  {
    name: 'Founder / Gold',
    price: '129 zł',
    features: ['Nielimitowane porady', 'Bezpośredni kontakt (chat)', 'Dedykowany opiekun', 'Wsparcie 24/7'],
    icon: Star,
    color: 'bg-amber-400',
    textColor: 'text-amber-900'
  }
];

export default function Subscription({ onBack }: SubscriptionProps) {
  return (
    <div className="max-w-5xl mx-auto w-full px-6 py-12">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-10 transition-all font-bold bg-white/30 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/50 w-fit shadow-sm"
      >
        <ChevronLeft className="w-5 h-5" />
        Wróć do Dashboardu
      </button>

      <div className="text-center mb-16">
        <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter uppercase italic">Twoja Subskrypcja</h1>
        <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">Wybierz plan dopasowany do Twoich potrzeb merytorycznych.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {tiers.map((tier, idx) => {
          const Icon = tier.icon;
          return (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`relative rounded-[3rem] p-10 border border-white/60 shadow-2xl flex flex-col ${tier.color} ${tier.textColor} backdrop-blur-2xl`}
            >
              {tier.popular && (
                <div className="absolute top-0 right-10 -translate-y-1/2 bg-white text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full shadow-lg">
                  Najpopularniejszy
                </div>
              )}
              
              <div className="mb-8">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-white/20`}>
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-black mb-2">{tier.name}</h3>
                <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black">{tier.price}</span>
                    <span className="text-sm opacity-60">/ miesięcznie</span>
                </div>
              </div>

              <div className="flex-1 space-y-4 mb-10">
                {tier.features.map(feat => (
                  <div key={feat} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold tracking-tight">{feat}</span>
                  </div>
                ))}
              </div>

              <button className={`w-full py-5 rounded-2xl font-black text-xl transition-all shadow-xl active:scale-[0.98] ${
                  tier.popular ? 'bg-white text-blue-600 hover:bg-slate-50 shadow-white/10' : 'bg-white/20 text-current border border-current/20 hover:bg-white/30'
              }`}>
                Wybierz Plan
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
