import React from 'react';
import { useApp } from '../../context/AppContext';
import { getT } from '../../constants/translations';
import { formatMoney } from '../../utils/formatters';
import {
  Wallet as WalletIcon,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { Tilt3DCard } from '../Common/Tilt3DCard';

export const FinancialKpiCards: React.FC = () => {
  const { wallets, transactions, debts, currency, language, exchangeRate, periodFilter } = useApp();
  const t = getT(language);

  // Total balance across all wallets
  const totalBalance = wallets.reduce((acc, w) => acc + w.balance, 0);

  // Filter transactions based on period
  // Period filter logic:
  // 'today': 2026-10-28
  // 'week': 2026-10-21 to 2026-10-28
  // 'month': 2026-10-01 to 2026-10-31
  // 'year': 2026-01-01 to 2026-12-31
  const filteredTxs = transactions.filter(tx => {
    if (periodFilter === 'all') return true;
    if (periodFilter === 'today') return tx.date === '2026-10-28' || tx.date === '2026-10-27';
    if (periodFilter === 'week') return tx.date >= '2026-10-21' && tx.date <= '2026-10-28';
    if (periodFilter === 'month') return tx.date.startsWith('2026-10');
    if (periodFilter === 'year') return tx.date.startsWith('2026');
    return true;
  });

  const periodIncome = filteredTxs
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const periodExpense = filteredTxs
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const netSavings = periodIncome - periodExpense;
  const savingsRate = periodIncome > 0 ? Math.round((netSavings / periodIncome) * 100) : 0;

  // Active debts calculation
  const theyOweActive = debts
    .filter(d => d.type === 'they_owe' && d.status !== 'settled')
    .reduce((acc, d) => acc + d.remainingAmount, 0);

  const iOweActive = debts
    .filter(d => d.type === 'i_owe' && d.status !== 'settled')
    .reduce((acc, d) => acc + d.remainingAmount, 0);

  const netDebtPosition = theyOweActive - iOweActive;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Balance */}
      <Tilt3DCard>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              {t.totalBalance}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <WalletIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
            {formatMoney(totalBalance, currency, language, exchangeRate)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <span>{wallets.length} та фаол ҳисоб/карта</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-600 font-medium">100% фаол</span>
          </div>
        </div>
      </Tilt3DCard>

      {/* 2. Monthly Income */}
      <Tilt3DCard>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              {t.monthlyIncome}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-emerald-600 tabular-nums">
            +{formatMoney(periodIncome, currency, language, exchangeRate)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-emerald-700 font-medium">Даромадлар барқарор</span>
          </div>
        </div>
      </Tilt3DCard>

      {/* 3. Monthly Expense */}
      <Tilt3DCard>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              {t.monthlyExpense}
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-rose-600 tabular-nums">
            -{formatMoney(periodExpense, currency, language, exchangeRate)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <span className="text-slate-600">
              Соф тежамкорлик: <span className="font-semibold text-slate-900 tabular-nums">{savingsRate}%</span>
            </span>
          </div>
        </div>
      </Tilt3DCard>

      {/* 4. Debt & Receivables Position */}
      <Tilt3DCard>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              {t.netDebts}
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
            {formatMoney(Math.abs(netDebtPosition), currency, language, exchangeRate)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span className="text-emerald-600 font-medium flex items-center gap-0.5">
              <ArrowDownLeft className="w-3 h-3" />
              +{formatMoney(theyOweActive, currency, language, exchangeRate).split(' ')[0]} {currency === 'UZS' ? 'сўм' : '$'}
            </span>
            <span className="text-rose-600 font-medium flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" />
              -{formatMoney(iOweActive, currency, language, exchangeRate).split(' ')[0]} {currency === 'UZS' ? 'сўм' : '$'}
            </span>
          </div>
        </div>
      </Tilt3DCard>
    </div>
  );
};
