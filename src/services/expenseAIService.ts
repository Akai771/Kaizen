import Perplexity from '@perplexity-ai/perplexity_ai';

// Initialize Perplexity client
const client = new Perplexity({
  apiKey: import.meta.env.VITE_PERPLEXITY_API_KEY
});

export interface ExpenseData {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
}

export interface GoalData {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}

export interface ExpenseAnalysisRequest {
  expenses: ExpenseData[];
  goals: GoalData[];
  month: string;
  totalSpent: number;
  categoryBreakdown: Record<string, number>;
  budget?: number | null; // Monthly budget (optional)
}

export interface ExpenseAnalysisResponse {
  summary: string;
  insights: string[];
  recommendations: string[];
  savingsPotential: number;
  budgetSuggestions: Record<string, number>;
}

/**
 * Analyze expenses using Perplexity's Sonar AI model
 * This provides intelligent insights and recommendations based on spending patterns
 */
export const analyzeExpensesWithAI = async (
  data: ExpenseAnalysisRequest
): Promise<ExpenseAnalysisResponse> => {
  try {
    const { expenses, goals, month, totalSpent, categoryBreakdown, budget } = data;

    // Calculate additional metrics
    const numTransactions = expenses.length;
    const avgTransaction = numTransactions > 0 ? totalSpent / numTransactions : 0;
    const categories = Object.keys(categoryBreakdown);
    const topCategory = Object.entries(categoryBreakdown).length > 0 
      ? Object.entries(categoryBreakdown).reduce((a, b) => b[1] > a[1] ? b : a)
      : ['None', 0];

    // Build comprehensive context for AI
    const expenseContext = `
User's Financial Data for ${month}:
- Total Expenses: ₹${totalSpent.toLocaleString('en-IN')}
- Number of Transactions: ${numTransactions}
- Average Transaction: ₹${avgTransaction.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
- Monthly Budget: ${budget !== null && budget !== undefined ? `₹${budget.toLocaleString('en-IN')}` : 'Not Set'}
- Budget Status: ${budget ? (totalSpent > budget ? `Over budget by ₹${(totalSpent - budget).toLocaleString('en-IN')}` : `Under budget by ₹${(budget - totalSpent).toLocaleString('en-IN')}`) : 'No budget set'}
- Categories: ${categories.length > 0 ? categories.join(', ') : 'None'}
- Top Spending Category: ${topCategory[0]} (₹${topCategory[1].toLocaleString('en-IN')})

Category Breakdown:
${Object.entries(categoryBreakdown).length > 0
  ? Object.entries(categoryBreakdown)
      .map(([cat, amount]) => `- ${cat}: ₹${amount.toLocaleString('en-IN')} (${((amount / totalSpent) * 100).toFixed(1)}%)`)
      .join('\n')
  : '- No expenses recorded yet'}

Financial Goals:
${goals.length > 0 
  ? goals.map(g => {
      const progress = ((g.currentAmount / g.targetAmount) * 100).toFixed(1);
      const remaining = g.targetAmount - g.currentAmount;
      return `- ${g.title}: ₹${g.currentAmount.toLocaleString('en-IN')} / ₹${g.targetAmount.toLocaleString('en-IN')} (${progress}% complete, ₹${remaining.toLocaleString('en-IN')} remaining) - Target: ${g.deadline}`;
    }).join('\n')
  : '- No active financial goals'}

Recent Expenses (Last 10):
${expenses.length > 0
  ? expenses.slice(0, 10).map(e => `- ${e.date}: ${e.category} - ${e.description} (₹${e.amount.toLocaleString('en-IN')})`).join('\n')
  : '- No expenses recorded yet'}

IMPORTANT: Analyze this data and provide:
1. Comprehensive spending pattern analysis
2. Specific insights about their financial behavior
3. Actionable recommendations to optimize spending
4. Budget recommendations if budget is not set, or advice on staying within budget if set
5. Strategies to achieve their financial goals
6. Potential savings opportunities

Format your response in markdown with clear sections, bullet points, and specific numbers from the data.`;

    const systemPrompt = `You are an expert personal financial advisor AI with deep expertise in budget management, expense optimization, and financial goal planning. 

Your task is to analyze the user's expense data comprehensively and provide:
- Clear, data-driven insights about spending patterns
- Specific, actionable recommendations with exact rupee amounts
- Practical strategies to reduce expenses and increase savings
- Goal-oriented advice to help achieve financial targets
- Budget optimization suggestions

Be encouraging, specific, and practical. Use the actual data provided to give personalized advice. Format your response in markdown with:
- Clear section headers (##, ###)
- Bullet points for lists
- Bold for important numbers and categories
- Specific rupee amounts and percentages from the data

Make it detailed, professional, and actionable.`;

    console.log('🤖 Calling Perplexity AI for expense analysis...');

    const response = await client.chat.completions.create({
      model: 'sonar-pro', // Perplexity's most advanced model
      messages: [
        { role: 'system', content: systemPrompt },
        { 
          role: 'user', 
          content: `Please analyze my expenses and provide detailed insights and recommendations:\n\n${expenseContext}` 
        }
      ],
      temperature: 0.7,
      max_tokens: 3000, // Increased for more detailed response
    });

    const aiResponse = response.choices[0].message.content;
    const responseText = typeof aiResponse === 'string' ? aiResponse : '';

    console.log('✅ AI analysis received from Perplexity');

    // Return the AI-generated analysis
    return {
      summary: responseText,
      insights: [], // AI response contains everything in summary
      recommendations: [],
      savingsPotential: calculateSavingsPotential(totalSpent, categoryBreakdown),
      budgetSuggestions: generateBudgetSuggestions(categoryBreakdown, totalSpent)
    };

  } catch (error) {
    console.error('❌ Error analyzing expenses with Perplexity AI:', error);
    console.log('📊 Falling back to local analysis...');
    
    // Fallback to local analysis if API fails
    return generateFallbackAnalysis(data);
  }
};

