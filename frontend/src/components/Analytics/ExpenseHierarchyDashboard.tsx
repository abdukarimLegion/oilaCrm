import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatMoney, formatCompactMoney, formatDateUz, CURRENT_DATE_STR } from '../../utils/formatters';
import { CategoryIcon } from '../Common/CategoryIcon';
import {
  LayoutGrid,
  Layers,
  BarChart3,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Users,
  Wallet,
  Calendar,
  Search,
  ChevronRight,
  ChevronDown,
  ArrowUpRight,
  SlidersHorizontal,
  Info,
  Sparkles,
  PieChart as PieIcon,
  CheckCircle2,
  Tag,
  CreditCard,
  Flame,
  Target,
  Activity,
  Compass,
  Filter,
  ArrowDownRight,
  Percent,
  Award,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

type HierarchyViewMode = 'pareto' | 'radial' | 'tree' | 'budget';
type TimeRangeFilter = 'month' | 'last30' | 'quarter' | 'year' | 'all';
type SortOption = 'amount' | 'share' | 'risk' | 'count';

interface CategoryHierarchyItem {
  id: string;
  name_uz?: string;
  name_cyrl?: string;
  name_latn?: string;
  displayName: string;
  color: string;
  icon: string;
  type: string;
  totalAmount: number;
  txCount: number;
  share: number;
  cumulativeShare: number;
  paretoTier: 'A' | 'B' | 'C';
  averageTx: number;
  dailyBurnRate: number;
  projectedMonthEnd: number;
  runwayDays: number | null;
  monthlyBudget: number;
  budgetUsagePercent: number;
  budgetRemaining: number;
  isExceeded: boolean;
  isWarning: boolean;
  memberBreakdown: Array<{
    id: string;
    name: string;
    avatarColor: string;
    amount: number;
    percent: number;
  }>;
  walletBreakdown: Array<{
    id: string;
    name: string;
    color: string;
    amount: number;
    percent: number;
  }>;
  topNotes: Array<{
    note: string;
    amount: number;
  }>;
  recentTxs: any[];
}

export const ExpenseHierarchyDashboard: React.FC = () => {
  const {
    transactions,
    categories,
    wallets,
    members,
    currency,
    language,
    exchangeRate,
    openCategoryLimitsModal,
  } = useApp();

  const [viewMode, setViewMode] = useState<HierarchyViewMode>('pareto');
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>('month');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('amount');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // 1. Filter expense transactions by chosen time range
  const filteredExpenseTxs = useMemo(() => {
    return transactions.filter(t => {
      if (t.type !== 'expense') return false;

      const txDate = t.date;
      if (timeRange === 'all') return true;

      const currentYearMonth = CURRENT_DATE_STR.substring(0, 7); // "2026-10"
      if (timeRange === 'month') {
        return txDate.startsWith(currentYearMonth);
      }

      const refDate = new Date(CURRENT_DATE_STR + 'T00:00:00');
      const txD = new Date(txDate + 'T00:00:00');
      const diffDays = (refDate.getTime() - txD.getTime()) / (1000 * 3600 * 24);

      if (timeRange === 'last30') {
        return diffDays >= 0 && diffDays <= 30;
      }
      if (timeRange === 'quarter') {
        return diffDays >= 0 && diffDays <= 90;
      }
      if (timeRange === 'year') {
        return txDate.startsWith(CURRENT_DATE_STR.substring(0, 4));
      }
      return true;
    });
  }, [transactions, timeRange]);

  const totalPeriodExpense = useMemo(() => {
    return filteredExpenseTxs.reduce((sum, t) => sum + t.amount, 0);
  }, [filteredExpenseTxs]);

  // Compute date progress for velocity metrics
  const dateContext = useMemo(() => {
    const currentDay = parseInt(CURRENT_DATE_STR.substring(8, 10), 10) || 28;
    const daysInMonth = 31; // October has 31 days
    const daysRemaining = Math.max(1, daysInMonth - currentDay);
    const daysElapsed = Math.max(1, currentDay);
    return { currentDay, daysInMonth, daysRemaining, daysElapsed };
  }, []);

  // 2. Aggregate category metrics with multi-dimensional hierarchy breakdown & Pareto classification
  const categoryHierarchyList: CategoryHierarchyItem[] = useMemo(() => {
    const expenseCats = categories.filter(c => c.type === 'expense');

    // First pass: aggregate totals
    const initialList = expenseCats.map(cat => {
      const catTxs = filteredExpenseTxs.filter(t => t.categoryId === cat.id);
      const totalAmount = catTxs.reduce((sum, t) => sum + t.amount, 0);
      const txCount = catTxs.length;
      const share = totalPeriodExpense > 0 ? (totalAmount / totalPeriodExpense) * 100 : 0;
      const averageTx = txCount > 0 ? Math.round(totalAmount / txCount) : 0;

      // Daily burn rate in current month
      const dailyBurnRate = Math.round(totalAmount / dateContext.daysElapsed);
      const projectedMonthEnd = Math.round(dailyBurnRate * dateContext.daysInMonth);

      // Hierarchy Level 2: Member Breakdown
      const memberBreakdownMap = new Map<string, number>();
      catTxs.forEach(t => {
        const cur = memberBreakdownMap.get(t.memberId) || 0;
        memberBreakdownMap.set(t.memberId, cur + t.amount);
      });
      const memberBreakdown = Array.from(memberBreakdownMap.entries())
        .map(([mId, amt]) => {
          const mem = members.find(m => m.id === mId);
          return {
            id: mId,
            name: mem ? (language === 'uz_cyrl' ? mem.name_cyrl : mem.name_latn) : 'Оила аъзоси',
            avatarColor: mem?.avatarColor || '#64748b',
            amount: amt,
            percent: totalAmount > 0 ? (amt / totalAmount) * 100 : 0,
          };
        })
        .sort((a, b) => b.amount - a.amount);

      // Hierarchy Level 2: Wallet Breakdown
      const walletBreakdownMap = new Map<string, number>();
      catTxs.forEach(t => {
        const cur = walletBreakdownMap.get(t.walletId) || 0;
        walletBreakdownMap.set(t.walletId, cur + t.amount);
      });
      const walletBreakdown = Array.from(walletBreakdownMap.entries())
        .map(([wId, amt]) => {
          const wal = wallets.find(w => w.id === wId);
          return {
            id: wId,
            name: wal ? (language === 'uz_cyrl' ? wal.name_cyrl : wal.name_latn) : 'Ҳамён',
            color: wal?.color || '#547f69',
            amount: amt,
            percent: totalAmount > 0 ? (amt / totalAmount) * 100 : 0,
          };
        })
        .sort((a, b) => b.amount - a.amount);

      // Top Merchants / Notes in this category
      const noteMap = new Map<string, number>();
      catTxs.forEach(t => {
        const cleanNote = (t.note || 'Харид').trim();
        noteMap.set(cleanNote, (noteMap.get(cleanNote) || 0) + t.amount);
      });
      const topNotes = Array.from(noteMap.entries())
        .map(([note, amt]) => ({ note, amount: amt }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 4);

      // Budget health
      const monthlyBudget = cat.monthlyBudget || 0;
      const budgetUsagePercent = monthlyBudget > 0 ? Math.round((totalAmount / monthlyBudget) * 100) : 0;
      const budgetRemaining = Math.max(0, monthlyBudget - totalAmount);
      const isExceeded = budgetUsagePercent >= 100;
      const isWarning = budgetUsagePercent >= 80 && budgetUsagePercent < 100;

      // Runway days left at current daily burn
      let runwayDays: number | null = null;
      if (monthlyBudget > 0) {
        if (dailyBurnRate > 0) {
          runwayDays = Math.floor(budgetRemaining / dailyBurnRate);
        } else {
          runwayDays = dateContext.daysRemaining;
        }
      }

      return {
        ...cat,
        displayName: language === 'uz_cyrl' ? cat.name_cyrl : cat.name_latn,
        totalAmount,
        txCount,
        share,
        averageTx,
        dailyBurnRate,
        projectedMonthEnd,
        runwayDays,
        memberBreakdown,
        walletBreakdown,
        topNotes,
        recentTxs: catTxs.slice(0, 5),
        monthlyBudget,
        budgetUsagePercent,
        budgetRemaining,
        isExceeded,
        isWarning,
      };
    });

    // Sort descending by amount to compute accurate Pareto ABC curve
    const sorted = [...initialList].sort((a, b) => b.totalAmount - a.totalAmount);

    let runningSum = 0;
    return sorted.map(item => {
      runningSum += item.totalAmount;
      const cumulativeShare = totalPeriodExpense > 0 ? (runningSum / totalPeriodExpense) * 100 : 0;

      // Pareto ABC Tier classification
      let paretoTier: 'A' | 'B' | 'C' = 'C';
      if (cumulativeShare <= 80 || (cumulativeShare > 80 && runningSum - item.totalAmount < totalPeriodExpense * 0.75)) {
        paretoTier = 'A'; // Core 80% spending block
      } else if (cumulativeShare <= 95) {
        paretoTier = 'B'; // Secondary 15% operational
      } else {
        paretoTier = 'C'; // Discretionary 5%
      }

      return {
        ...item,
        cumulativeShare,
        paretoTier,
      };
    });
  }, [categories, filteredExpenseTxs, totalPeriodExpense, members, wallets, language, dateContext]);

  // Active Category state for radial & inspector
  const activeCategoryId = selectedCategoryId || categoryHierarchyList[0]?.id || null;
  const activeCategory = useMemo(() => {
    return categoryHierarchyList.find(c => c.id === activeCategoryId) || categoryHierarchyList[0] || null;
  }, [categoryHierarchyList, activeCategoryId]);

  // Hovered item for Donut real-time center telemetry
  const displayCategory = useMemo(() => {
    if (hoveredCategoryId) {
      return categoryHierarchyList.find(c => c.id === hoveredCategoryId) || activeCategory;
    }
    return activeCategory;
  }, [hoveredCategoryId, activeCategory, categoryHierarchyList]);

  // Macro Statistics for Header Cards
  const topCategory = categoryHierarchyList[0];
  const topThreeConcentration = useMemo(() => {
    const top3Sum = categoryHierarchyList.slice(0, 3).reduce((sum, c) => sum + c.totalAmount, 0);
    return totalPeriodExpense > 0 ? (top3Sum / totalPeriodExpense) * 100 : 0;
  }, [categoryHierarchyList, totalPeriodExpense]);

  const activeCategoryCount = useMemo(() => {
    return categoryHierarchyList.filter(c => c.totalAmount > 0).length;
  }, [categoryHierarchyList]);

  // Total daily burn across all expenses
  const totalDailyBurn = useMemo(() => {
    return Math.round(totalPeriodExpense / dateContext.daysElapsed);
  }, [totalPeriodExpense, dateContext.daysElapsed]);

  const toggleExpand = (catId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  // Filtered & Sorted list for Pareto/Matrix view
  const processedCategoryList = useMemo(() => {
    let list = [...categoryHierarchyList];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(c => {
        const matchName = c.displayName.toLowerCase().includes(q);
        const matchNotes = c.topNotes.some(n => n.note.toLowerCase().includes(q));
        return matchName || matchNotes;
      });
    }

    // Sort
    if (sortBy === 'amount') {
      list.sort((a, b) => b.totalAmount - a.totalAmount);
    } else if (sortBy === 'share') {
      list.sort((a, b) => b.share - a.share);
    } else if (sortBy === 'risk') {
      list.sort((a, b) => b.budgetUsagePercent - a.budgetUsagePercent);
    } else if (sortBy === 'count') {
      list.sort((a, b) => b.txCount - a.txCount);
    }

    return list;
  }, [categoryHierarchyList, searchQuery, sortBy]);

  // Pareto Groups for high-level matrix breakdown
  const paretoGroups = useMemo(() => {
    const tierA = categoryHierarchyList.filter(c => c.paretoTier === 'A' && c.totalAmount > 0);
    const tierB = categoryHierarchyList.filter(c => c.paretoTier === 'B' && c.totalAmount > 0);
    const tierC = categoryHierarchyList.filter(c => c.paretoTier === 'C' && c.totalAmount > 0);

    const sumA = tierA.reduce((s, c) => s + c.totalAmount, 0);
    const sumB = tierB.reduce((s, c) => s + c.totalAmount, 0);
    const sumC = tierC.reduce((s, c) => s + c.totalAmount, 0);

    const shareA = totalPeriodExpense > 0 ? (sumA / totalPeriodExpense) * 100 : 0;
    const shareB = totalPeriodExpense > 0 ? (sumB / totalPeriodExpense) * 100 : 0;
    const shareC = totalPeriodExpense > 0 ? (sumC / totalPeriodExpense) * 100 : 0;

    return { tierA, tierB, tierC, sumA, sumB, sumC, shareA, shareB, shareC };
  }, [categoryHierarchyList, totalPeriodExpense]);

  // Data for Recharts Donut
  const donutChartData = useMemo(() => {
    return categoryHierarchyList
      .filter(item => item.totalAmount > 0)
      .map(item => ({
        name: item.displayName,
        value: item.totalAmount,
        color: item.color,
        id: item.id,
        share: item.share,
      }));
  }, [categoryHierarchyList]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-7 shadow-xs space-y-6 transition-colors duration-300">
      {/* -------------------------------------------------------------
          1. HEADER BAR & EXECUTIVE ANALYTICS CONTROLS
          ------------------------------------------------------------- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/50 shadow-2xs">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                  {language === 'uz_cyrl' ? 'Молиявий таҳлилчи ва сарф матрицаси' : 'Moliyaviy tahlilchi va sarf matritsasi'}
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-mono">
                  Executive Suite
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'uz_cyrl'
                  ? 'Парето 80/20 тамойили, кунлик ёниш суръати ва кўп босқичли иерархия'
                  : 'Pareto 80/20 tamoyili, kunlik sarf sur\'ati va ko\'p bosqichli iyerarxiya'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls: Range Selector + Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
          {/* Time Filter Segmented Control */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold">
            {[
              { id: 'month', label: language === 'uz_cyrl' ? 'Бу ой' : 'Bu oy' },
              { id: 'last30', label: language === 'uz_cyrl' ? '30 кун' : '30 kun' },
              { id: 'quarter', label: language === 'uz_cyrl' ? 'Квартал' : 'Kvartal' },
              { id: 'all', label: language === 'uz_cyrl' ? 'Барчаси' : 'Barchasi' },
            ].map(r => (
              <button
                key={r.id}
                onClick={() => setTimeRange(r.id as TimeRangeFilter)}
                className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  timeRange === r.id
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* View Mode Segmented Control */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setViewMode('pareto')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap ${
                viewMode === 'pareto'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Парето 80/20 Сарф Матрицаси"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{language === 'uz_cyrl' ? 'Матрица (ABC)' : 'Matritsa (ABC)'}</span>
            </button>
            <button
              onClick={() => setViewMode('radial')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap ${
                viewMode === 'radial'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Интерактив Ҳалқа ва Тақсимот"
            >
              <PieIcon className="w-3.5 h-3.5" />
              <span>{language === 'uz_cyrl' ? 'Радиал Ҳалқа' : 'Radial Halqa'}</span>
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap ${
                viewMode === 'tree'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Кўп босқичли Иерархия"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{language === 'uz_cyrl' ? 'Иерархия' : 'Iyerarxiya'}</span>
            </button>
            <button
              onClick={() => setViewMode('budget')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap ${
                viewMode === 'budget'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Бюджет лимити таҳлили"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{language === 'uz_cyrl' ? 'Лимитлар' : 'Limitlar'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          2. EXECUTIVE SUMMARY METRIC STRIP (ANALYST METRICS)
          ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* KPI 1: Total Period Expenses */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {language === 'uz_cyrl' ? 'Танланган даврда жами' : 'Tanlangan davrda jami'}
            </span>
            <Activity className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums mt-1 tracking-tight">
            {formatMoney(totalPeriodExpense, currency, language, exchangeRate)}
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-1">
            <span>{filteredExpenseTxs.length} {language === 'uz_cyrl' ? 'та амалиёт' : 'ta operatsiya'}</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">
              ~{formatCompactMoney(totalDailyBurn, currency, language, exchangeRate)}/кун
            </span>
          </div>
        </div>

        {/* KPI 2: Dominant Category */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {language === 'uz_cyrl' ? 'Асосий харажат драйвери' : 'Asosiy xarajat drayveri'}
            </span>
            <Flame className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="w-3 h-3 rounded-md shrink-0 shadow-2xs"
              style={{ backgroundColor: topCategory?.color || '#547f69' }}
            />
            <span className="text-base font-extrabold text-slate-900 dark:text-white truncate">
              {topCategory?.displayName || '---'}
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono mt-1">
            <span className="text-rose-600 dark:text-rose-400 font-bold">
              {topCategory?.share.toFixed(1)}% {language === 'uz_cyrl' ? 'улуш' : 'ulush'}
            </span>
            <span className="text-slate-400">
              {formatCompactMoney(topCategory?.totalAmount || 0, currency, language, exchangeRate)}
            </span>
          </div>
        </div>

        {/* KPI 3: Pareto 80/20 Concentration Ratio */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {language === 'uz_cyrl' ? 'Парето Концентрацияси' : 'Pareto Konsentratsiyasi'}
            </span>
            <Percent className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums mt-1">
            {topThreeConcentration.toFixed(1)}%
          </div>
          <div className="flex items-center justify-between text-[10px] mt-1">
            <span className="text-slate-500 dark:text-slate-400">Топ 3 тоифа юки</span>
            <span className={`font-bold ${topThreeConcentration > 75 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600'}`}>
              {topThreeConcentration > 75
                ? (language === 'uz_cyrl' ? 'Юқори юк' : 'Yuqori yuk')
                : (language === 'uz_cyrl' ? 'Мувозанатли' : 'Muvozanatli')}
            </span>
          </div>
        </div>

        {/* KPI 4: Monthly Spend Velocity & Days */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {language === 'uz_cyrl' ? 'Ойлик ёниш суръати' : 'Oylik sarf sur\'ati'}
            </span>
            <Target className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums mt-1">
            {dateContext.daysElapsed} / {dateContext.daysInMonth}{' '}
            <span className="text-xs font-normal text-slate-400">{language === 'uz_cyrl' ? 'кун' : 'kun'}</span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-1">
            <span>{dateContext.daysRemaining} {language === 'uz_cyrl' ? 'кун қолди' : 'kun qoldi'}</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              {activeCategoryCount} {language === 'uz_cyrl' ? 'тоифа фаол' : 'faol'}
            </span>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          3. VIEW 1: PARETO 80/20 EXPENSE MATRIX (PRIMARY ANALYST DASHBOARD)
             Replaces the crude treemap with high-precision financial matrix
          ------------------------------------------------------------- */}
      {viewMode === 'pareto' && (
        <div className="space-y-5">
          {/* Executive Pareto Breakdown Strip (A / B / C Tier Bands) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <h4 className="font-extrabold text-sm text-white">
                    {language === 'uz_cyrl' ? 'Парето (ABC) Таҳлили: Харажатлар Вазни' : 'Pareto (ABC) Tahlili'}
                  </h4>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {language === 'uz_cyrl'
                    ? '80% харажатлар атиги бир нечта ўзак тоифаларда тўпланган (A-Гуруҳ)'
                    : '80% xarajatlar asosiy o\'zak toifalarda to\'plangan (A-Guruh)'}
                </p>
              </div>

              {/* Tier Legend Badges */}
              <div className="flex items-center gap-2 text-[10px] font-mono">
                <span className="px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold">
                  A (Ўзак 80%)
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold">
                  B (Муҳим 15%)
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold">
                  C (Ихтиёрий 5%)
                </span>
              </div>
            </div>

            {/* Visual Cumulative Stacked Proportion Bar */}
            <div className="space-y-1.5">
              <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-800">
                <div
                  style={{ width: `${paretoGroups.shareA}%` }}
                  className="h-full bg-linear-to-r from-rose-500 to-rose-600 transition-all duration-500"
                  title={`Класс A: ${paretoGroups.shareA.toFixed(1)}%`}
                />
                <div
                  style={{ width: `${paretoGroups.shareB}%` }}
                  className="h-full bg-linear-to-r from-amber-500 to-amber-600 transition-all duration-500"
                  title={`Класс B: ${paretoGroups.shareB.toFixed(1)}%`}
                />
                <div
                  style={{ width: `${paretoGroups.shareC}%` }}
                  className="h-full bg-linear-to-r from-emerald-500 to-emerald-600 transition-all duration-500"
                  title={`Класс C: ${paretoGroups.shareC.toFixed(1)}%`}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs font-mono pt-1">
                <div>
                  <span className="text-rose-400 font-bold block">
                    A-Гуруҳ ({paretoGroups.tierA.length} тоифа)
                  </span>
                  <span className="text-white font-extrabold tabular-nums">
                    {formatCompactMoney(paretoGroups.sumA, currency, language, exchangeRate)}
                  </span>
                  <span className="text-[10px] text-slate-400 ml-1">({paretoGroups.shareA.toFixed(0)}%)</span>
                </div>
                <div>
                  <span className="text-amber-400 font-bold block">
                    B-Гуруҳ ({paretoGroups.tierB.length} тоифа)
                  </span>
                  <span className="text-white font-extrabold tabular-nums">
                    {formatCompactMoney(paretoGroups.sumB, currency, language, exchangeRate)}
                  </span>
                  <span className="text-[10px] text-slate-400 ml-1">({paretoGroups.shareB.toFixed(0)}%)</span>
                </div>
                <div>
                  <span className="text-emerald-400 font-bold block">
                    C-Гуруҳ ({paretoGroups.tierC.length} тоифа)
                  </span>
                  <span className="text-white font-extrabold tabular-nums">
                    {formatCompactMoney(paretoGroups.sumC, currency, language, exchangeRate)}
                  </span>
                  <span className="text-[10px] text-slate-400 ml-1">({paretoGroups.shareC.toFixed(0)}%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Search, Filter & Sort Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={
                  language === 'uz_cyrl'
                    ? 'Тоифа ёки харид йўналиши бўйича филтрлаш...'
                    : 'Toifa yoki xarid yo\'nalishi bo\'yicha filtrlash...'
                }
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">
                {language === 'uz_cyrl' ? 'Саралаш:' : 'Saralash:'}
              </span>
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setSortBy('amount')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    sortBy === 'amount'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Сумма
                </button>
                <button
                  onClick={() => setSortBy('share')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    sortBy === 'share'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Улуш
                </button>
                <button
                  onClick={() => setSortBy('risk')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    sortBy === 'risk'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Лимит хавфи
                </button>
                <button
                  onClick={() => setSortBy('count')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    sortBy === 'count'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Амалиётлар
                </button>
              </div>
            </div>
          </div>

          {/* Professional Category Matrix Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {processedCategoryList.map((cat, idx) => {
              const isSelected = activeCategoryId === cat.id;

              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer text-left relative overflow-hidden group ${
                    isSelected
                      ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-500 dark:border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
                  }`}
                >
                  {/* Top Tier Accent Bar */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1 transition-opacity duration-200"
                    style={{
                      backgroundColor:
                        cat.paretoTier === 'A'
                          ? '#f43f5e'
                          : cat.paretoTier === 'B'
                          ? '#f59e0b'
                          : '#10b981',
                    }}
                  />

                  {/* Header: Icon, Name, Tier Chip, Share */}
                  <div className="flex items-start justify-between gap-3 mb-3 pt-1">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
                        style={{ backgroundColor: cat.color }}
                      >
                        <CategoryIcon name={cat.icon} className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                            {cat.displayName}
                          </h4>
                          <span
                            className={`text-[9px] font-black font-mono px-1.5 py-0.5 rounded-sm shrink-0 ${
                              cat.paretoTier === 'A'
                                ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300'
                                : cat.paretoTier === 'B'
                                ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300'
                                : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300'
                            }`}
                          >
                            Класс {cat.paretoTier}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono block">
                          {cat.txCount} та амалиёт · ўртача {formatCompactMoney(cat.averageTx, currency, language, exchangeRate)}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono text-sm font-black text-slate-900 dark:text-white tabular-nums">
                        {cat.share.toFixed(1)}%
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">улуш</span>
                    </div>
                  </div>

                  {/* Amount & Burn Rate Metrics */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-500 font-medium">Сарфланган:</span>
                      <span className="font-mono text-base font-black text-slate-900 dark:text-white tabular-nums">
                        {formatMoney(cat.totalAmount, currency, language, exchangeRate)}
                      </span>
                    </div>

                    {/* Progress Bar of Category Share */}
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, (cat.totalAmount / (categoryHierarchyList[0]?.totalAmount || 1)) * 100)}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>

                    {/* Analytical Metrics: Daily Velocity & Runway */}
                    <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-mono">
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80">
                        <span className="text-[10px] text-slate-400 block">Кунлик суръат:</span>
                        <strong className="text-slate-800 dark:text-slate-200 tabular-nums">
                          {formatCompactMoney(cat.dailyBurnRate, currency, language, exchangeRate)}/кун
                        </strong>
                      </div>

                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80">
                        <span className="text-[10px] text-slate-400 block">Лимит / Ҳолат:</span>
                        {cat.monthlyBudget > 0 ? (
                          <strong
                            className={`tabular-nums ${
                              cat.isExceeded
                                ? 'text-rose-600 dark:text-rose-400'
                                : cat.isWarning
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            {cat.budgetUsagePercent}% ({cat.isExceeded ? 'Ошган' : `${cat.runwayDays}к захира`})
                          </strong>
                        ) : (
                          <span className="text-slate-400">Лимитсиз</span>
                        )}
                      </div>
                    </div>

                    {/* Quick Micro Member Badges */}
                    {cat.memberBreakdown.length > 0 && (
                      <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500">
                        <span>Аъзолар:</span>
                        <div className="flex items-center -space-x-1">
                          {cat.memberBreakdown.slice(0, 4).map(m => (
                            <span
                              key={m.id}
                              title={`${m.name}: ${m.percent.toFixed(0)}%`}
                              className="w-4 h-4 rounded-full border border-white dark:border-slate-900 flex items-center justify-center text-[8px] font-bold text-white shadow-2xs"
                              style={{ backgroundColor: m.avatarColor }}
                            >
                              {m.name.charAt(0)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          4. VIEW 2: INTERACTIVE RADIAL DONUT MATRIX & CATEGORY INSPECTOR
             Replaces the crude treemap with high-tech radial visualization
          ------------------------------------------------------------- */}
      {viewMode === 'radial' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Interactive Radial Donut with Real-Time Center Telemetry (7 cols) */}
          <div className="lg:col-span-7 bg-slate-50/70 dark:bg-slate-800/40 rounded-3xl p-5 sm:p-6 border border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                {language === 'uz_cyrl'
                  ? 'Интерактив ҳалқа: Тоифа устига боринг ва танланг'
                  : 'Interaktiv halqa: Toifa ustiga boring va tanlang'}
              </span>
              <span className="font-mono text-[11px] font-bold">
                {donutChartData.length} {language === 'uz_cyrl' ? 'тоифа' : 'toifa'}
              </span>
            </div>

            {/* Donut Chart Container with Center Telemetry Display */}
            <div className="relative h-[340px] sm:h-[380px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-xl border border-slate-700/80 shadow-2xl text-xs space-y-1">
                            <div className="flex items-center gap-1.5 font-bold">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: data.color }}
                              />
                              <span>{data.name}</span>
                            </div>
                            <div className="font-mono font-extrabold text-sm text-emerald-400">
                              {formatMoney(data.value, currency, language, exchangeRate)}
                            </div>
                            <div className="text-[10px] text-slate-300 font-mono">
                              Улуш: {data.share.toFixed(1)}%
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Pie
                    data={donutChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={128}
                    paddingAngle={3}
                    dataKey="value"
                    onMouseEnter={(_, index) => {
                      if (donutChartData[index]) {
                        setHoveredCategoryId(donutChartData[index].id);
                      }
                    }}
                    onMouseLeave={() => setHoveredCategoryId(null)}
                    onClick={(_, index) => {
                      if (donutChartData[index]) {
                        setSelectedCategoryId(donutChartData[index].id);
                      }
                    }}
                    cursor="pointer"
                  >
                    {donutChartData.map((entry, index) => {
                      const isHovered = (hoveredCategoryId || activeCategoryId) === entry.id;
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke={isHovered ? '#ffffff' : 'transparent'}
                          strokeWidth={isHovered ? 3 : 0}
                          className="transition-all duration-200 hover:opacity-90"
                        />
                      );
                    })}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Center Live Telemetry Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
                {displayCategory ? (
                  <div className="space-y-0.5 animate-fadeIn">
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">
                      {displayCategory.paretoTier}-Гуруҳ ({displayCategory.share.toFixed(1)}%)
                    </span>
                    <h5 className="text-sm font-extrabold text-slate-900 dark:text-white max-w-[150px] truncate mx-auto">
                      {displayCategory.displayName}
                    </h5>
                    <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-mono tabular-nums">
                      {formatCompactMoney(displayCategory.totalAmount, currency, language, exchangeRate)}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      ~{formatCompactMoney(displayCategory.dailyBurnRate, currency, language, exchangeRate)}/кун
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="text-xs text-slate-400 font-medium">Жами сарф</span>
                    <div className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                      {formatCompactMoney(totalPeriodExpense, currency, language, exchangeRate)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Horizontal Category Badges */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              {categoryHierarchyList.slice(0, 8).map(c => {
                const isActive = (hoveredCategoryId || activeCategoryId) === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategoryId(c.id)}
                    onMouseEnter={() => setHoveredCategoryId(c.id)}
                    onMouseLeave={() => setHoveredCategoryId(null)}
                    className={`px-2.5 py-1 rounded-xl text-xs flex items-center gap-1.5 transition-all ${
                      isActive
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 hover:border-slate-400'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                    <span>{c.displayName}</span>
                    <span className="font-mono text-[10px] opacity-75">{c.share.toFixed(0)}%</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Multi-Dimensional Category Intelligence Card (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5">
            {activeCategory ? (
              <>
                {/* Active Category Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xs shrink-0"
                      style={{ backgroundColor: activeCategory.color }}
                    >
                      <CategoryIcon name={activeCategory.icon} className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                          {activeCategory.displayName}
                        </h4>
                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {activeCategory.share.toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">
                        {activeCategory.txCount} {language === 'uz_cyrl' ? 'та амалиёт' : 'ta operatsiya'} · ўртача{' '}
                        {formatCompactMoney(activeCategory.averageTx, currency, language, exchangeRate)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-black text-slate-900 dark:text-white font-mono tabular-nums leading-tight">
                      {formatMoney(activeCategory.totalAmount, currency, language, exchangeRate)}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {language === 'uz_cyrl' ? 'жами сарфланган' : 'jami sarflangan'}
                    </span>
                  </div>
                </div>

                {/* Analytical Burn & Runway Card */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Кунлик суръат:</span>
                    <strong className="text-sm font-extrabold text-slate-900 dark:text-white tabular-nums">
                      {formatCompactMoney(activeCategory.dailyBurnRate, currency, language, exchangeRate)}/кун
                    </strong>
                    <span className="text-[10px] text-slate-400 block mt-0.5 font-sans">
                      Ой якуни: ~{formatCompactMoney(activeCategory.projectedMonthEnd, currency, language, exchangeRate)}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Лимит захираси:</span>
                    {activeCategory.monthlyBudget > 0 ? (
                      <div>
                        <strong
                          className={`text-sm font-extrabold tabular-nums ${
                            activeCategory.isExceeded
                              ? 'text-rose-600 dark:text-rose-400'
                              : activeCategory.isWarning
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {activeCategory.isExceeded ? 'Лимит ошди!' : `${activeCategory.runwayDays} кунга етади`}
                        </strong>
                        <span className="text-[10px] text-slate-400 block mt-0.5 font-sans">
                          Лимит: {formatCompactMoney(activeCategory.monthlyBudget, currency, language, exchangeRate)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs mt-1 block">Лимит белгиланмаган</span>
                    )}
                  </div>
                </div>

                {/* Monthly Budget Limit Progress Bar */}
                {activeCategory.monthlyBudget > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-300 font-medium">Лимитдан фойдаланиш:</span>
                      <span
                        className={`font-mono font-bold ${
                          activeCategory.isExceeded
                            ? 'text-rose-600'
                            : activeCategory.isWarning
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        {activeCategory.budgetUsagePercent}%
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          activeCategory.isExceeded
                            ? 'bg-rose-500'
                            : activeCategory.isWarning
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, activeCategory.budgetUsagePercent)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Sub-Hierarchy 1: Member Spending Distribution */}
                <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-500" />
                    <span>{language === 'uz_cyrl' ? 'Оила аъзолари улуши' : 'Oila a\'zolari ulushi'}</span>
                  </span>

                  {activeCategory.memberBreakdown.length > 0 ? (
                    <div className="space-y-2">
                      {activeCategory.memberBreakdown.map(m => (
                        <div key={m.id} className="text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: m.avatarColor }}
                              />
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{m.name}</span>
                            </div>
                            <div className="font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                              {formatCompactMoney(m.amount, currency, language, exchangeRate)}{' '}
                              <span className="text-[10px] text-slate-400 font-normal">({m.percent.toFixed(0)}%)</span>
                            </div>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{ width: `${m.percent}%`, backgroundColor: m.avatarColor }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Маълумот мавжуд эмас</p>
                  )}
                </div>

                {/* Sub-Hierarchy 2: Payment Methods Used */}
                <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{language === 'uz_cyrl' ? 'Тўлов манбалари' : 'To\'lov manbalari'}</span>
                  </span>

                  <div className="flex flex-wrap gap-2">
                    {activeCategory.walletBreakdown.map(w => (
                      <div
                        key={w.id}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 text-xs flex items-center gap-2"
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: w.color }} />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{w.name}</span>
                        <span className="font-mono font-bold text-slate-500 dark:text-slate-400 text-[11px]">
                          {w.percent.toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Purchases in this Category */}
                {activeCategory.topNotes.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{language === 'uz_cyrl' ? 'Асосий харид йўналишлари' : 'Asosiy xarid yo\'nalishlari'}</span>
                    </span>

                    <div className="space-y-1.5">
                      {activeCategory.topNotes.map((n, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-slate-50/60 dark:bg-slate-800/40"
                        >
                          <span className="text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                            {n.note}
                          </span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                            {formatCompactMoney(n.amount, currency, language, exchangeRate)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                {language === 'uz_cyrl' ? 'Тоифа танланмаган' : 'Toifa tanlanmagan'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          5. VIEW 3: MULTI-LEVEL EXPANDABLE HIERARCHY TREE
          ------------------------------------------------------------- */}
      {viewMode === 'tree' && (
        <div className="space-y-4">
          {/* Search bar inside tree view */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={language === 'uz_cyrl' ? 'Тоифа ёки харид номи бўйича қидириш...' : 'Qidirish...'}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-3">
            {processedCategoryList.map(cat => {
              const isExpanded = !!expandedCategories[cat.id];
              return (
                <div
                  key={cat.id}
                  className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs transition-all"
                >
                  {/* Category Main Row */}
                  <div
                    onClick={() => toggleExpand(cat.id)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                        style={{ backgroundColor: cat.color }}
                      >
                        <CategoryIcon name={cat.icon} className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                            {cat.displayName}
                          </h4>
                          <span
                            className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-sm ${
                              cat.paretoTier === 'A'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            Класс {cat.paretoTier}
                          </span>
                          <span className="font-mono text-[11px] font-bold text-slate-500">
                            {cat.share.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-0.5">
                          <span>{cat.txCount} та харид</span>
                          <span>·</span>
                          <span>ўртача {formatCompactMoney(cat.averageTx, currency, language, exchangeRate)}</span>
                          <span>·</span>
                          <span>~{formatCompactMoney(cat.dailyBurnRate, currency, language, exchangeRate)}/кун</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-base font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
                          {formatMoney(cat.totalAmount, currency, language, exchangeRate)}
                        </div>
                        {cat.monthlyBudget > 0 && (
                          <div
                            className={`text-[10px] font-mono font-bold ${
                              cat.isExceeded ? 'text-rose-600' : 'text-slate-400'
                            }`}
                          >
                            Лимит: {cat.budgetUsagePercent}%
                          </div>
                        )}
                      </div>

                      <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Level 2: Expanded Sub-hierarchy Branches */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-4 space-y-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Sub-branch: Family members */}
                          <div className="space-y-2">
                            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                              Оила аъзолари улуши:
                            </span>
                            <div className="space-y-1.5">
                              {cat.memberBreakdown.map(m => (
                                <div
                                  key={m.id}
                                  className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.avatarColor }} />
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">{m.name}</span>
                                  </div>
                                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                                    {formatMoney(m.amount, currency, language, exchangeRate)} ({m.percent.toFixed(0)}%)
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Sub-branch: Top purchases/notes */}
                          <div className="space-y-2">
                            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                              Энг йирик харид йўналишлари:
                            </span>
                            <div className="space-y-1.5">
                              {cat.topNotes.map((n, i) => (
                                <div
                                  key={i}
                                  className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60"
                                >
                                  <span className="text-slate-700 dark:text-slate-300 truncate">{n.note}</span>
                                  <span className="font-mono font-bold text-slate-900 dark:text-white shrink-0 ml-2">
                                    {formatMoney(n.amount, currency, language, exchangeRate)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          6. VIEW 4: BUDGET RATIOS & EFFICIENCY MATRIX
          ------------------------------------------------------------- */}
      {viewMode === 'budget' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              {language === 'uz_cyrl'
                ? 'Ҳар бир тоифанинг белгиланган ойлик лимитга нисбатан сарфланиш ҳолати ва захираси'
                : 'Har bir toifaning limitga nisbatan sarflanishi va zaxirasi'}
            </span>
            <button
              onClick={openCategoryLimitsModal}
              className="px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-xs flex items-center gap-1.5 hover:opacity-90 transition-opacity shadow-xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{language === 'uz_cyrl' ? 'Лимитларни таҳрирлаш' : 'Limitlarni tahrirlash'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {processedCategoryList.map(cat => {
              const hasLimit = cat.monthlyBudget > 0;
              return (
                <div
                  key={cat.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    cat.isExceeded
                      ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                      : cat.isWarning
                      ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60'
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs shrink-0"
                        style={{ backgroundColor: cat.color }}
                      >
                        <CategoryIcon name={cat.icon} className="w-4 h-4" />
                      </div>
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                        {cat.displayName}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        cat.isExceeded
                          ? 'bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100'
                          : cat.isWarning
                          ? 'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100'
                          : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                      }`}
                    >
                      {hasLimit ? `${cat.budgetUsagePercent}%` : 'Лимитсиз'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-slate-500 font-medium">Сарфланди:</span>
                      <span className="font-mono font-extrabold text-slate-900 dark:text-white">
                        {formatMoney(cat.totalAmount, currency, language, exchangeRate)}
                      </span>
                    </div>

                    {hasLimit && (
                      <>
                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              cat.isExceeded ? 'bg-rose-500' : cat.isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, cat.budgetUsagePercent)}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          <span>Лимит: {formatCompactMoney(cat.monthlyBudget, currency, language, exchangeRate)}</span>
                          <span className={cat.isExceeded ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                            {cat.isExceeded
                              ? `+${formatCompactMoney(cat.totalAmount - cat.monthlyBudget, currency, language, exchangeRate)} ошди`
                              : `${formatCompactMoney(cat.budgetRemaining, currency, language, exchangeRate)} қолдиқ`}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          7. EXECUTIVE ANALYST SYNTHESIS & STRATEGIC RECOMMENDATION
          ------------------------------------------------------------- */}
      <div className="p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4.5 h-4.5" />
          </div>
          <div>
            <p className="text-slate-700 dark:text-slate-300">
              <strong className="text-slate-900 dark:text-white font-bold">
                {language === 'uz_cyrl' ? 'Таҳлилчи хулосаси:' : 'Tahlilchi xulosasi:'}
              </strong>{' '}
              {language === 'uz_cyrl'
                ? `Харажатларнинг ${topThreeConcentration.toFixed(0)}% қисми Топ-3 соҳага (A-Гуруҳ) тўғри келмоқда. Кунлик ўртача сарф ${formatCompactMoney(totalDailyBurn, currency, language, exchangeRate)} ни ташкил қилиб, ой якунигача бюджет чегарасида барқарор назорат қилинмоқда.`
                : `Xarajatlarning ${topThreeConcentration.toFixed(0)}% qismi Top-3 sohaga (A-Guruh) to'g'ri kelmoqda. Kunlik o'rtacha sarf ${formatCompactMoney(totalDailyBurn, currency, language, exchangeRate)} ni tashkil qilmoqda.`}
            </p>
          </div>
        </div>

        <button
          onClick={() => setViewMode(viewMode === 'pareto' ? 'radial' : 'pareto')}
          className="text-xs font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5 whitespace-nowrap self-end sm:self-auto px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors"
        >
          <span>{viewMode === 'pareto' ? 'Радиал Ҳалқага ўтиш' : 'Матрицага (ABC) қайтиш'}</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
