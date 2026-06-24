/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import { createServer as createViteServer } from 'vite';
import { db } from './src/server/db';
import { getCoachResponse, checkAffordability, calculateFinancialHealth } from './src/server/gemini';
import { learningCourses } from './src/server/learning';

const JWT_SECRET = process.env.JWT_SECRET || 'moneymate_ai_super_secure_jwt_secret_token_key_2026';

// Extend Express Request type to include user information
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

// Authentication Middleware
function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token is required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: 'Session expired or invalid' });
    }
    req.user = decoded as { id: string; email: string };
    next();
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Global Middlewares
  app.use(express.json());

  // ==========================================
  // AUTHENTICATION ENDPOINTS
  // ==========================================

  // Register
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    try {
      const user = await db.registerUser(email, password, name);
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      res.status(201).json({ user, token });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Registration failed' });
    }
  });

  // Login
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
      const user = await db.validateUser(email, password);
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      
      // Fetch user profile if it exists
      const profile = db.getProfile(user.id);
      res.status(200).json({ user, token, hasProfile: !!profile });
    } catch (error: any) {
      res.status(401).json({ error: error.message || 'Invalid credentials' });
    }
  });

  // ==========================================
  // USER PROFILE ENDPOINTS
  // ==========================================

  // Get Profile
  app.get('/api/user/profile', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const profile = db.getProfile(userId);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(profile);
  });

  // Create / Update Profile
  app.put('/api/user/profile', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { age, country, preferredLanguage, monthlyIncome, monthlyExpenses, financialGoals, riskTolerance } = req.body;

    if (!age || !country || !preferredLanguage || monthlyIncome === undefined || monthlyExpenses === undefined) {
      return res.status(400).json({ error: 'Missing required profile parameters' });
    }

    try {
      const profile = db.upsertProfile(userId, {
        age: Number(age),
        country,
        preferredLanguage,
        monthlyIncome: Number(monthlyIncome),
        monthlyExpenses: Number(monthlyExpenses),
        financialGoals: Array.isArray(financialGoals) ? financialGoals : [],
        riskTolerance: riskTolerance || 'moderate'
      });
      res.json(profile);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  // ==========================================
  // EXPENSES ENDPOINTS
  // ==========================================

  // List Expenses
  app.get('/api/expenses', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const expenses = db.getExpenses(userId);
    res.json(expenses);
  });

  // Create Expense
  app.post('/api/expenses', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { amount, category, description, date } = req.body;

    if (!amount || !category || !date) {
      return res.status(400).json({ error: 'Amount, category, and date are required' });
    }

    try {
      const expense = db.addExpense(userId, {
        amount: Number(amount),
        category,
        description: description || '',
        date,
      });
      res.status(201).json(expense);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to create expense' });
    }
  });

  // Update Expense
  app.put('/api/expenses/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const expenseId = req.params.id;
    const { amount, category, description, date } = req.body;

    try {
      const updated = db.updateExpense(userId, expenseId, {
        ...(amount !== undefined && { amount: Number(amount) }),
        ...(category !== undefined && { category }),
        ...(description !== undefined && { description }),
        ...(date !== undefined && { date }),
      });
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Update failed' });
    }
  });

  // Delete Expense
  app.delete('/api/expenses/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const expenseId = req.params.id;

    const success = db.deleteExpense(userId, expenseId);
    if (!success) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json({ success: true, message: 'Expense deleted successfully' });
  });

  // ==========================================
  // GOALS ENDPOINTS
  // ==========================================

  // List Goals
  app.get('/api/goals', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const goals = db.getGoals(userId);
    res.json(goals);
  });

  // Create Goal
  app.post('/api/goals', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { title, category, targetAmount, currentAmount, targetDate } = req.body;

    if (!title || !category || !targetAmount || !targetDate) {
      return res.status(400).json({ error: 'Title, category, target amount, and target date are required' });
    }

    try {
      // Calculate dynamic monthly contribution needed
      const now = new Date();
      const target = new Date(targetDate);
      const diffMonths = Math.max(1, (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth()));
      const remainingAmount = Math.max(0, Number(targetAmount) - Number(currentAmount || 0));
      const monthlyContribution = Number((remainingAmount / diffMonths).toFixed(2));

      const goal = db.addGoal(userId, {
        title,
        category,
        targetAmount: Number(targetAmount),
        currentAmount: Number(currentAmount || 0),
        targetDate,
        monthlyContribution,
      });
      res.status(201).json(goal);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to create goal' });
    }
  });

  // Update Goal
  app.put('/api/goals/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const goalId = req.params.id;
    const { title, category, targetAmount, currentAmount, targetDate } = req.body;

    try {
      // Recalculate dynamic contribution if values changed
      let updatePayload: any = {};
      if (title !== undefined) updatePayload.title = title;
      if (category !== undefined) updatePayload.category = category;
      if (targetAmount !== undefined) updatePayload.targetAmount = Number(targetAmount);
      if (currentAmount !== undefined) updatePayload.currentAmount = Number(currentAmount);
      if (targetDate !== undefined) updatePayload.targetDate = targetDate;

      // Recalculate monthly contribution based on updated or current properties
      const existingGoals = db.getGoals(userId);
      const existing = existingGoals.find(g => g.id === goalId);
      if (existing) {
        const finalTargetDate = targetDate || existing.targetDate;
        const finalTargetAmount = targetAmount !== undefined ? Number(targetAmount) : existing.targetAmount;
        const finalCurrentAmount = currentAmount !== undefined ? Number(currentAmount) : existing.currentAmount;

        const now = new Date();
        const target = new Date(finalTargetDate);
        const diffMonths = Math.max(1, (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth()));
        const remainingAmount = Math.max(0, finalTargetAmount - finalCurrentAmount);
        updatePayload.monthlyContribution = Number((remainingAmount / diffMonths).toFixed(2));
      }

      const updated = db.updateGoal(userId, goalId, updatePayload);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Update failed' });
    }
  });

  // Delete Goal
  app.delete('/api/goals/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const goalId = req.params.id;

    const success = db.deleteGoal(userId, goalId);
    if (!success) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    res.json({ success: true, message: 'Goal deleted successfully' });
  });

  // ==========================================
  // RISK ASSESSMENT ENDPOINTS
  // ==========================================

  // Get current risk assessment
  app.get('/api/risk-assessment', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const assessment = db.getRiskAssessment(userId);
    if (!assessment) {
      return res.status(404).json({ error: 'No assessment on record' });
    }
    res.json(assessment);
  });

  // Submit assessment questionnaire
  app.post('/api/risk-assessment', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { answers } = req.body; // Map of Q -> A

    if (!answers) {
      return res.status(400).json({ error: 'Answers are required' });
    }

    try {
      // Logic to score the answers
      let score = 0;
      // Q1: fall 20%: A=1, B=2, C=3
      if (answers.q1 === 'A') score += 10;
      else if (answers.q1 === 'B') score += 20;
      else if (answers.q1 === 'C') score += 30;

      // Q2: goal: A=10, B=20, C=30
      if (answers.q2 === 'A') score += 10;
      else if (answers.q2 === 'B') score += 20;
      else if (answers.q2 === 'C') score += 30;

      // Q3: horizon: A=10, B=20, C=30
      if (answers.q3 === 'A') score += 10;
      else if (answers.q3 === 'B') score += 20;
      else if (answers.q3 === 'C') score += 30;

      // Classify Category
      let category: 'conservative' | 'moderate' | 'aggressive' = 'moderate';
      let explanation = '';

      if (score <= 40) {
        category = 'conservative';
        explanation = 'Your answers suggest a strong preference for capital preservation. You prefer asset classes like bonds, Treasury bills, and fixed deposits which buffer against sharp stock market declines, avoiding equity volatility.';
      } else if (score <= 70) {
        category = 'moderate';
        explanation = 'Your profile is balanced. You are willing to accept minor, short-term volatility in exchange for healthy compounding capital growth. A balanced index ETF, combined with high-grade security debts, aligns with your strategy.';
      } else {
        category = 'aggressive';
        explanation = 'You possess a high risk tolerance and a long-term investment horizon. You look past near-term fluctuations to harvest maximal equity compounding gains, selecting diversified tech and growth stock indices.';
      }

      const assessment = db.saveRiskAssessment(userId, {
        score,
        category,
        explanation,
        answers,
      });

      res.status(201).json(assessment);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to complete risk assessment' });
    }
  });

  // ==========================================
  // AI ADVISOR COACH CHAT
  // ==========================================

  // Get active chat logs
  app.get('/api/advisor/chat', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const history = db.getChatHistory(userId);
    res.json(history);
  });

  // Send a chat message & invoke Gemini
  app.post('/api/advisor/chat', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    try {
      // 1. Log the user's message
      const userMsg = db.addChatMessage(userId, 'user', message);

      // 2. Load context (profile, goals, expenses) to personalize the prompt
      const profile = db.getProfile(userId);
      const expenses = db.getExpenses(userId);
      const goals = db.getGoals(userId);

      // 3. Format history for context
      const chatHistory = db.getChatHistory(userId);
      const apiHistory = chatHistory.slice(-10).map(c => ({
        role: c.sender === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: c.message }],
      }));

      // 4. Trigger Gemini Client
      const coachReply = await getCoachResponse(message, apiHistory, profile, expenses, goals);

      // 5. Save AI's response in DB
      const aiMsg = db.addChatMessage(userId, 'assistant', coachReply);

      res.status(200).json({
        userMessage: userMsg,
        assistantMessage: aiMsg,
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Coach call failed' });
    }
  });

  // Clear Chat History
  app.delete('/api/advisor/chat', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    db.clearChatHistory(userId);
    res.json({ success: true, message: 'Chat history cleared' });
  });

  // ==========================================
  // SMART AI AFFORDABILITY CHECKER
  // ==========================================
  app.post('/api/affordability-checker', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { price, description } = req.body;

    if (price === undefined || !description) {
      return res.status(400).json({ error: 'Purchase price and description are required' });
    }

    try {
      const profile = db.getProfile(userId);
      const expenses = db.getExpenses(userId);
      const goals = db.getGoals(userId);

      const result = await checkAffordability(Number(price), description, profile, expenses, goals);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: 'Affordability diagnosis failed' });
    }
  });

  // ==========================================
  // INTELLIGENT FINANCIAL HEALTH SCORE
  // ==========================================
  app.get('/api/financial-health', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;

    try {
      const profile = db.getProfile(userId);
      const expenses = db.getExpenses(userId);
      const goals = db.getGoals(userId);

      const result = await calculateFinancialHealth(profile, expenses, goals);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: 'Financial health calculation failed' });
    }
  });

  // ==========================================
  // LEARNING HUB CONTENT
  // ==========================================
  app.get('/api/learning', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    res.json(learningCourses);
  });

  app.get('/learning', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    res.json(learningCourses);
  });

  // ==========================================
  // VITE OR STATIC FRONTEND SERVING
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MoneyMate AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