/**
 * Calculate potential savings based on spending patterns
 */
const calculateSavingsPotential = (
  _totalSpent: number,
  categoryBreakdown: Record<string, number>
): number => {
  // Identify discretionary spending categories
  const discretionaryCategories = ['Entertainment', 'Shopping', 'Dining Out', 'Other'];
  const discretionarySpending = discretionaryCategories.reduce(
    (sum, cat) => sum + (categoryBreakdown[cat] || 0),
    0
  );
  
  // Suggest saving 20% of discretionary spending
  return discretionarySpending * 0.2;
};

/**
 * Generate budget suggestions for each category
 */
const generateBudgetSuggestions = (
  categoryBreakdown: Record<string, number>,
  _totalSpent: number
): Record<string, number> => {
  const suggestions: Record<string, number> = {};
  
  // Essential categories should stay the same or slightly reduced
  const essentialCategories = ['Bills', 'Healthcare', 'Transportation'];
  
  // Discretionary categories can be reduced more
  const discretionaryCategories = ['Entertainment', 'Shopping', 'Dining Out'];
  
  for (const [category, amount] of Object.entries(categoryBreakdown)) {
    if (essentialCategories.includes(category)) {
      // 5% reduction for essentials
      suggestions[category] = amount * 0.95;
    } else if (discretionaryCategories.includes(category)) {
      // 20% reduction for discretionary
      suggestions[category] = amount * 0.8;
    } else {
      // 10% reduction for other categories
      suggestions[category] = amount * 0.9;
    }
  }
  
  return suggestions;
};

/**
 * Generate fallback analysis if AI is unavailable
 */
