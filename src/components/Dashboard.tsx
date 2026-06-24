/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { translations, getTranslation } from '../lib/i18n';
import { Language, Expense, Goal, FinancialProfile } from '../types';
import { Award, DollarSign, TrendingUp, Sparkles, Shield, AlertCircle, ArrowUpRight, ArrowDownRight, Target, Clock, ShieldCheck, HeartPulse } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  lang: Language;
  token: string;
  profile?: FinancialProfile;
  expenses: Expense[];
  goals: Goal[];
  onViewChange: (view: string) => void;
  triggerRefresh: number;
}

interface HealthResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
  aiRecommendations: string[];
}

export default function Dashboard({
  lang,
  token,
  profile,
  expenses,
  goals,
  onViewChange,
  triggerRefresh,
}: DashboardProps) {
  const [health, setHealth] = useState<HealthResult | null>(null);
  const [isHealthLoading, setIsHealthLoading] = useState(true);

  const t = (key: keyof typeof translations['en']) => getTranslation(lang, key);

  // Load health insights on profile, expenses, or goals change
  useEffect(() => {
    fetchHealthInsights();
  }, [triggerRefresh, profile, expenses.length, goals.length]);

  const fetchHealthInsights = async () => {
    setIsHealthLoading(true);
    try {
      const response = await fetch('/api/financial-health', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setHealth(data);
      }
    } catch (err) {
      console.error('Failed to load health insights:', err);
    } finally {
      setIsHealthLoading(false);
    }
  };

  // Math variables
  const monthlyIncome = profile?.monthlyIncome || 0;
  const monthlyExpenses = profile?.monthlyExpenses || 0;
  const netSavings = Math.max(0, monthlyIncome - monthlyExpenses);
  const savingsRate = monthlyIncome > 0 ? Math.round((netSavings / monthlyIncome) * 100) : 0;
  const activeGoalsCount = goals.length;

  return (
    <div className="space-y-6">
      {/* Executive Quick Cash-flow Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1: Health Score */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[120px]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-2xl pointer-events-none rounded-full" />
          <div className="flex justify-between items-start mb-2.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {t('healthScore')}
            </span>
            <div className="w-7 h-7 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center">
              <HeartPulse className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            {isHealthLoading ? (
              <span className="h-6 w-12 bg-slate-800 animate-pulse rounded" />
            ) : (
              <>
                <span className="text-2xl font-display font-bold text-white">{health?.score || 72}</span>
                <span className="text-xs text-slate-500 font-bold">/ 100</span>
              </>
            )}
          </div>
        </div>

        {/* Card 2: Income */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[120px]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-2xl pointer-events-none rounded-full" />
          <div className="flex justify-between items-start mb-2.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {t('totalIncome')}
            </span>
            <div className="w-7 h-7 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <span className="text-2xl font-mono font-bold text-white">${monthlyIncome}</span>
        </div>

        {/* Card 3: Expenses */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[120px]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 blur-2xl pointer-events-none rounded-full" />
          <div className="flex justify-between items-start mb-2.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {t('totalExpenses')}
            </span>
            <div className="w-7 h-7 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4 text-rose-400" />
            </div>
          </div>
          <span className="text-2xl font-mono font-bold text-white">${monthlyExpenses}</span>
        </div>

        {/* Card 4: Savings Rate */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[120px]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-2xl pointer-events-none rounded-full" />
          <div className="flex justify-between items-start mb-2.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {t('savingsRate')}
            </span>
            <div className="w-7 h-7 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-mono font-bold text-white">{savingsRate}%</span>
            <span className="text-slate-500 text-[10px] font-semibold">(${netSavings}/mo)</span>
          </div>
        </div>
      </div>

      {/* Main Insights Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CFO Insights Block */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl pointer-events-none rounded-full" />
          
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-sm font-display font-bold text-white">{t('aiInsights')}</h3>
            </div>

            {isHealthLoading ? (
              <div className="space-y-3">
                <div className="h-4 bg-slate-850 animate-pulse rounded-lg w-full" />
                <div className="h-4 bg-slate-850 animate-pulse rounded-lg w-[90%]" />
                <div className="h-4 bg-slate-850 animate-pulse rounded-lg w-[85%]" />
              </div>
            ) : (
              <div className="space-y-4 text-xs font-medium text-slate-300">
                <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl leading-relaxed">
                  <span className="font-bold text-emerald-400 block mb-1">CFO Diagnosis:</span>
                  <span>
                    {savingsRate >= 25 
                      ? t('goodStanding') 
                      : t('actionRequired')}
                  </span>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-emerald-500/5 border border-emerald-500/15 p-3.5 rounded-xl space-y-1.5">
                    <span className="text-[10px] text-emerald-400 font-bold block uppercase tracking-wider mb-1">
                      Strengths
                    </span>
                    {health?.strengths.map((str, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-slate-300 text-[11px] leading-relaxed">
                        <span className="text-emerald-400 font-bold shrink-0">✓</span>
                        <span>{str}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-amber-500/5 border border-amber-500/15 p-3.5 rounded-xl space-y-1.5">
                    <span className="text-[10px] text-amber-400 font-bold block uppercase tracking-wider mb-1">
                      Points to Optimize
                    </span>
                    {health?.weaknesses.map((weak, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-slate-300 text-[11px] leading-relaxed">
                        <span className="text-amber-400 font-bold shrink-0">!</span>
                        <span>{weak}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Actionable steps:
                  </span>
                  {health?.aiRecommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-slate-950/30 border border-slate-850/50 p-3 rounded-xl leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => onViewChange('ai-coach')}
            className="mt-6 w-full bg-slate-800 hover:bg-slate-750 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-700/80 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Consult AI Financial Coach</span>
          </button>
        </div>

        {/* Goals & Budget Alerts Sidebar */}
        <div className="space-y-5">
          {/* Active Goals block */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {t('activeGoals')} ({activeGoalsCount})
                </span>
                <button
                  onClick={() => onViewChange('goals')}
                  className="text-emerald-400 hover:text-emerald-300 text-[11px] font-bold tracking-wider uppercase cursor-pointer"
                >
                  View All
                </button>
              </div>

              {goals.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500">
                  <Target className="w-8 h-8 text-slate-600 mx-auto mb-1.5" />
                  <p>No goals set. Define milestones to audit compound velocity.</p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {goals.slice(0, 3).map((g) => {
                    const progress = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
                    return (
                      <div key={g.id} className="space-y-1.5">
                        <div className="flex justify-between items-center text-[11px] font-semibold text-slate-300">
                          <span className="truncate max-w-[120px]">{g.title}</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Recent Transact Block */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {t('recentTransactions')}
                </span>
                <button
                  onClick={() => onViewChange('expenses')}
                  className="text-emerald-400 hover:text-emerald-300 text-[11px] font-bold tracking-wider uppercase cursor-pointer"
                >
                  Ledger
                </button>
              </div>

              {expenses.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500">
                  <Clock className="w-8 h-8 text-slate-600 mx-auto mb-1.5" />
                  <p>{t('noRecentTransactions')}</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-850/60 max-h-[160px] overflow-y-auto pr-1">
                  {expenses.slice(0, 4).map((e) => (
                    <div key={e.id} className="py-2 flex items-center justify-between text-xs font-medium">
                      <div>
                        <span className="text-slate-200 block truncate max-w-[120px]">{e.description || e.category}</span>
                        <span className="text-[10px] text-slate-500 font-semibold uppercase">{e.category}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-100">${e.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
