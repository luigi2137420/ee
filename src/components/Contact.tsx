import React from 'react';
import { Mail, Phone, MapPin, Send, ChevronLeft, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';

interface ContactProps {
  onBack: () => void;
}

export default function Contact({ onBack }: ContactProps) {
  return (
    <div className="max-w-5xl mx-auto w-full px-6 py-20">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-10 transition-all font-bold bg-white/30 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/50 w-fit shadow-sm"
      >
        <ChevronLeft className="w-5 h-5" />
        Wróć
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-12">
          <div>
            <h1 className="text-6xl font-black text-slate-900 tracking-tighter uppercase italic mb-4 leading-none">Skontaktuj się z nami</h1>
            <p className="text-xl text-slate-500 font-medium">Masz pytania dotyczące działania platformy? Jesteśmy tu dla Ciebie.</p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-6 p-8 bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-white/60 shadow-xl group">
               <div className="w-16 h-16 bg-blue-600 text-white rounded-3xl flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform">
                  <Mail className="w-8 h-8" />
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Email</p>
                  <p className="text-2xl font-black text-slate-800">kontakt@expertease.pl</p>
               </div>
            </div>

            <div className="flex items-center gap-6 p-8 bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-white/60 shadow-xl group">
               <div className="w-16 h-16 bg-blue-600 text-white rounded-3xl flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform">
                  <Phone className="w-8 h-8" />
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Telefon</p>
                  <p className="text-2xl font-black text-slate-800">+48 123 456 789</p>
               </div>
            </div>

            <div className="flex items-center gap-6 p-8 bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-white/60 shadow-xl group">
               <div className="w-16 h-16 bg-blue-600 text-white rounded-3xl flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform">
                  <MapPin className="w-8 h-8" />
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Biuro</p>
                  <p className="text-2xl font-black text-slate-800">Warszawa, Polska</p>
               </div>
            </div>
          </div>
        </div>

        <div className="bg-white/40 backdrop-blur-2xl rounded-[3.5rem] p-12 border border-white/60 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20" />
          
          <h2 className="text-3xl font-black text-slate-800 mb-8 tracking-tight flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-blue-600" />
              Napisz wiadomość
          </h2>

          <form className="space-y-6 relative z-10" onSubmit={(e) => e.preventDefault()}>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Twoje Imię</label>
                <input type="text" className="w-full px-8 py-5 bg-white/40 border border-white/60 rounded-3xl focus:bg-white/60 transition-all outline-none" />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Email zwrotny</label>
                <input type="email" className="w-full px-8 py-5 bg-white/40 border border-white/60 rounded-3xl focus:bg-white/60 transition-all outline-none" />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Wiadomość</label>
                <textarea rows={5} className="w-full px-8 py-5 bg-white/40 border border-white/60 rounded-3xl focus:bg-white/60 transition-all outline-none resize-none" />
             </div>

             <button className="w-full py-6 bg-blue-600 text-white rounded-3xl font-black text-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-4 shadow-2xl shadow-blue-500/20 active:scale-[0.98]">
                <Send className="w-7 h-7" />
                Wyślij
             </button>
          </form>
        </div>
      </div>
    </div>
  );
}
