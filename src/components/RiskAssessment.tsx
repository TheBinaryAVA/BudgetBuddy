/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { translations, getTranslation } from '../lib/i18n';
import { Language, RiskTolerance } from '../types';
import { Shield, Sparkles, AlertCircle, TrendingUp, CheckCircle, HelpCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RiskAssessmentProps {
  lang: Language;
  token: string;
  onRiskChange?: () => void;
}

interface AssessmentRecord {
  score: number;
  category: RiskTolerance;
  explanation: string;
}

export default function RiskAssessment({ lang, token, onRiskChange }: RiskAssessmentProps) {
  const [assessment, setAssessment] = useState<AssessmentRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeStep, setActiveStep] = useState<number>(0);

  // Quiz States
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [q1, setQ1] = useState<string>('');
  const [q2, setQ2] = useState<string>('');
  const [q3, setQ3] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const t = (key: keyof typeof translations['en']) => getTranslation(lang, key);

  useEffect(() => {
    fetchAssessment();
  }, []);

  const fetchAssessment = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/risk-assessment', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setAssessment(data);
      } else {
        setAssessment(null);
      }
    } catch (err) {
      console.error('Failed to load risk profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartQuiz = () => {
    setQ1('');
    setQ2('');
    setQ3('');
    setActiveStep(1);
    setIsQuizActive(true);
  };

  const handleAnswer = (val: string) => {
    if (activeStep === 1) {
      setQ1(val);
      setActiveStep(2);
    } else if (activeStep === 2) {
      setQ2(val);
      setActiveStep(3);
    } else if (activeStep === 3) {
      setQ3(val);
      submitQuiz(q1, q2, val);
    }
  };

  const submitQuiz = async (ans1: string, ans2: string, ans3: string) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/risk-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          answers: { q1: ans1, q2: ans2, q3: ans3 },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAssessment(data);
        setIsQuizActive(false);
        if (onRiskChange) onRiskChange();
      }
    } catch (err) {
      console.error('Quiz submission failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl pointer-events-none rounded-full" />

      {/* Header Description */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-800 mb-6">
        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
          <Shield className="w-5.5 h-5.5 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-base font-display font-bold text-white">
            {t('riskTitle')}
          </h3>
          <p className="text-[11px] text-slate-400 font-medium">
            {t('riskSub')}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="h-48 flex items-center justify-center">
          <span className="animate-spin rounded-full h-5 w-5 border-2 border-emerald-500 border-t-transparent" />
        </div>
      ) : isQuizActive ? (
        /* Questionnaire active step */
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2 uppercase tracking-wider">
            <span>Risk Quiz</span>
            <span>Step {activeStep} of 3</span>
          </div>

          <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${(activeStep / 3) * 100}%` }}
            />
          </div>

          {activeStep === 1 && (
            <motion.div initial={{ opacity: 0, x: 5 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <h4 className="text-sm font-semibold text-slate-100 mb-3">{t('riskQ1')}</h4>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => handleAnswer('A')}
                  className="w-full text-left p-4 rounded-xl border border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-900/60 text-slate-300 text-xs font-semibold flex justify-between items-center transition-all cursor-pointer"
                >
                  <span>{t('riskQ1_A')}</span>
                  <ArrowRight className="w-4 h-4 text-slate-600" />
                </button>
                <button
                  type="button"
                  onClick={() => handleAnswer('B')}
                  className="w-full text-left p-4 rounded-xl border border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-900/60 text-slate-300 text-xs font-semibold flex justify-between items-center transition-all cursor-pointer"
                >
                  <span>{t('riskQ1_B')}</span>
                  <ArrowRight className="w-4 h-4 text-slate-600" />
                </button>
                <button
                  type="button"
                  onClick={() => handleAnswer('C')}
                  className="w-full text-left p-4 rounded-xl border border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-900/60 text-slate-300 text-xs font-semibold flex justify-between items-center transition-all cursor-pointer"
                >
                  <span>{t('riskQ1_C')}</span>
                  <ArrowRight className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </motion.div>
          )}

          {activeStep === 2 && (
            <motion.div initial={{ opacity: 0, x: 5 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <h4 className="text-sm font-semibold text-slate-100 mb-3">{t('riskQ2')}</h4>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => handleAnswer('A')}
                  className="w-full text-left p-4 rounded-xl border border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-900/60 text-slate-300 text-xs font-semibold flex justify-between items-center transition-all cursor-pointer"
                >
                  <span>{t('riskQ2_A')}</span>
                  <ArrowRight className="w-4 h-4 text-slate-600" />
                </button>
                <button
                  type="button"
                  onClick={() => handleAnswer('B')}
                  className="w-full text-left p-4 rounded-xl border border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-900/60 text-slate-300 text-xs font-semibold flex justify-between items-center transition-all cursor-pointer"
                >
                  <span>{t('riskQ2_B')}</span>
                  <ArrowRight className="w-4 h-4 text-slate-600" />
                </button>
                <button
                  type="button"
                  onClick={() => handleAnswer('C')}
                  className="w-full text-left p-4 rounded-xl border border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-900/60 text-slate-300 text-xs font-semibold flex justify-between items-center transition-all cursor-pointer"
                >
                  <span>{t('riskQ2_C')}</span>
                  <ArrowRight className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </motion.div>
          )}

          {activeStep === 3 && (
            <motion.div initial={{ opacity: 0, x: 5 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <h4 className="text-sm font-semibold text-slate-100 mb-3">{t('riskQ3')}</h4>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleAnswer('A')}
                  className="w-full text-left p-4 rounded-xl border border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-900/60 text-slate-300 text-xs font-semibold flex justify-between items-center transition-all cursor-pointer"
                >
                  <span>{t('riskQ3_A')}</span>
                  <ArrowRight className="w-4 h-4 text-slate-600" />
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleAnswer('B')}
                  className="w-full text-left p-4 rounded-xl border border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-900/60 text-slate-300 text-xs font-semibold flex justify-between items-center transition-all cursor-pointer"
                >
                  <span>{t('riskQ3_B')}</span>
                  <ArrowRight className="w-4 h-4 text-slate-600" />
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleAnswer('C')}
                  className="w-full text-left p-4 rounded-xl border border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-900/60 text-slate-300 text-xs font-semibold flex justify-between items-center transition-all cursor-pointer"
                >
                  <span>{t('riskQ3_C')}</span>
                  <ArrowRight className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </motion.div>
          )}
        </div>
      ) : !assessment ? (
        /* Empty State */
        <div className="text-center py-8 space-y-4">
          <div className="w-12 h-12 bg-slate-850 rounded-2xl flex items-center justify-center border border-slate-800 mx-auto">
            <HelpCircle className="w-6 h-6 text-slate-500" />
          </div>
          <div className="max-w-xs mx-auto">
            <p className="text-white font-semibold text-xs mb-1">Determine Your Strategy</p>
            <p className="text-slate-500 text-[10px] leading-relaxed mb-4">
              Complete our short risk profile diagnostic to calculate investment tolerances and compound structures.
            </p>
            <button
              onClick={handleStartQuiz}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 mx-auto shadow-md shadow-emerald-500/10 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t('startRiskQuiz')}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Diagnostic assessment Results display */
        <div className="space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                {t('riskScore')}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-mono font-bold text-white">{assessment.score}</span>
                <span className="text-xs text-slate-500">/ 90</span>
              </div>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-bold px-3 py-1.5 rounded-full text-xs uppercase tracking-wide flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              <span>{assessment.category}</span>
            </div>
          </div>

          <div className="h-[1px] bg-slate-800" />

          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-emerald-400">
              <TrendingUp className="w-4 h-4" />
              <span>{t('riskExplanation')}</span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed font-medium">
              {assessment.explanation}
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleStartQuiz}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t('retakeQuiz')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
