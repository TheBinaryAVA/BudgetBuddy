/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Language = 'en' | 'ta';

export type RiskTolerance = 'conservative' | 'moderate' | 'aggressive';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface FinancialProfile {
  id: string;
  userId: string;
  age: number;
  country: string;
  preferredLanguage: Language;
  monthlyIncome: number;
  monthlyExpenses: number;
  financialGoals: string[];
  riskTolerance: RiskTolerance;
  updatedAt: string;
}

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  category: 'Food' | 'Rent' | 'Transport' | 'Shopping' | 'Entertainment' | 'Education' | 'Health' | 'Other';
  description: string;
  date: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  category: 'Emergency Fund' | 'Laptop' | 'Car' | 'House' | 'Vacation' | 'Education' | 'Other';
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  monthlyContribution: number;
  createdAt: string;
}

export interface RiskAssessment {
  id: string;
  userId: string;
  score: number;
  category: RiskTolerance;
  explanation: string;
  answers: Record<string, string | number>;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  sender: 'user' | 'assistant';
  message: string;
  timestamp: string;
}

export interface FinancialHealth {
  score: number;
  savingsRate: number;
  emergencyFundStatus: string;
  spendingDiscipline: number; // score 0-100
  goalProgressRate: number; // average progress %
  strengths: string[];
  weaknesses: string[];
  aiRecommendations: string[];
}
