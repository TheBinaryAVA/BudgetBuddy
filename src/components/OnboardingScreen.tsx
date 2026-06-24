/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { translations, getTranslation } from '../lib/i18n';
import { Language, RiskTolerance } from '../types';
import { Landmark, TrendingUp, DollarSign, Flag, Globe, UserCheck, ShieldAlert, Sparkles, Plus, X } from 'lucide-react';
import { motion } from 'motion/react';

interface OnboardingScreenProps {
  token: string;
  onOnboardingComplete: () => void;
}

const PRESET_GOALS = [
  'Emergency Fund',
  'Laptop',
  'Car',
  'House',
  'Vacation',
  'Education',
  'Retirement',
];

export default function OnboardingScreen({ token, onOnboardingComplete }: OnboardingScreenProps) {
  const [lang, setLang] = useState<Language>('en');
  const [age, setAge] = useState<number>(25);
  const [country, setCountry] = useState('India');
  const [monthlyIncome, setMonthlyIncome] = useState<number>(4000);
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(2200);
  const [riskTolerance, setRiskTolerance] = useState<RiskTolerance>('moderate');
  const [selectedGoals, setSelectedGoals] = useState<string[]>(['Emergency Fund']);
  const [customGoal, setCustomGoal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const t = (key: keyof typeof translations['en']) => getTranslation(lang, key);

  const togglePresetGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter(g => g !== goal));
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const handleAddCustomGoal = () => {
    if (customGoal.trim() && !selectedGoals.includes(customGoal.trim())) {
      setSelectedGoals([...selectedGoals, customGoal.trim()]);
      setCustomGoal('');
    }
  };

  const handleRemoveGoal = (goal: string) => {
    setSelectedGoals(selectedGoals.filter(g => g !== goal));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (monthlyExpenses > monthlyIncome) {
      setError(
        lang === 'en'
          ? 'Notice: Your expenses exceed your income. Our AI will guide you to reduce discretionary spending.'
          : 'கவனிக்கவும்: உங்கள் செலவுகள் வருமானத்தை விட அதிகமாக உள்ளன. செலவுகளைக் குறைக்க எங்கள் AI உங்களுக்கு உதவும்.'
      );
    }

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          age,
          country,
          preferredLanguage: lang,
          monthlyIncome,
          monthlyExpenses,
          financialGoals: selectedGoals,
          riskTolerance,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit profile');
      }

      localStorage.setItem('lang', lang);
      onOnboardingComplete();
    } catch (err: any) {
      setError(err.message || 'Server error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-sans p-6 relative overflow-hidden">
      {/* Background ambient light effects */}
      <div className="absolute top-[-30%] right-[-10%] w-[70%] h-[70%] rounded-full bg-emerald-500/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-30%] left-[-10%] w-[70%] h-[70%] rounded-full bg-blue-500/5 blur-[150px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-2xl bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl relative z-10"
      >
        {/* Title Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 mb-3.5">
            <Landmark className="w-6 h-6 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-white mb-2">
            {t('onboardingTitle')}
          </h1>
          <p className="text-slate-400 text-sm max-w-lg font-medium leading-relaxed">
            {t('onboardingSub')}
          </p>
        </div>

        {error && (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl p-3.5 mb-6 flex items-start gap-3 text-xs leading-relaxed">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="text-[11px] text-slate-400 font-semibold block mb-1.5 uppercase tracking-wider">
                {t('language')}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Globe className="w-4 h-4" />
                </span>
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value as Language)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all font-medium appearance-none"
                >
                  <option value="en">{t('english')}</option>
                  <option value="ta">{t('tamil')}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-semibold block mb-1.5 uppercase tracking-wider">
                {t('age')}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 font-semibold text-xs">
                  A
                </span>
                <input
                  type="number"
                  required
                  min={10}
                  max={120}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-semibold block mb-1.5 uppercase tracking-wider">
                {t('country')}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Flag className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all font-medium"
                />
              </div>
            </div>
          </div>

          {/* STEP 2: Cash Flows */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[11px] text-slate-400 font-semibold block uppercase tracking-wider">
                  {t('monthlyIncome')} ($)
                </label>
                <span className="text-emerald-400 text-xs font-mono font-bold">${monthlyIncome}</span>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                </span>
                <input
                  type="number"
                  required
                  min={0}
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all font-medium font-mono"
                />
              </div>
              <input
                type="range"
                min={500}
                max={25000}
                step={250}
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                className="w-full accent-emerald-500 mt-2 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[11px] text-slate-400 font-semibold block uppercase tracking-wider">
                  {t('monthlyExpenses')} ($)
                </label>
                <span className="text-rose-400 text-xs font-mono font-bold">${monthlyExpenses}</span>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <DollarSign className="w-4 h-4 text-rose-500" />
                </span>
                <input
                  type="number"
                  required
                  min={0}
                  value={monthlyExpenses}
                  onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all font-medium font-mono"
                />
              </div>
              <input
                type="range"
                min={200}
                max={20000}
                step={200}
                value={monthlyExpenses}
                onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                className="w-full accent-rose-500 mt-2 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* STEP 3: Risk Profile */}
          <div>
            <label className="text-[11px] text-slate-400 font-semibold block mb-2 uppercase tracking-wider">
              {t('riskTolerance')}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setRiskTolerance('conservative')}
                className={`border rounded-xl p-4 text-left transition-all ${
                  riskTolerance === 'conservative'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 text-slate-300'
                }`}
              >
                <span className="font-semibold text-xs block mb-1">Conservative</span>
                <span className="text-[10px] leading-relaxed block text-slate-400">Capital safety first. Low risk parameters.</span>
              </button>

              <button
                type="button"
                onClick={() => setRiskTolerance('moderate')}
                className={`border rounded-xl p-4 text-left transition-all ${
                  riskTolerance === 'moderate'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 text-slate-300'
                }`}
              >
                <span className="font-semibold text-xs block mb-1">Moderate</span>
                <span className="text-[10px] leading-relaxed block text-slate-400">Balanced safety with wealth compounding index growth.</span>
              </button>

              <button
                type="button"
                onClick={() => setRiskTolerance('aggressive')}
                className={`border rounded-xl p-4 text-left transition-all ${
                  riskTolerance === 'aggressive'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 text-slate-300'
                }`}
              >
                <span className="font-semibold text-xs block mb-1">Aggressive</span>
                <span className="text-[10px] leading-relaxed block text-slate-400">High growth potential. Accept high volatility.</span>
              </button>
            </div>
          </div>

          {/* STEP 4: Savings Goals Selector */}
          <div>
            <label className="text-[11px] text-slate-400 font-semibold block mb-2 uppercase tracking-wider">
              Select Financial Goals
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {PRESET_GOALS.map((goal) => {
                const selected = selectedGoals.includes(goal);
                return (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => togglePresetGoal(goal)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      selected
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    {goal}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder={t('goalsPlaceholder')}
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-all font-medium"
              />
              <button
                type="button"
                onClick={handleAddCustomGoal}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl px-4 py-2 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {selectedGoals.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/40">
                {selectedGoals.map((g) => (
                  <span
                    key={g}
                    className="inline-flex items-center gap-1.5 bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md text-xs font-medium border border-slate-700"
                  >
                    <span>{g}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveGoal(g)}
                      className="text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || selectedGoals.length === 0}
            className="w-full bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-semibold py-4 px-4 rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-[0.99] transition-all duration-150 flex items-center justify-center gap-2 font-display text-sm disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {isLoading ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-slate-950 border-t-transparent" />
            ) : (
              <>
                <UserCheck className="w-4 h-4" />
                <span>{t('submit')}</span>
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
