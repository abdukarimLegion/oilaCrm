import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Currency,
  Language,
  Category,
  CategoryLimitAlert,
  Wallet,
  FamilyMember,
  Transaction,
  SavingsGoal,
  Debt,
  Contact,
  RecurringItem,
  MainTabType,
  PeriodFilter,
  BudgetLimitSettings,
  Theme,
} from '../types';
import { DEFAULT_MONTHLY_BUDGET_LIMIT } from '../constants/initialData';
import { CURRENT_DATE_STR, getDueStatus, getRecurringStatus, LiveExchangeRates, DEFAULT_LIVE_RATES } from '../utils/formatters';
import * as api from '../services/api';
import { changeI18nLanguage } from '../utils/i18n';

interface AppContextType {
  // Data
  categories: Category[];
  wallets: Wallet[];
  members: FamilyMember[];
  transactions: Transaction[];
  goals: SavingsGoal[];
  debts: Debt[];
  contacts: Contact[];
  recurringItems: RecurringItem[];
  isLoaded: boolean;

  // Settings & Live Rates
  currency: Currency;
  setCurrency: (c: Currency) => void;
  language: Language;
  setLanguage: (l: Language) => void;
  exchangeRate: number;
  setExchangeRate: (rate: number) => void;
  liveRates: LiveExchangeRates;
  isFetchingRates: boolean;
  ratesLastUpdated: string;
  refreshLiveRates: () => Promise<void>;
  periodFilter: PeriodFilter;
  setPeriodFilter: (p: PeriodFilter) => void;
  activeTab: MainTabType;
  setActiveTab: (t: MainTabType) => void;
  selectedTagFilter: string | null;
  setSelectedTagFilter: (tag: string | null) => void;
  allTags: Array<{ tag: string; count: number }>;
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;

  // Monthly Budget Limit & Alerts
  monthlyBudgetLimit: number;
  setMonthlyBudgetLimit: (limit: number) => void;
  budgetAlertSettings: BudgetLimitSettings;
  setBudgetAlertSettings: React.Dispatch<React.SetStateAction<BudgetLimitSettings>>;
  isBudget80Alert: boolean;
  isBudget100Alert: boolean;
  budgetUsagePercent: number;

