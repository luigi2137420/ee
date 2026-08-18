/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppStep, Category, Subcategory, Expert, UserRole } from './types';
import Onboarding from './components/Onboarding';
import CategorySelection from './components/CategorySelection';
import SubcategorySelection from './components/SubcategorySelection';
import ChatInterface from './components/ChatInterface';
import DraftReview from './components/DraftReview';
import ExpertList from './components/ExpertList';
import Payment from './components/Payment';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ExpertApplicationForm from './components/ExpertApplicationForm';
import AdminDashboard from './components/AdminDashboard';
import Subscription from './components/Subscription';
import Settings from './components/Settings';
import InfoPage from './components/InfoPage';
import Contact from './components/Contact';
import { motion, AnimatePresence } from 'motion/react';
import { User, LogIn } from 'lucide-react';

export default function App() {
  const [step, setStep] = useState<AppStep>(AppStep.ONBOARDING);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [draft, setDraft] = useState<string>('');
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('USER');
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [profile, setProfile] = useState<any>(null);

  // Supabase Auth Listener
  React.useEffect(() => {
    // Check for admin query param
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      console.log('--- ADMIN MODE ACTIVE via URL param ---');
      setUserRole('ADMIN');
      setStep(AppStep.ADMIN_PANEL);
    }

    import('./lib/supabase').then(({ supabase }) => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setIsLoggedIn(!!session);
        setCurrentUser(session?.user || null);
        if (session?.user) fetchProfile(session.user.id);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsLoggedIn(!!session);
        setCurrentUser(session?.user || null);
        if (session?.user) fetchProfile(session.user.id);
        else {
          setProfile(null);
          const params = new URLSearchParams(window.location.search);
          if (params.get('admin') === 'true') {
            setUserRole('ADMIN');
          } else {
            setUserRole('USER');
          }
        }
      });

      return () => subscription.unsubscribe();
    });
  }, []);

  const fetchProfile = async (userId: string) => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      setUserRole('ADMIN');
      return;
    }
    const { supabase } = await import('./lib/supabase');
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (data) {
      setProfile(data);
      setUserRole(data.role as UserRole);
    }
  };

  const handleLogout = async () => {
    const { supabase } = await import('./lib/supabase');
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUserRole('USER');
    setStep(AppStep.CATEGORY_SELECTION);
  };

  const saveConsultation = async (userId: string) => {
    if (!draft || !selectedExpert) return;
    const { supabase } = await import('./lib/supabase');
    const { error } = await supabase
      .from('consultations')
      .insert([{
        user_id: userId,
        expert_id: selectedExpert.id,
        category: selectedCategory?.name || 'Ogólne',
        subcategory: selectedSubcategory?.name || 'Ogólne',
        title: `Konsultacja: ${draft.slice(0, 30)}...`,
        draft_content: draft,
        status: 'PENDING'
      }]);
    
    if (error) {
      console.error('Błąd zapisu zaległej konsultacji:', error);
    }
  };

  // Layout wrapper for transitions
  const ScreenWrapper = ({ children, identifier }: { children: React.ReactNode, identifier: string }) => (
    <motion.div
      key={identifier}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="flex-1 w-full"
    >
      {children}
    </motion.div>
  );

  const renderStep = () => {
    switch (step) {
      case AppStep.ONBOARDING:
        return <Onboarding onComplete={() => setStep(AppStep.CATEGORY_SELECTION)} />;
      
      case AppStep.CATEGORY_SELECTION:
        return (
          <ScreenWrapper identifier="categories">
            <CategorySelection onSelect={(cat) => {
              setSelectedCategory(cat);
              setStep(AppStep.SUBCATEGORY_SELECTION);
            }} />
          </ScreenWrapper>
        );

      case AppStep.SUBCATEGORY_SELECTION:
        return selectedCategory && (
          <ScreenWrapper identifier="subcategories">
            <SubcategorySelection 
              category={selectedCategory} 
              onSelect={(sub) => {
                setSelectedSubcategory(sub);
                setStep(AppStep.AI_CHAT);
              }}
              onBack={() => setStep(AppStep.CATEGORY_SELECTION)}
            />
          </ScreenWrapper>
        );

      case AppStep.AI_CHAT:
        return selectedCategory && selectedSubcategory && (
          <ScreenWrapper identifier="chat">
            <div className="py-8 px-4 flex-1 flex flex-col justify-center">
              <ChatInterface 
                category={selectedCategory}
                subcategory={selectedSubcategory}
                onFinishChat={(d) => {
                  setDraft(d);
                  setStep(AppStep.DRAFT_REVIEW);
                }}
              />
            </div>
          </ScreenWrapper>
        );

      case AppStep.DRAFT_REVIEW:
        return (
          <ScreenWrapper identifier="draft">
            <DraftReview 
              initialDraft={draft}
              onConfirm={(final) => {
                setDraft(final);
                setStep(AppStep.EXPERT_SELECTION);
              }}
            />
          </ScreenWrapper>
        );

      case AppStep.EXPERT_SELECTION:
        return (
          <ScreenWrapper identifier="experts">
            <ExpertList 
              selectedCategory={selectedCategory?.name}
              selectedSubcategory={selectedSubcategory?.name}
              onSelect={(exp) => {
                setSelectedExpert(exp);
                setStep(AppStep.PAYMENT);
              }}
            />
          </ScreenWrapper>
        );

      case AppStep.PAYMENT:
        return selectedExpert && (
          <ScreenWrapper identifier="payment">
            <Payment 
              expert={selectedExpert}
              draft={draft}
              category={selectedCategory?.name}
              subcategory={selectedSubcategory?.name}
              onComplete={() => isLoggedIn ? setStep(AppStep.DASHBOARD) : setStep(AppStep.REGISTER)}
              onBack={() => setStep(AppStep.EXPERT_SELECTION)}
            />
          </ScreenWrapper>
        );

      case AppStep.REGISTER:
        return (
          <ScreenWrapper identifier="register">
            <Register onSuccess={() => {
              setIsLoggedIn(true);
              if (draft && selectedExpert) {
                // If user registered after payment flow, save the pending consultation
                import('./lib/supabase').then(({ supabase }) => {
                   supabase.auth.getUser().then(({ data: { user } }) => {
                      if (user) saveConsultation(user.id);
                   });
                });
              }
              setStep(AppStep.DASHBOARD);
            }} />
          </ScreenWrapper>
        );

      case AppStep.DASHBOARD:
        return (
          <ScreenWrapper identifier="dashboard">
            <Dashboard 
              userRole={userRole}
              profile={profile}
              onLogout={handleLogout} 
              onApplyExpert={() => setStep(AppStep.EXPERT_APPLICATION)}
              onGoAdmin={() => setStep(AppStep.ADMIN_PANEL)}
              onSubscription={() => setStep(AppStep.SUBSCRIPTION)}
              onSettings={() => setStep(AppStep.SETTINGS)}
              onNewQuestion={() => setStep(AppStep.CATEGORY_SELECTION)}
              onBack={() => setStep(AppStep.CATEGORY_SELECTION)}
            />
          </ScreenWrapper>
        );

      case AppStep.SUBSCRIPTION:
        return (
          <ScreenWrapper identifier="sub">
            <Subscription onBack={() => setStep(AppStep.DASHBOARD)} />
          </ScreenWrapper>
        );

      case AppStep.SETTINGS:
        return (
          <ScreenWrapper identifier="settings">
            <Settings 
              onBack={() => setStep(AppStep.DASHBOARD)} 
              onProfileUpdate={() => currentUser && fetchProfile(currentUser.id)}
            />
          </ScreenWrapper>
        );

      case AppStep.ABOUT:
        return (
          <ScreenWrapper identifier="about">
            <InfoPage title="O ExpertEase" type="ABOUT" onBack={() => setStep(AppStep.CATEGORY_SELECTION)} />
          </ScreenWrapper>
        );

      case AppStep.TERMS:
        return (
          <ScreenWrapper identifier="terms">
            <InfoPage title="Regulamin Serwisu" type="TERMS" onBack={() => setStep(AppStep.CATEGORY_SELECTION)} />
          </ScreenWrapper>
        );

      case AppStep.PRIVACY:
        return (
          <ScreenWrapper identifier="privacy">
            <InfoPage title="Polityka Prywatności" type="PRIVACY" onBack={() => setStep(AppStep.CATEGORY_SELECTION)} />
          </ScreenWrapper>
        );

      case AppStep.CONTACT:
        return (
          <ScreenWrapper identifier="contact">
            <Contact onBack={() => setStep(AppStep.CATEGORY_SELECTION)} />
          </ScreenWrapper>
        );

      case AppStep.EXPERT_APPLICATION:
        return (
          <ScreenWrapper identifier="expert-app">
            <ExpertApplicationForm 
              onBack={() => setStep(AppStep.DASHBOARD)}
              onSubmit={() => setStep(AppStep.DASHBOARD)}
            />
          </ScreenWrapper>
        );

      case AppStep.ADMIN_PANEL:
        return (
          <ScreenWrapper identifier="admin">
            <AdminDashboard 
              onBack={() => setStep(AppStep.DASHBOARD)}
            />
          </ScreenWrapper>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Global Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-white/30 border-b border-white/20 px-6 py-4 flex items-center justify-between shadow-sm">
        <div 
          className="flex items-center gap-3 cursor-pointer" 
          onClick={() => setStep(AppStep.CATEGORY_SELECTION)}
        >
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg ring-1 ring-blue-400">
            E
          </div>
          <span className="text-2xl font-bold text-slate-800 tracking-tight">ExpertEase</span>
        </div>

        <div className="flex items-center gap-4">
          {new URLSearchParams(window.location.search).get('admin') === 'true' && (
            <button 
              onClick={() => setStep(AppStep.ADMIN_PANEL)}
              className="px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-200 hover:bg-amber-200 transition-colors"
            >
              Panel Admina (DEV)
            </button>
          )}
          {isLoggedIn ? (
            <button 
              onClick={() => setStep(AppStep.DASHBOARD)}
              className="w-12 h-12 rounded-full border-2 border-white/50 bg-white/30 backdrop-blur-md flex items-center justify-center overflow-hidden hover:bg-white/50 transition-all group"
            >
              {profile?.avatar_url ? (
                <img 
                  key={profile.avatar_url}
                  src={`${profile.avatar_url}?t=${Date.now()}`} 
                  alt="User" 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-600">
                   <User className="w-6 h-6" />
                </div>
              )}
            </button>
          ) : (
            <button 
              onClick={() => setStep(AppStep.REGISTER)}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600/90 text-white rounded-full text-sm font-bold hover:bg-blue-600 transition-colors backdrop-blur-md shadow-lg shadow-blue-500/20"
            >
              <LogIn className="w-4 h-4" />
              Zaloguj się
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-x-hidden">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </main>

      <footer className="p-8 text-center text-slate-400 text-xs mt-auto">
        <div className="flex justify-center gap-8 mb-4">
          <span 
            onClick={() => setStep(AppStep.ABOUT)}
            className="hover:text-blue-600 cursor-pointer transition-colors font-bold"
          >
            O nas
          </span>
          <span 
            onClick={() => setStep(AppStep.TERMS)}
            className="hover:text-blue-600 cursor-pointer transition-colors font-bold"
          >
            Regulamin
          </span>
          <span 
            onClick={() => setStep(AppStep.PRIVACY)}
            className="hover:text-blue-600 cursor-pointer transition-colors font-bold"
          >
            Prywatność
          </span>
          <span 
            onClick={() => setStep(AppStep.CONTACT)}
            className="hover:text-blue-600 cursor-pointer transition-colors font-bold"
          >
            Kontakt
          </span>
        </div>
        <p>© 2024 ExpertEase - AI-Powered Support Systems. All rights reserved.</p>
      </footer>
    </div>
  );
}
