import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, UserPlus, CheckCircle2, AlertCircle, LogIn } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';

interface RegisterProps {
  onSuccess: () => void;
}

export default function Register({ onSuccess }: RegisterProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'REGISTER') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          }
        });

        if (signUpError) throw signUpError;
        if (!data.user) throw new Error('Błąd podczas tworzenia użytkownika');

        // Używamy upsert, żeby nie było błędu przy ponownej próbie
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert([
            { 
              id: data.user.id, 
              full_name: fullName, 
              role: 'USER',
              username: email.split('@')[0]
            }
          ]);

        if (profileError) console.error('Błąd tworzenia profilu:', profileError);
      } else {
        // LOGIN
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      }

      setIsSuccess(true);
      setTimeout(() => onSuccess(), 1500);
    } catch (err: any) {
      setError(
        err.message === 'Invalid login credentials' ? 'Błędny email lub hasło' : 
        err.message || 'Wystąpił nieoczekiwany błąd'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto w-full px-4 py-20 text-center">
        <div className="bg-white/40 backdrop-blur-2xl rounded-[3.5rem] p-12 border border-white/60 shadow-2xl">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-black text-slate-900 mb-2">Sukces!</h2>
          <p className="text-slate-600">Twoje konto zostało utworzone. Zaraz zostaniesz przekierowany...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto w-full px-4 py-20">
      <div className="bg-white/40 backdrop-blur-2xl rounded-[3.5rem] p-12 shadow-2xl border border-white/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16" />

        <div className="text-center mb-12 relative z-10">
          <div className="w-24 h-24 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/30 transform rotate-3">
            {mode === 'REGISTER' ? <UserPlus className="w-12 h-12 text-white -rotate-3" /> : <LogIn className="w-12 h-12 text-white -rotate-3" />}
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">
            {mode === 'REGISTER' ? 'Cześć!' : 'Witaj z powrotem'}
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">
            {mode === 'REGISTER' ? 'Dołącz do ExpertEase' : 'Zaloguj się do swojego konta'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-600 text-xs font-bold flex items-center gap-3">
             <AlertCircle className="w-5 h-5 shrink-0" />
             {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {mode === 'REGISTER' && (
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-5">Imię i Nazwisko</label>
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 bg-white/40 border border-white/60 rounded-2xl focus:bg-white/60 focus:border-blue-400 transition-all outline-none text-slate-800 shadow-inner"
                  placeholder="Jan Kowalski"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-5">Twój Email</label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-white/40 border border-white/60 rounded-2xl focus:bg-white/60 focus:border-blue-400 transition-all outline-none text-slate-800 shadow-inner"
                placeholder="jan@ekspert.pl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-5">Bezpieczne Hasło</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-white/40 border border-white/60 rounded-2xl focus:bg-white/60 focus:border-blue-400 transition-all outline-none text-slate-800 shadow-inner"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-6 bg-blue-600 text-white rounded-3xl font-extrabold text-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-blue-500/20 disabled:opacity-70 active:scale-[0.98] mt-4"
          >
            {isLoading ? 'Łączenie...' : mode === 'REGISTER' ? 'Załóż konto' : 'Zaloguj się'}
            {!isLoading && <ArrowRight className="w-6 h-6" />}
          </button>
        </form>

        <p className="mt-10 text-center text-slate-500 text-sm font-medium relative z-10">
          {mode === 'REGISTER' ? 'Już tu byłeś?' : 'Nie masz konta?'} 
          <button 
            onClick={() => setMode(mode === 'REGISTER' ? 'LOGIN' : 'REGISTER')}
            className="text-blue-600 font-bold hover:underline ml-1"
          >
            {mode === 'REGISTER' ? 'Zaloguj się' : 'Zarejestruj się'}
          </button>
        </p>
      </div>
    </div>
  );
}
