import React, { useState } from 'react';
import { Upload, CheckCircle2, ChevronLeft, Briefcase, DollarSign, Tag, MessageSquare, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CATEGORIES } from '../constants';
import { supabase } from '../lib/supabase';

interface ExpertApplicationFormProps {
  onBack: () => void;
  onSubmit: (data: any) => void;
}

export default function ExpertApplicationForm({ onBack, onSubmit }: ExpertApplicationFormProps) {
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [selectedSubcats, setSelectedSubcats] = useState<string[]>([]);
  const [customCat, setCustomCat] = useState('');
  const [bio, setBio] = useState('');
  const [price, setPrice] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const toggleCategory = (id: string) => {
    setSelectedCats(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const toggleSubcategory = (id: string) => {
    setSelectedSubcats(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setCvFile(file);
      setFileName(file.name);
    } else if (file) {
      alert('Tylko pliki PDF są akceptowane.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Musisz być zalogowany');

      let cvUrl = '';
      if (cvFile) {
        const fileExt = cvFile.name.split('.').pop();
        const filePath = `${session.user.id}/${Math.random()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('expert-materials')
          .upload(filePath, cvFile);

        if (uploadError) {
            let msg = uploadError.message;
            if (msg.includes('Bucket not found')) {
                msg = 'Błąd: Bucket "expert-materials" nie istnieje w Supabase Storage. Utwórz go w zakładce Storage.';
            }
            throw new Error(msg);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('expert-materials')
          .getPublicUrl(filePath);
        
        cvUrl = publicUrl;
      }

      const categoryNames = selectedCats.map(id => CATEGORIES.find(c => c.id === id)?.name || id);

      const { error } = await supabase
        .from('expert_applications')
        .insert([{
          user_id: session.user.id,
          bio,
          proposed_price: parseFloat(price),
          categories: categoryNames,
          subcategories: selectedSubcats,
          custom_category: customCat,
          status: 'PENDING',
          cv_url: cvUrl,
          cv_filename: fileName
        }]);

      if (error) throw error;

      setIsSuccess(true);
      setTimeout(() => onSubmit({}), 2000);
    } catch (err: any) {
      console.error('Error submitting application:', err);
      alert('Błąd podczas wysyłania zgłoszenia: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto w-full px-4 py-20 text-center">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/40 backdrop-blur-2xl rounded-[3.5rem] p-12 border border-white/60 shadow-2xl"
        >
          <div className="w-24 h-24 bg-green-500 rounded-full mx-auto flex items-center justify-center mb-6 shadow-xl shadow-green-500/20">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Wysłano zgłoszenie!</h2>
          <p className="text-slate-600 font-medium leading-relaxed">
            Dziękujemy! Twoja aplikacja trafiła do naszego zespołu weryfikacyjnego. Poinformujemy Cię o decyzji drogą mailową.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto w-full px-4 py-12">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-10 transition-all font-bold bg-white/30 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/50 w-fit shadow-sm"
      >
        <ChevronLeft className="w-5 h-5" />
        Wróć do Panelu
      </button>

      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tighter uppercase italic">Zostań Ekspertem</h1>
        <p className="text-slate-600 font-medium">Dołącz do elitarnego grona specjalistów ExpertEase.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white/30 backdrop-blur-xl rounded-[3rem] p-10 border border-white/60 shadow-xl space-y-8">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4">Opisz swoje doświadczenie</label>
              <div className="relative">
                <Briefcase className="absolute left-5 top-5 text-slate-400 w-5 h-5" />
                <textarea 
                  required
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 bg-white/40 border border-white/60 rounded-3xl focus:bg-white/60 focus:border-blue-400 transition-all outline-none text-slate-800 resize-none"
                  placeholder="Opowiedz nam o swojej drodze zawodowej..."
                />
              </div>
            </div>
            
            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4">Proponowana cena (PLN/odp)</label>
                    <div className="relative">
                        <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input 
                            type="number"
                            required
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-full pl-14 pr-6 py-5 bg-white/40 border border-white/60 rounded-2xl focus:bg-white/60 focus:border-blue-400 transition-all outline-none text-slate-800"
                            placeholder="np. 150"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4">Załącz CV / Portfolio</label>
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/60 rounded-3xl cursor-pointer bg-white/20 hover:bg-white/40 transition-all group overflow-hidden">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className={`w-8 h-8 mb-3 ${fileName ? 'text-blue-600' : 'text-slate-400'}`} />
                            <p className="text-sm text-slate-500 font-bold">
                                {fileName ? fileName : 'Kliknij lub przeciągnij plik PDF'}
                            </p>
                        </div>
                        <input type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
                    </label>
                </div>
            </div>
          </div>

          <div className="h-px bg-white/30" />

          {/* Category Selection */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4">Wybierz kategorie (lub zaproponuj własną)</label>
            <div className="flex flex-wrap gap-2 mb-4">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${
                    selectedCats.includes(cat.id) 
                      ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20' 
                      : 'bg-white/30 text-slate-500 border-white/50 hover:bg-white/50'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {selectedCats.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-white/30">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4">Zaznacz specjalizacje (podkategorie)</label>
                {CATEGORIES.filter(cat => selectedCats.includes(cat.id)).map(cat => (
                   <div key={`subcats-${cat.id}`} className="mb-4">
                     <p className="text-xs font-bold text-slate-500 mb-2">{cat.name}:</p>
                     <div className="flex flex-wrap gap-2">
                       {cat.subcategories.map(sub => (
                         <button
                           key={sub.id}
                           type="button"
                           onClick={() => toggleSubcategory(sub.name)}
                           className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                             selectedSubcats.includes(sub.name)
                               ? 'bg-indigo-500 text-white border-indigo-400 shadow-md shadow-indigo-500/20'
                               : 'bg-white/40 text-slate-600 border-white/60 hover:bg-white/60'
                           }`}
                         >
                           {sub.name}
                         </button>
                       ))}
                     </div>
                   </div>
                ))}
              </div>
            )}
            
            <div className="relative mt-4">
              <Tag className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text"
                className="w-full pl-14 pr-6 py-4 bg-white/20 border border-white/40 rounded-2xl focus:bg-white/40 focus:border-blue-400 transition-all outline-none text-slate-800 italic text-sm"
                placeholder="Inna kategoria (np. Kryptowaluty, Filatelistyka...)"
                value={customCat}
                onChange={(e) => setCustomCat(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black text-2xl hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/30 flex items-center justify-center gap-4 active:scale-[0.98] disabled:opacity-70"
          >
            {isSubmitting ? 'Przetwarzanie profilu...' : 'Wyślij aplikację'}
            {!isSubmitting && <CheckCircle2 className="w-8 h-8" />}
          </button>
        </div>
      </form>
    </div>
  );
}
