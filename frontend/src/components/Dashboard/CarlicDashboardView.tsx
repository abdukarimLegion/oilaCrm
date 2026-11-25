import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatMoney,
  formatCompactMoney,
  formatDateUz,
} from '../../utils/formatters';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronDown,
  CreditCard,
  Plus,
  Shield,
  Sparkles,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertOctagon,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Tilt3DCard } from '../Common/Tilt3DCard';
import { BudgetLimitModal } from '../Modals/BudgetLimitModal';
import { KpiDetailModal } from './KpiDetailModal';
import { CurrencyConverter } from './CurrencyConverter';
import { CategoryMiniCards } from './CategoryMiniCards';
import { QuickAddFAB } from './QuickAddFAB';

export const CarlicDashboardView: React.FC = () => {
  const {
    wallets,
    transactions,
    debts,
    goals,
    currency,
    language,
    exchangeRate,
    openAddTxModal,
    openAddDebtModal,
    openWalletsModal,
    setActiveTab,
    openPresentation,
    monthlyBudgetLimit,
    budgetAlertSettings,
    isBudget80Alert,
    isBudget100Alert,
  } = useApp();

  const [timeFilter, setTimeFilter] = useState<'monthly' | 'weekly' | 'yearly'>('monthly');
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isAlertDismissed, setIsAlertDismissed] = useState(false);
  const [kpiModalType, setKpiModalType] = useState<'expense' | 'income' | 'savings' | 'networth' | null>(null);

  // Calculations
  const totalWallets = wallets.reduce((acc, w) => acc + w.balance, 0);
  const totalGoalsSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const totalTheyOwe = debts
    .filter(d => d.type === 'they_owe' && d.status !== 'settled')
    .reduce((acc, d) => acc + d.remainingAmount, 0);
  const totalIOwe = debts
    .filter(d => d.type === 'i_owe' && d.status !== 'settled')
    .reduce((acc, d) => acc + d.remainingAmount, 0);

  const netWorth = totalWallets + totalGoalsSaved + totalTheyOwe - totalIOwe;

  // Income Breakdown (Separate UZS and USD)
  const incomeTxs = transactions.filter(t => t.type === 'income');
  const totalIncomeUZS = incomeTxs
    .filter(t => !t.currency || t.currency === 'UZS')
    .reduce((acc, t) => acc + t.amount, 0);
  const totalIncomeUSD = incomeTxs
    .filter(t => t.currency === 'USD')
    .reduce((acc, t) => acc + (t.originalAmount || Math.round(t.amount / exchangeRate)), 0);

  // Expense Breakdown (Separate UZS and USD)
  const expenseTxs = transactions.filter(t => t.type === 'expense');
  const totalExpenseUZS = expenseTxs
    .filter(t => !t.currency || t.currency === 'UZS')
    .reduce((acc, t) => acc + t.amount, 0);
  const totalExpenseUSD = expenseTxs
    .filter(t => t.currency === 'USD')
    .reduce((acc, t) => acc + (t.originalAmount || Math.round(t.amount / exchangeRate)), 0);

  const totalExpense = totalExpenseUZS + (totalExpenseUSD * exchangeRate);
  const totalIncome = totalIncomeUZS + (totalIncomeUSD * exchangeRate);

  const savingsRate = totalIncome > 0 ? Math.min(100, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)) : 43.5;

  // Additional infographic metrics
  const totalGoalsTarget = goals.reduce((acc, g) => acc + (g.targetAmount || 0), 0) || 1;
  const goalsProgressPercent = Math.min(100, Math.round((totalGoalsSaved / totalGoalsTarget) * 100));
  const incomeRetentionPercent = totalIncome > 0 ? Math.max(0, Math.min(100, Math.round(((totalIncome - totalExpense) / totalIncome) * 100))) : 43;
  const assetsToLiabilitiesPercent = (totalWallets + totalGoalsSaved + totalTheyOwe) > 0
    ? Math.min(100, Math.round(((totalWallets + totalGoalsSaved + totalTheyOwe - totalIOwe) / (totalWallets + totalGoalsSaved + totalTheyOwe)) * 100))
    : 92;

  // Monthly Budget Usage & Threshold Alerts
  const budgetPercent = monthlyBudgetLimit > 0
    ? Math.round((totalExpense / monthlyBudgetLimit) * 100)
    : 0;
  const isOver100 = budgetPercent >= 100;
  const isOver80 = budgetPercent >= 80 && budgetPercent < 100;

  // Semi-circle arc math: radius = 60, circumference = pi * 60 ~= 188.5
  const gaugeCircumference = 188.5;
  const clampedRatio = Math.min(1, budgetPercent / 100);
  const gaugeDashoffset = gaugeCircumference * (1 - clampedRatio);
  const gaugeColor = isOver100 ? '#e11d48' : isOver80 ? '#d97706' : '#547f69';

  // Recent 3 transfers / debts
  const recentTransfers = transactions.slice(0, 3);

  return (
    <div className="space-y-5">
      {/* Monthly Budget Alert Banner (when reaching 80% or 100%) */}
      {(isOver80 || isOver100) && !isAlertDismissed && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-3xl p-4 sm:p-5 border shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            isOver100
              ? 'bg-[#fceeee] dark:bg-rose-950/30 border-[#f8d7da] dark:border-rose-900/50 text-[#1c211e] dark:text-slate-100'
              : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 text-[#1c211e] dark:text-slate-100'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                isOver100 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {isOver100 ? <AlertOctagon className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-sm sm:text-base leading-tight">
                  {isOver100
                    ? language === 'uz_cyrl'
                      ? 'Огоҳлантириш: Ойлик бюджет лимити (100%) тўлиқ сарфланди ва ошди!'
                      : 'Ogohlantirish: Oylik byudjet limiti (100%) to\'liq sarflandi va oshdi!'
                    : language === 'uz_cyrl'
                      ? 'Диққат: Ойлик харажатларингиз 80% лимитга етди!'
                      : 'Diqqat: Oylik xarajatlaringiz 80% limitga yetdi!'}
                </h4>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono tabular-nums ${
                    isOver100 ? 'bg-rose-200 text-rose-900' : 'bg-amber-200 text-amber-900'
                  }`}
                >
                  {budgetPercent}%
                </span>
              </div>
              <p className="text-xs text-[#555a56] mt-1 max-w-2xl">
                {isOver100
                  ? language === 'uz_cyrl'
                    ? `Белгиланган ${formatMoney(monthlyBudgetLimit, currency, language, exchangeRate)} лимитдан +${formatMoney(totalExpense - monthlyBudgetLimit, currency, language, exchangeRate)} ортиқча чиқим қилинди. Ортиқча харажатларни чеклаш тавсия этилади.`
                    : `Belgilangan ${formatMoney(monthlyBudgetLimit, currency, language, exchangeRate)} limitdan +${formatMoney(totalExpense - monthlyBudgetLimit, currency, language, exchangeRate)} ortiqcha chiqim qilindi.`
                  : language === 'uz_cyrl'
                    ? `Белгиланган ${formatMoney(monthlyBudgetLimit, currency, language, exchangeRate)} лимитдан ${formatMoney(totalExpense, currency, language, exchangeRate)} сарфланди. Ой охиригача қолган маблағ: ${formatMoney(Math.max(0, monthlyBudgetLimit - totalExpense), currency, language, exchangeRate)}.`
                    : `Belgilangan ${formatMoney(monthlyBudgetLimit, currency, language, exchangeRate)} limitdan ${formatMoney(totalExpense, currency, language, exchangeRate)} sarflandi. Qolgan mablag': ${formatMoney(Math.max(0, monthlyBudgetLimit - totalExpense), currency, language, exchangeRate)}.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              onClick={() => setIsBudgetModalOpen(true)}
              className="px-3.5 py-2 text-xs font-bold text-white bg-[#1c211e] hover:bg-[#2c332f] rounded-xl transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{language === 'uz_cyrl' ? 'Лимитни созлаш' : 'Limitni sozlash'}</span>
            </button>
            <button
              onClick={() => setIsAlertDismissed(true)}
              className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-500 flex items-center justify-center transition-colors shadow-2xs"
              title="Ёпиш"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}


      {/* =========================================================================
          ROW 1: 4 TOP METRIC CARDS (Matching Screenshot top row)
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Spent this month */}
        <Tilt3DCard>
          <div
            onClick={() => setKpiModalType('expense')}
            className="bg-white dark:bg-slate-900 hover:bg-rose-50/40 dark:hover:bg-rose-950/20 rounded-3xl p-5 shadow-xs border border-black/[0.04] dark:border-white/[0.04] flex flex-col justify-between h-full cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md group"
            title="Толиқ харажатлар таҳлилини кўриш учун босинг"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs text-[#797e7a] dark:text-slate-400 group-hover:text-rose-700 dark:group-hover:text-rose-400 font-medium block mb-1">
                  {language === 'uz_cyrl' ? 'Бу ойлик харажат' : 'Bu oylik xarajat'}
                </span>
                <div className="text-2xl font-extrabold text-[#1c211e] dark:text-white tracking-tight font-mono tabular-nums">
                  {formatCompactMoney(totalExpenseUZS, 'UZS', language, exchangeRate)}
                </div>
                <div className="text-[11px] font-mono font-bold text-rose-600 mt-0.5">
                  {totalExpenseUSD > 0 ? `+ $${totalExpenseUSD.toLocaleString()} USD` : '$0 USD'}
                </div>
              </div>

              {/* Vertical Bar Micro-Chart graphic from screenshot */}
              <div className="flex items-end gap-1.5 h-10 shrink-0">
                <span className="w-1.5 h-6 bg-[#1c211e] dark:bg-slate-200 group-hover:bg-rose-600 rounded-full transition-colors" />
                <span className="w-1.5 h-10 bg-[#1c211e] dark:bg-slate-200 group-hover:bg-rose-600 rounded-full transition-colors" />
                <span className="w-1.5 h-7 bg-[#1c211e] dark:bg-slate-200 group-hover:bg-rose-600 rounded-full transition-colors" />
                <span className="w-1.5 h-9 bg-[#1c211e] dark:bg-slate-200 group-hover:bg-rose-600 rounded-full transition-colors" />
                <span className="w-1.5 h-4 bg-[#797e7a] rounded-full" />
              </div>
            </div>

            {/* Animated Monthly Limit Progress Bar */}
            <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                <span className="text-slate-400">Лимитдан:</span>
                <span className={`font-bold ${isOver100 ? 'text-rose-600 dark:text-rose-400' : isOver80 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>
                  {budgetPercent}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, budgetPercent)}%` }}
                  transition={{ duration: 0.9, ease: 'easeOut' }}
                  className={`h-full rounded-full ${isOver100 ? 'bg-rose-500' : isOver80 ? 'bg-amber-500' : 'bg-rose-500'}`}
                />
              </div>
            </div>
          </div>
        </Tilt3DCard>

        {/* Card 2: New Income / Inflow */}
        <Tilt3DCard>
          <div
            onClick={() => setKpiModalType('income')}
            className="bg-white dark:bg-slate-900 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 rounded-3xl p-5 shadow-xs border border-black/[0.04] dark:border-white/[0.04] flex flex-col justify-between h-full cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md group"
            title="Толиқ даромад манбаларини кўриш учун босинг"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#f3f0ea] dark:bg-slate-800 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 flex items-center justify-center text-[#547f69] dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 shrink-0 transition-colors">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-[#797e7a] dark:text-slate-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 font-medium block">
                    {language === 'uz_cyrl' ? 'Ойлик даромад' : 'Oylik daromad'}
                  </span>
                  <div className="text-2xl font-extrabold text-[#1c211e] dark:text-white tracking-tight font-mono tabular-nums">
                    {formatCompactMoney(totalIncomeUZS, 'UZS', language, exchangeRate)}
                  </div>
                  <div className="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                    {totalIncomeUSD > 0 ? `+ $${totalIncomeUSD.toLocaleString()} USD` : '$0 USD'}
                  </div>
                </div>
              </div>

              {/* Smooth SVG Trend Sparkline */}
              <svg className="w-14 h-8 text-[#797e7a] group-hover:text-emerald-600 shrink-0 transition-colors" viewBox="0 0 60 30" fill="none">
                <path
                  d="M2 22C12 22 18 10 28 12C38 14 44 4 58 6"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Animated Income Retention Progress Bar */}
            <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                <span className="text-slate-400">Сақлаб қолинди:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {incomeRetentionPercent}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${incomeRetentionPercent}%` }}
                  transition={{ duration: 0.9, ease: 'easeOut' }}
                  className="h-full rounded-full bg-emerald-500"
                />
              </div>
            </div>
          </div>
        </Tilt3DCard>

        {/* Card 3: Earnings / Goals Savings */}
        <Tilt3DCard>
          <div
            onClick={() => setKpiModalType('savings')}
            className="bg-white dark:bg-slate-900 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 rounded-3xl p-5 shadow-xs border border-black/[0.04] dark:border-white/[0.04] flex flex-col justify-between h-full cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md group"
            title="Жамғарма мақсадлари таҳлилини кўриш учун босинг"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#faeede] dark:bg-amber-950/30 group-hover:bg-amber-200 dark:group-hover:bg-amber-900/50 text-[#d48344] dark:text-amber-400 flex items-center justify-center font-bold text-sm shrink-0 transition-colors">
                💰
              </div>
              <div>
                <span className="text-xs text-[#797e7a] dark:text-slate-400 group-hover:text-amber-800 dark:group-hover:text-amber-300 font-medium block">
                  {language === 'uz_cyrl' ? 'Жамғармаларда' : 'Jamg\'armalarda'}
                </span>
                <div className="text-2xl font-extrabold text-[#1c211e] dark:text-white tracking-tight font-mono tabular-nums">
                  {formatCompactMoney(totalGoalsSaved, currency, language, exchangeRate)}
                </div>
                <div className="text-[11px] font-mono font-bold text-amber-600 mt-0.5">
                  {currency === 'UZS' ? `≈ $${formatCompactMoney(totalGoalsSaved / exchangeRate, 'USD', language, exchangeRate)} USD` : ''}
                </div>
              </div>
            </div>

            {/* Animated Goal Target Progress Bar */}
            <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                <span className="text-slate-400">Мақсадларга нисбатан:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {goalsProgressPercent}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${goalsProgressPercent}%` }}
                  transition={{ duration: 0.9, ease: 'easeOut' }}
                  className="h-full rounded-full bg-amber-500"
                />
              </div>
            </div>
          </div>
        </Tilt3DCard>

        {/* Card 4: FEATURED SAGE GREEN CARD (Activity / Net Worth) */}
        <Tilt3DCard>
          <div
            onClick={() => setKpiModalType('networth')}
            className="bg-[#547f69] hover:bg-[#466d59] text-white rounded-3xl p-5 shadow-sm border border-[#48705c] flex flex-col justify-between h-full relative overflow-hidden cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md group"
            title="Соф капитал (Net Worth) структурасини кўриш учун босинг"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs text-emerald-100 font-medium block mb-1">
                  {language === 'uz_cyrl' ? 'Соф капитал (Net Worth)' : 'Sof kapital (Net Worth)'}
                </span>
                <div className="text-2xl font-extrabold tracking-tight font-mono tabular-nums text-white">
                  {formatCompactMoney(netWorth, currency, language, exchangeRate)}
                </div>
                <div className="text-[11px] font-mono font-bold text-emerald-100/80 mt-0.5">
                  {currency === 'UZS' ? `≈ $${formatCompactMoney(netWorth / exchangeRate, 'USD', language, exchangeRate)} USD` : ''}
                </div>
              </div>

              {/* Glowing White Wave Curve */}
              <svg className="w-16 h-10 text-white shrink-0 drop-shadow-sm group-hover:scale-110 transition-transform" viewBox="0 0 60 30" fill="none">
                <path
                  d="M2 18C12 8 20 25 32 14C44 3 50 12 58 8"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Animated Solvency Progress Bar */}
            <div className="mt-4 pt-2.5 border-t border-white/20">
              <div className="flex items-center justify-between text-[10px] font-mono mb-1 text-emerald-100">
                <span>Активлар ҳимояси:</span>
                <span className="font-bold">{assetsToLiabilitiesPercent}%</span>
              </div>
              <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${assetsToLiabilitiesPercent}%` }}
                  transition={{ duration: 0.9, ease: 'easeOut' }}
                  className="h-full rounded-full bg-white"
                />
              </div>
            </div>
          </div>
        </Tilt3DCard>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Card A: Balance & Dual-Spline Wave Chart (6 cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xs border border-black/[0.04] dark:border-white/[0.04] flex flex-col justify-between transition-colors duration-300">
          <div>
            {/* Header: Title + On Track Pill + Dropdown */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-[#1c211e] dark:text-white">
                  {language === 'uz_cyrl' ? 'Баланс динамикаси' : 'Balans dinamikasi'}
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#e8ede8] dark:bg-emerald-950/30 text-[#547f69] dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#547f69] dark:bg-emerald-400" />
                  <span>{language === 'uz_cyrl' ? 'Барқарор' : 'On track'}</span>
                </span>
              </div>

              {/* Time dropdown pill */}
              <button
                onClick={() => setTimeFilter(timeFilter === 'monthly' ? 'weekly' : 'monthly')}
                className="flex items-center gap-1 text-xs text-[#797e7a] dark:text-slate-400 hover:text-[#1c211e] dark:hover:text-white bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-100 dark:border-slate-700 transition-colors"
              >
                <span>{timeFilter === 'monthly' ? 'Monthly' : 'Weekly'}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            {/* Sub-KPI stats: Saves + Balance */}
            <div className="flex items-center gap-8 mb-4">
              <div>
                <span className="text-[11px] text-[#797e7a] dark:text-slate-400 block">
                  {language === 'uz_cyrl' ? 'Тежамкорлик:' : 'Saves:'}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xl font-extrabold text-[#1c211e] dark:text-white font-mono tabular-nums">
                    {savingsRate}%
                  </span>
                  <span className="text-[10px] font-bold text-[#547f69] dark:text-emerald-400 bg-[#e8ede8] dark:bg-emerald-950/30 px-1.5 py-0.5 rounded-full">
                    +2.45%
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-[#797e7a] dark:text-slate-400 block">
                  {language === 'uz_cyrl' ? 'Ҳамёнларда:' : 'Balance:'}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xl font-extrabold text-[#1c211e] dark:text-white font-mono tabular-nums">
                    {formatCompactMoney(totalWallets, currency, language, exchangeRate)}
                  </span>
                  <span className="text-[10px] font-bold text-[#b54d4d] dark:text-rose-400 bg-[#fceeee] dark:bg-rose-950/30 px-1.5 py-0.5 rounded-full">
                    -4.75%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Dual-Spline Chart Canvas / SVG from screenshot */}
          <div className="relative h-32 w-full pt-4">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 500 120"
              preserveAspectRatio="none"
            >
              {/* Soft background reference wave */}
              <path
                d="M0 80 Q 40 40, 80 70 T 160 50 T 240 85 T 320 45 T 400 70 T 500 55"
                fill="none"
                stroke="#e5e5e0"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Foreground active wave matching screenshot */}
              <path
                d="M0 65 Q 45 95, 90 60 T 170 30 T 250 80 T 330 25 T 410 65 T 500 40"
                fill="none"
                stroke="#547f69"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Subtle fill gradient under the primary wave */}
              <path
                d="M0 65 Q 45 95, 90 60 T 170 30 T 250 80 T 330 25 T 410 65 T 500 40 L 500 120 L 0 120 Z"
                fill="rgba(84, 127, 105, 0.05)"
              />
            </svg>
          </div>
        </div>

        {/* Card B: Earnings / Total Expense with Dynamic Semi-Circular Gauge (3 cols) */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xs border border-black/[0.04] dark:border-white/[0.04] flex flex-col justify-between transition-colors duration-300">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[#797e7a] dark:text-slate-400 font-medium block">
                {language === 'uz_cyrl' ? 'Умумий харажат' : 'Total Expense'}
              </span>

              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono tabular-nums ${
                    isOver100
                      ? 'bg-[#fceeee] dark:bg-rose-950/30 text-[#b54d4d] dark:text-rose-400'
                      : isOver80
                      ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400'
                      : 'bg-[#e8ede8] dark:bg-emerald-950/30 text-[#547f69] dark:text-emerald-400'
                  }`}
                >
                  {isOver100
                    ? language === 'uz_cyrl' ? '100%+ Ошди' : '100%+ Limit'
                    : isOver80
                    ? language === 'uz_cyrl' ? '80% Лимит' : '80% Limit'
                    : language === 'uz_cyrl' ? 'Меъёрида' : 'On track'}
                </span>

                <button
                  onClick={() => setIsBudgetModalOpen(true)}
                  className="p-1 rounded-lg text-[#797e7a] dark:text-slate-400 hover:text-[#1c211e] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title={language === 'uz_cyrl' ? 'Ойлик бюджет лимитини созлаш' : 'Oylik byudjet limitini sozlash'}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="text-2xl font-black text-[#1c211e] dark:text-white tracking-tight font-mono tabular-nums mt-0.5">
              {formatMoney(totalExpense, currency, language, exchangeRate)}
            </div>

            <p className="text-[11px] text-[#797e7a] mt-1 leading-tight">
              {isOver100
                ? language === 'uz_cyrl'
                  ? `🚨 Лимитдан +${formatCompactMoney(totalExpense - monthlyBudgetLimit, currency, language, exchangeRate)} ортиқча сарфланди`
                  : `🚨 Limitdan +${formatCompactMoney(totalExpense - monthlyBudgetLimit, currency, language, exchangeRate)} ortiqcha sarflandi`
                : isOver80
                ? language === 'uz_cyrl'
                  ? `⚠️ Лимитнинг 80% дан ортиғи сарфланди (Қолдиқ: ${formatCompactMoney(Math.max(0, monthlyBudgetLimit - totalExpense), currency, language, exchangeRate)})`
                  : `⚠️ Limitning 80% dan ortig'i sarflandi (Qoldiq: ${formatCompactMoney(Math.max(0, monthlyBudgetLimit - totalExpense), currency, language, exchangeRate)})`
                : language === 'uz_cyrl'
                ? `Режадаги ${formatCompactMoney(monthlyBudgetLimit, currency, language, exchangeRate)} лимитдан ${budgetPercent}% сарфланди`
                : `Rejadagi ${formatCompactMoney(monthlyBudgetLimit, currency, language, exchangeRate)} limitdan ${budgetPercent}% sarflandi`}
            </p>
          </div>

          {/* Semi-circular radial gauge meter matching screenshot */}
          <div
            className="relative flex flex-col items-center justify-center my-3 cursor-pointer group"
            onClick={() => setIsBudgetModalOpen(true)}
            title={language === 'uz_cyrl' ? 'Бюджет лимитини ўзгартириш учун босинг' : 'Click to adjust budget limit'}
          >
            <svg className="w-36 h-20" viewBox="0 0 160 90">
              {/* Background grey arc */}
              <path
                d="M 20 80 A 60 60 0 0 1 140 80"
                fill="none"
                stroke="#e8ede8"
                strokeWidth="16"
                strokeLinecap="round"
              />
              {/* Foreground arc filled dynamically with gaugeDashoffset & gaugeColor */}
              <path
                d="M 20 80 A 60 60 0 0 1 140 80"
                fill="none"
                stroke={gaugeColor}
                strokeWidth="16"
                strokeLinecap="round"
                strokeDasharray="188.5"
                strokeDashoffset={gaugeDashoffset}
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div
              className={`text-2xl font-black font-mono tabular-nums -mt-5 transition-colors ${
                isOver100 ? 'text-rose-600' : isOver80 ? 'text-amber-700' : 'text-[#1c211e] dark:text-white'
              }`}
            >
              {budgetPercent}%
            </div>
            <span className="text-[10px] text-[#797e7a] dark:text-slate-400 group-hover:text-[#1c211e] dark:group-hover:text-white mt-0.5 font-medium transition-colors">
              {language === 'uz_cyrl' ? 'Лимит: ' : 'Limit: '}
              <strong className="text-[#1c211e] dark:text-white">{formatCompactMoney(monthlyBudgetLimit, currency, language, exchangeRate)}</strong>
            </span>
          </div>

          {/* Bottom Card Helper */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-[#797e7a]">
              {isOver100
                ? language === 'uz_cyrl' ? 'Ортиқча:' : 'Ortiqcha:'
                : language === 'uz_cyrl' ? 'Қолдиқ:' : 'Qoldiq:'}
              <strong className={`ml-1 font-mono font-bold ${isOver100 ? 'text-rose-600' : 'text-[#547f69]'}`}>
                {isOver100
                  ? `+${formatCompactMoney(totalExpense - monthlyBudgetLimit, currency, language, exchangeRate)}`
                  : formatCompactMoney(Math.max(0, monthlyBudgetLimit - totalExpense), currency, language, exchangeRate)}
              </strong>
            </span>

            <button
              onClick={() => setIsBudgetModalOpen(true)}
              className="text-[#547f69] font-bold hover:underline"
            >
              {language === 'uz_cyrl' ? 'Созлаш' : 'Sozlash'}
            </button>
          </div>
        </div>

        {/* Card C: Currency Converter (3 cols) */}
        <div className="lg:col-span-3 h-full">
          <CurrencyConverter />
        </div>
      </div>

      {/* =========================================================================
          CATEGORY DYNAMICS & HOVER-ANIMATED MINI-CARDS
          ========================================================================= */}
      <CategoryMiniCards />

      {/* =========================================================================
          ROW 3: AVAILABLE CREDIT CARDS + TRANSFERS + KEEP YOU SAFE
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Card D: Available Credit Card in Wallet (6 cols) */}
        <div
          onClick={openWalletsModal}
          className="lg:col-span-8 bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/80 rounded-3xl p-6 shadow-xs border border-black/[0.04] dark:border-white/[0.04] hover:border-emerald-300 dark:hover:border-emerald-500/50 flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden cursor-pointer transition-all hover:scale-[1.01]"
          title="Барча карталар ва ҳамёнларни кўриш ҳамда бошқариш"
        >
          <div className="max-w-xs">
            <h4 className="font-extrabold text-base text-[#1c211e] dark:text-white mb-2 leading-tight">
              {language === 'uz_cyrl' ? 'Ҳамёнлардаги карталар' : 'Available Credit Card in Wallet'}
            </h4>
            <p className="text-xs text-[#797e7a] dark:text-slate-400 leading-relaxed mb-4">
              {language === 'uz_cyrl'
                ? 'Humo, Uzcard ва Visa карталари ҳамда нақд маблағлар маркази.'
                : 'Manage your primary payment methods, active balances, and daily transaction limits.'}
            </p>
            <button
              onClick={e => {
                e.stopPropagation();
                openWalletsModal();
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#547f69] hover:bg-[#466d59] rounded-xl transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
            >
              <span>{language === 'uz_cyrl' ? '+ Карта қўшиш' : 'Add New Card +'}</span>
            </button>
          </div>

          {/* Realistic 3D Stacked Isometric Credit Cards matching screenshot */}
          <div className="relative w-52 h-44 shrink-0 flex items-center justify-center">
            {/* Card 1 (Back / Top layer): Silver metallic card */}
            <div
              className="absolute w-44 h-24 rounded-2xl bg-gradient-to-tr from-slate-200 via-slate-100 to-slate-300 p-3 shadow-md border border-white/60 transform -rotate-12 translate-y-[-24px] translate-x-[-12px]"
            >
              <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Master Card</div>
              <div className="text-[9px] font-mono font-bold text-slate-700 mt-4 tracking-wider">
                1234 1234 1234 1234
              </div>
            </div>

            {/* Card 2 (Middle layer): Sage green card */}
            <div
              className="absolute w-44 h-24 rounded-2xl bg-gradient-to-tr from-[#3b5949] via-[#547f69] to-[#6c9881] p-3 shadow-md border border-white/20 transform -rotate-6 translate-y-[-8px] text-white"
            >
              <div className="flex justify-between items-center text-[8px] font-mono text-emerald-100 uppercase">
                <span>Humo Pay</span>
                <span>08/28</span>
              </div>
              <div className="text-[9px] font-mono font-bold text-white mt-4 tracking-wider">
                9860 **** **** 8842
              </div>
            </div>

            {/* Card 3 (Front / Primary): Dark Charcoal Phoenix Card */}
            <div
              className="absolute w-44 h-24 rounded-2xl bg-gradient-to-tr from-[#161917] via-[#232724] to-[#121413] p-3 shadow-xl border border-white/10 transform rotate-2 translate-y-[12px] text-white"
            >
              <div className="flex justify-between items-center text-[8px] font-mono text-slate-400 uppercase">
                <span>Phoenix Black</span>
                <span className="w-4 h-3 rounded bg-amber-400/80 inline-block" />
              </div>
              <div className="text-[10px] font-mono font-bold text-white mt-3 tracking-wider">
                8600 **** **** 4120
              </div>
              <div className="text-[8px] text-slate-400 mt-1 flex justify-between">
                <span>SARDOR RAHIMOV</span>
                <span>UZCARD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card E: Your Transfers (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xs border border-black/[0.04] dark:border-white/[0.04] flex flex-col justify-between transition-colors duration-300">
          <div>
            <h4 className="font-extrabold text-base text-[#1c211e] dark:text-white mb-3">
              {language === 'uz_cyrl' ? 'Сўнгги ўтказмалар' : 'Your Transfers'}
            </h4>

            {/* Transfers list with vertical accent line & percentage pills */}
            <div className="space-y-3.5">
              {recentTransfers.map((tx, idx) => {
                const isIncome = tx.type === 'income';
                return (
                  <div key={tx.id || idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-start gap-2.5">
                      {/* Left accent bar matching screenshot */}
                      <span
                        className={`w-1 h-8 rounded-full ${
                          isIncome ? 'bg-[#547f69]' : 'bg-[#1c211e]'
                        }`}
                      />
                      <div>
                        <div className="font-bold text-[#1c211e] dark:text-white">
                          {tx.note || (isIncome ? 'Даромад тушуми' : 'Харажат')}
                        </div>
                        <div className="text-[10px] text-[#797e7a] dark:text-slate-400">
                          {formatDateUz(tx.date, language).split(',')[0]}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono tabular-nums ${
                        isIncome
                          ? 'bg-[#e8ede8] text-[#547f69]'
                          : 'bg-[#fceeee] text-[#b54d4d]'
                      }`}
                    >
                      {isIncome ? '+2.45%' : '-4.75%'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('transactions')}
            className="text-xs font-semibold text-[#547f69] hover:underline pt-3 mt-3 border-t border-slate-100 block text-left"
          >
            {language === 'uz_cyrl' ? 'Барча амалиётлар тарихи →' : 'View all transactions →'}
          </button>
        </div>


      </div>

      {/* Monthly Budget Limit Modal */}
      <BudgetLimitModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
      />

      {/* KPI Detail Breakdown Modal */}
      <KpiDetailModal
        type={kpiModalType}
        onClose={() => setKpiModalType(null)}
      />

      {/* Floating Action Menu for Quick Logging */}
      <QuickAddFAB />
    </div>
  );
};
