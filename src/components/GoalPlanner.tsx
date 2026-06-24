/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { translations, getTranslation } from '../lib/i18n';
import { Language, Goal } from '../types';
import { Target, Plus, Pencil, Trash2, Calendar, DollarSign, Percent, ShieldCheck, Clock, X, Save } from 'lucide-react';
import { motion } from 'motion/react';

interface GoalPlannerProps {
  lang: Language;
  token: string;
  onGoalChange?: () => void;
}

const CATEGORIES = ['Emergency Fund', 'Laptop', 'Car', 'House', 'Vacation', 'Education', 'Other'] as const;

export default function GoalPlanner({ lang, token, onGoalChange }: GoalPlannerProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<typeof CATEGORIES[number]>('Emergency Fund');
  const [targetAmount, setTargetAmount] = useState<number | ''>('');
  const [currentAmount, setCurrentAmount] = useState<number | ''>('');
  const [targetDate, setTargetDate] = useState('');
  const [formError, setFormError] = useState('');

  const t = (key: keyof typeof translations['en']) => getTranslation(lang, key);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/goals', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setGoals(data);
      }
    } catch (err) {
      console.error('Failed to load goals:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setCategory('Emergency Fund');
    setTargetAmount('');
    setCurrentAmount('');
    setTargetDate('');
    setEditingGoalId(null);
    setFormError('');
    setShowForm(false);
  };

  const handleEditClick = (goal: Goal) => {
    setEditingGoalId(goal.id);
    setTitle(goal.title);
    setCategory(goal.category as any);
    setTargetAmount(goal.targetAmount);
    setCurrentAmount(goal.currentAmount);
    // Format date string as YYYY-MM-DD
    const date = new Date(goal.targetDate);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    setTargetDate(`${yyyy}-${mm}-${dd}`);
    setShowForm(true);
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!window.confirm(lang === 'en' ? 'Are you sure you want to delete this savings goal?' : 'இந்தச் சேமிப்பு இலக்கை நீக்க விரும்புகிறீர்களா?')) {
      return;
    }

    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        setGoals(goals.filter(g => g.id !== goalId));
        if (onGoalChange) onGoalChange();
      }
    } catch (err) {
      console.error('Failed to delete goal:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!title || targetAmount === '' || currentAmount === '' || !targetDate) {
      setFormError('Please fill in all goal fields.');
      return;
    }

    if (Number(currentAmount) > Number(targetAmount)) {
      setFormError('Current saved amount cannot exceed target budget.');
      return;
    }

    const payload = {
      title,
      category,
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount),
      targetDate,
    };

    try {
      const method = editingGoalId ? 'PUT' : 'POST';
      const endpoint = editingGoalId ? `/api/goals/${editingGoalId}` : '/api/goals';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save goal parameters.');
      }

      await fetchGoals();
      if (onGoalChange) onGoalChange();
      resetForm();
    } catch (err: any) {
      setFormError(err.message || 'An error occurred.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
            <span>{t('goalTitle')}</span>
          </h3>
          <p className="text-slate-400 text-xs">
            {t('noGoalsYet')} Setup active milestones for compounding.
          </p>
        </div>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addGoal')}</span>
          </button>
        )}
      </div>

      {/* Slide-Down Dialog Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl relative"
        >
          <button
            onClick={resetForm}
            className="absolute top-4 right-4 text-slate-500 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <h4 className="text-sm font-display font-bold text-white mb-4">
            {editingGoalId ? t('editGoal') : t('addGoal')}
          </h4>

          {formError && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl p-3 mb-4 text-xs font-semibold">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1 uppercase tracking-wider">
                Goal Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Emergency Fund Reserve"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 transition-all font-medium"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1 uppercase tracking-wider">
                {t('category')}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all font-medium appearance-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1 uppercase tracking-wider">
                {t('targetAmount')} ($)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                </span>
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="0.00"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 transition-all font-mono font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1 uppercase tracking-wider">
                {t('currentSaved')} ($)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                </span>
                <input
                  type="number"
                  required
                  min={0}
                  placeholder="0.00"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 transition-all font-mono font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1 uppercase tracking-wider">
                {t('targetDate')}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                </span>
                <input
                  type="date"
                  required
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs text-white transition-all font-medium"
                />
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end gap-2.5 pt-3">
              <button
                type="button"
                onClick={resetForm}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/10 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{t('save')}</span>
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Goals grid display */}
      {isLoading ? (
        <div className="h-48 flex items-center justify-center">
          <span className="animate-spin rounded-full h-5 w-5 border-2 border-emerald-500 border-t-transparent" />
        </div>
      ) : goals.length === 0 ? (
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-2xl p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-750 mx-auto">
            <Target className="w-6 h-6 text-slate-500" />
          </div>
          <div>
            <p className="text-white font-semibold text-xs mb-1">Create Savings Goals</p>
            <p className="text-slate-500 text-[10px] leading-relaxed">
              Define target funds for Emergency reserves, Tech, Cars or houses. MoneyMate AI calculates compound parameters automatically.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((g) => {
            const progress = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
            const remaining = Math.max(0, g.targetAmount - g.currentAmount);
            const targetDateStr = new Date(g.targetDate).toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-US', {
              month: 'short',
              year: 'numeric',
            });

            return (
              <div
                key={g.id}
                className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between"
              >
                {/* Visual line at top */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-slate-800" />
                
                <div>
                  <div className="flex items-start justify-between mb-3.5">
                    <div>
                      <span className="bg-slate-800 border border-slate-700/50 text-slate-400 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider block w-fit mb-1.5">
                        {g.category}
                      </span>
                      <h4 className="font-display font-bold text-sm text-slate-100 truncate max-w-[160px]" title={g.title}>
                        {g.title}
                      </h4>
                    </div>

                    <div className="flex gap-1 bg-slate-950/40 p-1 rounded-lg border border-slate-850">
                      <button
                        onClick={() => handleEditClick(g)}
                        className="p-1 text-slate-500 hover:text-white transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(g.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Pricing metrics */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider mb-0.5">
                        Target Goal
                      </span>
                      <span className="text-sm font-mono font-bold text-white">${g.targetAmount}</span>
                    </div>

                    <div>
                      <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider mb-0.5">
                        {t('currentSaved')}
                      </span>
                      <span className="text-sm font-mono font-bold text-emerald-400">${g.currentAmount}</span>
                    </div>
                  </div>

                  {/* Progress Line */}
                  <div className="space-y-1 mb-4">
                    <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400">
                      <span>{t('progress')}</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Calculated statistics box */}
                <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-3 space-y-2 text-[10px]">
                  <div className="flex justify-between items-center text-slate-400 leading-none">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{t('completionDate')}</span>
                    </span>
                    <span className="font-semibold text-slate-200">{targetDateStr}</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-400 leading-none">
                    <span className="flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5 text-slate-500" />
                      <span>{t('remaining')}</span>
                    </span>
                    <span className="font-semibold text-slate-200 font-mono">${remaining}</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-400 leading-none pt-1 border-t border-slate-850">
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Required Save rate</span>
                    </span>
                    <span className="font-bold text-emerald-400 font-mono">${g.monthlyContribution}/mo</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