const generateFallbackAnalysis = (data: ExpenseAnalysisRequest): ExpenseAnalysisResponse => {
  const { totalSpent, categoryBreakdown, goals, month, expenses, budget } = data;
  
  console.log('🔍 Generating fallback analysis for:', {
    month,
    totalExpenses: expenses.length,
    totalSpent,
    budget,
    categories: Object.keys(categoryBreakdown)
  });
  
  // Handle case when no expenses exist
  if (Object.keys(categoryBreakdown).length === 0) {
    const summary = `## 📊 Financial Overview - ${month}

### No Expenses Yet

You haven't added any expenses for ${month} yet. Start tracking your spending to get personalized insights and recommendations!

**Get Started:**
1. Click "Add Expense" to record your first expense
2. Set a monthly budget to track your spending
3. Create financial goals to stay motivated
4. Come back here for AI-powered insights

---

💡 **Tip:** The more consistently you track expenses, the better insights you'll receive!`;

    return {
      summary,
      insights: ['Start tracking expenses to unlock personalized insights'],
      recommendations: ['Add your first expense to begin'],
      savingsPotential: 0,
      budgetSuggestions: {}
    };
  }
  
  const topCategory = Object.entries(categoryBreakdown).reduce((a, b) => 
    b[1] > a[1] ? b : a
  );
  
  const categoryCount = Object.keys(categoryBreakdown).length;
  const avgDaily = totalSpent / 30;
  const topCategoryPercent = ((topCategory[1] / totalSpent) * 100).toFixed(1);
  
  // Budget status
  const budgetStatus = budget 
    ? (totalSpent > budget 
        ? `⚠️ Over budget by ₹${(totalSpent - budget).toLocaleString('en-IN')} (${((totalSpent / budget - 1) * 100).toFixed(1)}%)`
        : `✅ Under budget by ₹${(budget - totalSpent).toLocaleString('en-IN')} (${((1 - totalSpent / budget) * 100).toFixed(1)}% remaining)`)
    : '⚡ No budget set - Consider setting one for better tracking';
  
  // Build a detailed, premium-looking summary
  const summary = `## 📊 Financial Overview - ${month}

### Quick Stats
- **Total Expenses:** ₹${totalSpent.toLocaleString('en-IN')}
- **Monthly Budget:** ${budget ? `₹${budget.toLocaleString('en-IN')}` : 'Not Set'}
- **Budget Status:** ${budgetStatus}
- **Daily Average:** ₹${avgDaily.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
- **Categories Tracked:** ${categoryCount}
- **Active Financial Goals:** ${goals.length}

---

### 💡 Key Insights

**1. Spending Distribution**
Your expenses are spread across ${categoryCount} different categories. Your largest expense category is **${topCategory[0]}** at ₹${topCategory[1].toLocaleString('en-IN')}, representing ${topCategoryPercent}% of your total monthly spending.

**2. Budget Performance**
${budget 
  ? (totalSpent > budget 
      ? `You've exceeded your monthly budget of ₹${budget.toLocaleString('en-IN')} by ₹${(totalSpent - budget).toLocaleString('en-IN')}. Focus on reducing discretionary spending in the remaining days.`
      : `Great job! You're ${((1 - totalSpent / budget) * 100).toFixed(1)}% under budget with ₹${(budget - totalSpent).toLocaleString('en-IN')} remaining. Consider allocating excess funds to your savings goals.`)
  : `Setting a monthly budget of around ₹${(totalSpent * 1.1).toLocaleString('en-IN', { maximumFractionDigits: 0 })} would help you track spending better and identify areas for optimization.`}

**3. Spending Behavior**
${categoryCount > 5 
  ? 'You maintain diverse spending habits across multiple categories, indicating good awareness of where your money goes.' 
  : 'Consider tracking more expense categories to gain better insights into your spending patterns.'}

**4. Goal Progress**
${goals.length > 0 
  ? `You're actively working towards ${goals.length} financial goal${goals.length !== 1 ? 's' : ''}. ${goals.map(g => `\n   - **${g.title}:** ₹${g.currentAmount.toLocaleString('en-IN')} / ₹${g.targetAmount.toLocaleString('en-IN')} (${((g.currentAmount / g.targetAmount) * 100).toFixed(1)}%)`).join('')}`
  : 'Consider setting specific financial goals to give your savings purpose and motivation.'}

---

### 🎯 Personalized Recommendations

**Immediate Actions (This Week)**
  ? 'You maintain diverse spending habits across multiple categories, indicating good awareness of where your money goes.' 
  : 'Consider tracking more expense categories to gain better insights into your spending patterns.'}

**3. Goal Progress**
${goals.length > 0 
  ? `You're actively working towards ${goals.length} financial goal${goals.length !== 1 ? 's' : ''}. ${goals.map(g => `\n   - **${g.title}:** ₹${g.currentAmount.toLocaleString('en-IN')} / ₹${g.targetAmount.toLocaleString('en-IN')} (${((g.currentAmount / g.targetAmount) * 100).toFixed(1)}%)`).join('')}`
  : 'Consider setting specific financial goals to give your savings purpose and motivation.'}

---

### 🎯 Personalized Recommendations

**Immediate Actions (This Week)**
1. **Review ${topCategory[0]} Expenses**
   - Target: Reduce by 15-20% (Save ₹${(topCategory[1] * 0.175).toLocaleString('en-IN', { maximumFractionDigits: 0 })})
   - Strategy: Identify unnecessary purchases or find cost-effective alternatives

