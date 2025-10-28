import { supabase } from '@/hooks/supabaseClient';

export interface Expense {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  description: string;
  expense_date: string;
  created_at?: string;
  category?: {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
  };
}

export interface ExpenseCategory {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  is_default: boolean;
}

export interface FinancialGoal {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  status: string;
  created_at?: string;
}

export interface Budget {
  id: string;
  user_id: string;
  month: string;
  total_budget: number;
  created_at?: string;
}

// ============= EXPENSE OPERATIONS =============

export const getExpenses = async (userId: string, startDate?: string, endDate?: string) => {
  try {
    let query = supabase
      .from('expenses')
      .select(`
        *,
        expense_categories!category_id(id, name, icon, color)
      `)
      .eq('user_id', userId)
      .order('expense_date', { ascending: false });

    if (startDate && endDate) {
      query = query
        .gte('expense_date', startDate)
        .lte('expense_date', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;
    
    // Transform the data to match our interface
    return ((data || []) as any[]).map((expense: any) => ({
      ...expense,
      category: expense.expense_categories
    })) as Expense[];
  } catch (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }
};

export const addExpense = async (expense: {
  user_id: string;
  category_id: string;
  amount: number;
  description: string;
  expense_date: string;
}) => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .insert([expense] as any)
      .select(`
        *,
        expense_categories!category_id(id, name, icon, color)
      `)
      .single();

    if (error) throw error;
    
    // Transform the data
    const result: any = data;
    return {
      ...result,
      category: result.expense_categories
    } as Expense;
  } catch (error) {
    console.error('Error adding expense:', error);
    throw error;
  }
};

export const deleteExpense = async (expenseId: string, userId: string) => {
  try {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
};

// ============= CATEGORY OPERATIONS =============

export const getCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('expense_categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data as ExpenseCategory[];
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const addCategory = async (category: {
  name: string;
  icon?: string;
  color?: string;
}) => {
  try {
    const { data, error } = await supabase
      .from('expense_categories')
      .insert([category] as any)
      .select()
      .single();

    if (error) throw error;
    return data as ExpenseCategory;
  } catch (error) {
    console.error('Error adding category:', error);
    throw error;
  }
};

// ============= GOAL OPERATIONS =============

export const getGoals = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('financial_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as FinancialGoal[];
  } catch (error) {
    console.error('Error fetching goals:', error);
    throw error;
  }
};

export const addGoal = async (goal: {
  user_id: string;
  title: string;
  target_amount: number;
  current_amount?: number;
  deadline: string;
}) => {
  try {
    const { data, error } = await supabase
      .from('financial_goals')
      .insert([{ ...goal, current_amount: goal.current_amount || 0 }] as any)
      .select()
      .single();

    if (error) throw error;
    return data as FinancialGoal;
  } catch (error) {
    console.error('Error adding goal:', error);
    throw error;
  }
};

export const deleteGoal = async (goalId: string, userId: string) => {
  try {
    const { error } = await supabase
      .from('financial_goals')
      .delete()
      .eq('id', goalId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting goal:', error);
    throw error;
  }
};

// ============= BUDGET OPERATIONS =============

export const getBudget = async (userId: string, month: string) => {
  try {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .eq('month', month)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data as Budget | null;
  } catch (error) {
    console.error('Error fetching budget:', error);
    throw error;
  }
};

export const upsertBudget = async (budget: {
  user_id: string;
  month: string;
  total_budget: number;
}) => {
  try {
    // First, try to check if budget exists
    const { data: existing } = await supabase
      .from('budgets')
      .select('id')
      .eq('user_id', budget.user_id)
      .eq('month', budget.month)
      .single();

    if (existing) {
      // Update existing budget
      const { data, error } = await (supabase as any)
        .from('budgets')
        .update({ total_budget: budget.total_budget, updated_at: new Date().toISOString() })
        .eq('user_id', budget.user_id)
        .eq('month', budget.month)
        .select()
        .single();

      if (error) throw error;
      return data as Budget;
    } else {
      // Insert new budget
      const { data, error } = await supabase
        .from('budgets')
        .insert([budget] as any)
        .select()
        .single();

      if (error) throw error;
      return data as Budget;
    }
  } catch (error) {
    console.error('Error upserting budget:', error);
    throw error;
  }
};

// ============= STATISTICS =============

export const getCategoryBreakdown = async (userId: string, startDate: string, endDate: string) => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select(`
        amount,
        category:expense_categories(name)
      `)
      .eq('user_id', userId)
      .gte('expense_date', startDate)
      .lte('expense_date', endDate);

    if (error) throw error;

    // Aggregate by category
    const breakdown = (data as any[]).reduce((acc, expense) => {
      const categoryName = expense.category?.name || 'Uncategorized';
      acc[categoryName] = (acc[categoryName] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(breakdown).map(([name, value]) => ({
      name,
      value,
    }));
  } catch (error) {
    console.error('Error fetching category breakdown:', error);
    throw error;
  }
};
