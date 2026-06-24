/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { translations, getTranslation } from '../lib/i18n';
import { Language, Expense } from '../types';
import { ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Plus, Pencil, Trash2, Calendar, DollarSign, Filter, BookOpen, AlertCircle, Save, X } from 'lucide-react';
import { motion } from 'motion/react';

interface ExpenseTrackerProps {
  lang: Language;
  token: string;
  onExpenseChange?: () => void;
}

const CATEGORIES = ['Food', 'Rent', 'Transport', 'Shopping', 'Entertainment', 'Education', 'Health', 'Other'] as const;

const COLORS = [
  '#10b981', // Food - Emerald
  '#6366f1', // Rent - Indigo
  '#f59e0b', // Transport - Amber
  '#ec4899', // Shopping - Pink
  '#8b5cf6', // Entertainment - Violet
  '#3b82f6', // Education - Blue
  '#ef4444', // Health - Red
  '#64748b', // Other - Slate
];

export default function ExpenseTracker({ lang, token, onExpenseChange }: ExpenseTrackerProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | ''>('');
  const [category, setCategory] = useState<typeof CATEGORIES[number]>('Food');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [formError, setFormError] = useState('');

  const t = (key: keyof typeof translations['en']) => getTranslation(lang, key);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/expenses', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setExpenses(data);
      }
    } catch (err) {
      console.error('Failed to load expenses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (expense: Expense) => {
    setEditingExpenseId(expense.id);
    setAmount(expense.amount);
    setCategory(expense.category);
    setDescription(expense.description);
    // Format date properly
    const d = new Date(expense.date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setDate(`${yyyy}-${mm}-${dd}`);
    setShowForm(true);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!window.confirm(lang === 'en' ? 'Are you sure you want to delete this expense record?' : 'இந்தச் செலவைப் பதிவை நீக்க விரும்புகிறீர்களா?')) {
      return;
    }

    try {
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        setExpenses(expenses.filter(e => e.id !== expenseId));
        if (onExpenseChange) onExpenseChange();
      }
    } catch (err) {
      console.error('Failed to delete expense:', err);
    }
  };

  const resetForm = () => {
    setAmount('');
    setCategory('Food');
    setDescription('');
    setDate('');
    setEditingExpenseId(null);
    setFormError('');
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (amount === '' || !category || !date) {
      setFormError('Amount, category, and date are required fields.');
      return;
    }

    const payload = {
      amount: Number(amount),
      category,
      description,
      date,
    };

    try {
      const method = editingExpenseId ? 'PUT' : 'POST';
      const endpoint = editingExpenseId ? `/api/expenses/${editingExpenseId}` : '/api/expenses';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save expense data.');
      }

      await fetchExpenses();
      if (onExpenseChange) onExpenseChange();
      resetForm();
    } catch (err: any) {
      setFormError(err.message || 'An error occurred.');
    }
  };

  // Compile Chart data
  const getCategoryData = () => {
    const dataMap: Record<string, number> = {};
    expenses.forEach((e) => {
      dataMap[e.category] = (dataMap[e.category] || 0) + e.amount;
    });

    return Object.keys(dataMap).map((cat, idx) => ({
      name: cat,
      value: dataMap[cat],
      color: COLORS[CATEGORIES.indexOf(cat as any) % COLORS.length],
    }));
  };

  const getTrendData = () => {
    const dataMap: Record<string, number> = {};
    // Sort expenses chronologically
    const sorted = [...expenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    sorted.forEach((e) => {
      const dateObj = new Date(e.date);
      const label = dateObj.toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-US', {
        month: 'short',
        day: 'numeric',
      });
      dataMap[label] = (dataMap[label] || 0) + e.amount;
    });

    return Object.keys(dataMap).map((label) => ({
      date: label,
      amount: dataMap[label],
    }));
  };

  const filteredExpenses = filterCategory === 'all'
    ? expenses
    : expenses.filter(e => e.category === filterCategory);

  const categoryData = getCategoryData();
  const trendData = getTrendData();

  return (
    <div className="space-y-6">
      {/* Header Ledger Controllers */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
            <span>{t('expenseTitle')}</span>
          </h3>
          <p className="text-slate-400 text-xs">
            Review detailed categories and track spending metrics.
          </p>
        </div>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addExpense')}</span>
          </button>
        )}
      </div>

      {/* Slide down Form Modal */}
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
            {editingExpenseId ? t('editExpense') : t('addExpense')}
          </h4>

          {formError && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl p-3 mb-4 text-xs font-semibold">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1 uppercase tracking-wider">
                {t('amount')} ($)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </span>
                <input
                  type="number"
                  required
                  min={0.01}
                  step="any"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 font-mono font-medium"
                />
              </div>
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
                {t('description')}
              </label>
              <input
                type="text"
                placeholder="e.g., Grocery shopping, weekly transit"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 transition-all font-medium"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1 uppercase tracking-wider">
                {t('date')}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                </span>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
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

      {/* Visual Analytics Graphs (Pie & Area) */}
      {expenses.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Category Pie Chart */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-4 block">
              {t('categoryBreakdown')}
            </span>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Area Spending Trend Chart */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-4 block">
              {t('monthlySpendingTrend')}
            </span>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#64748b" fontSize={9} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#10b981" fillOpacity={1} fill="url(#colorSpent)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Ledger Table */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Ledger Audit entries ({filteredExpenses.length})
          </span>

          {/* Ledger category filter */}
          <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-850 p-1 rounded-xl w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-500 ml-2 shrink-0" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-transparent text-slate-300 text-xs py-1 px-2.5 focus:outline-none focus:ring-0 w-full cursor-pointer appearance-none"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="h-24 flex items-center justify-center">
            <span className="animate-spin rounded-full h-4 w-4 border-2 border-emerald-500 border-t-transparent" />
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="bg-slate-950/40 border border-slate-850/60 rounded-xl p-8 text-center text-xs text-slate-500 max-w-sm mx-auto my-4">
            <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="font-semibold text-slate-400 mb-0.5">No Records Logged</p>
            <p className="leading-relaxed">Click "{t('addExpense')}" to log your outflows and generate cash flow breakdowns.</p>
          </div>
        ) : (
          <div className="overflow-x-auto text-xs font-medium">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-850 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-slate-300">
                {filteredExpenses.map((exp) => {
                  const dStr = new Date(exp.date).toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  return (
                    <tr key={exp.id} className="hover:bg-slate-850/20 group transition-all">
                      <td className="py-3 px-4 font-mono">{dStr}</td>
                      <td className="py-3 px-4">
                        <span className="bg-slate-850 border border-slate-750 text-slate-400 font-semibold px-2 py-0.5 rounded uppercase text-[10px]">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 truncate max-w-[200px]" title={exp.description}>
                        {exp.description || '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-slate-100">
                        ${exp.amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex gap-1 justify-end opacity-40 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditClick(exp)}
                            className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteExpense(exp.id)}
                            className="p-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
