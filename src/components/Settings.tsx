import React, { useState, useEffect, useRef } from 'react';
import { User, Shield, Bell, ChevronLeft, Save, Loader2, Camera } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';

interface SettingsProps {
  onBack: () => void;
  onProfileUpdate?: () => void;
}

export default function Settings({ onBack, onProfileUpdate }: SettingsProps) {
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;
      if (data) {
        let avatar = data.avatar_url || '';
        if (avatar) {
          avatar = `${avatar}${avatar.includes('?') ? '&' : '?'}t=${Date.now()}`;
        }
        setProfile(data);
        setFullName(data.full_name || '');
        setAvatarUrl(avatar);
        setEmail(session.user.email || '');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingAvatar(true);
      const file = e.target.files?.[0];
      if (!file) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const fileExt = file.name.split('.').pop();
      const filePath = `avatars/${session.user.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
    } catch (err: any) {
      console.error('Avatar upload error:', err);
      let msg = err.message;
      if (msg.includes('Bucket not found')) {
        msg = 'Błąd: Bucket "avatars" nie istnieje. Przejdź do zakładki Storage w Supabase, utwórz bucket o nazwie "avatars" i zaznacz opcję "Public bucket".';
      } else if (msg.includes('row-level security')) {
        msg = 'Błąd RLS: Nie można dodać zdjęcia. Uruchom w SQL Editorze:\n\nCREATE POLICY "Public Access" ON storage.objects FOR ALL USING (bucket_id = \'avatars\');';
      }
      alert(msg);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Clean URL (remove query params) before saving to DB
      const cleanAvatarUrl = avatarUrl.split('?')[0];

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          avatar_url: cleanAvatarUrl,
        })
        .eq('id', session.user.id);

      if (error) throw error;

      // Update experts table if they are an expert
      if (profile?.role === 'EXPERT') {
        const { error: expErr } = await supabase
          .from('experts')
          .update({ photo: cleanAvatarUrl })
          .eq('user_id', session.user.id);
        
        if (expErr) console.warn('Sync to experts failed:', expErr);
      }

      alert('Profil został zaktualizowany! Jeśli zdjęcie nadal się nie wyświetla, upewnij się, że bucket "avatars" jest ustawiony jako PUBLIC (Public Bucket) w panelu Supabase Storage.');
      if (onProfileUpdate) onProfileUpdate();
    } catch (err: any) {
      console.error('Save profile error:', err);
      let msg = err.message;
      if (msg.includes('column "avatar_url" of relation "profiles" does not exist')) {
         msg = 'Błąd: Tabela "profiles" nie ma kolumny "avatar_url". Uruchom w SQL Editorze:\n\nALTER TABLE profiles ADD COLUMN avatar_url TEXT;';
      } else if (msg.includes('row-level security')) {
        msg = 'Błąd RLS: Nie można zaktualizować profilu. Wyłącz RLS dla tabeli "profiles" w zakładce Database -> Tables.';
      }
      alert(msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Ładowanie ustawień...</p>
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
        Wróć
      </button>

      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">Ustawienia Konta</h1>
        <p className="text-slate-500 font-medium">Zarządzaj swoją prywatnością i preferencjami.</p>
      </div>

      <div className="space-y-6">
        {/* Personal Info */}
        <section className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-8">
            <User className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest">Profil</h2>
          </div>
          
          <div className="flex flex-col items-center mb-10">
            <div className="relative group">
              <div className="w-32 h-32 rounded-[2.5rem] border-4 border-white shadow-2xl overflow-hidden bg-slate-100 flex items-center justify-center">
                {uploadingAvatar ? (
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                ) : avatarUrl ? (
                    <img 
                      key={avatarUrl}
                      src={`${avatarUrl.split('?')[0]}?t=${Date.now()}`} 
                      alt="Avatar" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                ) : (
                    <img src={`https://ui-avatars.com/api/?name=${fullName || 'U'}&background=random`} alt="Default Avatar" className="w-full h-full object-cover" />
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-3 bg-blue-600 text-white rounded-2xl shadow-xl hover:bg-blue-700 transition-all active:scale-95 group-hover:scale-110"
              >
                <Camera className="w-5 h-5" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/*"
                onChange={handleAvatarUpload}
              />
            </div>
            <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Kliknij w ikonę, by zmienić zdjęcie</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-[0.2em]">Imię i Nazwisko</label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-6 py-4 bg-white/40 border border-white/60 rounded-2xl focus:bg-white/60 outline-none font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-[0.2em]">Email</label>
              <input 
                type="email" 
                value={email}
                disabled
                className="w-full px-6 py-4 bg-white/10 border border-white/40 rounded-2xl outline-none font-bold text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>
        </section>

        {/* Security */}
        <section className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest">Bezpieczeństwo</h2>
          </div>
          
          <button className="w-full flex items-center justify-between p-6 bg-white/20 rounded-2xl border border-white/40 hover:bg-white/40 transition-all font-bold">
            <span>Zmień hasło</span>
            <ChevronLeft className="w-5 h-5 rotate-180" />
          </button>
        </section>

        {/* Notifications */}
        <section className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-8">
            <Bell className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest">Powiadomienia</h2>
          </div>
          
          <div className="space-y-4">
             {['Email o odpowiedzi eksperta', 'Powiadomienia o nowościach', 'Newsletter merytoryczny'].map(item => (
                 <label key={item} className="flex items-center justify-between p-6 bg-white/20 rounded-2xl border border-white/40">
                    <span className="font-bold">{item}</span>
                    <input type="checkbox" defaultChecked className="w-6 h-6 rounded-lg border-white/60 text-blue-600" />
                 </label>
             ))}
          </div>
        </section>

        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black text-2xl hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/20 flex items-center justify-center gap-4 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-7 h-7 animate-spin" /> : <Save className="w-7 h-7" />}
          {isSaving ? 'Zapisywanie...' : 'Zapisz zmiany'}
        </button>
      </div>
    </div>
  );
}
