import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { getT } from '../../constants/translations';
import { formatMoney, formatCompactMoney } from '../../utils/formatters';
import { FinancialKpiCards } from './FinancialKpiCards';
import { CashflowChart } from './CashflowChart';
import { CategoryBreakdown } from './CategoryBreakdown';
import { UrgentAlerts } from './UrgentAlerts';
import { RecentTransactions } from './RecentTransactions';
import { CategoryIcon } from '../Common/CategoryIcon';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Users,
  Wallet,
  ChevronDown,
  ChevronUp,
  BarChart3,
  PieChart,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { QuickAddFAB } from './QuickAddFAB';

export const DashboardView: React.FC = () => {
  const {
    wallets,
    goals,
    debts,
    categories,
    transactions,
    members,
    currency,
    language,
    exchangeRate,
    setActiveTab,
    openPresentation,
  } = useApp();

  const t = getT(language);

  // Toggle for detailed Net Worth assets sheet
  const [showNetWorthDetails, setShowNetWorthDetails] = useState(false);

  // Tab mode for Analytics & Cashflow section: 'cashflow' | 'income_sources' | 'family'
  const [analyticsMode, setAnalyticsMode] = useState<'cashflow' | 'income_sources' | 'family'>('cashflow');

  // Net Worth calculations
  const totalWallets = wallets.reduce((sum, w) => sum + w.balance, 0);
  const totalGoalsSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalReceivable = debts
    .filter(d => d.type === 'they_owe' && d.status !== 'settled')
    .reduce((sum, d) => sum + d.remainingAmount, 0);
  const totalPayable = debts
    .filter(d => d.type === 'i_owe' && d.status !== 'settled')
    .reduce((sum, d) => sum + d.remainingAmount, 0);

  const totalAssets = totalWallets + totalGoalsSaved + totalReceivable;
  const netWorth = totalAssets - totalPayable;

  // Income sources breakdown
  const incomeBreakdown = useMemo(() => {
    const incomeCats = categories.filter(c => c.type === 'income');
    const incomeTxs = transactions.filter(t => t.type === 'income');
    const totalInc = incomeTxs.reduce((sum, t) => sum + t.amount, 0);

    return incomeCats
      .map(cat => {
        const amount = incomeTxs
          .filter(t => t.categoryId === cat.id)
          .reduce((sum, t) => sum + t.amount, 0);
        const percent = totalInc > 0 ? (amount / totalInc) * 100 : 0;
        return {
          ...cat,
          amount,
          percent,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [categories, transactions]);

  // Family member analytics
  const memberAnalytics = useMemo(() => {
    return members.map(m => {
      const earned = transactions
        .filter(t => t.memberId === m.id && t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const spent = transactions
        .filter(t => t.memberId === m.id && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        ...m,
        earned,
        spent,
        net: earned - spent,
      };
    });
  }, [members, transactions]);

  return (
    <div className="relative">
      <div className="space-y-6">
        {/* 2026 Interactive Presentation Showcase Banner */}
        <motion.div
          whileHover={{ scale: 1.008 }}
          onClick={openPresentation}
          className="relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-[#06172e] to-slate-900 border border-cyan-500/30 p-4 sm:p-5 shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/20 transition-all duration-700" />
          <div className="flex items-center gap-3.5 z-10">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 text-slate-950 flex items-center justify-center font-black text-base shadow-[0_0_20px_rgba(6,182,212,0.5)] shrink-0">
              <Sparkles className="w-5 h-5 text-slate-950 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base leading-tight group-hover:text-cyan-200 transition-colors">
                  2026 Интерактив 3D Молиявий Саёҳат ва Тақдимот
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950/80 border border-cyan-500/50 text-cyan-300">
                  НАТИЖАНИ ҲИСОБЛАШ
                </span>
              </div>
              <p className="text-xs text-slate-300/80 mt-1 max-w-xl">
                Пул оқимлари, харажатлар галактикаси, мақсадлар чўққиси ва келажакни бошқариш симуляторини тўлиқ экранда кўринг
              </p>
            </div>
          </div>

          <div className="z-10 flex items-center gap-2 self-end sm:self-auto shrink-0">
            <div className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.4)] group-hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all">
              <span>Саёҳатни бошлаш</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </motion.div>

        {/* 1. Executive Net Worth Banner (Unified with Analytics) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-800"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Оилавий соф капитал (Net Worth)
                </span>
                <span className="text-emerald-400 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Юқори барқарорлик</span>
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-white mt-1">
                {formatMoney(netWorth, currency, language, exchangeRate)}
              </div>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <span>Жами активлар: <strong className="text-slate-200 font-mono tabular-nums">{formatCompactMoney(totalAssets, currency, language, exchangeRate)}</strong></span>
                <span aria-hidden="true">·</span>
                <span>Мажбуриятлар: <strong className="text-rose-400 font-mono tabular-nums">-{formatCompactMoney(totalPayable, currency, language, exchangeRate)}</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => setShowNetWorthDetails(!showNetWorthDetails)}
                className="px-3 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 active:scale-95 rounded-xl border border-slate-700 transition-all flex items-center gap-1.5"
              >
                <span>{showNetWorthDetails ? 'Тафсилотни ёпиш' : 'Активлар таҳлили'}</span>
                {showNetWorthDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Expandable Net Worth Detailed breakdown */}
          <AnimatePresence>
            {showNetWorthDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-4 mt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs overflow-hidden"
              >
                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                  <span className="text-slate-400 text-[11px] block">Ҳамёнларда:</span>
                  <span className="text-sm font-bold font-mono text-slate-100 tabular-nums">
                    {formatMoney(totalWallets, currency, language, exchangeRate)}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{wallets.length} та карта/ҳисоб</span>
                </div>

                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                  <span className="text-slate-400 text-[11px] block">Жамғармаларда:</span>
                  <span className="text-sm font-bold font-mono text-emerald-400 tabular-nums">
                    {formatMoney(totalGoalsSaved, currency, language, exchangeRate)}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{goals.length} та мақсадли жамғарма</span>
                </div>

                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                  <span className="text-slate-400 text-[11px] block">Ундириладиган:</span>
                  <span className="text-sm font-bold font-mono text-blue-400 tabular-nums">
                    {formatMoney(totalReceivable, currency, language, exchangeRate)}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Олинган қарзлар</span>
                </div>

                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                  <span className="text-slate-400 text-[11px] block">Тўланиши керак:</span>
                  <span className="text-sm font-bold font-mono text-rose-400 tabular-nums">
                    -{formatMoney(totalPayable, currency, language, exchangeRate)}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Менинг қарзларим</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* 2. Urgent Alerts Banner (Combined Debts + Recurring Bills!) */}
        <UrgentAlerts />

        {/* 3. Core Financial KPI Cards */}
        <FinancialKpiCards />

        {/* 4. Unified Cashflow & Analytics Center */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {analyticsMode === 'cashflow'
                  ? 'Пул оқимлари ва Динамика'
                  : analyticsMode === 'income_sources'
                  ? 'Даромад манбалари таҳлили'
                  : 'Оила аъзолари ҳиссаси ва харажатлари'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Молиявий ҳолатнинг кўп қиррали таҳлили
              </p>
            </div>

            {/* Segmented Mode Switcher */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl shrink-0">
              <button
                onClick={() => setAnalyticsMode('cashflow')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  analyticsMode === 'cashflow'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Динамика
              </button>
              <button
                onClick={() => setAnalyticsMode('income_sources')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  analyticsMode === 'income_sources'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Даромад манбалари
              </button>
              <button
                onClick={() => setAnalyticsMode('family')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  analyticsMode === 'family'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Оила аъзолари
              </button>
            </div>
          </div>

          {/* View mode 1: Cashflow chart */}
          {analyticsMode === 'cashflow' && <CashflowChart />}

          {/* View mode 2: Income Sources */}
          {analyticsMode === 'income_sources' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {incomeBreakdown.map(cat => {
                const catName = language === 'uz_cyrl' ? cat.name_cyrl : cat.name_latn;
                return (
                  <div key={cat.id} className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-white shrink-0"
                          style={{ backgroundColor: cat.color }}
                        >
                          <CategoryIcon name={cat.icon} className="w-3.5 h-3.5" />
                        </span>
                        <span className="font-bold text-slate-900">{catName}</span>
                      </div>
                      <div className="font-mono font-bold text-slate-900 tabular-nums">
                        {formatMoney(cat.amount, currency, language, exchangeRate)}
                        <span className="text-slate-400 text-[11px] ml-1 font-normal">
                          ({cat.percent.toFixed(1)}%)
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mt-2">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${cat.percent}%`, backgroundColor: cat.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* View mode 3: Family Contribution Matrix */}
          {analyticsMode === 'family' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {memberAnalytics.map(m => {
                const name = language === 'uz_cyrl' ? m.name_cyrl : m.name_latn;
                const role = language === 'uz_cyrl' ? m.role_cyrl : m.role_latn;

                return (
                  <div key={m.id} className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 text-xs">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-full text-white font-bold flex items-center justify-center text-xs shadow-xs"
                          style={{ backgroundColor: m.avatarColor }}
                        >
                          {name[0]}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{name}</span>
                          <span className="text-[10px] text-slate-400">{role}</span>
                        </div>
                      </div>

                      <div className="text-right font-mono font-bold">
                        <span className={m.net >= 0 ? 'text-emerald-700' : 'text-slate-700'}>
                          {m.net >= 0 ? '+' : ''}{formatMoney(m.net, currency, language, exchangeRate)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-200 text-slate-600 font-mono">
                      <div>
                        <span>Кирим: </span>
                        <strong className="text-emerald-600 font-semibold">
                          +{formatCompactMoney(m.earned, currency, language, exchangeRate)}
                        </strong>
                      </div>
                      <div className="text-right">
                        <span>Чиқим: </span>
                        <strong className="text-rose-600 font-semibold">
                          -{formatCompactMoney(m.spent, currency, language, exchangeRate)}
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 5. What-If Simulator Quick Callout */}
        <motion.div
          whileHover={{ scale: 1.005 }}
          className="bg-gradient-to-r from-emerald-900 to-slate-900 rounded-2xl p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm border border-emerald-800"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                Мақсадли жамғармалар ва Бюджет манипуляцияси симулятори
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Харажатларни 15-20% қисқартирганда янги машина ёки уй мақсадига неча ой тезроқ эришишни ҳисобланг
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('goals')}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all self-start sm:self-auto shrink-0 shadow-sm"
          >
            <span>Симуляторни очиш</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>

        {/* 6. 2-Column Split: Category Breakdown & Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            <CategoryBreakdown />
          </div>
          <div className="lg:col-span-6">
            <RecentTransactions />
          </div>
        </div>
      </div>

      {/* Floating Quick Add Menu */}
      <QuickAddFAB />
    </div>
  );
};
