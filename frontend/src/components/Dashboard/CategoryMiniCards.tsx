import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatMoney, formatCompactMoney, CURRENT_DATE_STR } from '../../utils/formatters';
import { CategoryIcon } from '../Common/CategoryIcon';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowUpRight,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  Layers,
  PieChart,
  CheckCircle2,
  AlertTriangle,
  X,
  Calendar,
  Wallet,
  Users,
} from 'lucide-react';
import { Category } from '../../types';

interface CategoryModalData {
  category: Category;
  spent: number;
  limit: number;
  percent: number;
  txCount: number;
  recentTxs: Array<{ id: string; date: string; amount: number; note: string }>;
}

export const CategoryMiniCards: React.FC = () => {
  const {
    categories,
    transactions,
    currency,
    language,
    exchangeRate,
    openAddTxModal,
    openCategoryLimitsModal,
    setActiveTab,
  } = useApp();

  const [activeTabType, setActiveTabType] = useState<'expense' | 'income'>('expense');
  const [selectedCategoryModal, setSelectedCategoryModal] = useState<CategoryModalData | null>(null);

  const currentMonthStr = CURRENT_DATE_STR.substring(0, 7); // e.g. "2026-10"

  // Calculate monthly metrics for each category
  const categoriesWithMetrics = useMemo(() => {
    const list = categories.filter(c => c.type === activeTabType);

    // Calculate total spend for active tab type in current month
    const monthTxs = transactions.filter(t => t.type === activeTabType && t.date.startsWith(currentMonthStr));
    const totalMonthAmount = monthTxs.reduce((sum, t) => sum + t.amount, 0);

    return list.map(cat => {
      const catTxs = monthTxs.filter(t => t.categoryId === cat.id);
      const spent = catTxs.reduce((sum, t) => sum + t.amount, 0);
      const limit = cat.monthlyBudget || 0;
      const percentOfLimit = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
      const shareOfTotal = totalMonthAmount > 0 ? (spent / totalMonthAmount) * 100 : 0;
      const isOverLimit = limit > 0 && spent > limit;
      const isNearLimit = limit > 0 && spent >= limit * 0.8 && spent <= limit;

      return {
        ...cat,
        displayName: language === 'uz_cyrl' ? cat.name_cyrl : cat.name_latn,
        spent,
        limit,
        percentOfLimit,
        shareOfTotal,
        txCount: catTxs.length,
        isOverLimit,
        isNearLimit,
        recentTxs: catTxs.slice(0, 4),
      };
    }).sort((a, b) => b.spent - a.spent);
  }, [categories, transactions, activeTabType, language, currentMonthStr]);

  // Overall total for the current tab
  const totalAmount = useMemo(() => {
    return categoriesWithMetrics.reduce((sum, c) => sum + c.spent, 0);
  }, [categoriesWithMetrics]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-black/[0.04] dark:border-white/[0.04] shadow-xs space-y-5 transition-colors duration-300">
      {/* Header and View Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
              {language === 'uz_cyrl' ? 'Тоифалар динамикаси ва лимитлар' : 'Toifalar dinamikasi va limitlar'}
            </h3>
            <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              {categoriesWithMetrics.length} {language === 'uz_cyrl' ? 'тоифа' : 'toifa'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'uz_cyrl'
              ? 'Ҳар бир тоифа бўйича бу ойлик сарф-харажатлар ва анимацион кўрсаткичлар'
              : 'Har bir toifa bo\'yicha bu oylik sarf-xarajatlar va animatsion ko\'rsatkichlar'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Expense / Income Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-semibold">
            <button
              onClick={() => setActiveTabType('expense')}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                activeTabType === 'expense'
                  ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {language === 'uz_cyrl' ? 'Харажатлар' : 'Xarajatlar'}
            </button>
            <button
              onClick={() => setActiveTabType('income')}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                activeTabType === 'income'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {language === 'uz_cyrl' ? 'Даромадлар' : 'Daromadlar'}
            </button>
          </div>

          {/* Quick Limits modal trigger */}
          <button
            onClick={openCategoryLimitsModal}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={language === 'uz_cyrl' ? 'Лимитларни созлаш' : 'Limitlarni sozlash'}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Multi-segment Animated Distribution Spectrum Bar */}
      {totalAmount > 0 && activeTabType === 'expense' && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-[11px] uppercase tracking-wider">
              {language === 'uz_cyrl' ? 'Харажатлар спектри' : 'Xarajatlar spektri'}
            </span>
            <span className="font-mono tabular-nums font-bold text-slate-700 dark:text-slate-300">
              {formatMoney(totalAmount, currency, language, exchangeRate)}
            </span>
          </div>

          <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex p-0.5 gap-0.5">
            {categoriesWithMetrics
              .filter(c => c.spent > 0)
              .map(c => (
                <motion.div
                  key={c.id}
                  initial={{ width: 0 }}
                  animate={{ width: `${c.shareOfTotal}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full cursor-pointer relative group transition-opacity hover:opacity-85"
                  style={{ backgroundColor: c.color }}
                  onClick={() =>
                    setSelectedCategoryModal({
                      category: c,
                      spent: c.spent,
                      limit: c.limit,
                      percent: c.percentOfLimit,
                      txCount: c.txCount,
                      recentTxs: c.recentTxs,
                    })
                  }
                  title={`${c.displayName}: ${c.shareOfTotal.toFixed(1)}%`}
                />
              ))}
          </div>
        </div>
      )}

      {/* Grid of Hover-Animated Category Mini-Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {categoriesWithMetrics.map((cat, idx) => {
          const hasLimit = cat.limit > 0;
          const statusBg = cat.isOverLimit
            ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10'
            : cat.isNearLimit
            ? 'border-amber-200 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/10'
            : 'border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900/90';

          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.03 }}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() =>
                setSelectedCategoryModal({
                  category: cat,
                  spent: cat.spent,
                  limit: cat.limit,
                  percent: cat.percentOfLimit,
                  txCount: cat.txCount,
                  recentTxs: cat.recentTxs,
                })
              }
              className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between group shadow-2xs hover:shadow-md relative overflow-hidden ${statusBg}`}
            >
              {/* Category Subtle Ambient Glow on Hover */}
              <div
                className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full blur-xl opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none"
                style={{ backgroundColor: cat.color }}
              />

              <div>
                {/* Top Row: Icon + Title + Share Pill */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3"
                      style={{ backgroundColor: cat.color }}
                    >
                      <CategoryIcon name={cat.icon} className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <h4 className="font-bold text-xs sm:text-[13px] text-slate-900 dark:text-white truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                        {cat.displayName}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {cat.txCount} {language === 'uz_cyrl' ? 'та харид' : 'ta xarid'}
                      </span>
                    </div>
                  </div>

                  {activeTabType === 'expense' && cat.spent > 0 && (
                    <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md shrink-0">
                      {cat.shareOfTotal.toFixed(0)}%
                    </span>
                  )}
                </div>

                {/* Amount Display */}
                <div className="mb-3">
                  <div className="text-lg font-black text-slate-900 dark:text-white font-mono tabular-nums leading-none tracking-tight">
                    {formatMoney(cat.spent, currency, language, exchangeRate)}
                  </div>
                  {currency === 'UZS' && exchangeRate > 0 && (
                    <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">
                      ≈ ${formatCompactMoney(cat.spent / exchangeRate, 'USD', language, exchangeRate)}
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom: Animated Progress Bar vs Monthly Limit */}
              {activeTabType === 'expense' && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: hasLimit
                          ? `${Math.min(100, cat.percentOfLimit)}%`
                          : cat.spent > 0
                          ? '100%'
                          : '0%',
                      }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: idx * 0.04 }}
                      className={`h-full rounded-full ${
                        cat.isOverLimit
                          ? 'bg-rose-500'
                          : cat.isNearLimit
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span
                      className={`font-bold ${
                        cat.isOverLimit
                          ? 'text-rose-600 dark:text-rose-400'
                          : cat.isNearLimit
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {hasLimit ? `${cat.percentOfLimit}%` : 'Лимитсиз'}
                    </span>
                    <span className="text-slate-400 truncate ml-1">
                      {hasLimit
                        ? `Лимит: ${formatCompactMoney(cat.limit, currency, language, exchangeRate)}`
                        : (language === 'uz_cyrl' ? 'Сарфланди' : 'Sarflangan')}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Category Detail Modal */}
      <AnimatePresence>
        {selectedCategoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 space-y-5 transition-colors"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xs"
                    style={{ backgroundColor: selectedCategoryModal.category.color }}
                  >
                    <CategoryIcon name={selectedCategoryModal.category.icon} className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                      {language === 'uz_cyrl'
                        ? selectedCategoryModal.category.name_cyrl
                        : selectedCategoryModal.category.name_latn}
                    </h4>
                    <span className="text-xs text-slate-400 font-mono">
                      {selectedCategoryModal.txCount} {language === 'uz_cyrl' ? 'та амалиёт бу ойда' : 'ta operatsiya'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCategoryModal(null)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* KPI Strip in Modal */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[11px] text-slate-500 font-medium block">
                    {language === 'uz_cyrl' ? 'Жами сарфланди' : 'Jami sarflandi'}
                  </span>
                  <div className="text-lg font-black text-slate-900 dark:text-white font-mono tabular-nums mt-0.5">
                    {formatMoney(selectedCategoryModal.spent, currency, language, exchangeRate)}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 font-medium block">
                    {language === 'uz_cyrl' ? 'Ойлик лимит' : 'Oylik limit'}
                  </span>
                  <div className="text-lg font-black text-slate-900 dark:text-white font-mono tabular-nums mt-0.5">
                    {selectedCategoryModal.limit > 0
                      ? formatMoney(selectedCategoryModal.limit, currency, language, exchangeRate)
                      : (language === 'uz_cyrl' ? 'Ўрнатилмаган' : 'O\'rnatilmagan')}
                  </div>
                </div>
              </div>

              {/* Recent Transactions in this Category */}
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block mb-2.5">
                  {language === 'uz_cyrl' ? 'Ушбу тоифадаги сўнгги харидлар' : 'So\'nggi xaridlar'}
                </span>

                {selectedCategoryModal.recentTxs.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {selectedCategoryModal.recentTxs.map(t => (
                      <div
                        key={t.id}
                        className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-bold text-slate-900 dark:text-white truncate">
                            {t.note || (language === 'uz_cyrl' ? 'Харажат' : 'Xarajat')}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {t.date}
                          </span>
                        </div>
                        <div className="font-mono font-bold text-slate-900 dark:text-white tabular-nums shrink-0">
                          {formatMoney(t.amount, currency, language, exchangeRate)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic py-4 text-center">
                    {language === 'uz_cyrl' ? 'Харидлар топилмади' : 'Xaridlar topilmadi'}
                  </p>
                )}
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    setSelectedCategoryModal(null);
                    setActiveTab('transactions');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  {language === 'uz_cyrl' ? 'Барча амалиётлар' : 'Barcha operatsiyalar'}
                </button>
                <button
                  onClick={() => {
                    setSelectedCategoryModal(null);
                    openAddTxModal();
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{language === 'uz_cyrl' ? '+ Харажат қўшиш' : '+ Xarajat qo\'shish'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
