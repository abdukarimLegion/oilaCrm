import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { getT } from '../../constants/translations';
import { formatMoney, formatCompactMoney } from '../../utils/formatters';
import { Calendar } from 'lucide-react';

interface DataPoint {
  label: string;
  dateStr: string;
  income: number;
  expense: number;
}

export const CashflowChart: React.FC = () => {
  const { transactions, currency, language, exchangeRate, periodFilter, setPeriodFilter } = useApp();
  const t = getT(language);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Group transactions by date/month according to periodFilter
  const chartData: DataPoint[] = useMemo(() => {
    if (periodFilter === 'year') {
      // 12 months in 2026
      const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
      return months.map((m, idx) => {
        const monthNum = String(idx + 1).padStart(2, '0');
        const prefix = `2026-${monthNum}`;
        const inc = transactions
          .filter(tx => tx.type === 'income' && tx.date.startsWith(prefix))
          .reduce((sum, tx) => sum + tx.amount, 0);
        const exp = transactions
          .filter(tx => tx.type === 'expense' && tx.date.startsWith(prefix))
          .reduce((sum, tx) => sum + tx.amount, 0);

        return {
          label: m,
          dateStr: `2026-${monthNum}`,
          income: inc,
          expense: exp,
        };
      });
    }

    if (periodFilter === 'week') {
      // Last 7 days ending on 2026-10-28
      const days = ['22 Окт', '23 Окт', '24 Окт', '25 Окт', '26 Окт', '27 Окт', '28 Окт'];
      const dates = [
        '2026-10-22',
        '2026-10-23',
        '2026-10-24',
        '2026-10-25',
        '2026-10-26',
        '2026-10-27',
        '2026-10-28',
      ];
      return dates.map((dStr, idx) => {
        const inc = transactions
          .filter(tx => tx.type === 'income' && tx.date === dStr)
          .reduce((sum, tx) => sum + tx.amount, 0);
        const exp = transactions
          .filter(tx => tx.type === 'expense' && tx.date === dStr)
          .reduce((sum, tx) => sum + tx.amount, 0);

        return {
          label: days[idx],
          dateStr: dStr,
          income: inc,
          expense: exp,
        };
      });
    }

    // Default: 'month' (October 2026 split into 6 intervals: 1-5, 6-10, 11-15, 16-20, 21-25, 26-31)
    const intervals = [
      { label: '01-05 Окт', start: '2026-10-01', end: '2026-10-05' },
      { label: '06-10 Окт', start: '2026-10-06', end: '2026-10-10' },
      { label: '11-15 Окт', start: '2026-10-11', end: '2026-10-15' },
      { label: '16-20 Окт', start: '2026-10-16', end: '2026-10-20' },
      { label: '21-25 Окт', start: '2026-10-21', end: '2026-10-25' },
      { label: '26-31 Окт', start: '2026-10-26', end: '2026-10-31' },
    ];

    return intervals.map(inter => {
      const inc = transactions
        .filter(tx => tx.type === 'income' && tx.date >= inter.start && tx.date <= inter.end)
        .reduce((sum, tx) => sum + tx.amount, 0);
      const exp = transactions
        .filter(tx => tx.type === 'expense' && tx.date >= inter.start && tx.date <= inter.end)
        .reduce((sum, tx) => sum + tx.amount, 0);

      return {
        label: inter.label,
        dateStr: `${inter.start} ~ ${inter.end}`,
        income: inc,
        expense: exp,
      };
    });
  }, [transactions, periodFilter]);

  // Max value calculation for scale
  const maxValue = useMemo(() => {
    let max = 1000000;
    chartData.forEach(d => {
      if (d.income > max) max = d.income;
      if (d.expense > max) max = d.expense;
    });
    return max * 1.15; // 15% headroom
  }, [chartData]);

  // SVG Chart Geometry
  const width = 680;
  const height = 240;
  const paddingX = 40;
  const paddingBottom = 35;
  const paddingTop = 20;
  const graphWidth = width - paddingX * 2;
  const graphHeight = height - paddingTop - paddingBottom;

  const pointsCount = chartData.length;
  const getX = (idx: number) => paddingX + (idx / Math.max(1, pointsCount - 1)) * graphWidth;
  const getY = (val: number) => height - paddingBottom - (val / maxValue) * graphHeight;

  // Path generators
  const incomePath = chartData.reduce((acc, d, idx) => {
    const x = getX(idx);
    const y = getY(d.income);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const expensePath = chartData.reduce((acc, d, idx) => {
    const x = getX(idx);
    const y = getY(d.expense);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const incomeArea = chartData.length > 0
    ? `${incomePath} L ${getX(pointsCount - 1)} ${height - paddingBottom} L ${getX(0)} ${height - paddingBottom} Z`
    : '';

  const expenseArea = chartData.length > 0
    ? `${expensePath} L ${getX(pointsCount - 1)} ${height - paddingBottom} L ${getX(0)} ${height - paddingBottom} Z`
    : '';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <span>{t.cashflowTitle}</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.cashflowSubtitle}
          </p>
        </div>

        {/* Filter Tab controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
          <button
            onClick={() => setPeriodFilter('week')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              periodFilter === 'week'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.periodWeek}
          </button>
          <button
            onClick={() => setPeriodFilter('month')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              periodFilter === 'month'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.periodMonth}
          </button>
          <button
            onClick={() => setPeriodFilter('year')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              periodFilter === 'year'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.periodYear}
          </button>
        </div>
      </div>

      {/* Legend & Summary */}
      <div className="flex items-center justify-between text-xs text-slate-500 mb-3 border-b border-slate-100 pb-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="font-medium text-slate-700">{t.income}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="font-medium text-slate-700">{t.expense}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-500">
          <Calendar className="w-3.5 h-3.5" />
          <span>Жорий таҳлил даври</span>
        </div>
      </div>

      {/* Responsive SVG Chart */}
      <div className="relative w-full aspect-21/9 min-h-[220px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#EF4444" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal grid guide lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = height - paddingBottom - pct * graphHeight;
            const val = pct * maxValue;
            return (
              <g key={i}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 6}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[9px] fill-slate-400 font-mono tabular-nums"
                >
                  {formatCompactMoney(val, currency, language, exchangeRate)}
                </text>
              </g>
            );
          })}

          {/* Area fills */}
          {incomeArea && <path d={incomeArea} fill="url(#incomeGrad)" />}
          {expenseArea && <path d={expenseArea} fill="url(#expenseGrad)" />}

          {/* Lines */}
          {incomePath && (
            <path
              d={incomePath}
              fill="none"
              stroke="#10B981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {expensePath && (
            <path
              d={expensePath}
              fill="none"
              stroke="#EF4444"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data Points */}
          {chartData.map((d, idx) => {
            const x = getX(idx);
            const yInc = getY(d.income);
            const yExp = getY(d.expense);
            const isHovered = hoveredIndex === idx;

            return (
              <g key={idx}>
                {/* Vertical hover indicator */}
                {isHovered && (
                  <line
                    x1={x}
                    y1={paddingTop}
                    x2={x}
                    y2={height - paddingBottom}
                    stroke="#94A3B8"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Income point */}
                <circle
                  cx={x}
                  cy={yInc}
                  r={isHovered ? 5 : 3.5}
                  fill="#10B981"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  className="transition-all"
                />

                {/* Expense point */}
                <circle
                  cx={x}
                  cy={yExp}
                  r={isHovered ? 5 : 3.5}
                  fill="#EF4444"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  className="transition-all"
                />

                {/* X Axis Label */}
                <text
                  x={x}
                  y={height - 12}
                  textAnchor="middle"
                  className={`text-[10px] font-medium ${
                    isHovered ? 'fill-slate-900 font-bold' : 'fill-slate-500'
                  }`}
                >
                  {d.label}
                </text>

                {/* Invisible hover trigger column */}
                <rect
                  x={x - (graphWidth / pointsCount) / 2}
                  y={paddingTop}
                  width={graphWidth / pointsCount}
                  height={graphHeight + paddingBottom}
                  fill="transparent"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="cursor-pointer"
                />
              </g>
            );
          })}
        </svg>

        {/* Floating tooltip */}
        {hoveredIndex !== null && chartData[hoveredIndex] && (
          <div
            className="absolute z-10 pointer-events-none bg-slate-900 text-white text-xs rounded-lg p-2.5 shadow-lg -translate-x-1/2 -translate-y-full border border-slate-700"
            style={{
              left: `${(getX(hoveredIndex) / width) * 100}%`,
              top: '35%',
            }}
          >
            <div className="font-semibold text-slate-200 border-b border-slate-700 pb-1 mb-1">
              {chartData[hoveredIndex].label} ({chartData[hoveredIndex].dateStr})
            </div>
            <div className="flex items-center justify-between gap-3 text-emerald-400">
              <span>{t.income}:</span>
              <span className="font-mono tabular-nums font-semibold">
                +{formatMoney(chartData[hoveredIndex].income, currency, language, exchangeRate)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 text-rose-400">
              <span>{t.expense}:</span>
              <span className="font-mono tabular-nums font-semibold">
                -{formatMoney(chartData[hoveredIndex].expense, currency, language, exchangeRate)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 text-slate-300 border-t border-slate-700 mt-1 pt-1">
              <span>Фарқ:</span>
              <span className="font-mono tabular-nums font-bold">
                {formatMoney(
                  chartData[hoveredIndex].income - chartData[hoveredIndex].expense,
                  currency,
                  language,
                  exchangeRate
                )}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
