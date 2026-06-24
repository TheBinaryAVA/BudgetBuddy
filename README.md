# 💰 BudgetBuddy

> Your Personal AI Financial Coach
 BudgetBuddy is an AI-powered personal finance platform that helps users track expenses, improve savings habits, understand investments, plan financial goals, and build wealth through personalized AI guidance and financial education in multiple regional languages.

---

# 🚀 Overview

BudgetBuddy combines:

* Expense Tracking
* Budget Management
* Goal Planning
* Financial Education
* AI Financial Advisor
* Investment Recommendations
* Regional Language Support

Unlike traditional budgeting apps, BudgetBuddy acts as a personal financial coach that helps users make better financial decisions based on their income, spending patterns, goals, and risk profile.

---

# 🎯 Problem Statement

Millions of people struggle with:

* Understanding financial concepts
* Managing expenses
* Building savings habits
* Choosing investments
* Planning financial goals
* Accessing financial education in their native language

Most finance apps focus on tracking money but fail to educate users.

BudgetBuddy bridges this gap by combining financial management with AI-powered education and personalized guidance.

---

# ✨ Key Features

## 📊 Smart Financial Dashboard

View:

* Monthly Income
* Monthly Expenses
* Savings Rate
* Net Worth
* Financial Health Score
* Goal Progress

Interactive charts and analytics provide a complete financial overview.

---

## 💸 Expense Tracking

Track expenses across categories:

* Food
* Rent
* Transportation
* Education
* Entertainment
* Healthcare
* Shopping

Features:

* Expense categorization
* Spending trends
* Budget analysis
* Monthly reports

---

## 💰 Income Management

Track multiple income sources:

* Salary
* Freelancing
* Business
* Investments
* Scholarships
* Side Hustles

Generate income insights and growth reports.

---

## 🎯 Goal Planner

Create financial goals such as:

* Laptop Purchase
* Emergency Fund
* Vacation
* Higher Education
* Car
* House

The platform calculates:

* Monthly contribution required
* Expected completion date
* Goal success probability

Display beautiful progress visualizations.

---

## 🧠 AI Financial Coach

An AI-powered assistant that answers questions like:

* How much should I save every month?
* Can I afford this purchase?
* Should I start investing?
* What is an ETF?
* What is SIP and SWP?
* How much emergency fund do I need?

Recommendations are personalized using:

* Income
* Expenses
* Goals
* Risk Profile

---

## 📚 Financial Learning Hub

Learn finance from beginner to advanced levels.

Topics include:

* Budgeting
* Savings
* Emergency Funds
* SIP
* SWP
* ETFs
* Mutual Funds
* Stocks
* Bonds
* Inflation
* Retirement Planning
* Tax Basics

Each topic contains:

### Beginner Mode

Simple explanations.

### Intermediate Mode

Examples and use cases.

### Advanced Mode

Detailed concepts and strategies.

---

## 🌐 Multi-Language Support

Supported Languages:

* English
* Tamil
* Hindi
* Telugu
* Malayalam
* Kannada

Users can switch languages instantly throughout the platform.

---

## 📈 Risk Assessment Engine

Financial risk analysis based on:

* Age
* Income
* Financial Goals
* Investment Horizon
* Risk Appetite

Outputs:

* Conservative
* Moderate
* Aggressive

Along with recommended asset allocation.

---

## 💹 Investment Recommendation Engine

Personalized suggestions based on:

* Income
* Expenses
* Goals
* Risk Score

Includes:

* Emergency Fund Planning
* SIP Recommendations
* ETF Allocation
* Asset Diversification

Educational guidance is provided alongside recommendations.

---

## 📂 Portfolio Tracking

Track:

* Stocks
* ETFs
* Mutual Funds
* Gold
* Cryptocurrency

Monitor:

* Portfolio Value
* Profit/Loss
* Diversification Score
* Asset Allocation

---

## 📉 Market Insights

Track major market indices:

* NIFTY 50
* SENSEX
* NASDAQ Composite
* S&P 500

Features:

* Live Prices
* Historical Charts
* Market Trends

---

## 🔮 Spending Forecast

Predict:

* Future expenses
* Budget overruns
* Monthly savings potential

Using machine learning models.

---

## 🏆 Gamification

Financial achievements:

* First Savings Goal
* 30-Day Budget Streak
* Emergency Fund Complete
* Investment Beginner
* Smart Saver

Designed to encourage healthy financial habits.

---

# 🏗️ System Architecture

```text
Frontend (Next.js)

├── Dashboard
├── Expense Tracking
├── Goal Planning
├── Learning Hub
├── AI Coach
├── Portfolio
└── Settings

↓

API Layer (FastAPI)

├── Auth Service
├── Finance Service
├── Goal Service
├── Investment Service
├── Learning Service
└── AI Service

↓

Database Layer

├── PostgreSQL
├── Redis Cache
└── Object Storage

↓

AI Layer

├── OpenAI
├── LangChain
├── RAG System
└── Recommendation Engine
```

# 🛠️ Tech Stack

## Frontend

* Next.js 15
* TypeScript
* Tailwind CSS
* shadcn/ui
* Framer Motion
* Recharts

## Backend

* FastAPI
* Python
* PostgreSQL
* Redis

## AI

* OpenAI
* LangChain
* Vector Database
* RAG Pipeline

## Deployment

* Vercel
* Railway
* Supabase

---

# 🎨 Design Philosophy

MoneyMate AI follows:

* Clean UI
* Minimal Design
* Financial Clarity
* Accessibility
* Mobile First
* Regional Inclusivity

Inspired by:

* CRED
* Stripe
* Notion
* Linear

---

# 🔒 Security

Security measures include:

* JWT Authentication
* OAuth Login
* Password Hashing
* Role-Based Access Control
* Rate Limiting
* Data Encryption
* Secure API Architecture

---


# 🌟 Mission

To make financial literacy and wealth building accessible to everyone, regardless of their financial background, investment knowledge, or preferred language.

MoneyMate AI empowers users to not only manage money but also understand it, grow it, and make confident financial decisions for the future.

---

# 📜 Disclaimer

MoneyMate AI provides educational content, financial insights, and AI-generated recommendations.

The platform does not provide licensed financial, tax, legal, or investment advice. Users should consult qualified professionals before making major financial decisions.

---

Made with ❤️ to democratize financial literacy and wealth creation.


# Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
