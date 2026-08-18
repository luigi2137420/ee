import React from 'react';
import { ChevronLeft, Info, FileText, Lock } from 'lucide-react';

interface InfoPageProps {
  title: string;
  type: 'ABOUT' | 'TERMS' | 'PRIVACY';
  onBack: () => void;
}

export default function InfoPage({ title, type, onBack }: InfoPageProps) {
  const Icon = type === 'ABOUT' ? Info : type === 'TERMS' ? FileText : Lock;

  const getContent = () => {
    switch (type) {
      case 'TERMS':
        return (
          <>
            <h2 className="text-2xl font-black uppercase text-slate-900">1. Postanowienia ogólne</h2>
            <p>Korzystając z serwisu ExpertEase, akceptujesz niniejszy regulamin. Portal służy do łączenia użytkowników z ekspertami w celu uzyskania porad merytorycznych.</p>
            <h2 className="text-2xl font-black uppercase text-slate-900">2. Realizacja usług</h2>
            <p>Odpowiedzi są udzielane przez zweryfikowanych ekspertów w czasie określonym przez wybrany pakiet. ExpertEase nie ponosi odpowiedzialności za skutki decyzji podjętych na podstawie porad.</p>
            <h2 className="text-2xl font-black uppercase text-slate-900">3. Płatności</h2>
            <p>Wszelkie płatności są realizowane za pośrednictwem bezpiecznych bramek płatniczych. Użytkownik ma prawo do reklamacji w przypadku braku odpowiedzi w terminie.</p>
          </>
        );
      case 'PRIVACY':
        return (
          <>
            <h2 className="text-2xl font-black uppercase text-slate-900">Gromadzenie danych</h2>
            <p>Przetwarzamy Twoje dane (email, historia zapytań) wyłącznie w celu realizacji usług i poprawy jakości działania AI wspierającej ekspertów.</p>
            <h2 className="text-2xl font-black uppercase text-slate-900">Bezpieczeństwo</h2>
            <p>Twoje dane są szyfrowane i nigdy nie są odsprzedawane podmiotom trzecim. Wykorzystujemy mechanizmy OAuth dla bezpiecznego logowania.</p>
            <h2 className="text-2xl font-black uppercase text-slate-900">Twoje prawa</h2>
            <p>Masz prawo do wglądu w swoje dane, ich poprawienia lub żądania usunięcia konta wraz z całą historią zapytań.</p>
          </>
        );
      default:
        return (
          <>
            <p className="text-xl">
               ExpertEase to miejsce, gdzie technologia służy rzetelnej wiedzy. W świecie zdominowanym przez algorytmy, my stawiamy na ludzkie doświadczenie wspierane przez AI.
            </p>
            <div className="h-px bg-white/40" />
            <h2 className="text-2xl font-black uppercase text-slate-900">Nasza Misja</h2>
            <p>
              Chcemy umożliwić każdemu dostęp do najlepszych specjalistów w sposób szybki, tani i wiarygodny. Nasza platforma automatyzuje proces zbierania wywiadu.
            </p>
          </>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-6 py-20">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-10 transition-all font-bold bg-white/30 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/50 w-fit shadow-sm"
      >
        <ChevronLeft className="w-5 h-5" />
        Wróć
      </button>

      <div className="bg-white/40 backdrop-blur-2xl rounded-[3.5rem] p-12 border border-white/60 shadow-2xl">
        <div className="flex items-center gap-6 mb-12 border-b border-white/40 pb-8">
            <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                <Icon className="w-10 h-10" />
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic">{title}</h1>
        </div>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-700 font-medium leading-relaxed italic">
          {getContent()}
          
          <div className="p-8 bg-blue-600 text-white rounded-[2.5rem] shadow-xl shadow-blue-500/10">
            <h3 className="text-2xl font-black mb-4">Siedziba i kontakt</h3>
            <p className="font-bold opacity-80">ExpertEase Sp. z o.o.</p>
            <p className="opacity-80">ul. Technologiczna 12/4</p>
            <p className="opacity-80">00-001 Warszawa, Polska</p>
          </div>
        </div>
      </div>
    </div>
  );
}
