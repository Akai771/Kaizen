import React, { useState, useMemo, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Plus, 
  Trash2, 
  TrendingUp, 
  DollarSign,
  Target,
  Calendar,
  PieChart,
  Sparkles,
  Wallet,
  TrendingDown,
  Loader2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  PieChart as RechartPieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { analyzeExpensesWithAI } from '@/services/expenseAIService';
import { 
  getExpenses, 
  addExpense, 
  deleteExpense,
  getCategories,
  getGoals,
  addGoal,
  deleteGoal,
  getBudget,
  upsertBudget,
  type Expense as ExpenseType,
  type ExpenseCategory,
  type FinancialGoal
} from '@/services/expenseService';
import { useAuth } from '@/context/auth-context';
import { toast } from 'sonner';

// Types
interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
}

interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}

// Theme-aware color palette
const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(221.2 83.2% 53.3%)', // blue
  'hsl(142.1 76.2% 36.3%)', // green
  'hsl(24.6 95% 53.1%)', // orange
];

const Expense: React.FC = () => {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(0); // 0 = current month, 1 = 1 month ago, etc.
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [budget, setBudget] = useState<number | null>(null); // Monthly budget in rupees (null if not set)
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dialog states
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [isSetBudgetOpen, setIsSetBudgetOpen] = useState(false);
  const [isAISummaryOpen, setIsAISummaryOpen] = useState(false);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // Form states
  const [newExpense, setNewExpense] = useState({
    category: '',
    amount: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  const [newGoal, setNewGoal] = useState({
    title: '',
    targetAmount: '',
    deadline: '',
  });

  const [budgetInput, setBudgetInput] = useState('50000');

  // Fetch data from Supabase
  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user?.id, selectedMonth]);

  const fetchData = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const targetDate = subMonths(new Date(), selectedMonth);
      const startDate = startOfMonth(targetDate);
      const endDate = endOfMonth(targetDate);

      // Fetch categories first
      const categoriesData = await getCategories();
      setCategories(categoriesData);

      // Fetch expenses for selected month
      const expensesData = await getExpenses(
        user.id,
        format(startDate, 'yyyy-MM-dd'),
        format(endDate, 'yyyy-MM-dd')
      );

      // Transform to component format
      const transformedExpenses: Expense[] = expensesData.map((exp: ExpenseType) => ({
        id: exp.id,
        category: exp.category?.name || 'Uncategorized',
        amount: exp.amount,
        description: exp.description,
        date: exp.expense_date,
      }));

      setExpenses(transformedExpenses);

      // Fetch goals
      const goalsData = await getGoals(user.id);
      const transformedGoals: Goal[] = goalsData.map((goal: FinancialGoal) => ({
        id: goal.id,
        title: goal.title,
        targetAmount: goal.target_amount,
        currentAmount: goal.current_amount,
        deadline: goal.deadline,
      }));
      setGoals(transformedGoals);

      // Fetch budget for selected month
      const monthKey = format(startOfMonth(targetDate), 'yyyy-MM-dd'); // First day of month
      const budgetData = await getBudget(user.id, monthKey);
      if (budgetData) {
        setBudget(budgetData.total_budget);
        setBudgetInput(budgetData.total_budget.toString());
      } else {
        setBudget(null); // No budget set for this month
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load expense data');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const byCategory = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>);

    const categoryData = Object.entries(byCategory).map(([name, value]) => ({
      name,
      value,
      percentage: ((value / total) * 100).toFixed(1),
    }));

    // Calculate daily spending for line chart
    const dailySpending = expenses.reduce((acc, exp) => {
      const day = format(new Date(exp.date), 'MMM dd');
      acc[day] = (acc[day] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>);

    const spendingTrend = Object.entries(dailySpending)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-14); // Last 14 days

    return {
      total,
      categoryData,
      spendingTrend,
      averageDaily: total / new Date().getDate(),
      highestCategory: categoryData.length > 0 ? categoryData.reduce((max, cat) => cat.value > max.value ? cat : max) : null,
    };
  }, [expenses]);

  // Handle month change
  const handleMonthChange = (offset: number) => {
    setSelectedMonth(offset);
  };

  // Add expense
  const handleAddExpense = async () => {
    if (!newExpense.category || !newExpense.amount || !newExpense.description || !user?.id) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      const categoryId = categories.find(cat => cat.name === newExpense.category)?.id;
      if (!categoryId) {
        toast.error('Please select a valid category');
        return;
      }

      const expenseData = await addExpense({
        user_id: user.id,
        category_id: categoryId,
        amount: parseFloat(newExpense.amount),
        description: newExpense.description,
        expense_date: newExpense.date,
      });

      // Add to local state
      setExpenses([
        {
          id: expenseData.id,
          category: expenseData.category?.name || 'Uncategorized',
          amount: expenseData.amount,
          description: expenseData.description,
          date: expenseData.expense_date,
        },
        ...expenses,
      ]);

      setIsAddExpenseOpen(false);
      setNewExpense({
        category: '',
        amount: '',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd'),
      });

      toast.success('Expense added successfully');
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('Failed to add expense');
    }
  };

  // Add goal
  const handleAddGoal = async () => {
    if (!newGoal.title || !newGoal.targetAmount || !newGoal.deadline || !user?.id) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      const goalData = await addGoal({
        user_id: user.id,
        title: newGoal.title,
        target_amount: parseFloat(newGoal.targetAmount),
        current_amount: 0,
        deadline: newGoal.deadline,
      });

      setGoals([
        ...goals,
        {
          id: goalData.id,
          title: goalData.title,
          targetAmount: goalData.target_amount,
          currentAmount: goalData.current_amount,
          deadline: goalData.deadline,
        },
      ]);

      setIsAddGoalOpen(false);
      setNewGoal({
        title: '',
        targetAmount: '',
        deadline: '',
      });

      toast.success('Goal created successfully');
    } catch (error) {
      console.error('Error adding goal:', error);
      toast.error('Failed to create goal');
    }
  };

  // Delete expense
  const handleDeleteExpense = async (id: string) => {
    if (!user?.id) return;

    try {
      await deleteExpense(id, user.id);
      setExpenses(expenses.filter(exp => exp.id !== id));
      toast.success('Expense deleted');
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Failed to delete expense');
    }
  };

  // Delete goal
  const handleDeleteGoal = async (id: string) => {
    if (!user?.id) return;

    try {
      await deleteGoal(id, user.id);
      setGoals(goals.filter(goal => goal.id !== id));
      toast.success('Goal deleted');
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal');
    }
  };

  // Set budget
  const handleSetBudget = async () => {
    const newBudget = parseFloat(budgetInput);
    if (!isNaN(newBudget) && newBudget > 0 && user?.id) {
      try {
        const targetDate = subMonths(new Date(), selectedMonth);
        const monthKey = format(startOfMonth(targetDate), 'yyyy-MM-dd'); // First day of month

        await upsertBudget({
          user_id: user.id,
          month: monthKey,
          total_budget: newBudget,
        });

        setBudget(newBudget);
        setIsSetBudgetOpen(false);
        toast.success('Budget updated successfully');
      } catch (error) {
        console.error('Error setting budget:', error);
        toast.error('Failed to update budget');
      }
    }
  };

  // Generate AI Summary
  const generateAISummary = async () => {
    setIsLoadingAI(true);
    setIsAISummaryOpen(true);

    try {
      const monthName = format(subMonths(new Date(), selectedMonth), 'MMMM yyyy');
      
      // Prepare category breakdown for AI
      const categoryBreakdown: Record<string, number> = {};
      stats.categoryData.forEach(cat => {
        categoryBreakdown[cat.name] = cat.value;
      });

      console.log('📊 Generating AI analysis with data:', {
        expenseCount: expenses.length,
        totalSpent: stats.total,
        budget: budget,
        categories: Object.keys(categoryBreakdown),
        goals: goals.length
      });

      // Call Perplexity AI for analysis with all data including budget and goals
      const analysisResult = await analyzeExpensesWithAI({
        expenses: expenses.map(exp => ({
          id: exp.id,
          category: exp.category,
          amount: exp.amount,
          description: exp.description,
          date: exp.date
        })),
        goals: goals.map(g => ({
          id: g.id,
          title: g.title,
          targetAmount: g.targetAmount,
          currentAmount: g.currentAmount,
          deadline: g.deadline
        })),
        month: monthName,
        totalSpent: stats.total,
        categoryBreakdown,
        budget: budget // Pass the current month's budget
      });

      // Use the summary directly from Perplexity AI
      setAiSummary(analysisResult.summary);
      
      console.log('✅ AI analysis generated successfully');
    } catch (error) {
      console.error('Error generating AI summary:', error);
      // Fallback to basic summary if analysis fails
      const monthName = format(subMonths(new Date(), selectedMonth), 'MMMM yyyy');
      setAiSummary(generateFallbackSummary(monthName));
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Fallback summary if AI fails
  const generateFallbackSummary = (monthName: string) => {
    const totalSpent = stats.total;
    const highestCat = stats.highestCategory;
    const categoryCount = stats.categoryData.length;
    const avgDaily = stats.averageDaily;

    return `## � Financial Overview - ${monthName}

### Quick Stats
- **Total Expenses:** ₹${totalSpent.toLocaleString('en-IN')}
- **Daily Average:** ₹${avgDaily.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
- **Categories Tracked:** ${categoryCount}
- **Active Financial Goals:** ${goals.length}

---

### 💡 Key Insights

**1. Spending Distribution**
Your expenses are spread across ${categoryCount} different categories. Your largest expense category is **${highestCat?.name}** at ₹${highestCat?.value.toLocaleString('en-IN')}, representing ${highestCat?.percentage}% of your total monthly spending.

**2. Spending Behavior**
${categoryCount > 5 
  ? 'You maintain diverse spending habits across multiple categories, indicating good awareness of where your money goes.' 
  : 'Consider tracking more expense categories to gain better insights into your spending patterns.'}

**3. Goal Progress**
${goals.length > 0 
  ? `You're actively working towards ${goals.length} financial goal${goals.length !== 1 ? 's' : ''}. ${goals.map(g => `\n   - **${g.title}:** ₹${g.currentAmount.toLocaleString('en-IN')} / ₹${g.targetAmount.toLocaleString('en-IN')} (${((g.currentAmount / g.targetAmount) * 100).toFixed(1)}%)`).join('')}`
  : 'Consider setting specific financial goals to give your savings purpose and motivation.'}

---

### 🎯 Personalized Recommendations

**Immediate Actions (This Week)**
1. **Review ${highestCat?.name} Expenses**
   - Target: Reduce by 15-20% (Save ₹${highestCat ? (highestCat.value * 0.175).toLocaleString('en-IN', { maximumFractionDigits: 0 }) : 0})
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
  };

  // Generate month options - only show current month and previous months with data
  const monthOptions = useMemo(() => {
    const options = [];
    const today = new Date();
    
    // Always add current month
    options.push({ value: 0, label: format(today, 'MMMM yyyy') });
    
    // Add previous months only if you want to view historical data
    // Uncomment below to show last 5 months as well:
    /*
    for (let i = 1; i <= 5; i++) {
      options.push({
        value: i,
        label: format(subMonths(today, i), 'MMMM yyyy')
      });
    }
    */
    
    return options;
  }, []);

  return (
    <div className="w-full flex flex-col h-full">
      {/* Header */}
      <header className="flex-shrink-0 h-16 border-b border-border/80 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">
            <span className="text-primary">Expense</span> Management
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={generateAISummary}>
            <Sparkles className="mr-2 h-4 w-4" />
            AI Insights
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading your expenses...</p>
            </div>
          </div>
        ) : (
          <div className="max-w-[1600px] mx-auto space-y-6">
          {/* Controls Section */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <select
                value={selectedMonth}
                onChange={(e) => handleMonthChange(parseInt(e.target.value))}
                className="bg-background border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {monthOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setIsSetBudgetOpen(true)}>
                <Wallet className="mr-2 h-4 w-4" />
                Set Budget
              </Button>
              <Button variant="outline" onClick={() => setIsAddGoalOpen(true)}>
                <Target className="mr-2 h-4 w-4" />
                Add Goal
              </Button>
              <Button onClick={() => setIsAddExpenseOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Expense
              </Button>
            </div>
          </div>

          {/* Budget Info Card - Show when no budget is set */}
          {budget === null && (
            <Card className="border-amber-500/50 bg-amber-500/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <Wallet className="h-6 w-6 text-amber-500" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Set Your Monthly Budget</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      You haven't set a budget for {format(subMonths(new Date(), selectedMonth), 'MMMM yyyy')} yet. 
                      Setting a budget helps you track your savings and stay on top of your expenses.
                    </p>
                    <Button onClick={() => setIsSetBudgetOpen(true)} size="sm">
                      <Wallet className="mr-2 h-4 w-4" />
                      Set Budget Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Budget Overview Card - Show when budget is set */}
          {budget !== null && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Monthly Budget</p>
                    <p className="text-2xl font-bold">₹{budget.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-sm text-muted-foreground">Total Expenses</p>
                    <p className={`text-2xl font-bold ${stats.total > budget ? 'text-red-500' : 'text-green-500'}`}>
                      ₹{stats.total.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-sm text-muted-foreground">
                      {stats.total > budget ? 'Over Budget' : 'Savings'}
                    </p>
                    <div className="flex items-center gap-2">
                      {stats.total > budget ? (
                        <>
                          <TrendingDown className="h-5 w-5 text-red-500" />
                          <p className="text-2xl font-bold text-red-500">
                            ₹{(stats.total - budget).toLocaleString('en-IN')}
                          </p>
                        </>
                      ) : (
                        <>
                          <TrendingUp className="h-5 w-5 text-green-500" />
                          <p className="text-2xl font-bold text-green-500">
                            ₹{(budget - stats.total).toLocaleString('en-IN')}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        stats.total > budget ? 'bg-red-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min((stats.total / budget) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabs for Table and Statistics */}
          <Tabs defaultValue="table" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="table">Expenses Table</TabsTrigger>
              <TabsTrigger value="statistics">Statistics</TabsTrigger>
            </TabsList>

            {/* Table Tab */}
            <TabsContent value="table" className="space-y-6">
              {/* 3-Column Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Expenses Table - 2 columns */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Expenses</CardTitle>
                      <CardDescription>All your expenses for the selected month</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[600px]">
                        <div className="relative">
                          <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-secondary sticky top-0">
                              <tr>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Category</th>
                                <th className="px-6 py-3">Description</th>
                                <th className="px-6 py-3 text-right">Amount</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {expenses.length === 0 ? (
                                <tr>
                                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                    No expenses recorded yet. Add your first expense!
                                  </td>
                                </tr>
                              ) : (
                                expenses.map((expense) => (
                                  <tr key={expense.id} className="border-b hover:bg-secondary/50">
                                    <td className="px-6 py-4">
                                      {format(new Date(expense.date), 'MMM dd, yyyy')}
                                    </td>
                                    <td className="px-6 py-4">
                                      <Badge variant="outline">
                                        {expense.category}
                                      </Badge>
                                    </td>
                                    <td className="px-6 py-4">{expense.description}</td>
                                    <td className="px-6 py-4 text-right font-semibold">
                                      ₹{expense.amount.toLocaleString('en-IN')}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteExpense(expense.id)}
                                      >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>

                {/* Goals Card - 1 column */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Financial Goals</CardTitle>
                      <CardDescription>Track your savings goals</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {goals.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No goals yet. Create your first financial goal!</p>
                          </div>
                        ) : (
                          goals.map((goal) => {
                            const progress = (goal.currentAmount / goal.targetAmount) * 100;
                            return (
                              <div key={goal.id} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <h3 className="font-semibold">{goal.title}</h3>
                                    <p className="text-sm text-muted-foreground">
                                      Target: ₹{goal.targetAmount.toLocaleString('en-IN')} by {format(new Date(goal.deadline), 'MMM dd, yyyy')}
                                    </p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteGoal(goal.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span>₹{goal.currentAmount.toLocaleString('en-IN')}</span>
                                    <span className="text-muted-foreground">{progress.toFixed(1)}%</span>
                                  </div>
                                  <div className="w-full bg-secondary rounded-full h-2">
                                    <div
                                      className="bg-primary h-2 rounded-full transition-all"
                                      style={{ width: `${Math.min(progress, 100)}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Total Expense Card */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center space-y-2">
                        <p className="text-sm text-muted-foreground">Total Expenses</p>
                        <p className={`text-3xl font-bold ${
                          budget !== null && stats.total > budget ? 'text-red-500' : budget !== null ? 'text-green-500' : 'text-foreground'
                        }`}>
                          ₹{stats.total.toLocaleString('en-IN')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {expenses.length} transactions this month
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Statistics Tab */}
            <TabsContent value="statistics" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₹{stats.total.toLocaleString('en-IN')}</div>
                    <p className="text-xs text-muted-foreground">
                      {expenses.length} transactions
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Daily</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₹{stats.averageDaily.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                    <p className="text-xs text-muted-foreground">Per day spending</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Top Category</CardTitle>
                    <PieChart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.highestCategory?.name || 'N/A'}</div>
                    <p className="text-xs text-muted-foreground">
                      ₹{stats.highestCategory?.value.toLocaleString('en-IN')} ({stats.highestCategory?.percentage}%)
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{goals.length}</div>
                    <p className="text-xs text-muted-foreground">
                      ₹{goals.reduce((sum, g) => sum + g.currentAmount, 0).toLocaleString('en-IN')} / ₹
                      {goals.reduce((sum, g) => sum + g.targetAmount, 0).toLocaleString('en-IN')}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Breakdown - Pie Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Spending by Category</CardTitle>
                    <CardDescription>Distribution of expenses across categories</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartPieChart>
                        <Pie
                          data={stats.categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percentage }) => `${name}: ${percentage}%`}
                          outerRadius={80}
                          fill="hsl(var(--primary))"
                          dataKey="value"
                        >
                          {stats.categoryData.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
                          contentStyle={{
                            backgroundColor: 'hsl(var(--popover))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px',
                            color: 'hsl(var(--popover-foreground))'
                          }}
                        />
                      </RechartPieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Category Bar Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Category Comparison</CardTitle>
                    <CardDescription>Expense amounts by category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={stats.categoryData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45} 
                          textAnchor="end" 
                          height={100}
                          stroke="hsl(var(--muted-foreground))"
                        />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip 
                          formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
                          contentStyle={{
                            backgroundColor: 'hsl(var(--popover))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px',
                            color: 'hsl(var(--popover-foreground))'
                          }}
                        />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                          {stats.categoryData.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Spending Trend - Line Chart */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Spending Trend</CardTitle>
                    <CardDescription>Daily spending over the last 2 weeks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={stats.spendingTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="date" 
                          stroke="hsl(var(--muted-foreground))"
                        />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip 
                          formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
                          contentStyle={{
                            backgroundColor: 'hsl(var(--popover))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px',
                            color: 'hsl(var(--popover-foreground))'
                          }}
                        />
                        <Legend 
                          wrapperStyle={{
                            color: 'hsl(var(--foreground))'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="amount" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        )}
      </div>

      {/* Set Budget Dialog */}
      <Dialog open={isSetBudgetOpen} onOpenChange={setIsSetBudgetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Monthly Budget</DialogTitle>
            <DialogDescription>Set your monthly expense budget in rupees</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Monthly Budget (₹)</Label>
              <Input
                id="budget"
                type="number"
                step="100"
                placeholder="50000"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSetBudgetOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSetBudget}>Set Budget</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Expense Dialog */}
      <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Expense</DialogTitle>
            <DialogDescription>Record a new expense transaction</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={newExpense.category}
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              >
                <option value="">Select category</option>
                {categories.length === 0 ? (
                  <option value="" disabled>No categories found - Please add categories in Supabase</option>
                ) : (
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))
                )}
              </select>
              {categories.length === 0 && (
                <p className="text-sm text-amber-500">
                  ⚠️ No categories available. Please add categories in your Supabase database first.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                step="1"
                placeholder="1000"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="What did you spend on?"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={newExpense.date}
                onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddExpenseOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddExpense}>Add Expense</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Goal Dialog */}
      <Dialog open={isAddGoalOpen} onOpenChange={setIsAddGoalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Financial Goal</DialogTitle>
            <DialogDescription>Set a new savings target</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="goalTitle">Goal Title</Label>
              <Input
                id="goalTitle"
                placeholder="e.g., Emergency Fund, Vacation"
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetAmount">Target Amount (₹)</Label>
              <Input
                id="targetAmount"
                type="number"
                step="100"
                placeholder="100000"
                value={newGoal.targetAmount}
                onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">Target Date</Label>
              <Input
                id="deadline"
                type="date"
                value={newGoal.deadline}
                onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddGoalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddGoal}>Create Goal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Summary Dialog */}
      <Dialog open={isAISummaryOpen} onOpenChange={setIsAISummaryOpen}>
        <DialogContent className="max-w-3xl h-[85vh] flex flex-col gap-0">
          <DialogHeader className="flex-shrink-0 pb-4">
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Expense Insights & Recommendations
            </DialogTitle>
            <DialogDescription>
              Powered by Perplexity Sonar Pro - Advanced AI financial analysis
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 min-h-0">
            <ScrollArea className="h-full">
              <div className="pr-4">
                {isLoadingAI ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="text-muted-foreground">Analyzing your expenses with AI...</p>
                    <p className="text-sm text-muted-foreground">This may take a few moments</p>
                  </div>
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-none pb-4">
                    <ReactMarkdown
                      components={{
                        h2: ({ ...props }) => <h2 className="text-2xl font-bold mt-6 mb-4 text-primary first:mt-0" {...props} />,
                        h3: ({ ...props }) => <h3 className="text-xl font-semibold mt-4 mb-3" {...props} />,
                        h4: ({ ...props }) => <h4 className="text-lg font-semibold mt-3 mb-2" {...props} />,
                        p: ({ ...props }) => <p className="mb-3 leading-relaxed" {...props} />,
                        ul: ({ ...props }) => <ul className="mb-4 space-y-2 list-disc" {...props} />,
                        ol: ({ ...props }) => <ol className="mb-4 space-y-2 list-decimal" {...props} />,
                        li: ({ ...props }) => <li className="ml-4" {...props} />,
                        strong: ({ ...props }) => <strong className="font-semibold text-foreground" {...props} />,
                        hr: ({ ...props }) => <hr className="my-6 border-border" {...props} />,
                        blockquote: ({ ...props }) => (
                          <blockquote className="border-l-4 border-primary pl-4 italic my-4" {...props} />
                        ),
                      }}
                    >
                      {aiSummary}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
          
          <DialogFooter className="flex-shrink-0 pt-4">
            <Button onClick={() => setIsAISummaryOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Expense;
