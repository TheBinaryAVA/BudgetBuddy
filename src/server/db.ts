/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { User, FinancialProfile, Expense, Goal, RiskAssessment, ChatMessage } from '../types';

interface DatabaseSchema {
  users: User[];
  passwords: Record<string, string>; // userId -> hashed_password
  profiles: FinancialProfile[];
  expenses: Expense[];
  goals: Goal[];
  riskAssessments: RiskAssessment[];
  chatHistories: ChatMessage[];
}

class LocalDatabase {
  private filePath: string;
  private data: DatabaseSchema;
  private isLoaded: boolean = false;

  constructor() {
    this.filePath = path.join(process.cwd(), 'data', 'db.json');
    this.data = {
      users: [],
      passwords: {},
      profiles: [],
      expenses: [],
      goals: [],
      riskAssessments: [],
      chatHistories: [],
    };
  }

  private ensureDir() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private load() {
    if (this.isLoaded) return;
    this.ensureDir();
    try {
      if (fs.existsSync(this.filePath)) {
        const fileContent = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(fileContent);
        this.data = { ...this.data, ...parsed };
      } else {
        this.save();
      }
    } catch (error) {
      console.error('Failed to load local database:', error);
    }
    this.isLoaded = true;
  }

  private save() {
    this.ensureDir();
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to save local database:', error);
    }
  }

  // Auth Operations
  async registerUser(email: string, passwordString: string, name: string): Promise<User> {
    this.load();
    const existing = this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('User already exists with this email');
    }

    const userId = crypto.randomUUID();
    const hashedPassword = await bcrypt.hash(passwordString, 10);
    
    const newUser: User = {
      id: userId,
      email: email.toLowerCase(),
      name,
      createdAt: new Date().toISOString(),
    };

    this.data.users.push(newUser);
    this.data.passwords[userId] = hashedPassword;
    this.save();

    return newUser;
  }

  async validateUser(email: string, passwordString: string): Promise<User> {
    this.load();
    const user = this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const hashedPassword = this.data.passwords[user.id];
    if (!hashedPassword) {
      throw new Error('Credentials mismatch');
    }

    const isMatch = await bcrypt.compare(passwordString, hashedPassword);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    return user;
  }

  async getUser(userId: string): Promise<User | undefined> {
    this.load();
    return this.data.users.find(u => u.id === userId);
  }

  // Profile Operations
  getProfile(userId: string): FinancialProfile | undefined {
    this.load();
    return this.data.profiles.find(p => p.userId === userId);
  }

  upsertProfile(userId: string, profileData: Omit<FinancialProfile, 'id' | 'userId' | 'updatedAt'>): FinancialProfile {
    this.load();
    const existingIndex = this.data.profiles.findIndex(p => p.userId === userId);
    
    const profile: FinancialProfile = {
      id: existingIndex >= 0 ? this.data.profiles[existingIndex].id : crypto.randomUUID(),
      userId,
      ...profileData,
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      this.data.profiles[existingIndex] = profile;
    } else {
      this.data.profiles.push(profile);
    }
    
    this.save();
    return profile;
  }

  // Expense CRUD Operations
  getExpenses(userId: string): Expense[] {
    this.load();
    return this.data.expenses
      .filter(e => e.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  addExpense(userId: string, expenseData: Omit<Expense, 'id' | 'userId' | 'createdAt'>): Expense {
    this.load();
    const newExpense: Expense = {
      id: crypto.randomUUID(),
      userId,
      ...expenseData,
      createdAt: new Date().toISOString(),
    };
    this.data.expenses.push(newExpense);
    this.save();
    return newExpense;
  }

  updateExpense(userId: string, expenseId: string, expenseData: Partial<Omit<Expense, 'id' | 'userId'>>): Expense {
    this.load();
    const index = this.data.expenses.findIndex(e => e.id === expenseId && e.userId === userId);
    if (index === -1) {
      throw new Error('Expense not found');
    }

    const updated = {
      ...this.data.expenses[index],
      ...expenseData,
    } as Expense;

    this.data.expenses[index] = updated;
    this.save();
    return updated;
  }

  deleteExpense(userId: string, expenseId: string): boolean {
    this.load();
    const initialLen = this.data.expenses.length;
    this.data.expenses = this.data.expenses.filter(e => !(e.id === expenseId && e.userId === userId));
    const deleted = this.data.expenses.length < initialLen;
    if (deleted) this.save();
    return deleted;
  }

  // Goal CRUD Operations
  getGoals(userId: string): Goal[] {
    this.load();
    return this.data.goals.filter(g => g.userId === userId);
  }

  addGoal(userId: string, goalData: Omit<Goal, 'id' | 'userId' | 'createdAt'>): Goal {
    this.load();
    const newGoal: Goal = {
      id: crypto.randomUUID(),
      userId,
      ...goalData,
      createdAt: new Date().toISOString(),
    };
    this.data.goals.push(newGoal);
    this.save();
    return newGoal;
  }

  updateGoal(userId: string, goalId: string, goalData: Partial<Omit<Goal, 'id' | 'userId'>>): Goal {
    this.load();
    const index = this.data.goals.findIndex(g => g.id === goalId && g.userId === userId);
    if (index === -1) {
      throw new Error('Goal not found');
    }

    const updated = {
      ...this.data.goals[index],
      ...goalData,
    } as Goal;

    this.data.goals[index] = updated;
    this.save();
    return updated;
  }

  deleteGoal(userId: string, goalId: string): boolean {
    this.load();
    const initialLen = this.data.goals.length;
    this.data.goals = this.data.goals.filter(g => !(g.id === goalId && g.userId === userId));
    const deleted = this.data.goals.length < initialLen;
    if (deleted) this.save();
    return deleted;
  }

  // Risk Assessment Operations
  getRiskAssessment(userId: string): RiskAssessment | undefined {
    this.load();
    return this.data.riskAssessments.find(r => r.userId === userId);
  }

  saveRiskAssessment(userId: string, assessment: Omit<RiskAssessment, 'id' | 'userId' | 'createdAt'>): RiskAssessment {
    this.load();
    const existingIndex = this.data.riskAssessments.findIndex(r => r.userId === userId);

    const newAssessment: RiskAssessment = {
      id: existingIndex >= 0 ? this.data.riskAssessments[existingIndex].id : crypto.randomUUID(),
      userId,
      ...assessment,
      createdAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      this.data.riskAssessments[existingIndex] = newAssessment;
    } else {
      this.data.riskAssessments.push(newAssessment);
    }

    // Also update the user's profile risk tolerance
    const profile = this.getProfile(userId);
    if (profile) {
      this.upsertProfile(userId, {
        ...profile,
        riskTolerance: assessment.category,
      });
    }

    this.save();
    return newAssessment;
  }

  // Chat History Operations
  getChatHistory(userId: string): ChatMessage[] {
    this.load();
    return this.data.chatHistories
      .filter(c => c.userId === userId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  addChatMessage(userId: string, sender: 'user' | 'assistant', message: string): ChatMessage {
    this.load();
    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      userId,
      sender,
      message,
      timestamp: new Date().toISOString(),
    };
    this.data.chatHistories.push(newMessage);
    this.save();
    return newMessage;
  }

  clearChatHistory(userId: string): void {
    this.load();
    this.data.chatHistories = this.data.chatHistories.filter(c => c.userId !== userId);
    this.save();
  }
}

export const db = new LocalDatabase();
