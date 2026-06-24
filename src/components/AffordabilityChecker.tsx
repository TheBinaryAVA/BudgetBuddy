/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { translations, getTranslation } from '../lib/i18n';
import { Language } from '../types';
import { DollarSign, ShieldAlert, Sparkles, Scale, Info, CheckCircle2, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

interface AffordabilityCheckerProps {
  lang: Language;
  token: string;
}

interface DiagnosticResult {
  affordable: boolean;
  scoreImpact: number;
  savingsImpact: string;
  goalsImpact: string;
  recommendation: string;
  alternatives: string[];
}

export default function AffordabilityChecker({ lang, token }: AffordabilityCheckerProps) {
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const t = (key: keyof typeof translations['en']) => getTranslation(lang, key);

  const handleRunAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || price === '') return;

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/affordability-checker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ description, price: Number(price) }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Diagnostic query failed.');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred during diagnostic. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      {/* Input Form */}
      <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-2xl pointer-events-none rounded-full" />
        
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800 mb-6">
          <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
            <Scale className="w-5.5 h-5.5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-base font-display font-bold text-white">
              {t('affordTitle')}
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              {t('affordSub')}
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl p-3 mb-4 text-xs font-semibold flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRunAnalysis} className="space-y-4">
          <div>
            <label className="text-[11px] text-slate-400 font-semibold block mb-1.5 uppercase tracking-wider">
              {t('itemDescription')}
            </label>
            <input
              type="text"
              required
              placeholder="e.g., MacBook Pro 16-inch, Vacation to Bali"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 transition-all font-medium"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 font-semibold block mb-1.5 uppercase tracking-wider">
              {t('purchasePrice')} ($)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <DollarSign className="w-4 h-4 text-blue-500" />
              </span>
              <input
                type="number"
                required
                min={1}
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-600 transition-all font-mono font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !description || price === ''}
            className="w-full bg-blue-500 hover:bg-blue-400 active:bg-blue-600 text-slate-950 font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-[0.99] transition-all duration-150 flex items-center justify-center gap-2 font-display text-xs disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="animate-spin w-4 h-4" />
                <span>{t('runningAnalysis')}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{t('analyzeAffordability')}</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Result Panel */}
      <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden min-h-[360px] flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl pointer-events-none rounded-full" />
        
        {isLoading ? (
          /* Loading skeleton state */
          <div className="flex-1 flex flex-col items-center justify-center py-10 space-y-4">
            <div className="relative flex items-center justify-center">
              <div className="w-14 h-14 rounded-full border-4 border-slate-800 border-t-blue-500 animate-spin" />
              <Sparkles className="absolute w-5 h-5 text-blue-400 animate-pulse-subtle" />
            </div>
            <div className="text-center">
              <p className="text-white text-xs font-semibold">{t('runningAnalysis')}</p>
              <p className="text-slate-500 text-[10px] mt-1 font-medium">Auditing current cashflows, goals, and risk profiles...</p>
            </div>
          </div>
        ) : !result ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center text-center max-w-xs mx-auto py-12 space-y-4">
            <div className="w-12 h-12 bg-slate-850 rounded-2xl flex items-center justify-center border border-slate-850">
              <Info className="w-5.5 h-5.5 text-slate-500" />
            </div>
            <div>
              <p className="text-white font-semibold text-xs mb-1">Awaiting Inputs</p>
              <p className="text-slate-400 text-[10px] leading-relaxed">
                Provide the purchase item name and price, and MoneyMate AI will run a fully calculated diagnostic check for you.
              </p>
            </div>
          </div>
        ) : (
          /* Dynamic Result details */
          <div className="space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  {t('affordResultTitle')}
                </h4>
                <h3 className="text-lg font-display font-bold text-white leading-snug">
                  {description}
                </h3>
              </div>

              {/* Status Pill */}
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${
                  result.affordable
                    ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/25 text-rose-400'
                }`}
              >
                {result.affordable ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>APPROVED</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span>POSTPONE</span>
                  </>
                )}
              </div>
            </div>

            <div className="h-[1px] bg-slate-800" />

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/40">
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider mb-0.5">
                  Savings impact
                </span>
                <span className="text-xs text-slate-200 font-semibold leading-relaxed block">
                  {result.savingsImpact}
                </span>
              </div>

              <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/40">
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider mb-0.5">
                  Goals progress delay
                </span>
                <span className="text-xs text-slate-200 font-semibold leading-relaxed block">
                  {result.goalsImpact}
                </span>
              </div>
            </div>

            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/40">
              <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <span>AI Recommendation</span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed font-medium">
                {result.recommendation}
              </p>
            </div>

            {/* Alternatives */}
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider mb-2">
                Smarter Alternatives suggested:
              </span>
              <ul className="space-y-1.5">
                {result.alternatives.map((alt, index) => (
                  <li key={index} className="flex items-start gap-2 text-xs text-slate-300 leading-normal">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 mt-1.5" />
                    <span className="font-medium">{alt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Footnote */}
        <div className="flex items-center gap-1.5 mt-5 text-[10px] text-slate-500 leading-relaxed font-medium pt-3 border-t border-slate-850">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>{t('disclaimer')}</span>
        </div>
      </div>
    </div>
  );
}