  // Transaction Actions
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
  editTransaction: (id: string, tx: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  // Recurring Items Actions
  addRecurringItem: (item: Omit<RecurringItem, 'id' | 'lastPaidDate'>) => Promise<void>;
  editRecurringItem: (id: string, item: Partial<RecurringItem>) => Promise<void>;
  deleteRecurringItem: (id: string) => Promise<void>;
  payRecurringItem: (id: string, date?: string) => Promise<void>;
  urgentRecurringCount: number;

  // Goal Actions
  addGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount' | 'history'>) => Promise<void>;
  editGoal: (id: string, goal: Partial<SavingsGoal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  contributeToGoal: (goalId: string, amount: number, walletId?: string, note?: string) => Promise<void>;
  withdrawFromGoal: (goalId: string, amount: number, walletId?: string, note?: string) => Promise<void>;

  // Debt Actions with Financial Source/Destination Linking
  addDebt: (debt: Omit<Debt, 'id' | 'paidAmount' | 'remainingAmount' | 'status' | 'payments'>) => Promise<void>;
  editDebt: (id: string, debt: Partial<Debt>) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;
  settleDebt: (id: string, targetType?: 'wallet' | 'goal', targetId?: string) => Promise<void>;
  addPartialDebtPayment: (debtId: string, amount: number, targetType: 'wallet' | 'goal', targetId: string, note?: string) => Promise<void>;

  // Contacts
  addContact: (contact: Omit<Contact, 'id'>) => Promise<Contact>;
  editContact: (id: string, contact: Partial<Contact>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;

  // Wallets
  addWallet: (wallet: Omit<Wallet, 'id'>) => Promise<void>;
  editWallet: (id: string, wallet: Partial<Wallet>) => Promise<void>;

  // Modals state helper
  openAddTxModal: () => void;
  closeAddTxModal: () => void;
  isAddTxModalOpen: boolean;

  openReceiptScanner: () => void;
  closeReceiptScanner: () => void;
  isReceiptScannerOpen: boolean;

  openAddGoalModal: () => void;
  closeAddGoalModal: () => void;
  isAddGoalModalOpen: boolean;

  openAddDebtModal: () => void;
  closeAddDebtModal: () => void;
  isAddDebtModalOpen: boolean;

  openWalletsModal: () => void;
  closeWalletsModal: () => void;
  isWalletsModalOpen: boolean;

  // Category Budget Limits & Notifications
  categoryLimitAlerts: CategoryLimitAlert[];
  updateCategoryBudgets: (categoryId: string, daily?: number, weekly?: number, monthly?: number) => Promise<void>;
  activeLimitToast: CategoryLimitAlert | null;
  clearLimitToast: () => void;

  openNotificationsModal: () => void;
  closeNotificationsModal: () => void;
  isNotificationsModalOpen: boolean;

  openCategoryLimitsModal: () => void;
  closeCategoryLimitsModal: () => void;
  isCategoryLimitsModalOpen: boolean;

  // Alerts
  urgentDebtsCount: number;
  totalUrgentAlertsCount: number;
  resetToSampleData: () => Promise<void>;

  // 2026 Interactive Presentation Mode
  isPresentationOpen: boolean;
  openPresentation: () => void;
  closePresentation: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();

  // ---- Bootstrap query: barcha domen ma'lumotlari Server'dan ----
  const bootstrapQuery = useQuery({
    queryKey: ['bootstrap'],
    queryFn: api.bootstrap,
    staleTime: 15_000,
  });

  const categories = bootstrapQuery.data?.categories ?? [];
  const wallets = bootstrapQuery.data?.wallets ?? [];
  const members = bootstrapQuery.data?.members ?? [];
  const transactions = bootstrapQuery.data?.transactions ?? [];
  const goals = bootstrapQuery.data?.goals ?? [];
  const debts = bootstrapQuery.data?.debts ?? [];
  const contacts = bootstrapQuery.data?.contacts ?? [];
  const recurringItems = bootstrapQuery.data?.recurringItems ?? [];
  const isLoaded = bootstrapQuery.isSuccess;

  const refetch = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['bootstrap'] });
  }, [queryClient]);

  // ---- Persisted local UI settings ----
  const [currency, setCurrencyState] = useState<Currency>(() => {
    return (localStorage.getItem('oilaviy_currency') as Currency) || 'UZS';
  });

  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('oilaviy_lang') as Language) || 'uz_cyrl';
  });

  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('oilaviy_theme') as Theme) || 'light';
  });

  const [exchangeRate, setExchangeRate] = useState<number>(() => {
    const persisted = localStorage.getItem('oilaviy_exchange_rate');
    return persisted ? Number(persisted) : DEFAULT_RATE;
  });
  const [liveRates, setLiveRates] = useState<LiveExchangeRates>(() => {
    const saved = localStorage.getItem('oilaviy_live_rates');
    return saved ? JSON.parse(saved) : DEFAULT_LIVE_RATES;
  });
  const [isFetchingRates, setIsFetchingRates] = useState(false);
  const [ratesLastUpdated, setRatesLastUpdated] = useState<string>(() => {
    return localStorage.getItem('oilaviy_rates_updated') || 'МБ (CBU) курси';
  });

  // Bootstrap'dan kursni olib, shu bilan sinxronlaymiz (bir marta)
  const bootSettings = bootstrapQuery.data?.settings;
  useEffect(() => {
    if (bootSettings) {
      setExchangeRate((prev) => {
        const persisted = localStorage.getItem('oilaviy_exchange_rate');
        return persisted ? Number(persisted) : bootSettings.exchangeRate;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bootSettings?.exchangeRate]);

  // Backend'ga kursni saqlash (debounce'siz, sekin uchraydi)
  const persistExchangeRate = useCallback((rate: number) => {
    setExchangeRate(rate);
    localStorage.setItem('oilaviy_exchange_rate', String(rate));
    api.settings.update({ exchangeRate: rate }).catch(() => undefined);
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem('oilaviy_currency', c);
  };

  const setLanguage = (l: Language) => {
    setLanguageState(l);
    localStorage.setItem('oilaviy_lang', l);
    changeI18nLanguage(l);
  };

  useEffect(() => {
    changeI18nLanguage(language);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  useEffect(() => {
    localStorage.setItem('oilaviy_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const refreshLiveRates = async () => {
    setIsFetchingRates(true);
    try {
      const data = await api.rates.get();
      const newRates: LiveExchangeRates = {
        USD: data.USD || liveRates.USD,
        EUR: data.EUR || liveRates.EUR,
        RUB: data.RUB || liveRates.RUB,
      };
      setLiveRates(newRates);
      persistExchangeRate(newRates.USD);
      const timeNow = new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
      const updatedStr = data.source === 'cbu'
        ? `МБ (CBU) курси - бугун, ${timeNow}`
        : `Жонли курс - ${timeNow}`;
      setRatesLastUpdated(updatedStr);
      localStorage.setItem('oilaviy_live_rates', JSON.stringify(newRates));
      localStorage.setItem('oilaviy_rates_updated', updatedStr);
    } catch (e) {
      console.warn('Rate fetch error:', e);
    } finally {
      setIsFetchingRates(false);
    }
  };

  useEffect(() => {
    refreshLiveRates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('month');
  const [activeTab, setActiveTab] = useState<MainTabType>('dashboard');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);

  // Compute unique list of tags and their counts from transactions
  const allTags = useMemo(() => {
    const map = new Map<string, number>();
    transactions.forEach((tx) => {
      if (tx.tags && Array.isArray(tx.tags)) {
        tx.tags.forEach((rawTag) => {
          const tag = rawTag.startsWith('#') ? rawTag : `#${rawTag}`;
          map.set(tag, (map.get(tag) || 0) + 1);
        });
      }
    });
    ['#urgent', '#shopping', '#gift', '#family', '#groceries', '#work'].forEach((preset) => {
      if (!map.has(preset)) map.set(preset, 0);
    });
    return Array.from(map.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }, [transactions]);

  // Monthly Budget Limit & Alert Settings (backend bilan sinxron)
  const [monthlyBudgetLimit, setMonthlyBudgetLimitState] = useState<number>(() => {
    const saved = localStorage.getItem('oilaviy_budget_limit');
    return saved ? JSON.parse(saved) : DEFAULT_MONTHLY_BUDGET_LIMIT;
  });
  const [budgetAlertSettings, setBudgetAlertSettings] = useState<BudgetLimitSettings>(() => {
    const saved = localStorage.getItem('oilaviy_budget_alert_settings');
    return saved ? JSON.parse(saved) : { monthlyLimit: DEFAULT_MONTHLY_BUDGET_LIMIT, alertAt80: true, alertAt100: true };
  });

  useEffect(() => {
    if (bootSettings) {
      setMonthlyBudgetLimitState(bootSettings.monthlyBudgetLimit);
      setBudgetAlertSettings({
        monthlyLimit: bootSettings.monthlyBudgetLimit,
        alertAt80: bootSettings.alertAt80,
        alertAt100: bootSettings.alertAt100,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bootSettings?.monthlyBudgetLimit]);

  const setMonthlyBudgetLimit = (limit: number) => {
    setMonthlyBudgetLimitState(limit);
    api.settings.update({ monthlyBudgetLimit: limit }).catch(() => undefined);
  };

  const updateBudgetAlertSettings: React.Dispatch<React.SetStateAction<BudgetLimitSettings>> = (updater) => {
    setBudgetAlertSettings((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      api.settings
        .update({
          monthlyBudgetLimit: next.monthlyLimit,
          alertAt80: next.alertAt80,
          alertAt100: next.alertAt100,
        })
        .catch(() => undefined);
      return next;
    });
  };

  // Modals
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [isReceiptScannerOpen, setIsReceiptScannerOpen] = useState(false);
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [isAddDebtModalOpen, setIsAddDebtModalOpen] = useState(false);
  const [isWalletsModalOpen, setIsWalletsModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isCategoryLimitsModalOpen, setIsCategoryLimitsModalOpen] = useState(false);
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);

  // Active floating toast notification
  const [activeLimitToast, setActiveLimitToast] = useState<CategoryLimitAlert | null>(null);

  // ---- Category limit alerts (frontend hisob-kitobi) ----
  const categoryLimitAlerts = useMemo<CategoryLimitAlert[]>(() => {
    const alerts: CategoryLimitAlert[] = [];

    categories.filter((c) => c.type === 'expense').forEach((cat) => {
      const dailySpent = transactions
        .filter((t) => t.type === 'expense' && t.categoryId === cat.id && t.date === CURRENT_DATE_STR)
        .reduce((sum, t) => sum + t.amount, 0);

      const dailyLimit = cat.dailyBudget || (cat.monthlyBudget ? Math.round(cat.monthlyBudget / 30) : 250000);

      if (dailySpent > 0 && dailyLimit > 0) {
        const percent = Math.round((dailySpent / dailyLimit) * 100);
        if (percent >= 80) {
          alerts.push({
            id: `alert_daily_${cat.id}`,
            categoryId: cat.id,
            categoryNameCyrl: cat.name_cyrl,
            categoryNameLatn: cat.name_latn,
            categoryIcon: cat.icon,
            categoryColor: cat.color,
            period: 'daily',
            spentAmount: dailySpent,
            limitAmount: dailyLimit,
            percentExceeded: percent,
            severity: percent >= 100 ? 'danger' : 'warning',
            dateStr: CURRENT_DATE_STR,
          });
        }
      }

      const refDate = new Date(CURRENT_DATE_STR + 'T00:00:00');
      const sevenDaysAgo = new Date(refDate);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

      const weeklySpent = transactions
        .filter((t) => t.type === 'expense' && t.categoryId === cat.id && t.date >= sevenDaysAgoStr && t.date <= CURRENT_DATE_STR)
        .reduce((sum, t) => sum + t.amount, 0);

      const weeklyLimit = cat.weeklyBudget || (cat.monthlyBudget ? Math.round(cat.monthlyBudget / 4) : 1100000);

      if (weeklySpent > 0 && weeklyLimit > 0) {
        const percent = Math.round((weeklySpent / weeklyLimit) * 100);
        if (percent >= 80) {
          alerts.push({
            id: `alert_weekly_${cat.id}`,
            categoryId: cat.id,
            categoryNameCyrl: cat.name_cyrl,
            categoryNameLatn: cat.name_latn,
            categoryIcon: cat.icon,
            categoryColor: cat.color,
            period: 'weekly',
            spentAmount: weeklySpent,
            limitAmount: weeklyLimit,
            percentExceeded: percent,
            severity: percent >= 100 ? 'danger' : 'warning',
            dateStr: CURRENT_DATE_STR,
          });
        }
      }
    });

    return alerts;
  }, [categories, transactions]);

  // ---- Mutations ----

  const addTransaction = async (tx: Omit<Transaction, 'id'>) => {
    try {
      await api.transactions.create({
        date: tx.date,
        amount: tx.amount,
        type: tx.type,
        categoryId: tx.categoryId,
        walletId: tx.walletId,
        memberId: tx.memberId,
        note: tx.note,
        currency: tx.currency,
        originalAmount: tx.originalAmount,
        tags: tx.tags || [],
        isRecurring: tx.isRecurring || false,
        recurringItemId: tx.recurringItemId,
      });
      await refetch();
      checkDailyLimitAfterAdd(tx);
    } catch (e) {
      console.warn('addTransaction error', e);
    }
  };

  const editTransaction = async (id: string, updated: Partial<Transaction>) => {
    await api.transactions.update(id, updated);
    await refetch();
  };

  const deleteTransaction = async (id: string) => {
    await api.transactions.remove(id);
    await refetch();
  };

  const addRecurringItem = async (item: Omit<RecurringItem, 'id' | 'lastPaidDate'>) => {
    await api.recurring.create(item);
    await refetch();
  };

  const editRecurringItem = async (id: string, updated: Partial<RecurringItem>) => {
    await api.recurring.update(id, updated);
    await refetch();
  };

  const deleteRecurringItem = async (id: string) => {
    await api.recurring.remove(id);
    await refetch();
  };

  const payRecurringItem = async (id: string, date?: string) => {
    await api.recurring.pay(id, date);
    await refetch();
    confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
  };

  const addGoal = async (goal: Omit<SavingsGoal, 'id' | 'currentAmount' | 'history'>) => {
    await api.goals.create(goal);
    await refetch();
  };

  const editGoal = async (id: string, updated: Partial<SavingsGoal>) => {
    await api.goals.update(id, updated);
    await refetch();
  };

  const deleteGoal = async (id: string) => {
    await api.goals.remove(id);
    await refetch();
  };

  const contributeToGoal = async (goalId: string, amount: number, walletId?: string, note?: string) => {
    const goal = goals.find((g) => g.id === goalId);
    await api.goals.contribute(goalId, {
      amount,
      walletId,
      note,
      type: 'deposit',
    });
    await refetch();
    if (goal && goal.currentAmount + amount >= goal.targetAmount) {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }
  };

  const withdrawFromGoal = async (goalId: string, amount: number, walletId?: string, note?: string) => {
    await api.goals.contribute(goalId, {
      amount,
      walletId,
      note,
      type: 'withdrawal',
    });
    await refetch();
  };

  const addDebt = async (debt: Omit<Debt, 'id' | 'paidAmount' | 'remainingAmount' | 'status' | 'payments'>) => {
    await api.debts.create(debt);
    await refetch();
  };

  const editDebt = async (id: string, updated: Partial<Debt>) => {
    await api.debts.update(id, updated);
    await refetch();
  };

  const deleteDebt = async (id: string) => {
    await api.debts.remove(id);
    await refetch();
  };

  const settleDebt = async (id: string, targetType?: 'wallet' | 'goal', targetId?: string) => {
    await api.debts.settle(id, { targetType, targetId });
    await refetch();
    confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
  };

  const addPartialDebtPayment = async (
    debtId: string,
    amount: number,
    targetType: 'wallet' | 'goal',
    targetId: string,
    note?: string
  ) => {
    await api.debts.payPartial(debtId, {
      amount,
      targetType,
      targetId,
      note,
    });
    const debt = debts.find((d) => d.id === debtId);
    if (debt && debt.remainingAmount - amount <= 0) {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }
    await refetch();
  };

  const addContact = async (contact: Omit<Contact, 'id'>): Promise<Contact> => {
    const created = await api.contacts.create(contact);
    await refetch();
    return created;
  };

  const editContact = async (id: string, updated: Partial<Contact>) => {
    await api.contacts.update(id, updated);
    await refetch();
  };

  const deleteContact = async (id: string) => {
    await api.contacts.remove(id);
    await refetch();
  };

  const addWallet = async (w: Omit<Wallet, 'id'>) => {
    await api.wallets.create(w);
    await refetch();
  };

  const editWallet = async (id: string, updated: Partial<Wallet>) => {
    await api.wallets.update(id, updated);
    await refetch();
  };

  const updateCategoryBudgets = async (categoryId: string, daily?: number, weekly?: number, monthly?: number) => {
    await api.categories.updateBudgets(categoryId, {
      dailyBudget: daily,
      weeklyBudget: weekly,
      monthlyBudget: monthly,
    });
    await refetch();
  };

  const resetToSampleData = async () => {
    await api.dev.reset();
    localStorage.removeItem('oilaviy_exchange_rate');
    await refetch();
  };

  // ---- Urgent counts ----

  const urgentDebtsCount = debts.filter((d) => {
    if (d.status === 'settled') return false;
    const s = getDueStatus(d.dueDate, false, CURRENT_DATE_STR);
    return s.isAlert;
  }).length;

  const urgentRecurringCount = recurringItems.filter((r) => {
    if (!r.isActive) return false;
    const s = getRecurringStatus(r.dueDayOfMonth, r.lastPaidDate, CURRENT_DATE_STR);
    return s.isAlert;
  }).length;

  const currentMonthExpenses = transactions
    .filter((t) => t.type === 'expense' && t.date.startsWith(CURRENT_DATE_STR.substring(0, 7)))
    .reduce((sum, t) => sum + t.amount, 0);

  const budgetUsagePercent =
    monthlyBudgetLimit > 0 ? Math.round((currentMonthExpenses / monthlyBudgetLimit) * 100) : 0;
  const isBudget80Alert = budgetAlertSettings.alertAt80 && budgetUsagePercent >= 80 && budgetUsagePercent < 100;
  const isBudget100Alert = budgetAlertSettings.alertAt100 && budgetUsagePercent >= 100;
  const budgetAlertCount = isBudget80Alert || isBudget100Alert ? 1 : 0;

  const totalUrgentAlertsCount = urgentDebtsCount + urgentRecurringCount + budgetAlertCount + categoryLimitAlerts.length;

  return (
    <AppContext.Provider
      value={{
        categories,
        wallets,
        members,
        transactions,
        goals,
        debts,
        contacts,
        recurringItems,
        isLoaded,
        currency,
        setCurrency,
        language,
        setLanguage,
        exchangeRate,
        setExchangeRate: persistExchangeRate,
        liveRates,
        isFetchingRates,
        ratesLastUpdated,
        refreshLiveRates,
        periodFilter,
        setPeriodFilter,
        activeTab,
        setActiveTab,
        selectedTagFilter,
        setSelectedTagFilter,
        allTags,
        theme,
        setTheme,
        toggleTheme,
        addTransaction,
        editTransaction,
        deleteTransaction,
        addRecurringItem,
        editRecurringItem,
        deleteRecurringItem,
        payRecurringItem,
        urgentRecurringCount,
        addGoal,
        editGoal,
        deleteGoal,
        contributeToGoal,
        withdrawFromGoal,
        addDebt,
        editDebt,
        deleteDebt,
        settleDebt,
        addPartialDebtPayment,
        addContact,
        editContact,
        deleteContact,
        addWallet,
        editWallet,
        openAddTxModal: () => setIsAddTxModalOpen(true),
        closeAddTxModal: () => setIsAddTxModalOpen(false),
        isAddTxModalOpen,
        openReceiptScanner: () => setIsReceiptScannerOpen(true),
        closeReceiptScanner: () => setIsReceiptScannerOpen(false),
        isReceiptScannerOpen,
        openAddGoalModal: () => setIsAddGoalModalOpen(true),
        closeAddGoalModal: () => setIsAddGoalModalOpen(false),
        isAddGoalModalOpen,
        openAddDebtModal: () => setIsAddDebtModalOpen(true),
        closeAddDebtModal: () => setIsAddDebtModalOpen(false),
        isAddDebtModalOpen,
        openWalletsModal: () => setIsWalletsModalOpen(true),
        closeWalletsModal: () => setIsWalletsModalOpen(false),
        isWalletsModalOpen,
        categoryLimitAlerts,
        updateCategoryBudgets,
        activeLimitToast,
        clearLimitToast: () => setActiveLimitToast(null),
        openNotificationsModal: () => setIsNotificationsModalOpen(true),
        closeNotificationsModal: () => setIsNotificationsModalOpen(false),
        isNotificationsModalOpen,
        openCategoryLimitsModal: () => setIsCategoryLimitsModalOpen(true),
        closeCategoryLimitsModal: () => setIsCategoryLimitsModalOpen(false),
        isCategoryLimitsModalOpen,
        urgentDebtsCount,
        totalUrgentAlertsCount,
        resetToSampleData,
        isPresentationOpen,
        openPresentation: () => setIsPresentationOpen(true),
        closePresentation: () => setIsPresentationOpen(false),
        monthlyBudgetLimit,
        setMonthlyBudgetLimit,
        budgetAlertSettings,
        setBudgetAlertSettings: updateBudgetAlertSettings,
        isBudget80Alert,
        isBudget100Alert,
        budgetUsagePercent,
      }}
    >
      {children}
    </AppContext.Provider>
  );

  // Transaction qo'shishdan so'ng limit toastini ko'rsatish (frontend real-time)
  function checkDailyLimitAfterAdd(tx: Omit<Transaction, 'id'>) {
    if (tx.type !== 'expense') return;
    const cat = categories.find((c) => c.id === tx.categoryId);
    if (!cat) return;
    const dailyLimit = cat.dailyBudget || (cat.monthlyBudget ? Math.round(cat.monthlyBudget / 30) : 250000);
    const currentTxDate = tx.date || CURRENT_DATE_STR;
    const dailySpent =
      transactions
        .filter((t) => t.type === 'expense' && t.categoryId === tx.categoryId && t.date === currentTxDate)
        .reduce((sum, t) => sum + t.amount, 0) + tx.amount;

    if (dailySpent > 0 && dailyLimit > 0) {
      const percent = Math.round((dailySpent / dailyLimit) * 100);
      if (percent >= 80) {
        setActiveLimitToast({
          id: `toast_${Date.now()}`,
          categoryId: cat.id,
          categoryNameCyrl: cat.name_cyrl,
          categoryNameLatn: cat.name_latn,
          categoryIcon: cat.icon,
          categoryColor: cat.color,
          period: 'daily',
          spentAmount: dailySpent,
          limitAmount: dailyLimit,
          percentExceeded: percent,
          severity: percent >= 100 ? 'danger' : 'warning',
          dateStr: currentTxDate,
        });
      }
    }
  }
};

// Kursning boshlang'ich mantiqiy qiymati (backend settings bilan keyin sinxronlanadi)
const DEFAULT_RATE = 12850;

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
