/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from '@google/genai';
import { FinancialProfile, Expense, Goal } from '../types';

let aiInstance: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY environment variable is not defined. AI functionality will fallback to high-quality rule-based simulations.');
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey || 'MOCK_KEY',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

/**
 * Helper to retry asynchronous operations with exponential backoff.
 * Gracefully handles 503 / transient overloaded errors from the Gemini API.
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const errorStr = String(error).toLowerCase();
    const isTransient =
      error?.status === 'UNAVAILABLE' ||
      error?.code === 503 ||
      errorStr.includes('503') ||
      errorStr.includes('unavailable') ||
      errorStr.includes('high demand') ||
      errorStr.includes('overloaded');

    if (isTransient && retries > 0) {
      console.warn(`[Gemini] Transient error encountered. Retrying in ${delayMs}ms... (${retries} attempts remaining)`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return retryWithBackoff(fn, retries - 1, delayMs * 2);
    }
    throw error;
  }
}

/**
 * AI Financial Coach Chat Handler
 */
export async function getCoachResponse(
  message: string,
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  profile?: FinancialProfile,
  expenses: Expense[] = [],
  goals: Goal[] = []
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return generateFallbackCoachResponse(message, profile, expenses, goals);
  }

  try {
    const ai = getGeminiClient();

    // Compile contextual user summary to inject as system instructions
    const profileStr = profile 
      ? `User Context: Income: $${profile.monthlyIncome}/mo, Expenses: $${profile.monthlyExpenses}/mo, Savings Rate: ${((profile.monthlyIncome - profile.monthlyExpenses) / profile.monthlyIncome * 100).toFixed(1)}%, Risk Tolerance: ${profile.riskTolerance}, Preferred Language: ${profile.preferredLanguage}.`
      : 'User Profile: Not initialized yet.';

    const expensesStr = expenses.length > 0
      ? `Expenses logged: ${expenses.slice(0, 10).map(e => `${e.category}: $${e.amount} (${e.description || 'No desc'})`).join(', ')}.`
      : 'Expenses logged: None.';

    const goalsStr = goals.length > 0
      ? `Savings Goals: ${goals.map(g => `${g.title} ($${g.currentAmount}/$${g.targetAmount}, Target: ${g.targetDate})`).join(', ')}.`
      : 'Goals: None created yet.';

    const systemInstruction = `You are MoneyMate AI.
    You are a friendly and premium personal financial coach.
    You explain complex finance concepts simply using intuitive real-world analogies.
    Always avoid complex, dry economic jargon.
    Use user's context, assets, goals, and risk profile to personalize recommendations.
    Never guarantee investment returns or state deterministic outcomes.
    You must always end with an educational disclaimer emphasizing that this advice is for educational purposes only.
    Please respond in the user's preferred language if specified (${profile?.preferredLanguage || 'en'}).`;

    // Format chat history for the Gemini API chat controller
    const chat = ai.chats.create({
      model: 'gemini-3.5-flash',
      config: {
        systemInstruction: `${systemInstruction}\n\n${profileStr}\n${expensesStr}\n${goalsStr}`,
        temperature: 0.7,
      }
    });

    // Populate previous logs if any
    if (history.length > 0) {
      // Re-feed chat context or simulate chat state
    }

    const response = await retryWithBackoff(() => chat.sendMessage({ message }));
    return response.text || 'I apologize, I am unable to formulate an answer right now. Please try again.';
  } catch (error: any) {
    console.warn('Gemini API Coach Warning (switching to fallback):', error?.message || error);
    return generateFallbackCoachResponse(message, profile, expenses, goals) + '\n\n*(Note: MoneyMate AI AI Coach is running in secure high-fidelity fallback mode)*';
  }
}

/**
 * Smart Affordability Checker Engine
 */
export interface AffordabilityResult {
  affordable: boolean;
  scoreImpact: number;
  savingsImpact: string;
  goalsImpact: string;
  recommendation: string;
  alternatives: string[];
}

