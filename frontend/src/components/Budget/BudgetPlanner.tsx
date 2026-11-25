import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatMoney,
  formatCompactMoney,
  CURRENT_DATE_STR,
  getRecurringStatus,
} from '../../utils/formatters';
import {
  LayoutGrid,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight,
  Info,
  Zap,
  MonitorPlay,
  CalendarClock,
  BellRing,
  CreditCard,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CategoryIcon } from '../Common/CategoryIcon';

type BudgetView = 'limits' | 'subscriptions' | 'daily';

export const BudgetPlanner: React.FC = () => {
  const {
    categories,
    transactions,
    recurringItems,
    currency,
    language,
    exchangeRate,
    updateCategoryBudgets,
    payRecurringItem,
    wallets,
    monthlyBudgetLimit,
  } = useApp();

  const [activeView, setActiveView] = useState<BudgetView>('limits');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editLimitValue, setEditLimitValue] = useState<number>(0);

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  const budgetData = useMemo(() => {
    const currentMonth = CURRENT_DATE_STR.substring(0, 7); // YYYY-MM
    return expenseCategories.map((cat) => {
      const spent = transactions
        .filter(
          (t) =>
            t.type === 'expense' &&
            t.categoryId === cat.id &&
            t.date.startsWith(currentMonth)
        )
        .reduce((sum, t) => sum + t.amount, 0);

      const limit = cat.monthlyBudget || 0;
      const percent = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : spent > 0 ? 100 : 0;
      const status = percent >= 100 ? 'danger' : percent >= 80 ? 'warning' : 'safe';

      return {
        ...cat,
        spent,
        limit,
        percent,
        status,
        remaining: Math.max(0, limit - spent),
      };
    });
  }, [expenseCategories, transactions]);

  const subscriptionsData = useMemo(() => {
    return recurringItems
      .filter((item) => item.type === 'expense' && item.isActive)
      .map((item) => {
        const status = getRecurringStatus(item.dueDayOfMonth, item.lastPaidDate, CURRENT_DATE_STR);
        const category = categories.find((c) => c.id === item.categoryId);
        const wallet = wallets.find((w) => w.id === item.walletId);
        
        return {
          ...item,
          status,
          category,
          wallet,
        };
      })
      .sort((a, b) => {
        // Sort by urgency: overdue first, then today, then soon, then upcoming, then paid
        const order: Record<string, number> = { overdue: 0, today: 1, soon: 2, upcoming: 3, paid: 4 };
        return order[a.status.status] - order[b.status.status];
      });
  }, [recurringItems, categories, wallets]);

  const dailyBudgetData = useMemo(() => {
    const [year, month, day] = CURRENT_DATE_STR.split('-').map(Number);
    // Calculate total days in current month
    const totalDaysInMonth = new Date(year, month, 0).getDate();
    const daysRemaining = totalDaysInMonth - day + 1; // including today

    const currentMonthPrefix = CURRENT_DATE_STR.substring(0, 7);
    const monthExpenses = transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(currentMonthPrefix))
      .reduce((sum, t) => sum + t.amount, 0);

    const remainingMonthBudget = Math.max(0, monthlyBudgetLimit - monthExpenses);
    const safeToSpendDaily = daysRemaining > 0 ? remainingMonthBudget / daysRemaining : 0;

    const todaySpent = transactions
      .filter(t => t.type === 'expense' && t.date === CURRENT_DATE_STR)
      .reduce((sum, t) => sum + t.amount, 0);

    const isOverLimit = todaySpent > safeToSpendDaily;
    const progressPercent = safeToSpendDaily > 0 ? Math.min(100, Math.round((todaySpent / safeToSpendDaily) * 100)) : todaySpent > 0 ? 100 : 0;

    return {
      safeToSpendDaily,
      todaySpent,
      daysRemaining,
      totalRemaining: remainingMonthBudget,
      isOverLimit,
      progressPercent,
      totalMonthLimit: monthlyBudgetLimit,
      monthSpent: monthExpenses,
    };
  }, [transactions, monthlyBudgetLimit]);

  const handleEditLimit = (catId: string, currentLimit: number) => {
    setEditingCategoryId(catId);
    setEditLimitValue(currentLimit);
  };

  const saveLimit = () => {
    if (editingCategoryId) {
      updateCategoryBudgets(editingCategoryId, undefined, undefined, editLimitValue);
      setEditingCategoryId(null);
    }
  };

  const [isForecasting, setIsForecasting] = useState(false);
  const [forecastResults, setForecastResults] = useState<{
    suggestions: Array<{ categoryId: string; suggestedLimit: number; reasoning: string }>;
    summary: string;
  } | null>(null);

  const runAiForecast = async () => {
    setIsForecasting(true);
    setForecastResults(null);
    try {
      const response = await fetch('/api/ai/budget-forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactions,
          categories,
          currency,
        }),
      });

      if (!response.ok) throw new Error('Forecast failed');
      const data = await response.json();
      setForecastResults(data);
    } catch (err) {
      console.error('Forecast error:', err);
    } finally {
      setIsForecasting(false);
    }
  };

  const applySuggestedLimit = (catId: string, amount: number) => {
    updateCategoryBudgets(catId, undefined, undefined, amount);
    // Remove from results after applying
    if (forecastResults) {
      setForecastResults({
        ...forecastResults,
        suggestions: forecastResults.suggestions.filter(s => s.categoryId !== catId)
      });
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Бюджетни Режалаштириш
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {activeView === 'limits' 
              ? 'Ҳар бир тоифа учун ойлик харажат лимитларини белгиланг ва уларни назорат қилинг'
              : activeView === 'subscriptions'
              ? 'Ойлик такрорланувчи тўловлар ва обуналарни бошқаринг'
              : 'Бугунги кун учун хавфсиз харажат миқдорини кузатинг'}
          </p>
        </div>

        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit self-start sm:self-auto overflow-x-auto transition-colors duration-300">
          <button
            onClick={() => setActiveView('limits')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
              activeView === 'limits'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Лимитлар
          </button>
          <button
            onClick={() => setActiveView('daily')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
              activeView === 'daily'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Кунлик
          </button>
          <button
            onClick={() => setActiveView('subscriptions')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeView === 'subscriptions'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Обуналар
            {subscriptionsData.some(s => s.status.isAlert) && (
              <span className="flex h-2 w-2 rounded-full bg-rose-500" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeView === 'limits' ? (
          <motion.div
            key="limits-view"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-6"
          >
            {/* AI Forecast Trigger Section */}
            <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 rounded-[32px] p-6 text-white shadow-xl relative overflow-hidden group transition-all">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-fuchsia-300 animate-pulse" />
                    <h3 className="text-lg font-black tracking-tight uppercase italic">AI Молиявий Прогноз</h3>
                  </div>
                  <p className="text-xs font-medium text-indigo-100 max-w-md leading-relaxed">
                    Харажатларингиз тарихини таҳлил қилиб, келаси ой учун энг мақбул бюджет лимитларини автоматик аниқлаймиз.
                  </p>
                </div>
                
                <button
                  onClick={runAiForecast}
                  disabled={isForecasting}
                  className="px-6 py-3 bg-white text-indigo-700 rounded-2xl font-black text-xs shadow-lg hover:shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isForecasting ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      <span>Таҳлил қилинмоқда...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-current" />
                      <span>Ақлли Прогнозни Ишга Тушириш</span>
                    </>
                  )}
                </button>
              </div>

              {/* Forecast Results Section */}
              <AnimatePresence>
                {forecastResults && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-6 pt-6 border-t border-white/20 overflow-hidden"
                  >
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-4 border border-white/10">
                      <p className="text-xs font-medium italic text-fuchsia-100 leading-relaxed">
                        "{forecastResults.summary}"
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {forecastResults.suggestions.map((s) => {
                        const cat = categories.find(c => c.id === s.categoryId);
                        if (!cat) return null;
                        return (
                          <div key={s.categoryId} className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                                  <CategoryIcon name={cat.icon} className="w-3.5 h-3.5 text-white" />
                                </div>
                                <span className="text-xs font-bold truncate">
                                  {language === 'uz_cyrl' ? cat.name_cyrl : cat.name_latn}
                                </span>
                              </div>
                              <p className="text-[10px] text-white/70 leading-tight mb-3">
                                {s.reasoning}
                              </p>
                            </div>
                            <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
                              <span className="text-xs font-black font-mono">
                                {formatCompactMoney(s.suggestedLimit, currency, language, exchangeRate)}
                              </span>
                              <button
                                onClick={() => applySuggestedLimit(s.categoryId, s.suggestedLimit)}
                                className="px-2.5 py-1 bg-white text-indigo-900 rounded-lg text-[10px] font-bold hover:bg-fuchsia-100 transition-colors"
                              >
                                Қабул қилиш
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {budgetData.map((cat) => (
              <motion.div
                key={cat.id}
                layout
                className={`bg-white dark:bg-slate-900 rounded-3xl p-5 border shadow-xs flex flex-col justify-between transition-all ${
                  cat.status === 'danger'
                    ? 'border-rose-200 dark:border-rose-900/50 ring-1 ring-rose-100 dark:ring-rose-950/30'
                    : cat.status === 'warning'
                    ? 'border-amber-200 dark:border-amber-900/50 ring-1 ring-amber-100 dark:ring-amber-950/30'
                    : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs"
                        style={{ backgroundColor: cat.color }}
                      >
                        <CategoryIcon name={cat.icon} className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                          {language === 'uz_cyrl' ? cat.name_cyrl : cat.name_latn}
                        </h4>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                          Ойлик Лимит
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleEditLimit(cat.id, cat.limit)}
                      className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-lg font-black text-slate-900 dark:text-white font-mono tabular-nums leading-none">
                          {formatMoney(cat.spent, currency, language, exchangeRate)}
                        </div>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                          Сарфланган
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-500 dark:text-slate-400 font-mono tabular-nums leading-none">
                          {formatMoney(cat.limit, currency, language, exchangeRate)}
                        </div>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                          Лимит
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden transition-colors">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${cat.percent}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={`h-full rounded-full transition-colors ${
                          cat.status === 'danger'
                            ? 'bg-rose-500'
                            : cat.status === 'warning'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span
                        className={
                          cat.status === 'danger'
                            ? 'text-rose-600'
                            : cat.status === 'warning'
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }
                      >
                        {cat.percent}% ишлатилди
                      </span>
                      <span className="text-slate-400">
                        Қолдиқ: {formatMoney(cat.remaining, currency, language, exchangeRate)}
                      </span>
                    </div>
                  </div>
                </div>

                {cat.status !== 'safe' && (
                  <div
                    className={`mt-4 p-2 rounded-xl flex items-center gap-2 text-[10px] font-bold ${
                      cat.status === 'danger'
                        ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50'
                        : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50'
                    }`}
                  >
                    {cat.status === 'danger' ? (
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <Info className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span>
                      {cat.status === 'danger'
                        ? 'Лимит тўлиқ сарфланди!'
                        : 'Харажатлар лимитга яқинлашмоқда.'}
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
            </div>
          </motion.div>
        ) : activeView === 'daily' ? (
          <motion.div
            key="daily-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6"
          >
            <div className="bg-slate-900 rounded-[32px] p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-slate-800">
              {/* Background Glow */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]" />
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-[0.2em]">Safe-to-Spend</span>
                  </div>
                  
                  <div>
                    <h3 className="text-4xl sm:text-5xl font-black font-mono tabular-nums tracking-tighter">
                      {formatMoney(dailyBudgetData.safeToSpendDaily, currency, language, exchangeRate)}
                    </h3>
                    <p className="text-slate-400 text-sm mt-2 font-medium">
                      Ойнинг қолган қисми учун кунлик хавфсиз харажат миқдори
                    </p>
                  </div>

                  <div className="flex items-center gap-6 pt-2">
                    <div>
                      <div className="text-xl font-bold text-slate-100 font-mono tabular-nums">
                        {dailyBudgetData.daysRemaining}
                      </div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Кун қолди</div>
                    </div>
                    <div className="h-8 w-px bg-slate-800" />
                    <div>
                      <div className="text-xl font-bold text-slate-100 font-mono tabular-nums">
                        {formatCompactMoney(dailyBudgetData.totalRemaining, currency, language, exchangeRate)}
                      </div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Ойлик қолдиқ</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center p-6 bg-slate-800/50 rounded-[28px] border border-slate-700/50 min-w-[240px]">
                  <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                    {/* Simplified Circular Progress SVG */}
                    <svg className="w-full h-full -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="58"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="10"
                        className="text-slate-700"
                      />
                      <motion.circle
                        cx="64"
                        cy="64"
                        r="58"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="10"
                        strokeDasharray="364.4"
                        initial={{ strokeDashoffset: 364.4 }}
                        animate={{ strokeDashoffset: 364.4 - (364.4 * dailyBudgetData.progressPercent) / 100 }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                        className={dailyBudgetData.isOverLimit ? 'text-rose-500' : 'text-emerald-500'}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-black font-mono">{dailyBudgetData.progressPercent}%</span>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Бугун сарфланди</span>
                    <span className={`text-lg font-black font-mono ${dailyBudgetData.isOverLimit ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {formatMoney(dailyBudgetData.todaySpent, currency, language, exchangeRate)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-xs transition-colors duration-300">
                <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Ойлик Бюджет Назорати</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-2">
                      <span className="text-slate-600 dark:text-slate-400">Ойлик лимит:</span>
                      <span className="text-slate-900 dark:text-white">{formatMoney(dailyBudgetData.totalMonthLimit, currency, language, exchangeRate)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold mb-2">
                      <span className="text-slate-600 dark:text-slate-400">Сарфланди:</span>
                      <span className="text-slate-900 dark:text-white">{formatMoney(dailyBudgetData.monthSpent, currency, language, exchangeRate)}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-slate-900 dark:bg-slate-100 rounded-full transition-all" 
                        style={{ width: `${Math.min(100, (dailyBudgetData.monthSpent / dailyBudgetData.totalMonthLimit) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className={`rounded-3xl p-6 border shadow-xs flex flex-col justify-center transition-all ${
                dailyBudgetData.isOverLimit 
                  ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/50 text-rose-900 dark:text-rose-400' 
                  : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-400'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  {dailyBudgetData.isOverLimit ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                  <h4 className="text-sm font-black">
                    {dailyBudgetData.isOverLimit ? 'Диққат: Меъёрдан ошди' : 'Сиз хавфсиз ҳудуддасиз'}
                  </h4>
                </div>
                <p className="text-xs font-medium opacity-80 leading-relaxed">
                  {dailyBudgetData.isOverLimit 
                    ? 'Бугунги харажатларингиз кунлик хавфсиз миқдордан ошди. Ой охиригача харажатларни камайтириш тавсия этилади.'
                    : 'Сизнинг кунлик харажатларингиз белгиланган меъёрда. Бюджетни режа бўйича бошқаришда давом этинг.'}
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="subscriptions-view"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-4"
          >
            {subscriptionsData.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 border border-dashed border-slate-300 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                  <CalendarClock className="w-8 h-8" />
                </div>
                <h4 className="text-slate-900 font-bold mb-1">Такрорланувчи тўловлар мавжуд эмас</h4>
                <p className="text-slate-500 text-sm max-w-xs">
                  Ҳали ҳеч қандай ойлик обуна ёки коммунал тўловлар киритилмаган.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {subscriptionsData.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    className={`bg-white dark:bg-slate-900 rounded-3xl p-4 border transition-all flex flex-col sm:flex-row items-center gap-4 ${
                      item.status.isAlert 
                        ? 'border-rose-100 dark:border-rose-900/50 ring-1 ring-rose-50/50 dark:ring-rose-950/20' 
                        : 'border-slate-100 dark:border-slate-800'
                    }`}
                  >
                    <div className="relative">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xs shrink-0"
                        style={{ backgroundColor: item.category?.color || '#94a3b8' }}
                      >
                        {item.categoryId === 'exp_utilities' ? (
                          <Zap className="w-6 h-6" />
                        ) : item.categoryId === 'exp_tech' ? (
                          <MonitorPlay className="w-6 h-6" />
                        ) : (
                          <CategoryIcon name={item.category?.icon || 'HelpCircle'} className="w-6 h-6" />
                        )}
                      </div>
                      {item.status.isAlert && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 items-center justify-center">
                            <BellRing className="w-2.5 h-2.5 text-white" />
                          </span>
                        </span>
                      )}
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 justify-center sm:justify-start">
                        <h4 className="font-black text-slate-900 dark:text-white text-sm">
                          {item.title}
                        </h4>
                        <div className={`text-[10px] font-black px-2 py-0.5 rounded-lg border w-fit mx-auto sm:mx-0 ${item.status.badgeColor}`}>
                          {language === 'uz_cyrl' ? item.status.labelCyrl : item.status.labelLatn}
                        </div>
                      </div>
                      <div className="flex items-center justify-center sm:justify-start gap-3 mt-1">
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          <CalendarClock className="w-3 h-3" />
                          Ҳар ойнинг {item.dueDayOfMonth}-санаси
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          <CreditCard className="w-3 h-3" />
                          {item.wallet ? (language === 'uz_cyrl' ? item.wallet.name_cyrl : item.wallet.name_latn) : '---'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="text-right flex-1 sm:flex-none">
                        <div className="text-sm font-black text-slate-900 dark:text-white font-mono tabular-nums leading-none">
                          {formatMoney(item.amount, currency, language, exchangeRate)}
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                          Сумма
                        </span>
                      </div>

                      {item.status.status === 'paid' ? (
                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 transition-colors">
                          <Check className="w-5 h-5" />
                        </div>
                      ) : (
                        <button
                          onClick={() => payRecurringItem(item.id)}
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-90 shadow-sm ${
                            item.status.isAlert 
                              ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-200' 
                              : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200'
                          }`}
                          title="Тўлаш"
                        >
                          <RotateCcw className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Limit Modal */}
      <AnimatePresence>
        {editingCategoryId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800 transition-colors duration-300"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Лимитни Ўрнатиш
                </h3>
                <button
                  onClick={() => setEditingCategoryId(null)}
                  className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white"
                >
                  <ChevronRight className="w-5 h-5 rotate-90" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Ойлик харажат суммаси
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      autoFocus
                      value={editLimitValue}
                      onChange={(e) => setEditLimitValue(Number(e.target.value))}
                      className="w-full text-2xl font-black font-mono tabular-nums px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold">
                      {currency}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[500000, 1000000, 2500000].map((val) => (
                    <button
                      key={val}
                      onClick={() => setEditLimitValue(val)}
                      className="py-2 text-[10px] font-bold bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-300 hover:border-emerald-200 dark:hover:border-emerald-700 transition-all"
                    >
                      {formatCompactMoney(val, currency, language, exchangeRate)}
                    </button>
                  ))}
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    onClick={() => setEditingCategoryId(null)}
                    className="flex-1 py-3 px-4 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    Бекор қилиш
                  </button>
                  <button
                    onClick={saveLimit}
                    className="flex-1 py-3 px-4 bg-emerald-600 text-white text-sm font-bold rounded-2xl shadow-md hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Сақлаш</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
