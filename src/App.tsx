/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Language, Expense, Goal, FinancialProfile } from './types';
import AuthScreen from './components/AuthScreen';
import OnboardingScreen from './components/OnboardingScreen';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ExpenseTracker from './components/ExpenseTracker';
import GoalPlanner from './components/GoalPlanner';
import RiskAssessment from './components/RiskAssessment';
import AICoach from './components/AICoach';
import AffordabilityChecker from './components/AffordabilityChecker';
import LearningHub from './components/LearningHub';
import { translations, getTranslation } from './lib/i18n';
import { ShieldCheck, HeartPulse, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<any>(null);
  const [lang, setLang] = useState<Language>('en');
  const [profile, setProfile] = useState<FinancialProfile | undefined>(undefined);
  const [hasProfile, setHasProfile] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  // Lists shared with dashboard
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [triggerRefresh, setTriggerRefresh] = useState(0);

  const t = (key: keyof typeof translations['en']) => getTranslation(lang, key);

  useEffect(() => {
    // Read cached language selection
    const cachedLang = localStorage.getItem('lang') as Language;
    if (cachedLang === 'en' || cachedLang === 'ta') {
      setLang(cachedLang);
    }

    // Read cached user session info
    const cachedUser = localStorage.getItem('user');
    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
      } catch (e) {
        console.error(e);
      }
    }

    if (token) {
      validateSession();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  // Load lists when token / trigger refresh changes
  useEffect(() => {
    if (token && hasProfile) {
      fetchAppStats();
    }
  }, [token, hasProfile, triggerRefresh]);

  const validateSession = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/profile', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setHasProfile(true);
        if (data.preferredLanguage === 'ta' || data.preferredLanguage === 'en') {
          setLang(data.preferredLanguage);
        }
      } else if (response.status === 404) {
        // Profile is missing, needs onboarding
        setHasProfile(false);
      } else {
        // session expired
        handleLogout();
      }
    } catch (err) {
      console.error('Session validation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAppStats = async () => {
    try {
      const [expRes, goalsRes] = await Promise.all([
        fetch('/api/expenses', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/goals', { headers: { 'Authorization': `Bearer ${token}` } }),
      ]);

      if (expRes.ok) {
        const expData = await expRes.json();
        setExpenses(expData);
      }
      if (goalsRes.ok) {
        const goalsData = await goalsRes.json();
        setGoals(goalsData);
      }
    } catch (err) {
      console.error('Failed to load application statistics:', err);
    }
  };

  const handleAuthSuccess = (newToken: string, profileExists: boolean) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setHasProfile(profileExists);
    
    // Read updated user info
    const cachedUser = localStorage.getItem('user');
    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
      } catch (e) {
        console.error(e);
      }
    }

    if (profileExists) {
      validateSession();
    }
  };

  const handleOnboardingComplete = () => {
    setHasProfile(true);
    validateSession();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setProfile(undefined);
    setHasProfile(false);
    setActiveView('dashboard');
    setIsLoading(false);
  };

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('lang', newLang);

    // Persist language setting in profile if active
    if (token && hasProfile) {
      fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...profile,
          preferredLanguage: newLang,
        }),
      }).catch((e) => console.error('Failed to sync language preference with backend:', e));
    }
  };

  const refreshDashboard = () => {
    setTriggerRefresh((prev) => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center font-sans space-y-4">
        <div className="relative flex items-center justify-center">
          <div className="w-14 h-14 rounded-full border-4 border-slate-900 border-t-emerald-500 animate-spin" />
          <HeartPulse className="absolute w-5 h-5 text-emerald-400 animate-pulse-subtle" />
        </div>
        <div className="text-center">
          <h2 className="text-sm font-display font-bold text-white tracking-wide">Syncing Security Credentials...</h2>
          <p className="text-[10px] text-slate-500 font-medium mt-1">Establishing tunnel connection with MoneyMate AI</p>
        </div>
      </div>
    );
  }

  // Session Wall
  if (!token) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  // Onboarding Wall
  if (!hasProfile) {
    return <OnboardingScreen token={token} onOnboardingComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col justify-between">
      <div>
        {/* Navigation bar */}
        <Navbar
          lang={lang}
          onLanguageChange={handleLanguageChange}
          activeView={activeView}
          onViewChange={setActiveView}
          onLogout={handleLogout}
          userName={user?.name || profile?.preferredLanguage}
        />

        {/* View Router */}
        <main className="max-w-7xl mx-auto px-6 py-8 relative z-10">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {activeView === 'dashboard' && (
              <Dashboard
                lang={lang}
                token={token}
                profile={profile}
                expenses={expenses}
                goals={goals}
                onViewChange={setActiveView}
                triggerRefresh={triggerRefresh}
              />
            )}

            {activeView === 'expenses' && (
              <ExpenseTracker
                lang={lang}
                token={token}
                onExpenseChange={refreshDashboard}
              />
            )}

            {activeView === 'goals' && (
              <GoalPlanner
                lang={lang}
                token={token}
                onGoalChange={refreshDashboard}
              />
            )}

            {activeView === 'risk' && (
              <RiskAssessment
                lang={lang}
                token={token}
                onRiskChange={refreshDashboard}
              />
            )}

            {activeView === 'ai-coach' && (
              <AICoach
                lang={lang}
                token={token}
              />
            )}

            {activeView === 'affordability' && (
              <AffordabilityChecker
                lang={lang}
                token={token}
              />
            )}

            {activeView === 'learning' && (
              <LearningHub
                lang={lang}
                token={token}
              />
            )}
          </motion.div>
        </main>
      </div>

      {/* Shared Footer block */}
      <footer className="border-t border-slate-900/60 bg-slate-950/40 py-6 px-6 relative z-10 text-slate-600 text-xs text-center font-medium leading-relaxed">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-slate-900 border border-slate-800 rounded flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span>MoneyMate AI © 2026. Venture Backed Personal Finance Engine.</span>
          </div>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Security Protocol</span>
            <span className="hover:text-slate-400 cursor-pointer">API Ledger Documentation</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
