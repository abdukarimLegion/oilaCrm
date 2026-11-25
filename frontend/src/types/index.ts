export type Currency = 'UZS' | 'USD';
export type Language = 'uz_cyrl' | 'uz_latn' | 'ru' | 'en';
export type Theme = 'light' | 'dark';

export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  name_cyrl: string;
  name_latn: string;
  type: TransactionType;
  icon: string;
  color: string;
  monthlyBudget?: number;
  dailyBudget?: number;
  weeklyBudget?: number;
}

export interface CategoryLimitAlert {
  id: string;
  categoryId: string;
  categoryNameCyrl: string;
  categoryNameLatn: string;
  categoryIcon: string;
  categoryColor: string;
  period: 'daily' | 'weekly';
  spentAmount: number;
  limitAmount: number;
  percentExceeded: number;
  severity: 'warning' | 'danger';
  dateStr: string;
}

export interface Wallet {
  id: string;
  name_cyrl: string;
  name_latn: string;
  type: 'cash' | 'card' | 'bank' | 'savings';
  balance: number;
  currency: Currency;
  color: string;
}

export interface FamilyMember {
  id: string;
  name_cyrl: string;
  name_latn: string;
  role_cyrl: string;
  role_latn: string;
  avatarColor: string;
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number; // Stored in base currency UZS for ledger accounting
  type: TransactionType;
  categoryId: string;
  walletId: string;
  memberId: string;
  note: string;
  currency?: Currency; // Original entry currency
  originalAmount?: number; // Original entered amount
  tags?: string[]; // Custom transaction tags (e.g. #urgent, #shopping, #gift)
  isRecurring?: boolean;
  recurringItemId?: string;
}

export interface GoalContribution {
  id: string;
  date: string;
  amount: number;
  note?: string;
  walletId?: string;
  type?: 'deposit' | 'withdrawal';
}

export interface SavingsGoal {
  id: string;
  title_cyrl: string;
  title_latn: string;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number;
  targetDate: string; // YYYY-MM-DD
  category: string;
  icon: string;
  color: string;
  priority: 'low' | 'medium' | 'high';
  history: GoalContribution[];
  notes?: string;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  telegram?: string;
  whatsapp?: string;
  notes?: string;
  avatarColor: string;
}

export interface DebtPayment {
  id: string;
  date: string;
  amount: number;
  note?: string;
  targetType: 'wallet' | 'goal'; // Where collected money was directed
  targetId: string; // walletId or goalId
}

export interface Debt {
  id: string;
  contactId?: string;
  personName: string;
  phone: string;
  telegram?: string;
  whatsapp?: string;
  type: 'they_owe' | 'i_owe'; // they_owe: Мендан қарздорлар (ундирилиши керак), i_owe: Мен қарздорман (тўланиши керак)
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  givenDate: string;
  dueDate: string;
  status: 'active' | 'settled' | 'overdue';
  notes: string;
  sourceType: 'wallet' | 'goal'; // Which wallet/card or goal funded this debt
  sourceId: string; // walletId or goalId
  payments: DebtPayment[];
  settledDate?: string;
}

export interface RecurringItem {
  id: string;
  title: string;
  amount: number;
  type: 'expense' | 'income';
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  dueDayOfMonth: number; // 1 - 31
  categoryId: string;
  walletId: string;
  memberId: string;
  lastPaidDate?: string; // YYYY-MM-DD
  autoPost?: boolean; // Automatically post transaction to ledger on due date
  lastAutoPostedDate?: string; // YYYY-MM formatted string for last auto-post month
  isActive: boolean;
  notes?: string;
}

export type MainTabType = 'dashboard' | 'transactions' | 'goals' | 'debts' | 'analytics' | 'calendar' | 'budget';

export type PeriodFilter = 'today' | 'week' | 'month' | 'year' | 'all';

export interface SimulationParams {
  incomeDeltaPercent: number; // e.g. +10%
  discretionaryCutPercent: number; // e.g. -20%
  additionalSavingsPerMonth: number; // in UZS
}

export interface BudgetLimitSettings {
  monthlyLimit: number; // in UZS
  alertAt80: boolean;
  alertAt100: boolean;
}
