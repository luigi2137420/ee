import { useState } from 'react';
import { Edit3, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface DraftReviewProps {
  initialDraft: string;
  onConfirm: (finalDraft: string) => void;
}

export default function DraftReview({ initialDraft, onConfirm }: DraftReviewProps) {
  const [draft, setDraft] = useState(initialDraft);

  return (
    <div className="max-w-2xl mx-auto w-full px-4 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Zatwierdź swoje zapytanie</h1>
        <p className="text-slate-600 font-medium">To jest tekst, który trafi do eksperta. Możesz go dowolnie edytować.</p>
      </div>

      <div className="relative group">
        <div className="absolute top-6 left-6 text-blue-600 opacity-50 group-focus-within:opacity-100 transition-all scale-125">
          <Edit3 className="w-6 h-6" />
        </div>
        <textarea
          className="w-full h-80 pl-16 pr-8 py-8 bg-white/40 backdrop-blur-xl border-2 border-white/50 rounded-[3rem] shadow-xl focus:bg-white/60 focus:border-blue-400 transition-all outline-none text-xl leading-relaxed resize-none text-slate-800"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          id="draft-textarea"
        />
      </div>

      <div className="mt-10 flex flex-col gap-6">
        <div className="flex items-start gap-4 p-6 bg-blue-50/50 backdrop-blur-md rounded-3xl border border-blue-200/50 text-blue-900 text-sm font-medium">
          <AlertCircle className="w-6 h-6 shrink-0 text-blue-600" />
          <p>Twoje dane są bezpieczne. ExpertEase wykorzystuje szyfrowanie end-to-end dla każdej konsultacji merytorycznej.</p>
        </div>

        <button
          onClick={() => onConfirm(draft)}
          className="w-full py-6 bg-blue-600 text-white rounded-[2.5rem] font-bold text-2xl hover:bg-blue-700 transition-all active:scale-[0.98] flex items-center justify-center gap-4 shadow-2xl shadow-blue-500/30"
          id="confirm-draft-btn"
        >
          <CheckCircle2 className="w-7 h-7" />
          Wybierz Eksperta
        </button>
      </div>
    </div>
  );
}
