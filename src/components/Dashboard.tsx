import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { MessageSquare, Clock, CheckCircle2, User, CreditCard, LogOut, Settings, Award, ShieldCheck, ChevronLeft, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { UserRole } from '../types';

interface DashboardProps {
  onLogout: () => void;
  userRole: UserRole;
  profile: any;
  onApplyExpert: () => void;
  onGoAdmin: () => void;
  onSubscription: () => void;
  onSettings: () => void;
  onNewQuestion: () => void;
  onBack: () => void;
}

export default function Dashboard({ onLogout, userRole, profile, onApplyExpert, onGoAdmin, onSubscription, onSettings, onNewQuestion, onBack }: DashboardProps) {
  const [filter, setFilter] = useState<'ACTIVE' | 'ARCHIVE'>('ACTIVE');
  const [viewMode, setViewMode] = useState<'USER' | 'EXPERT'>(userRole === 'EXPERT' ? 'EXPERT' : 'USER');
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  
  const [consultations, setConsultations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [answer, setAnswer] = useState('');
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  React.useEffect(() => {
    fetchData();
  }, [viewMode]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Fetch Consultations
      const query = supabase.from('consultations').select('*').order('created_at', { ascending: false });
      
      if (viewMode === 'USER') {
        query.eq('user_id', session.user.id);
      } else {
        const { data: expData } = await supabase.from('experts').select('id').eq('user_id', session.user.id).maybeSingle();
        if (expData) {
          query.eq('expert_id', expData.id);
        } else {
          query.eq('expert_id', session.user.id); // fallback
        }
      }

      const { data } = await query;
      setConsultations(data || []);
    } catch (error: any) {
      console.error('Błąd pobierania danych:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!selectedQuestion || !answer) return;
    setIsSubmittingAnswer(true);
    setErrorMsg('');
    setSuccessMsg('');
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Brak sesji');
      
      const { data: expData } = await supabase.from('experts').select('id').eq('user_id', session.user.id).maybeSingle();
      const currentExpertId = expData ? expData.id : session.user.id;

      const { error } = await supabase
        .from('consultations')
        .update({
          final_answer: answer,
          status: 'ANSWERED'
        })
        .eq('id', selectedQuestion.id)
        .eq('expert_id', currentExpertId);

      if (error) throw error;
      
      setSelectedQuestion(null);
      setAnswer('');
      fetchData();
      setSuccessMsg('Odpowiedź została wysłana!');
    } catch (err: any) {
      console.error('Error submitting answer:', err);
      setErrorMsg('Nie udało się wysłać odpowiedzi. Upewnij się, że masz uprawnienia do edycji w Supabase: ALTER TABLE public.consultations DISABLE ROW LEVEL SECURITY; Błąd: ' + (err?.message || 'Nieznany'));
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const displayedQuestions = consultations.filter(q => 
    filter === 'ACTIVE' ? q.status === 'PENDING' : q.status === 'ANSWERED'
  );

  if (selectedQuestion) {
    return (
      <div className="max-w-4xl mx-auto w-full px-6 py-12">
        <button 
           onClick={() => { setSelectedQuestion(null); setAnswer(''); }}
           className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 font-bold"
        >
          <ChevronLeft className="w-5 h-5" /> Wróć do listy
        </button>
        <div className="bg-white/40 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/60 shadow-2xl">
          <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest bg-blue-100 px-3 py-1 rounded-md">{selectedQuestion.category} {selectedQuestion.subcategory ? `• ${selectedQuestion.subcategory}` : ''}</span>
          <h2 className="text-4xl font-black text-slate-900 mt-4 mb-2">{selectedQuestion.title}</h2>
          <p className="text-slate-500 font-bold mb-8">Konsultacja • {new Date(selectedQuestion.created_at).toLocaleDateString()}</p>
          
          {errorMsg && (
            <div className="mb-8 p-4 bg-rose-100 text-rose-700 rounded-2xl border border-rose-200 flex items-center gap-3">
              <AlertCircle className="w-6 h-6" />
              <p className="font-bold">{errorMsg}</p>
            </div>
          )}
          {successMsg && (
            <div className="mb-8 p-4 bg-green-100 text-green-700 rounded-2xl border border-green-200 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6" />
              <p className="font-bold">{successMsg}</p>
            </div>
          )}

          <div className="space-y-6">
            <div className="p-6 bg-white/60 rounded-3xl border border-white/80">
              <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Treść zapytania</p>
              <p className="font-medium text-slate-700 italic">"{selectedQuestion.draft_content}"</p>
            </div>

            {selectedQuestion.status === 'ANSWERED' ? (
              <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100">
                <p className="text-[10px] font-black uppercase text-blue-600 mb-2">Odpowiedź Eksperta</p>
                <div className="prose prose-slate max-w-none">
                   <p className="font-bold text-slate-800">{selectedQuestion.final_answer}</p>
                </div>
              </div>
            ) : viewMode === 'EXPERT' ? (
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-blue-600 tracking-widest pl-4">Twoja merytoryczna odpowiedź</label>
                <textarea 
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full p-8 bg-white/60 border border-white/80 rounded-3xl focus:border-blue-400 outline-none text-slate-800 font-medium min-h-[200px]"
                  placeholder="Napisz wyczerpującą odpowiedź dla klienta..."
                />
                <button 
                  disabled={!answer || isSubmittingAnswer}
                  onClick={handleAnswerSubmit}
                  className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xl hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isSubmittingAnswer ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle2 className="w-6 h-6" />}
                  Wyślij odpowiedź do klienta
                </button>
              </div>
            ) : (
              <div className="p-8 border-2 border-dashed border-amber-200 rounded-3xl text-amber-600 flex items-center gap-4">
                <Clock className="w-8 h-8 animate-pulse" />
                <span className="font-bold lowercase">Ekspert analizuje Twoje zapytanie. Powiadomimy Cię mailem.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto w-full px-6 py-12">
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Sidebar */}
        {/* ... (existing sidebar code) */}
        <div className="w-full lg:w-80 shrink-0 space-y-6">
          <div className="bg-white/40 backdrop-blur-2xl p-8 rounded-[3rem] border border-white/60 shadow-xl text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-blue-500/20 to-transparent" />
            <div className="w-24 h-24 rounded-[2rem] mx-auto flex items-center justify-center mb-6 border-4 border-white shadow-2xl overflow-hidden bg-slate-100 relative z-10">
                {profile?.avatar_url ? (
                    <img 
                      key={profile.avatar_url}
                      src={`${profile.avatar_url}?t=${Date.now()}`} 
                      alt="Profile" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                ) : (
                    <img src={`https://ui-avatars.com/api/?name=${profile?.full_name || 'U'}&background=random`} alt="Profile" className="w-full h-full object-cover" />
                )}
            </div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">{profile?.full_name || 'Użytkownik'}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 mb-8">
              {userRole === 'ADMIN' ? 'Administrator' : userRole === 'EXPERT' ? 'Ekspert Ease' : 'Pionier Ease'}
            </p>
            
            <span className="px-6 py-2 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">
              {userRole === 'ADMIN' ? 'Full Access' : 'Pakiet Premium'}
            </span>
          </div>

          <nav className="bg-white/30 backdrop-blur-md rounded-[3rem] border border-white/40 shadow-lg p-3 overflow-hidden">
            {userRole === 'EXPERT' && (
              <div className="p-2 mb-2 bg-white/40 rounded-[2.5rem] flex gap-1">
                <button 
                  onClick={() => setViewMode('USER')}
                  className={`flex-1 py-3 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'USER' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Użytkownik
                </button>
                <button 
                  onClick={() => setViewMode('EXPERT')}
                  className={`flex-1 py-3 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'EXPERT' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Ekspert
                </button>
              </div>
            )}

            <button 
              onClick={onBack}
              className="w-full flex items-center gap-4 px-6 py-5 text-blue-600 bg-white/60 rounded-[2.5rem] font-extrabold shadow-sm transition-all text-left"
            >
              <MessageSquare className="w-6 h-6" />
              <span>{viewMode === 'USER' ? 'Moje pytania' : 'Otrzymane zapytania'}</span>
            </button>
            
            {viewMode === 'USER' && (
              <button 
                onClick={onSubscription}
                className="w-full flex items-center gap-4 px-6 py-5 text-slate-500 hover:text-slate-800 hover:bg-white/40 rounded-[2.5rem] transition-all font-bold text-left"
              >
                <CreditCard className="w-6 h-6" />
                <span>Moja subskrypcja</span>
              </button>
            )}
            
            {userRole === 'ADMIN' && (
              <button 
                onClick={onGoAdmin}
                className="w-full flex items-center gap-4 px-6 py-5 text-amber-600 hover:bg-amber-50 rounded-[2.5rem] transition-all font-black text-left"
              >
                <ShieldCheck className="w-6 h-6" />
                <span>Panel Administratora</span>
              </button>
            )}

            <button 
              onClick={onSettings}
              className="w-full flex items-center gap-4 px-6 py-5 text-slate-500 hover:text-slate-800 hover:bg-white/40 rounded-[2.5rem] transition-all font-bold text-left"
            >
              <Settings className="w-6 h-6" />
              <span>Ustawienia konta</span>
            </button>

            <div className="h-px bg-white/40 my-3 mx-8" />
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-4 px-6 py-5 text-rose-500 hover:bg-rose-50/50 rounded-[2.5rem] transition-all font-bold text-left"
            >
              <LogOut className="w-6 h-6" />
              <span>Wyloguj panel</span>
            </button>
          </nav>

          {userRole !== 'ADMIN' && (
            <motion.div 
               whileHover={{ y: -5 }}
               className="bg-gradient-to-br from-blue-600 to-blue-700 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group cursor-pointer"
               onClick={onApplyExpert}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all" />
              <Award className="w-10 h-10 mb-4 text-blue-200" />
              <h4 className="text-xl font-black leading-tight mb-2">Zarabiaj jako Ekspert</h4>
              <p className="text-blue-100 text-xs font-medium leading-relaxed mb-6">Podziel się wiedzą i zarabiaj na każdej odpowiedzi.</p>
              <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white/20 px-4 py-2 rounded-xl">
                Aplikuj teraz <ArrowRight className="w-3 h-3" />
              </span>
            </motion.div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="mb-10 flex flex-col sm:flex-row justify-between items-end gap-4">
            <div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
                {viewMode === 'USER' ? 'Twoje Pytania' : 'Pytania do Ciebie'}
              </h1>
              <p className="text-slate-500 font-medium text-lg mt-1 font-sans">
                {viewMode === 'USER' ? 'Panel kontroli nad Twoimi zapytaniami.' : 'Pomóż użytkownikom i dziel się wiedzą.'}
              </p>
            </div>
            <div className="flex bg-white/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/50 shadow-sm">
                <button 
                  onClick={() => setFilter('ACTIVE')}
                  className={`px-6 py-2.5 rounded-[0.9rem] font-bold transition-all ${filter === 'ACTIVE' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Oczekujące
                </button>
                <button 
                  onClick={() => setFilter('ARCHIVE')}
                  className={`px-6 py-2.5 rounded-[0.9rem] font-bold transition-all ${filter === 'ARCHIVE' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Udzielone
                </button>
            </div>
          </div>

          <div className="space-y-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white/20 backdrop-blur-sm rounded-[3.5rem] border border-white/60 border-dashed">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Pobieranie konsultacji...</p>
              </div>
            ) : displayedQuestions.length > 0 ? (
              displayedQuestions.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.98, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => setSelectedQuestion(item)}
                  className="bg-white/40 backdrop-blur-xl p-8 rounded-[3.5rem] border border-white/60 shadow-xl hover:bg-white/50 transition-all flex flex-col sm:flex-row items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-lg ${item.status === 'ANSWERED' ? 'bg-green-500 text-white' : 'bg-amber-400 text-white'}`}>
                      {item.status === 'ANSWERED' ? <CheckCircle2 className="w-8 h-8" /> : <Clock className="w-8 h-8" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                          <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] bg-blue-100/50 px-2 py-0.5 rounded-md">{item.category} {item.subcategory ? `• ${item.subcategory}` : ''}</span>
                          <span className="text-slate-400 font-bold text-[10px]">{new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                      <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none group-hover:text-blue-600 transition-colors">{item.title}</h3>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 mt-6 sm:mt-0">
                    <div className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-sm ${
                      item.status === 'ANSWERED' 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-amber-100 text-amber-700 border border-amber-200'
                    }`}>
                      {item.status === 'ANSWERED' ? 'ZAKOŃCZONE' : 'W TOKU'}
                    </div>
                    <button className="w-12 h-12 bg-white/60 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-45 transition-all shadow-sm">
                      <ArrowRight className="w-6 h-6" />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-20 bg-white/20 backdrop-blur-sm rounded-[3.5rem] border border-white/60 border-dashed">
                <p className="text-slate-500 font-bold mb-4 uppercase tracking-[0.2em] text-xs">Nie znaleziono konsultacji w tej sekcji</p>
                {filter === 'ACTIVE' && viewMode === 'USER' && (
                  <button onClick={onNewQuestion} className="text-blue-600 font-black hover:underline flex items-center gap-2 mx-auto">
                    Zadaj pierwsze pytanie <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {viewMode === 'USER' && (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={onNewQuestion}
              className="mt-10 w-full py-12 border-2 border-dashed border-white/60 rounded-[3.5rem] text-slate-400 font-black hover:border-blue-400 hover:text-blue-600 hover:bg-white/30 transition-all flex flex-col items-center justify-center gap-4 group bg-white/20 backdrop-blur-sm"
            >
              <div className="w-16 h-16 bg-white/40 rounded-[2rem] flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110 transition-all shadow-lg text-slate-400">
                <MessageSquare className="w-8 h-8" />
              </div>
              <span className="text-xl uppercase tracking-[0.2em]">Zadaj nowe pytanie</span>
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