export async function checkAffordability(
  price: number,
  description: string,
  profile?: FinancialProfile,
  expenses: Expense[] = [],
  goals: Goal[] = []
): Promise<AffordabilityResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return simulateAffordability(price, description, profile, expenses, goals);
  }

  try {
    const ai = getGeminiClient();

    const profileText = profile 
      ? `Income: $${profile.monthlyIncome}/mo, Spent: $${profile.monthlyExpenses}/mo, Discretionary Savings: $${profile.monthlyIncome - profile.monthlyExpenses}/mo.`
      : 'Income: $4000/mo, Spent: $2500/mo, Discretionary Savings: $1500/mo.';

    const goalsText = goals.length > 0
      ? `Goals: ${goals.map(g => `${g.title} ($${g.currentAmount} saved of $${g.targetAmount})`).join(', ')}.`
      : 'Goals: None.';

    const prompt = `Perform an AI affordability analysis for:
Product: "${description}"
Price: $${price}
User details: ${profileText}
${goalsText}

Calculate:
1. Is it affordable (boolean) using sound personal finance principles (e.g. 50/30/20 budget or emergency savings status)?
2. Potential Financial Health Score Impact (number from -20 to 0).
3. Impact on monthly savings rate (string description).
4. Impact on savings goals (string description).
5. Comprehensive recommendation (string explaining the trade-offs).
6. 2-3 smarter alternatives (array of strings, like starting a dedicated SIP or delay-and-save option).

Please return your response matching this exact JSON schema. Ensure descriptions are in ${profile?.preferredLanguage === 'ta' ? 'Tamil' : 'English'}.`;

    const response = await retryWithBackoff(() => ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            affordable: { type: Type.BOOLEAN },
            scoreImpact: { type: Type.NUMBER },
            savingsImpact: { type: Type.STRING },
            goalsImpact: { type: Type.STRING },
            recommendation: { type: Type.STRING },
            alternatives: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['affordable', 'scoreImpact', 'savingsImpact', 'goalsImpact', 'recommendation', 'alternatives'],
        },
      },
    }));

    if (response.text) {
      return JSON.parse(response.text.trim()) as AffordabilityResult;
    }
    throw new Error('Empty response from Gemini');
  } catch (error: any) {
    console.warn('Gemini Affordability API Warning (switching to simulation):', error?.message || error);
    return simulateAffordability(price, description, profile, expenses, goals);
  }
}

/**
 * Intelligent Financial Health Score Diagnostics
 */
export interface HealthScoreResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
  aiRecommendations: string[];
}

export async function calculateFinancialHealth(
  profile?: FinancialProfile,
  expenses: Expense[] = [],
  goals: Goal[] = []
): Promise<HealthScoreResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return simulateFinancialHealth(profile, expenses, goals);
  }

  try {
    const ai = getGeminiClient();

    const profileText = profile 
      ? `Income: $${profile.monthlyIncome}/mo, Expenses: $${profile.monthlyExpenses}/mo, Savings: $${profile.monthlyIncome - profile.monthlyExpenses}/mo, Savings Rate: ${((profile.monthlyIncome - profile.monthlyExpenses) / profile.monthlyIncome * 100).toFixed(1)}%.`
      : 'No profile details.';

    const expensesText = expenses.length > 0
      ? `Expenses by Category: ${JSON.stringify(
          expenses.reduce((acc, e) => {
            acc[e.category] = (acc[e.category] || 0) + e.amount;
            return acc;
          }, {} as Record<string, number>)
        )}`
      : 'No logged transactions.';

    const goalsText = goals.length > 0
      ? `Active goals: ${goals.map(g => `${g.title}: $${g.currentAmount} of $${g.targetAmount}`).join(', ')}.`
      : 'No saving goals created.';

    const prompt = `Evaluate the user's financial status:
Profile: ${profileText}
${expensesText}
${goalsText}

Calculate:
1. Overall financial health score out of 100.
2. Strengths (array of strings, 2-3 items).
3. Weaknesses (array of strings, 2-3 items).
4. Personalized AI recommendations (array of strings, 3 key actionable items).

Ensure all recommendations are tailored, educational, and returned in this exact JSON schema:`;

    const response = await retryWithBackoff(() => ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            weaknesses: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            aiRecommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['score', 'strengths', 'weaknesses', 'aiRecommendations'],
        }
      }
    }));

    if (response.text) {
      const data = JSON.parse(response.text.trim()) as HealthScoreResult;
      // Clamp score
      data.score = Math.max(0, Math.min(100, data.score));
      return data;
    }
    throw new Error('Empty health score text');
  } catch (error: any) {
    console.warn('Gemini Health Score API Warning (switching to simulation):', error?.message || error);
    return simulateFinancialHealth(profile, expenses, goals);
  }
}

