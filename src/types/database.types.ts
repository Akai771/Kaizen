// Database Types matching Supabase schema

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      task_lists: {
        Row: TaskList;
        Insert: TaskListInsert;
        Update: TaskListUpdate;
      };
      tasks: {
        Row: Task;
        Insert: TaskInsert;
        Update: TaskUpdate;
      };
      expenses: {
        Row: ExpenseRow;
        Insert: ExpenseInsert;
        Update: ExpenseUpdate;
      };
      expense_categories: {
        Row: ExpenseCategoryRow;
        Insert: ExpenseCategoryInsert;
        Update: ExpenseCategoryUpdate;
      };
      financial_goals: {
        Row: FinancialGoalRow;
        Insert: FinancialGoalInsert;
        Update: FinancialGoalUpdate;
      };
      budgets: {
        Row: BudgetRow;
        Insert: BudgetInsert;
        Update: BudgetUpdate;
      };
      recurring_expenses: {
        Row: RecurringExpenseRow;
        Insert: RecurringExpenseInsert;
        Update: RecurringExpenseUpdate;
      };
      goal_transactions: {
        Row: GoalTransactionRow;
        Insert: GoalTransactionInsert;
        Update: GoalTransactionUpdate;
      };
      expense_attachments: {
        Row: ExpenseAttachmentRow;
        Insert: ExpenseAttachmentInsert;
        Update: ExpenseAttachmentUpdate;
      };
    };
  };
}

// Profile Types
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface ProfileInsert {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string | null;
}

export interface ProfileUpdate {
  email?: string;
  full_name?: string;
  avatar_url?: string | null;
  updated_at?: string | null;
}

// TaskList Types
export interface TaskList {
  id: string;
  user_id: string;
  name: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface TaskListInsert {
  user_id: string;
  name: string;
  position?: number;
}

export interface TaskListUpdate {
  name?: string;
  position?: number;
  updated_at?: string;
}

// Task Types
export interface Task {
  id: string;
  list_id: string;
  user_id: string;
  title: string;
  description: string | null;
  completed: boolean;
  position: number;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskInsert {
  list_id: string;
  user_id: string;
  title: string;
  description?: string | null;
  completed?: boolean;
  position?: number;
  due_date?: string | null;
}

export interface TaskUpdate {
  title?: string;
  description?: string | null;
  completed?: boolean;
  position?: number;
  due_date?: string | null;
  list_id?: string;
  updated_at?: string;
}

// Expense Types
export interface ExpenseRow {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  description: string;
  expense_date: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseInsert {
  user_id: string;
  category_id: string;
  amount: number;
  description: string;
  expense_date: string;
}

export interface ExpenseUpdate {
  category_id?: string;
  amount?: number;
  description?: string;
  expense_date?: string;
  updated_at?: string;
}

// Expense Category Types
export interface ExpenseCategoryRow {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  is_default: boolean;
  created_at: string;
}

export interface ExpenseCategoryInsert {
  name: string;
  icon?: string | null;
  color?: string | null;
  is_default?: boolean;
}

export interface ExpenseCategoryUpdate {
  name?: string;
  icon?: string | null;
  color?: string | null;
}

// Financial Goal Types
export interface FinancialGoalRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  target_amount: number;
  current_amount: number;
  deadline: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface FinancialGoalInsert {
  user_id: string;
  title: string;
  description?: string | null;
  target_amount: number;
  current_amount?: number;
  deadline: string;
  status?: string;
}

export interface FinancialGoalUpdate {
  title?: string;
  description?: string | null;
  target_amount?: number;
  current_amount?: number;
  deadline?: string;
  status?: string;
  updated_at?: string;
}

// Budget Types
export interface BudgetRow {
  id: string;
  user_id: string;
  month: string;
  total_budget: number;
  created_at: string;
  updated_at: string;
}

export interface BudgetInsert {
  user_id: string;
  month: string;
  total_budget: number;
}

export interface BudgetUpdate {
  total_budget?: number;
  updated_at?: string;
}

// Recurring Expense Types
export interface RecurringExpenseRow {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  description: string;
  frequency: string;
  start_date: string;
  end_date: string | null;
  last_processed: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RecurringExpenseInsert {
  user_id: string;
  category_id: string;
  amount: number;
  description: string;
  frequency: string;
  start_date: string;
  end_date?: string | null;
  is_active?: boolean;
}

export interface RecurringExpenseUpdate {
  category_id?: string;
  amount?: number;
  description?: string;
  frequency?: string;
  start_date?: string;
  end_date?: string | null;
  is_active?: boolean;
  updated_at?: string;
}

// Goal Transaction Types
export interface GoalTransactionRow {
  id: string;
  goal_id: string;
  user_id: string;
  amount: number;
  transaction_type: string;
  transaction_date: string;
  notes: string | null;
  created_at: string;
}

export interface GoalTransactionInsert {
  goal_id: string;
  user_id: string;
  amount: number;
  transaction_type: string;
  transaction_date: string;
  notes?: string | null;
}

export interface GoalTransactionUpdate {
  amount?: number;
  transaction_type?: string;
  transaction_date?: string;
  notes?: string | null;
}

// Expense Attachment Types
export interface ExpenseAttachmentRow {
  id: string;
  expense_id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  created_at: string;
}

export interface ExpenseAttachmentInsert {
  expense_id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
}

export interface ExpenseAttachmentUpdate {
  file_name?: string;
}
