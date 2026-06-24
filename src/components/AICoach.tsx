/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { translations, getTranslation } from '../lib/i18n';
import { Language, ChatMessage } from '../types';
import { Bot, User, Send, Trash2, ShieldAlert, Sparkles, HelpCircle, CornerDownLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface AICoachProps {
  lang: Language;
  token: string;
}

const SHORTCUT_QUESTIONS = [
  { text: 'How much should I save?', label: 'Savings Rule' },
  { text: 'Can I afford a laptop?', label: 'Affordability' },
  { text: 'What is an ETF?', label: 'Explain ETFs' },
  { text: 'Should I start SIP?', label: 'SIP Compounding' },
];

export default function AICoach({ lang, token }: AICoachProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const t = (key: keyof typeof translations['en']) => getTranslation(lang, key);

  // Load chat logs on load
  useEffect(() => {
    fetchChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const response = await fetch('/api/advisor/chat', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Failed to load chat logs:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    // optimistic update
    const tempId = Math.random().toString();
    const newUserMessage: ChatMessage = {
      id: tempId,
      userId: 'temp',
      sender: 'user',
      message: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/advisor/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) {
        throw new Error('API server timeout');
      }

      const data = await response.json();
      // Replace or update messages properly
      setMessages((prev) => 
        prev.filter(m => m.id !== tempId).concat([data.userMessage, data.assistantMessage])
      );
    } catch (err) {
      // Show failure message
      const errorMsg: ChatMessage = {
        id: Math.random().toString(),
        userId: 'temp',
        sender: 'assistant',
        message: 'Sorry, I encountered a temporary connection issue. Please check your credentials or try again in a few moments.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = async () => {
    if (!window.confirm(lang === 'en' ? 'Are you sure you want to wipe the chat history?' : 'அரட்டைப் பதிவுகளை அழிக்க விரும்புகிறீர்களா?')) {
      return;
    }
    try {
      const response = await fetch('/api/advisor/chat', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        setMessages([]);
      }
    } catch (err) {
      console.error('Failed to clear chat history:', err);
    }
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col h-[650px]">
      {/* Visual Header Decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl pointer-events-none rounded-full" />

      {/* Header Panel */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
            <Bot className="w-5.5 h-5.5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
              <span>{t('aiCoachTitle')}</span>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider">
                LIVE CFO
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              {t('aiCoachSub')}
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={handleClearChat}
            className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-850 rounded-lg transition-colors cursor-pointer"
            title="Clear History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto py-5 pr-2 space-y-4 min-h-0 text-sm">
        {isLoadingHistory ? (
          <div className="h-full flex items-center justify-center">
            <span className="animate-spin rounded-full h-5 w-5 border-2 border-emerald-500 border-t-transparent" />
          </div>
        ) : messages.length === 0 ? (
          /* Empty State */
          <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-4">
            <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700/60">
              <HelpCircle className="w-5.5 h-5.5 text-slate-400" />
            </div>
            <div>
              <p className="text-white font-semibold text-xs mb-1">Begin Wealth Mentoring</p>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                MoneyMate AI is ready to audit your portfolio, answer queries with analogies, or help formulate savings rules.
              </p>
            </div>
          </div>
        ) : (
          messages.map((m) => {
            const isAI = m.sender === 'assistant';
            return (
              <div
                key={m.id}
                className={`flex gap-3 max-w-[85%] ${isAI ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                    isAI
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div
                  className={`p-3.5 rounded-xl border ${
                    isAI
                      ? 'bg-slate-900/80 border-slate-800/80 text-slate-100 rounded-tl-none'
                      : 'bg-emerald-500 text-slate-950 font-medium border-emerald-400/20 rounded-tr-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed text-xs">{m.message}</p>
                </div>
              </div>
            );
          })
        )}

        {isTyping && (
          <div className="flex gap-3 max-w-[85%] mr-auto">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3 bg-slate-900 border border-slate-850 rounded-xl rounded-tl-none flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Shortcut Prompts */}
      {messages.length === 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 shrink-0 pb-3">
          {SHORTCUT_QUESTIONS.map((q) => (
            <button
              key={q.text}
              onClick={() => handleSendMessage(q.text)}
              className="bg-slate-950/40 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 p-2 rounded-xl text-left transition-all cursor-pointer"
            >
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-0.5">
                {q.label}
              </span>
              <span className="text-[11px] text-slate-300 leading-tight block truncate">
                "{q.text}"
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Form Input Area */}
      <div className="shrink-0 border-t border-slate-800/80 pt-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputValue);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t('coachPlaceholder')}
            className="flex-1 bg-slate-950/60 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 transition-all font-medium"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold p-3 rounded-xl shadow-md shadow-emerald-500/10 transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Disclaimer */}
        <div className="flex items-center gap-1.5 mt-3 text-[10px] text-slate-500 leading-relaxed font-medium">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
          <span>{t('disclaimer')}</span>
        </div>
      </div>
    </div>
  );
}
