/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { translations, getTranslation } from '../lib/i18n';
import { Language } from '../types';
import { Shield, Lock, Mail, User, Eye, EyeOff, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface AuthScreenProps {
  onAuthSuccess: (token: string, hasProfile: boolean) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [lang, setLang] = useState<Language>('en');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const t = (key: keyof typeof translations['en']) => getTranslation(lang, key);

  const handleDemoAccess = () => {
    setEmail('demo@moneymate.ai');
    setPassword('password123');
    setIsLogin(true);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password || (!isLogin && !name)) {
      setError('Please fill in all required fields.');
      setIsLoading(false);
      return;
    }

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin ? { email, password } : { email, password, name };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Save credentials in local storage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('lang', lang);

      onAuthSuccess(data.token, !!data.hasProfile);
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-sans p-4 relative overflow-hidden">
      {/* Background ambient light effects */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />

      {/* Language Switcher in top corner */}
      <div className="absolute top-6 right-6 flex bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
        <button
          onClick={() => setLang('en')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
            lang === 'en' ? 'bg-emerald-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
          }`}
        >
          English
        </button>
        <button
          onClick={() => setLang('ta')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
            lang === 'ta' ? 'bg-emerald-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
          }`}
        >
          தமிழ்
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl relative z-10"
      >
        {/* Brand Logo Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 mb-3 shadow-inner">
            <Shield className="w-6 h-6 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-white mb-1.5">
            {t('brand')}
          </h1>
          <p className="text-slate-400 text-sm text-center font-medium max-w-[280px]">
            {t('tagline')}
          </p>
        </div>

        {/* Demo Credential Banner */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3 mb-6 flex items-center justify-between text-xs text-slate-300">
          <div>
            <span className="font-semibold text-emerald-400 block mb-0.5">🚀 Recruiter Fast Pass:</span>
            <span>Use standard demo credentials</span>
          </div>
          <button
            onClick={handleDemoAccess}
            className="bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 font-medium px-2.5 py-1.5 rounded-lg border border-emerald-500/20 transition-all text-[11px] cursor-pointer"
          >
            Fill Demo
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 mb-6">
          <button
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 pb-3 text-center text-sm font-medium transition-all relative ${
              isLogin ? 'text-white font-semibold' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {t('login')}
            {isLogin && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400" />}
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 pb-3 text-center text-sm font-medium transition-all relative ${
              !isLogin ? 'text-white font-semibold' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {t('register')}
            {!isLogin && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400" />}
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl p-3 mb-6 flex items-start gap-2.5 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1.5 uppercase tracking-wider">
                {t('name')}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs text-slate-400 font-semibold block mb-1.5 uppercase tracking-wider">
              {t('email')}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-semibold block mb-1.5 uppercase tracking-wider">
              {t('password')}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-[0.99] transition-all duration-150 flex items-center justify-center gap-2 mt-2 font-display text-sm disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {isLoading ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-slate-950 border-t-transparent" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{isLogin ? t('login') : t('register')}</span>
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