2. **Set Category Limits**
   - Create spending caps for your top 3 expense categories
   - Use alerts to notify you when approaching limits

**Short-Term (This Month)**
3. **Optimize Recurring Expenses**
   - Review all subscriptions and memberships
   - Cancel unused services (potential savings: ₹${(totalSpent * 0.1).toLocaleString('en-IN', { maximumFractionDigits: 0 })})

4. **Implement the 50/30/20 Rule**
   - 50% for Needs: ₹${(totalSpent * 0.5).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
   - 30% for Wants: ₹${(totalSpent * 0.3).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
   - 20% for Savings: ₹${(totalSpent * 0.2).toLocaleString('en-IN', { maximumFractionDigits: 0 })}

**Long-Term (Next 3 Months)**
5. **Build an Emergency Fund**
   - Target: 3-6 months of expenses (₹${(totalSpent * 4).toLocaleString('en-IN', { maximumFractionDigits: 0 })})
   - Monthly contribution: ₹${(totalSpent * 0.2).toLocaleString('en-IN', { maximumFractionDigits: 0 })}

6. **Automate Your Savings**
   - Set up automatic transfers on payday
   - Use separate accounts for different goals

---

### 💰 Savings Potential

Based on your spending patterns, you could potentially save **₹${(totalSpent * 0.2).toLocaleString('en-IN', { maximumFractionDigits: 0 })}** per month by:
- Reducing discretionary spending by 20%
- Eliminating unnecessary subscriptions
- Finding better deals on regular expenses
- Cooking at home more often (if applicable)

**Annual Savings Projection:** ₹${(totalSpent * 0.2 * 12).toLocaleString('en-IN', { maximumFractionDigits: 0 })}

---

### 📈 Next Steps

✅ **Week 1:** Audit all expenses and identify waste
✅ **Week 2:** Set up category budgets and alerts
✅ **Week 3:** Automate savings transfers
✅ **Week 4:** Review progress and adjust strategy

*Keep tracking consistently for the best results! Small changes compound over time.* 🌟`;
  
  const insights = [
    `Your highest spending category is ${topCategory[0]} at ₹${topCategory[1].toLocaleString('en-IN')} (${topCategoryPercent}% of total)`,
    `Average daily spending of ₹${avgDaily.toLocaleString('en-IN', { maximumFractionDigits: 0 })} indicates ${avgDaily > 1000 ? 'opportunities for optimization' : 'relatively controlled spending'}`,
    `You have ${goals.length} active financial goal${goals.length !== 1 ? 's' : ''} ${goals.length > 0 ? 'driving your savings strategy' : '- consider setting some'}`,
    `Tracking ${categoryCount} categories ${categoryCount > 5 ? 'shows good financial awareness' : '- consider adding more for better insights'}`
  ];
  
  const recommendations = [
    `Set a monthly cap of ₹${(topCategory[1] * 0.85).toLocaleString('en-IN', { maximumFractionDigits: 0 })} for ${topCategory[0]} (15% reduction)`,
    'Review and optimize your top 3 spending categories this week',
    'Automate savings transfers immediately after receiving income',
    'Audit all subscription services and cancel unused ones',
    'Apply the 50/30/20 budgeting framework to balance spending and savings',
    'Set up spending alerts for major expense categories'
  ];
  
  return {
    summary,
    insights,
    recommendations,
    savingsPotential: calculateSavingsPotential(totalSpent, categoryBreakdown),
    budgetSuggestions: generateBudgetSuggestions(categoryBreakdown, totalSpent)
  };
};

/**
 * Get quick expense tip from AI
 */
export const getExpenseTip = async (category: string): Promise<string> => {
  try {
    const response = await client.chat.completions.create({
      model: 'sonar',
      messages: [
        { 
          role: 'user', 
          content: `Give me one practical tip to save money on ${category} expenses. Keep it under 50 words.` 
        }
      ],
      temperature: 0.7,
      max_tokens: 100,
    });

    const content = response.choices[0].message.content;
    return typeof content === 'string' ? content : 'Track your expenses regularly to identify savings opportunities.';
  } catch (error) {
    console.error('Error getting expense tip:', error);
    return 'Consider comparing prices and looking for deals before making purchases.';
  }
};
