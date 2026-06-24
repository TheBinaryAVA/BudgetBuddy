/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Language } from '../types';
import { translations, getTranslation } from '../lib/i18n';
import { LogOut, Globe, Sparkles, Shield, User, Menu, X } from 'lucide-react';
import React, { useState } from 'react';

interface NavbarProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  activeView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
  userName?: string;
}

export default function Navbar({
  lang,
  onLanguageChange,
  activeView,
  onViewChange,
  onLogout,
  userName = 'Member',
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const t = (key: keyof typeof translations['en']) => getTranslation(lang, key);

  const navItems = [
    { id: 'dashboard', label: t('navDashboard') },
    { id: 'expenses', label: t('navExpenses') },
    { id: 'goals', label: t('navGoals') },
    { id: 'risk', label: t('navRisk') },
    { id: 'ai-coach', label: t('navCoach'), badge: 'AI' },
    { id: 'affordability', label: t('navAffordability'), badge: 'Smart' },
    { id: 'learning', label: t('navLearning') },
  ];

  return (
    <nav className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 px-6 py-4 text-white">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Title */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onViewChange('dashboard')}>
          <div className="w-8 h-8 bg-emerald-500/15 rounded-lg flex items-center justify-center border border-emerald-500/20">
            <Shield className="w-4.5 h-4.5 text-emerald-400" />
          </div>
          <div>
            <span className="font-display font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              {t('brand')}
            </span>
            <span className="text-[10px] text-emerald-400 font-medium tracking-wide block leading-none">
              {t('personalCfo')}
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-1.5 bg-slate-950/40 p-1 rounded-xl border border-slate-800/60">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`relative px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] px-1 rounded font-mono font-bold uppercase tracking-wider">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Desktop Controls */}
        <div className="hidden lg:flex items-center gap-4">
          {/* Quick User Greeting */}
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-slate-300" />
            </div>
            <span className="font-medium text-[11px] max-w-[80px] truncate">{userName}</span>
          </div>

          {/* Language select */}
          <div className="flex items-center gap-1.5 bg-slate-950/60 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider transition-colors cursor-pointer ${
                lang === 'en' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => onLanguageChange('ta')}
              className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider transition-colors cursor-pointer ${
                lang === 'ta' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              தமிழ்
            </button>
          </div>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-slate-400 hover:text-rose-400 text-xs font-semibold cursor-pointer transition-colors"
            title={t('logout')}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Navigation Trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden mt-4 pt-4 border-t border-slate-800 flex flex-col gap-2 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onViewChange(item.id);
                setIsOpen(false);
              }}
              className={`px-4 py-3 rounded-xl text-xs font-semibold text-left flex items-center justify-between cursor-pointer ${
                activeView === item.id
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                  : 'text-slate-400 hover:bg-slate-900/50 hover:text-white'
              }`}
            >
              <span>{item.label}</span>
              {item.badge && (
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold">
                  {item.badge}
                </span>
              )}
            </button>
          ))}

          <div className="h-[1px] bg-slate-800 my-2" />

          {/* Mobile Profile & Lang Switch */}
          <div className="flex items-center justify-between p-2">
            <span className="text-slate-400 text-xs font-medium">{userName}</span>
            <div className="flex gap-2">
              <button
                onClick={() => { onLanguageChange('en'); setIsOpen(false); }}
                className={`px-3 py-1 rounded-md text-xs font-bold ${lang === 'en' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}
              >
                EN
              </button>
              <button
                onClick={() => { onLanguageChange('ta'); setIsOpen(false); }}
                className={`px-3 py-1 rounded-md text-xs font-bold ${lang === 'ta' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}
              >
                தமிழ்
              </button>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full bg-slate-900 hover:bg-rose-950/20 text-slate-400 hover:text-rose-400 font-semibold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-800 hover:border-rose-900/30 transition-all cursor-pointer mt-1"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('logout')}</span>
          </button>
        </div>
      )}
    </nav>
  );
}
