/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { translations, getTranslation } from '../lib/i18n';
import { Language } from '../types';
import { LearningCourse } from '../server/learning';
import { TrendingUp, Shield, RefreshCw, Layers, Award, BookOpen, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LearningHubProps {
  lang: Language;
  token: string;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  TrendingUp,
  Shield,
  RefreshCw,
  Layers,
};

export default function LearningHub({ lang, token }: LearningHubProps) {
  const [courses, setCourses] = useState<LearningCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('budgeting');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [isLoading, setIsLoading] = useState(true);

  const t = (key: keyof typeof translations['en']) => getTranslation(lang, key);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/learning', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl pointer-events-none rounded-full" />
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 shrink-0">
            <BookOpen className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-display font-bold text-white leading-tight">
              {t('learningTitle')}
            </h3>
            <p className="text-slate-400 text-xs mt-1 max-w-xl font-medium">
              {t('learningSub')}
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="h-48 flex items-center justify-center">
          <span className="animate-spin rounded-full h-6 w-6 border-2 border-emerald-500 border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Course Navigation List */}
          <div className="lg:col-span-1 space-y-2.5">
            {courses.map((course) => {
              const Icon = iconMap[course.icon] || BookOpen;
              const isSelected = course.id === selectedCourseId;
              const topic = lang === 'ta' ? course.topicTa : course.topic;
              const desc = lang === 'ta' ? course.descriptionTa : course.description;

              return (
                <button
                  key={course.id}
                  onClick={() => setSelectedCourseId(course.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400 shadow-lg shadow-emerald-900/5'
                      : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:border-slate-700/80 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                        isSelected ? 'bg-emerald-500/20 border-emerald-400/30' : 'bg-slate-800 border-slate-750'
                      }`}
                    >
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-display font-bold text-xs block truncate">{topic}</span>
                      <span className="text-[10px] text-slate-500 font-medium block truncate mt-0.5">{desc}</span>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'translate-x-0.5 text-emerald-400' : 'text-slate-600'}`} />
                </button>
              );
            })}
          </div>

          {/* Right Topic Content detail */}
          {selectedCourse && (
            <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                {/* Course Header */}
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-2.5">
                  <Award className="w-4 h-4" />
                  <span>Academy Module</span>
                </div>

                <h3 className="text-xl font-display font-bold text-white mb-4">
                  {lang === 'ta' ? selectedCourse.topicTa : selectedCourse.topic}
                </h3>

                {/* Level Tabs */}
                <div className="flex bg-slate-950/60 border border-slate-800 p-1 rounded-xl mb-6 text-[11px] font-bold tracking-wide">
                  {(['beginner', 'intermediate', 'advanced'] as const).map((lvl) => {
                    const active = difficulty === lvl;
                    return (
                      <button
                        key={lvl}
                        onClick={() => setDifficulty(lvl)}
                        className={`flex-1 py-2 text-center rounded-lg transition-all capitalize cursor-pointer ${
                          active
                            ? 'bg-slate-800 text-emerald-400 border border-slate-700/50 shadow-sm'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {lvl === 'beginner' ? t('beginner') : lvl === 'intermediate' ? t('intermediate') : t('advanced')}
                      </button>
                    );
                  })}
                </div>

                {/* Animated Course Article content */}
                <div className="min-h-[160px] bg-slate-950/40 rounded-xl p-5 border border-slate-850">
                  <h4 className="text-sm font-semibold text-white mb-2 font-display">
                    {lang === 'ta' ? selectedCourse[difficulty].titleTa : selectedCourse[difficulty].title}
                  </h4>
                  <p className="text-slate-300 text-xs leading-relaxed font-medium whitespace-pre-wrap">
                    {lang === 'ta' ? selectedCourse[difficulty].contentTa : selectedCourse[difficulty].content}
                  </p>
                </div>
              </div>

              {/* Course Footer Completion Tip */}
              <div className="mt-6 pt-4 border-t border-slate-850 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <span>Completed modules compound your Financial Score.</span>
                <span className="text-emerald-400 font-bold uppercase tracking-wider">Keep Learning!</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