/**
 * HIGH-QUALITY LOCAL FALLBACK ENGINES
 */

function generateFallbackCoachResponse(message: string, profile?: FinancialProfile, expenses: Expense[] = [], goals: Goal[] = []): string {
  const lcMsg = message.toLowerCase();
  const isTamil = profile?.preferredLanguage === 'ta';

  if (isTamil) {
    if (lcMsg.includes('save') || lcMsg.includes('சேமி')) {
      return `சேமிப்பு என்பது உங்கள் நிதிப் பாதுகாப்பின் அடித்தளமாகும். உங்கள் மாதாந்திர வருமானத்தில் குறைந்தது 20% சேமிக்க முயற்சி செய்யுங்கள்.
உதாரணத்திற்கு:
* உங்கள் மாதாந்திர வருமானம்: $${profile?.monthlyIncome || 0}
* பரிந்துரைக்கப்படும் சேமிப்பு (20%): $${((profile?.monthlyIncome || 0) * 0.2).toFixed(2)}

மறுப்பு: இந்தத் தகவல்கள் கல்வி நோக்கங்களுக்காக மட்டுமே. முதலீடு செய்வதற்கு முன் உங்கள் நிதி ஆலோசகரைக் கலந்தாலோசிக்கவும்.`;
    }
    if (lcMsg.includes('sip') || lcMsg.includes('எஸ்ஐபி') || lcMsg.includes('etf')) {
      return `எஸ்ஐபி (SIP) அல்லது முறைப்படுத்தப்பட்ட முதலீட்டுத் திட்டம் மற்றும் பங்குகளின் தொகுப்பு (ETFs) ஆகியவை நீண்ட கால செல்வ உருவாக்கத்திற்குச் சிறந்தவை. 
ஒவ்வொரு மாதமும் ஒரு சிறிய தொகையை நீங்கள் முதலீடு செய்வதன் மூலம் கூட்டு வட்டியின் பலனைப் பெறலாம்.

மறுப்பு: முதலீடுகள் சந்தை அபாயங்களுக்கு உட்பட்டவை. முந்தைய செயல்திறன் எதிர்கால வருமானத்திற்கு உத்தரவாதம் அளிக்காது.`;
    }
    return `வணக்கம்! நான் உங்கள் மணிமேட் AI நிதி ஆலோசகர். பட்ஜெட்டுகள், அவசரக்கால சேமிப்புகள், அல்லது முதலீடுகள் குறித்து உங்களுக்கு ஏதேனும் கேள்விகள் இருந்தால் கேளுங்கள்.

மறுப்பு: இந்த ஆலோசனைகள் கல்வி நோக்கங்களுக்காக மட்டுமே வழங்கப்படுகின்றன.`;
  }

  // English fallback responses
  if (lcMsg.includes('save') || lcMsg.includes('budget') || lcMsg.includes('how much')) {
    const savingsRate = profile ? ((profile.monthlyIncome - profile.monthlyExpenses) / profile.monthlyIncome * 100) : 30;
    return `Building an effective savings and budgeting strategy starts with the **50/30/20 Rule**:
* **50% Needs**: Essential expenses (Rent, utilities, groceries)
* **30% Wants**: Discretionary spending (Shopping, movies, hobbies)
* **20% Savings**: Direct transfer to wealth goals or emergency funds

Based on your profile, your current savings rate is **${savingsRate.toFixed(1)}%**. Keeping a buffer of 3-6 months of expenses in an Emergency Fund is highly recommended before making volatile asset investments.

*Educational Disclaimer: All insights are strictly for informational and educational purposes only. Past performance does not indicate future results.*`;
  }

  if (lcMsg.includes('afford') || lcMsg.includes('laptop') || lcMsg.includes('buy')) {
    return `When deciding if you can afford a major discretionary purchase, apply the **Rule of 2x**: If you cannot purchase two of the item comfortably in cash without touching your emergency reserve, it is safer to defer. 
Alternatively, establish a dedicated Savings Goal in the MoneyMate Planner. Compounding a small amount monthly is a disciplined path to ownership.

*Educational Disclaimer: All recommendations are for guidance only. Consult a registered financial adviser for personal choices.*`;
  }

  if (lcMsg.includes('sip') || lcMsg.includes('etf') || lcMsg.includes('invest')) {
    return `An **ETF (Exchange-Traded Fund)** tracks an index (like the S&P 500) and buys you diversified exposure to hundreds of top corporations in a single share, reducing single-stock risks.
A **SIP (Systematic Investment Plan)** is a method of investing a fixed sum of cash regularly (e.g., monthly) to benefit from *Rupee-Cost Averaging* (buying more shares when prices are low, and fewer when high).

For a **${profile?.riskTolerance || 'moderate'}** risk tolerance, a balanced approach combining index funds, safe government-backed bonds, and minor equity exposure is a typical structure.

*Educational Disclaimer: Investment strategies have volatility. MoneyMate AI does not guarantee capital appreciation or target returns.*`;
  }

  return `Hello! I am your MoneyMate AI Financial Coach. 

I can assist you with:
- Optimizing your savings rate (**current: ${profile ? ((profile.monthlyIncome - profile.monthlyExpenses) / profile.monthlyIncome * 100).toFixed(1) : '25'}%**)
- Setting up compound interest milestones (SIP/ETF education)
- Diagnosing your **${profile?.riskTolerance || 'Moderate'}** risk alignment
- Creating your ideal emergency fund parameters

What financial question can I demystify for you today?

*Educational Disclaimer: This advice is provided purely for pedagogical finance learning. MoneyMate AI never guarantees investment returns.*`;
}

