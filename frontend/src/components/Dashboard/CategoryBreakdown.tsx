import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { getT } from '../../constants/translations';
import { formatMoney } from '../../utils/formatters';
import { CategoryIcon } from '../Common/CategoryIcon';

export const CategoryBreakdown: React.FC = () => {
  const { categories, transactions, currency, language, exchangeRate, periodFilter } = useApp();
  const t = getT(language);

  // Filter transactions
  const filteredTxs = transactions.filter(tx => {
    if (tx.type !== 'expense') return false;
    if (periodFilter === 'all') return true;
    if (periodFilter === 'today') return tx.date === '2026-10-28' || tx.date === '2026-10-27';
    if (periodFilter === 'week') return tx.date >= '2026-10-21' && tx.date <= '2026-10-28';
    if (periodFilter === 'month') return tx.date.startsWith('2026-10');
    if (periodFilter === 'year') return tx.date.startsWith('2026');
    return true;
  });

  const totalExpense = filteredTxs.reduce((sum, tx) => sum + tx.amount, 0);

  // Group by category
  const breakdown = useMemo(() => {
    const expenseCategories = categories.filter(c => c.type === 'expense');
    const map = new Map<string, number>();

    filteredTxs.forEach(tx => {
      const cur = map.get(tx.categoryId) || 0;
      map.set(tx.categoryId, cur + tx.amount);
    });

    const list = expenseCategories.map(cat => {
      const spent = map.get(cat.id) || 0;
      const percent = totalExpense > 0 ? (spent / totalExpense) * 100 : 0;
      const budget = cat.monthlyBudget || 0;
      const budgetPercent = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
      return {
        ...cat,
        spent,
        percent,
        budgetPercent,
      };
    });

    // Sort by spent descending
    return list.sort((a, b) => b.spent - a.spent);
  }, [categories, filteredTxs, totalExpense]);

  // Donut chart stroke segments
  const size = 160;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;
  const segments = breakdown
    .filter(item => item.spent > 0)
    .map(item => {
      const strokeDasharray = `${(item.percent / 100) * circumference} ${circumference}`;
      const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
      accumulatedPercent += item.percent;
      return {
        ...item,
        strokeDasharray,
        strokeDashoffset,
      };
    });

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            {t.categoriesTitle}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.categoriesSubtitle}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Donut Chart representation */}
        <div className="md:col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-40 h-40">
            <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#F1F5F9"
                strokeWidth={strokeWidth}
              />
              {segments.map(seg => (
                <circle
                  key={seg.id}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={seg.strokeDasharray}
                  strokeDashoffset={seg.strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Жами харажат</span>
              <span className="text-sm font-bold text-slate-900 tabular-nums">
                {formatMoney(totalExpense, currency, language, exchangeRate).split(' ')[0]}
              </span>
              <span className="text-[10px] text-slate-500">{currency === 'UZS' ? 'сўм' : '$'}</span>
            </div>
          </div>
        </div>

        {/* Categories ranked list with progress bar vs limit */}
        <div className="md:col-span-7 space-y-3">
          {breakdown.slice(0, 5).map(cat => {
            const catName = language === 'uz_cyrl' ? cat.name_cyrl : cat.name_latn;
            return (
              <div key={cat.id} className="text-xs">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-5 h-5 rounded flex items-center justify-center text-white"
                      style={{ backgroundColor: cat.color }}
                    >
                      <CategoryIcon name={cat.icon} className="w-3 h-3" />
                    </span>
                    <span className="font-medium text-slate-800">{catName}</span>
                    <span className="text-slate-500 font-mono tabular-nums">
                      {cat.percent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="font-mono tabular-nums font-semibold text-slate-900">
                    {formatMoney(cat.spent, currency, language, exchangeRate)}
                  </div>
                </div>

                {/* Progress bar vs category limit */}
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, cat.spent > 0 ? (cat.spent / (cat.monthlyBudget || cat.spent)) * 100 : 0)}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
                {cat.monthlyBudget && (
                  <div className="flex justify-between items-center text-[10px] text-slate-500 mt-0.5">
                    <span>
                      Ойлик лимит: {formatMoney(cat.monthlyBudget, currency, language, exchangeRate)}
                    </span>
                    <span className={cat.budgetPercent > 90 ? 'text-rose-600 font-bold' : 'text-slate-500'}>
                      {cat.budgetPercent}% сарфланди
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
