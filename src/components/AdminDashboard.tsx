import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, FileText, Clock, ExternalLink, ShieldCheck, ChevronLeft, AlertCircle, Loader2, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ExpertApplication } from '../types';
import { supabase } from '../lib/supabase';

interface AdminDashboardProps {
  onBack: () => void;
}

export default function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [apps, setApps] = useState<ExpertApplication[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('expert_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Extract unique user ids
      const userIds = [...new Set((data || []).map(app => app.user_id).filter(Boolean))];

      // Fetch profiles
      let profilesData: any[] = [];
      if (userIds.length > 0) {
        const { data: pData } = await supabase
          .from('profiles')
          .select('id, full_name, username, avatar_url')
          .in('id', userIds);
        profilesData = pData || [];
      }

      const formattedApps: ExpertApplication[] = (data || []).map((app: any) => {
        const profile = profilesData?.find(p => p.id === app.user_id);
        return {
          id: app.id,
          name: profile?.full_name || 'Użytkownik',
          email: profile?.username ? profile.username + '@user.app' : 'brak maila',
          photo_url: profile?.avatar_url || null,
          bio: app.bio || 'Brak opisu',
          categories: app.categories || [],
          subcategories: app.subcategories || [],
          customCategory: app.custom_category,
          proposedPrice: app.proposed_price || 0,
          cvFileName: app.cv_filename || 'dokument.pdf', 
          cvUrl: app.cv_url,
          status: app.status || 'PENDING',
          rejectionReason: app.rejection_reason,
          appliedAt: new Date(app.created_at).toLocaleDateString(),
          user_id: app.user_id
        };
      });

      setApps(formattedApps);
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedApp = apps.find(a => a.id === selectedAppId);

  const handleApprove = async (app: ExpertApplication) => {
    setIsProcessing(true);
    try {
      // 1. Check if expert is already in experts table to prevent duplicates since user_id isn't UNIQUE
      const { data: existingExpert } = await supabase
        .from('experts')
        .select('id')
        .eq('user_id', app.user_id)
        .maybeSingle();

      // 1.5 Fetch user's current profile for photo
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', app.user_id)
        .single();

      if (existingExpert) {
        // 2a. Update existing expert record
        const { error: expertUpdateError } = await supabase
          .from('experts')
          .update({
            name: app.name,
            experience: app.bio,
            categories: app.categories,
            subcategories: app.subcategories,
            price: app.proposedPrice,
            status: 'ACTIVE',
            photo: userProfile?.avatar_url || null
          })
          .eq('id', existingExpert.id);

        if (expertUpdateError) {
           throw new Error('Błąd przy aktualizacji tabeli experts: ' + expertUpdateError.message);
        }
      } else {
        // 2b. Add to experts table
        const { error: expertInsertError } = await supabase
          .from('experts')
          .insert([{
            user_id: app.user_id,
            name: app.name,
            experience: app.bio,
            categories: app.categories,
            subcategories: app.subcategories,
            price: app.proposedPrice,
            status: 'ACTIVE',
            rating: 5.0,
            photo: userProfile?.avatar_url || null
          }]);
  
        if (expertInsertError) {
           throw new Error('Błąd przy dodawaniu do tabeli experts: ' + expertInsertError.message);
        }
      }

      // 3. Update profile role (UPSERT is safer in case the profile wasn't created initially)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .upsert([{
          id: app.user_id,
          role: 'EXPERT',
          full_name: app.name,
          username: app.email.split('@')[0] || 'ekspert'
        }], { onConflict: 'id' })
        .select();

      if (profileError) throw profileError;

      // 4. Update application status
      const { data: appData, error: updateError } = await supabase
        .from('expert_applications')
        .update({ status: 'APPROVED' })
        .eq('id', app.id)
        .select();
      
      if (updateError) throw updateError;
      if (!appData || appData.length === 0) {
         throw new Error(`Aplikacja ${app.id} nie istnieje lub RLS ją blokuje. Zrzut: ${JSON.stringify(app)}`);
      }

      setApps(prev => prev.map(a => a.id === app.id ? { ...a, status: 'APPROVED' } : a));
      setSelectedAppId(null);
      setSuccessMsg('Ekspert został w pełni zatwierdzony!');
      setErrorMsg('');
    } catch (err: any) {
      console.error('Error approving expert:', err);
      setErrorMsg('Błąd podczas zatwierdzania: ' + (err?.message || 'Nieznany błąd'));
      setSuccessMsg('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedAppId || !rejectionReason) return;
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('expert_applications')
        .update({ status: 'REJECTED', rejection_reason: rejectionReason })
        .eq('id', selectedAppId);

      if (error) throw error;

      setApps(prev => prev.map(a => a.id === selectedAppId ? { ...a, status: 'REJECTED', rejectionReason } : a));
      setIsRejecting(false);
      setSelectedAppId(null);
      setRejectionReason('');
      setSuccessMsg('Pomyślnie odrzucono zgłoszenie');
      setErrorMsg('');
    } catch (err: any) {
      console.error('Error rejecting:', err);
      setErrorMsg('Błąd podczas odrzucania: ' + (err?.message || 'Nieznany błąd'));
      setSuccessMsg('');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-4 py-12">
      <div className="flex items-center justify-between mb-12">
        <div>
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-4 transition-all font-bold"
          >
            <ChevronLeft className="w-5 h-5" />
            Wróć
          </button>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
            <ShieldCheck className="w-12 h-12 text-blue-600" />
            Panel Admina
          </h1>
          <p className="text-slate-500 font-medium">Weryfikacja zgłoszeń do programu ExpertEase.</p>
        </div>
        
        <div className="bg-blue-600 text-white px-8 py-4 rounded-3xl shadow-xl shadow-blue-500/20 font-black text-xl italic">
          {apps.filter(a => a.status === 'PENDING').length} NOWE ZGŁOSZENIA
        </div>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* List of Applications */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4 mb-2">Kolejka oczekujących</h2>
          {isLoading ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : apps.length === 0 ? (
            <div className="p-8 text-center bg-white/40 rounded-3xl border border-white/60">
              <p className="text-slate-500 font-bold">Brak zgłoszeń w bazie.</p>
            </div>
          ) : (
            apps.map(app => (
              <motion.div
                key={app.id}
                layoutId={app.id}
                onClick={() => {
                  setSelectedAppId(app.id);
                  setIsRejecting(false);
                }}
                className={`p-6 rounded-[2.5rem] border cursor-pointer transition-all ${
                  selectedAppId === app.id
                    ? 'bg-blue-600 border-blue-500 text-white shadow-2xl shadow-blue-500/20'
                    : app.status === 'PENDING'
                      ? 'bg-white/40 border-white/60 hover:bg-white/60'
                      : 'bg-white/10 border-transparent opacity-50'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-black text-lg">{app.name}</h3>
                  {app.status !== 'PENDING' && (
                      <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-md ${
                          app.status === 'APPROVED' ? 'bg-green-500 text-white' : 'bg-rose-500 text-white'
                      }`}>
                          {app.status}
                      </span>
                  )}
                </div>
                <p className={`text-xs font-bold ${selectedAppId === app.id ? 'text-blue-100' : 'text-slate-500'}`}>
                  {app.email}
                </p>
                <p className={`text-[10px] mt-4 font-bold uppercase tracking-widest ${selectedAppId === app.id ? 'text-blue-200' : 'text-slate-400'}`}>
                  {app.appliedAt}
                </p>
              </motion.div>
            ))
          )}
        </div>

        {/* Details View */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedApp ? (
              <motion.div
                key={selectedApp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white/40 backdrop-blur-2xl rounded-[3.5rem] p-10 border border-white/60 shadow-2xl h-full"
              >
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10">
                  <div className="flex items-center gap-6">
                    {selectedApp.photo_url ? (
                        <img 
                          src={selectedApp.photo_url} 
                          alt={selectedApp.name} 
                          className="w-20 h-20 rounded-2xl object-cover ring-2 ring-white/60 shadow-lg shrink-0" 
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-2xl bg-white/50 border border-white/60 shadow-inner flex items-center justify-center shrink-0">
                          <User className="w-10 h-10 text-slate-400" />
                        </div>
                    )}
                    <div>
                      <h3 className="text-4xl font-black text-slate-800 tracking-tight">{selectedApp.name}</h3>
                      <div className="flex items-center gap-4 mt-2">
                          <span className="text-blue-600 font-black text-xl">{selectedApp.proposedPrice} PLN</span>
                          <span className="text-slate-400 font-bold">/ odpowiedź</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {selectedApp.categories.map(c => (
                        <span key={c} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest border border-slate-200">
                            {c}
                        </span>
                    ))}
                    {selectedApp.subcategories && selectedApp.subcategories.map(c => (
                        <span key={c} className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-xs font-bold uppercase tracking-widest border border-slate-200 opacity-80">
                            {c}
                        </span>
                    ))}
                    {selectedApp.customCategory && (
                        <span className="px-4 py-2 bg-blue-100 text-blue-600 rounded-xl text-xs font-black uppercase tracking-widest border border-blue-200 italic">
                            + {selectedApp.customCategory}
                        </span>
                    )}
                  </div>
                </div>

                <div className="space-y-8">
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4 mb-2 block">O sobie</label>
                        <div className="p-6 bg-white/40 rounded-3xl border border-white/60 text-slate-700 leading-relaxed font-bold">
                            {selectedApp.bio}
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-6 bg-blue-50/50 rounded-3xl border border-blue-100 italic">
                        <div className="flex items-center gap-3 text-blue-600 font-bold max-w-[250px] truncate">
                            <FileText className="w-6 h-6 shrink-0" />
                            {selectedApp.cvFileName}
                        </div>
                        <button 
                            disabled={!selectedApp.cvUrl}
                            onClick={() => selectedApp.cvUrl && window.open(selectedApp.cvUrl, '_blank')}
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-700 disabled:opacity-30"
                        >
                            Pobierz CV <ExternalLink className="w-3 h-3" />
                        </button>
                    </div>
                </div>

                <div className="mt-12">
                   {selectedApp.status === 'PENDING' ? (
                       !isRejecting ? (
                        <div className="flex gap-4">
                            <button 
                                disabled={isProcessing}
                                onClick={() => setIsRejecting(true)}
                                className="flex-1 py-5 bg-rose-500 text-white rounded-[1.5rem] font-black text-xl hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/10 flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                <XCircle className="w-6 h-6" />
                                Odrzuć
                            </button>
                            <button 
                                disabled={isProcessing}
                                onClick={() => handleApprove(selectedApp)}
                                className="flex-[2] py-5 bg-green-500 text-white rounded-[1.5rem] font-black text-xl hover:bg-green-600 transition-all shadow-xl shadow-green-500/10 flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle2 className="w-6 h-6" />}
                                Zatwierdź Eksperta
                            </button>
                        </div>
                       ) : (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-4"
                        >
                            <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest pl-4 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                Podaj powód odrzucenia
                            </label>
                            <textarea 
                                autoFocus
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="w-full p-6 bg-rose-50 border border-rose-200 rounded-3xl focus:border-rose-400 outline-none text-rose-800 font-bold"
                                placeholder="np. Zbyt wysoka cena jak na to doświadczenie..."
                            />
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setIsRejecting(false)}
                                    className="px-8 py-4 bg-white/60 text-slate-500 rounded-2xl font-bold hover:bg-white"
                                >
                                    Anuluj
                                </button>
                                <button 
                                    onClick={handleReject}
                                    disabled={!rejectionReason || isProcessing}
                                    className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black disabled:opacity-50"
                                >
                                    {isProcessing ? 'Przetwarzanie...' : 'Potwierdź odrzucenie'}
                                </button>
                            </div>
                        </motion.div>
                       )
                   ) : (
                       <div className={`p-6 rounded-3xl border text-center font-bold text-lg flex flex-col items-center justify-center gap-3 ${selectedApp.status === 'APPROVED' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
                           {selectedApp.status === 'APPROVED' ? (
                               <><CheckCircle2 className="w-6 h-6" /> Zgłoszenie Zatwierdzone</>
                           ) : (
                               <div className="flex flex-col items-center gap-2">
                                   <div className="flex items-center gap-2"><XCircle className="w-6 h-6" /> Zgłoszenie Odrzucone</div>
                                   {selectedApp.rejectionReason && (
                                       <span className="text-sm font-medium mt-2">Powód: {selectedApp.rejectionReason}</span>
                                   )}
                               </div>
                           )}
                       </div>
                   )}
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                <Clock className="w-32 h-32 mb-6" />
                <h3 className="text-2xl font-black uppercase tracking-widest">Wybierz zgłoszenie</h3>
                <p className="font-bold">Aby zobaczyć szczegóły i podjąć decyzję.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