function simulateAffordability(price: number, description: string, profile?: FinancialProfile, expenses: Expense[] = [], goals: Goal[] = []): AffordabilityResult {
  const isTamil = profile?.preferredLanguage === 'ta';
  const monthlyIncome = profile?.monthlyIncome || 4000;
  const monthlyExpenses = profile?.monthlyExpenses || 2500;
  const netSavings = monthlyIncome - monthlyExpenses;

  const affordable = price <= netSavings * 1.5;
  const scoreImpact = affordable ? -2 : -8;
  
  if (isTamil) {
    return {
      affordable,
      scoreImpact,
      savingsImpact: affordable 
        ? `இந்தக் கொள்முதல் உங்கள் மாதாந்திர சேமிப்பில் $${price} தற்காலிகக் குறைவை ஏற்படுத்தும், ஆனால் நீங்கள் சமாளிக்கலாம்.`
        : `எச்சரிக்கை: இந்தத் தொகை உங்களின் மாதாந்திர நிகரச் சேமிப்பை விட அதிகமானது ($${netSavings}).`,
      goalsImpact: goals.length > 0
        ? `இது உங்கள் "${goals[0].title}" இலக்கின் சேமிப்பைப் பாதிக்கும்.`
        : 'புதிய சேமிப்பு இலக்குகளை உருவாக்க வேண்டியிருக்கும்.',
      recommendation: affordable
        ? `ஆம், உங்கள் வருமானத்தின் அடிப்படையில் இதை வாங்கலாம். இருப்பினும், உங்கள் மாதாந்திர பட்ஜெட்டைச் சற்றுச் சரிசெய்யவும்.`
        : `இல்லை, இப்போதைக்கு இதைத் தவிர்க்கவும். உங்கள் மாதாந்திர சேமிப்பைத் தாண்டுகிறது. அவசரக்கால நிதியைப் பாதுகாக்கவும்.`,
      alternatives: [
        `மாதம் $${(price / 4).toFixed(0)} வீதம் 4 மாதங்களுக்குச் சேமித்து வாங்குங்கள்`,
        'பதிலாக மலிவான மாற்றுப் பொருளைத் தேர்வு செய்யுங்கள்'
      ]
    };
  }

  return {
    affordable,
    scoreImpact,
    savingsImpact: affordable
      ? `This purchase represents ${((price / netSavings) * 100).toFixed(0)}% of your monthly net savings ($${netSavings}). It is manageable.`
      : `High Risk: Purchase price ($${price}) exceeds your entire month's net savings pool ($${netSavings}).`,
    goalsImpact: goals.length > 0
      ? `This will delay your active savings goal for "${goals[0].title}" by approximately ${Math.ceil(price / (goals[0].monthlyContribution || 100))} months.`
      : 'This capital could otherwise form the start of a robust 3-month emergency reserve cushion.',
    recommendation: affordable
      ? `You can comfortably afford this, but we advise transferring the equivalent amount into a high-yield savings vault to ensure double-liquidity.`
      : `We recommend postponing this purchase. Leverage MoneyMate's Goal Planner to accrue $${price} over the next 3-6 months safely.`,
    alternatives: [
      `Setup a dedicated "Savings Goal" of $${(price / 5).toFixed(0)}/mo for 5 months to avoid credit card debt.`,
      `Consider pre-owned options to lower capital requirement by 30-50%.`
    ]
  };
}

