import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { ArrowRight, Info, Eye, LogIn, ChevronLeft } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const steps = [
  {
    title: "Witaj w ExpertEase!",
    description: "To Twoje centrum merytorycznego wsparcia. Pomożemy Ci skontaktować się z najlepszymi specjalistami.",
    highlight: null
  },
  {
    title: "Wybierz kategorię",
    description: "Na początku wybierz dziedzinę, która Cię interesuje. Od prawa po wędkarstwo.",
    highlight: "categories"
  },
  {
    title: "Sztuczna Inteligencja",
    description: "Nasze AI przeprowadzi z Tobą wywiad, aby ekspert dostał od razu komplet informacji.",
    highlight: "chat"
  },
  {
    title: "Zatwierdź draft",
    description: "Zatwierdzasz lub edytujesz przygotowane zapytanie, zanim trafi do specjalisty.",
    highlight: "draft"
  },
  {
    title: "Wybierz Eksperta",
    description: "Wybierasz osobę, która odpowie na Twoje pytanie. Widzisz cenę i czas oczekiwania.",
    highlight: "experts"
  }
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const next = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          className="bg-white/40 backdrop-blur-2xl rounded-[3rem] shadow-2xl p-10 max-w-md w-full relative overflow-hidden border border-white/60"
        >
          <div className="flex justify-between items-center mb-8">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
              Krok {currentStep + 1} z {steps.length}
            </span>
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-500 ${i === currentStep ? 'w-8 bg-blue-600' : 'w-2 bg-white/50'}`} 
                />
              ))}
            </div>
          </div>

          <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight leading-tight">{steps[currentStep].title}</h2>
          <p className="text-slate-700 font-medium leading-relaxed mb-10">{steps[currentStep].description}</p>

          <div className="flex gap-4">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(s => s - 1)}
                className="flex-1 py-5 px-6 rounded-2xl font-bold text-slate-600 bg-white/40 hover:bg-white/60 border border-white/50 transition-all"
                id="onboarding-prev-btn"
              >
                Cofnij
              </button>
            )}
            <button
              onClick={next}
              className="flex-[2] py-5 px-6 rounded-2xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group shadow-xl shadow-blue-500/20 active:scale-95"
              id="onboarding-next-btn"
            >
              {currentStep === steps.length - 1 ? 'Rozpocznij' : 'Dalej'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
            </button>
          </div>
          
          {/* Decorative element */}
          <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl opacity-50" />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