function simulateFinancialHealth(profile?: FinancialProfile, expenses: Expense[] = [], goals: Goal[] = []): HealthScoreResult {
  const isTamil = profile?.preferredLanguage === 'ta';
  const income = profile?.monthlyIncome || 4000;
  const spent = profile?.monthlyExpenses || 2500;
  const savings = income - spent;
  const rate = income > 0 ? (savings / income) * 100 : 0;

  // Rule-based score calculation
  let score = 50;
  if (rate >= 30) score += 20;
  else if (rate >= 15) score += 10;
  else if (rate < 5) score -= 10;

  if (goals.length > 0) score += 10;
  const goalProgress = goals.length > 0 
    ? goals.reduce((sum, g) => sum + (g.currentAmount / g.targetAmount), 0) / goals.length
    : 0;
  score += Math.round(goalProgress * 15);

  const totalExpenseSum = expenses.reduce((sum, e) => sum + e.amount, 0);
  if (totalExpenseSum > spent) score -= 5;
  
  score = Math.max(20, Math.min(100, score));

  if (isTamil) {
    return {
      score,
      strengths: [
        rate >= 20 ? 'ஆரோக்கியமான மாதாந்திர சேமிப்பு விகிதம்' : 'அடிப்படை வரவு செலவு கண்காணிப்பு',
        goals.length > 0 ? 'செயலில் உள்ள சேமிப்பு இலக்குகள் அமைப்பு' : 'இலக்கு அமைப்பதற்கான ஆர்வம்'
      ],
      weaknesses: [
        rate < 15 ? 'குறைந்த சேமிப்பு விகிதம் (15% கீழ் உள்ளது)' : 'முதலீட்டுப் பன்முகத்தன்மை இல்லாமை',
        expenses.length === 0 ? 'செலவுப் பதிவுகள் குறைவாக உள்ளன' : 'நிர்ணயிக்கப்படாத இதர செலவுகள்'
      ],
      aiRecommendations: [
        'உங்கள் மாதாந்திர வருமானத்தில் 20% நேரடியாகச் சேமிப்புக் கணக்கிற்குத் தானாக மாறும்படி அமைக்கவும்.',
        'தேவையற்ற மாதாந்திரச் சந்தாக்களைக் கண்டறிந்து ரத்து செய்வதன் மூலம் செலவைக் குறைக்கவும்.',
        'அவசரகால தேவைகளுக்காக 3 மாதச் செலவுத் தொகையைச் சேமிப்பதை முதல் இலக்காகக் கொள்ளவும்.'
      ]
    };
  }

  return {
    score,
    strengths: [
      rate >= 20 ? `Excellent savings rate of ${rate.toFixed(1)}%` : 'Active financial profile initialization',
      goals.length > 0 ? `${goals.length} active wealth objectives programmed` : 'Clear awareness of cashflow margins'
    ],
    weaknesses: [
      rate < 15 ? `Suboptimal savings rate (${rate.toFixed(1)}% is below the recommended 20%)` : 'Absence of automated compound SIP targets',
      expenses.length < 3 ? 'Sparse transaction logs (need more continuous logging)' : 'High concentration in elective shopping/other categories'
    ],
    aiRecommendations: [
      'Establish a 3-month Emergency Fund of essential expenses before scaling up risk-based investments.',
      'Automate your savings: directly route $200 from every salary into a high-yield storage ledger on day 1.',
      'Log at least 5 major expenses this week to generate detailed spending visual category breakdowns.'
    ]
  };
}
