import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { getT } from '../../constants/translations';
import { formatMoney, formatCompactMoney } from '../../utils/formatters';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
  SlidersHorizontal,
  Info,
  CheckCircle2,
  AlertTriangle,
  Zap,
  ShoppingBag,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Download,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Default classification map for categories
const DEFAULT_FIXED_CAT_IDS = new Set(['exp_utilities', 'exp_education', 'exp_health']);

export const MonthlySummaryReport: React.FC = () => {
  const {
    transactions,
    categories,
    recurringItems,
    currency,
    language,
    exchangeRate,
  } = useApp();

  const t = getT(language);

  // Active view tab inside module: 'stacked' | 'percentage' | 'donut'
  const [chartMode, setChartMode] = useState<'stacked' | 'percentage' | 'donut'>('stacked');
  
  // Custom fixed category overrides set by user
  const [customFixedCatIds, setCustomFixedCatIds] = useState<Set<string>>(DEFAULT_FIXED_CAT_IDS);
  const [isCategoryClassifierOpen, setIsCategoryClassifierOpen] = useState(false);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(5); // Default to latest month (Oct 2026)

  // Toggle category between Fixed and Variable
  const toggleCategoryFixed = (catId: string) => {
    setCustomFixedCatIds(prev => {
      const next = new Set(prev);
      if (next.has(catId)) {
        next.delete(catId);
      } else {
        next.add(catId);
      }
      return next;
    });
  };

  // Past 6 Months list definition (May 2026 to Oct 2026)
  const monthList = useMemo(() => {
    return [
      { key: '2026-05', labelCyrl: 'Май', labelLatn: 'May', short: 'Май' },
      { key: '2026-06', labelCyrl: 'Июнь', labelLatn: 'Iyun', short: 'Июн' },
      { key: '2026-07', labelCyrl: 'Июль', labelLatn: 'Iyul', short: 'Июл' },
      { key: '2026-08', labelCyrl: 'Август', labelLatn: 'Avgust', short: 'Авг' },
      { key: '2026-09', labelCyrl: 'Сентябрь', labelLatn: 'Sentabr', short: 'Сен' },
      { key: '2026-10', labelCyrl: 'Октябрь', labelLatn: 'Oktabr', short: 'Окт' },
    ];
  }, []);

  // Compute 6-Month Fixed vs. Variable Spending Data
  const reportData = useMemo(() => {
    // Benchmark monthly base values for past months to provide rich historical trends
    const baseHistorical: Record<string, { fixed: number; variable: number; income: number }> = {
      '2026-05': { fixed: 1850000, variable: 2450000, income: 6200000 },
      '2026-06': { fixed: 1920000, variable: 2800000, income: 6500000 },
      '2026-07': { fixed: 1800000, variable: 3100000, income: 6500000 },
      '2026-08': { fixed: 2100000, variable: 2900000, income: 7000000 },
      '2026-09': { fixed: 2050000, variable: 2650000, income: 6800000 },
    };

    return monthList.map((m, idx) => {
      // Find actual transactions in that month
      const monthTxs = transactions.filter(
        t => t.type === 'expense' && t.date.startsWith(m.key)
      );

      let fixedTotal = 0;
      let variableTotal = 0;

      if (monthTxs.length > 0) {
        monthTxs.forEach(tx => {
          const isCategoryFixed = customFixedCatIds.has(tx.categoryId);
          const isRecurringAuto = tx.isRecurring || tx.note?.includes('Авто-тўлов') || tx.note?.includes('Такрорланувчи');

          if (isCategoryFixed || isRecurringAuto) {
            fixedTotal += tx.amount;
          } else {
            variableTotal += tx.amount;
          }
        });
      } else if (baseHistorical[m.key]) {
        fixedTotal = baseHistorical[m.key].fixed;
        variableTotal = baseHistorical[m.key].variable;
      } else {
        // Fallback calculated from recurring items + categories
        const recFixed = recurringItems
          .filter(r => r.type === 'expense')
          .reduce((sum, r) => sum + r.amount, 0);
        fixedTotal = recFixed > 0 ? recFixed : 1900000;
        variableTotal = 2500000;
      }

      const totalExpense = fixedTotal + variableTotal;
      const fixedRatio = totalExpense > 0 ? (fixedTotal / totalExpense) * 100 : 0;
      const variableRatio = totalExpense > 0 ? (variableTotal / totalExpense) * 100 : 0;

      return {
        monthKey: m.key,
        monthName: language === 'uz_cyrl' ? m.labelCyrl : m.labelLatn,
        monthShort: m.short,
        fixedAmount: fixedTotal,
        variableAmount: variableTotal,
        totalExpense,
        fixedRatio: Number(fixedRatio.toFixed(1)),
        variableRatio: Number(variableRatio.toFixed(1)),
        targetFixedRatio: 50, // 50/30/20 rule target
      };
    });
  }, [monthList, transactions, customFixedCatIds, recurringItems, language]);

  // Averages over 6 months
  const avgFixedAmount = useMemo(() => {
    const sum = reportData.reduce((acc, d) => acc + d.fixedAmount, 0);
    return Math.round(sum / reportData.length);
  }, [reportData]);

  const avgVariableAmount = useMemo(() => {
    const sum = reportData.reduce((acc, d) => acc + d.variableAmount, 0);
    return Math.round(sum / reportData.length);
  }, [reportData]);

  const avgFixedRatio = useMemo(() => {
    const sum = reportData.reduce((acc, d) => acc + d.fixedRatio, 0);
    return Number((sum / reportData.length).toFixed(1));
  }, [reportData]);

  // Selected Month details
  const currentMonthData = reportData[selectedMonthIndex] || reportData[reportData.length - 1];

  // Donut chart dataset for current selected month
  const donutData = useMemo(() => {
    return [
      { name: language === 'uz_cyrl' ? 'Доимий харажатлар' : 'Doimiy xarajatlar', value: currentMonthData.fixedAmount, color: '#1c211e' },
      { name: language === 'uz_cyrl' ? 'Ўзгарувчан харажатлар' : 'O\'zgaruvchan xarajatlar', value: currentMonthData.variableAmount, color: '#e06d53' },
    ];
  }, [currentMonthData, language]);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#1c211e] text-white p-3.5 rounded-2xl shadow-xl border border-white/10 text-xs space-y-2 min-w-[200px]">
          <div className="font-bold border-b border-white/10 pb-1.5 flex items-center justify-between">
            <span>{data.monthName} 2026</span>
            <span className="text-[10px] text-[#547f69] font-mono">
              Жами: {formatMoney(data.totalExpense, currency, language, exchangeRate)}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-slate-200">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1c211e] border border-white/40" />
                <span>Доимий (Fixed):</span>
              </span>
              <span className="font-mono font-bold text-white">
                {formatMoney(data.fixedAmount, currency, language, exchangeRate)} ({data.fixedRatio}%)
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-200">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#e06d53]" />
                <span>Ўзгарувчан (Variable):</span>
              </span>
              <span className="font-mono font-bold text-[#e06d53]">
                {formatMoney(data.variableAmount, currency, language, exchangeRate)} ({data.variableRatio}%)
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Module Title & Interactive Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 backdrop-blur-sm p-5 rounded-3xl border border-black/[0.04] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#547f69]/10 rounded-xl text-[#547f69]">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#1c211e] tracking-tight">
              Ойлик Харажатлар Таҳлили (6 Ойлик Доимий vs Ўзгарувчан)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1 pl-9">
            Сўнгги 6 ойдаги қайта тикланувчи (доимий) ва маиший (ўзгарувчан) харажатлар нисбати динамикаси
          </p>
        </div>

        {/* Controls Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#547f69] hover:bg-[#466d59] rounded-xl shadow-xs transition-all active:scale-95"
            title="Ойлик молиявий ҳисоботни PDF форматда юклаб олиш / чоп этиш"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PDF Ҳисобот</span>
          </button>
          {/* Chart View Switcher */}
          <div className="flex items-center gap-1 p-1 bg-[#f3f0ea] rounded-2xl">
            <button
              onClick={() => setChartMode('stacked')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                chartMode === 'stacked'
                  ? 'bg-white text-[#1c211e] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Сумма бўйича</span>
            </button>
            <button
              onClick={() => setChartMode('percentage')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                chartMode === 'percentage'
                  ? 'bg-white text-[#1c211e] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-[#547f69]" />
              <span>Нисбат (% Ratio)</span>
            </button>
            <button
              onClick={() => setChartMode('donut')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                chartMode === 'donut'
                  ? 'bg-white text-[#1c211e] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <PieIcon className="w-3.5 h-3.5 text-[#e06d53]" />
              <span>Донута (50/30/20)</span>
            </button>
          </div>

          {/* Category Classification Configurer button */}
          <button
            onClick={() => setIsCategoryClassifierOpen(!isCategoryClassifierOpen)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#1c211e] bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 shadow-xs transition-all"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#547f69]" />
            <span>Тоифаларни Созлаш</span>
          </button>
        </div>
      </div>

      {/* Category Classifier Drawer / Panel */}
      <AnimatePresence>
        {isCategoryClassifierOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-3xl border border-[#547f69]/30 p-5 shadow-sm space-y-4 overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#547f69]" />
                <h4 className="font-bold text-sm text-[#1c211e]">
                  Қайси харажатлар "Доимий (Fixed)" хисоблансин?
                </h4>
              </div>
              <span className="text-xs text-slate-400">
                Таҳлил аниқлигини ошириш учун тоифаларни белгиланг
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
              {categories
                .filter(c => c.type === 'expense')
                .map(cat => {
                  const isFixed = customFixedCatIds.has(cat.id);
                  const catName = language === 'uz_cyrl' ? cat.name_cyrl : cat.name_latn;

                  return (
                    <button
                      key={cat.id}
                      onClick={() => toggleCategoryFixed(cat.id)}
                      className={`p-2.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                        isFixed
                          ? 'bg-[#1c211e] text-white border-[#1c211e] shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className="font-semibold truncate mr-2">{catName}</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                          isFixed
                            ? 'bg-[#547f69] text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {isFixed ? 'Доимий' : 'Ўзгарувчан'}
                      </span>
                    </button>
                  );
                })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: 6-Month Avg Fixed */}
        <div className="bg-white p-5 rounded-3xl border border-black/[0.04] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Ўртача Доимий (Fixed)</span>
            <Zap className="w-4 h-4 text-[#1c211e]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#1c211e] tabular-nums pt-1">
            {formatMoney(avgFixedAmount, currency, language, exchangeRate)}
          </div>
          <div className="text-[11px] text-slate-400">
            Ойлик ижара, коммунал, абонемент ва таълим
          </div>
        </div>

        {/* Card 2: 6-Month Avg Variable */}
        <div className="bg-white p-5 rounded-3xl border border-black/[0.04] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Ўртача Ўзгарувчан (Variable)</span>
            <ShoppingBag className="w-4 h-4 text-[#e06d53]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#e06d53] tabular-nums pt-1">
            {formatMoney(avgVariableAmount, currency, language, exchangeRate)}
          </div>
          <div className="text-[11px] text-slate-400">
            Озиқ-овқат, транспорт, кийим ва ҳордиқ
          </div>
        </div>

        {/* Card 3: 6-Month Fixed Ratio */}
        <div className="bg-white p-5 rounded-3xl border border-black/[0.04] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Доимий Харажат Улуши</span>
            <span className="text-xs font-bold font-mono text-[#547f69]">50% Мақсад</span>
          </div>
          <div className="text-2xl font-bold font-mono text-[#1c211e] tabular-nums pt-1 flex items-center gap-2">
            <span>{avgFixedRatio}%</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                avgFixedRatio <= 50
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {avgFixedRatio <= 50 ? 'Нормада' : 'Юқори'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            50/30/20 қоидасида доимий харажат 50% дан ошмаслиги лозим
          </div>
        </div>

        {/* Card 4: Financial Health Advice Banner */}
        <div className="bg-[#1c211e] text-white p-5 rounded-3xl shadow-sm space-y-1 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5 text-[#547f69]">
              <CheckCircle2 className="w-4 h-4" />
              <span>Бюджет Барқарорлиги</span>
            </span>
            <span className="text-[10px] font-mono bg-[#547f69]/30 text-[#8ec8a8] px-2 py-0.5 rounded-full">
              6 Ойлик Тренд
            </span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-medium">
            {avgFixedRatio <= 50
              ? 'Аъло! Доимий мажбуриятларингиз умумий даромаднинг 50% дан кам. Бу жамғарма учун хавфсиз муҳит яратади.'
              : 'Диққат: Доимий мажбуриятларингиз юқори. Об обуналарни ва доимий харажатларни қайта кўриб чиқиш тавсия этилади.'}
          </p>
        </div>
      </div>

      {/* Main Interactive Recharts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Main Recharts Chart (Bar or Area) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-black/[0.04] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 className="font-bold text-[#1c211e] text-sm">
                {chartMode === 'stacked'
                  ? 'Сўнгги 6 Ойлик Харажатлар Ҳажми (Сумма)'
                  : chartMode === 'percentage'
                  ? 'Доимий vs Ўзгарувчан Нисбати Тренд Сизиғи (%)'
                  : 'Ойлик Бюджет Тақсимоти'}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Сичқончани ёки бармоқни график устига келтириб батафсил кўришингиз мумкин
              </p>
            </div>

            {/* Legend indicators */}
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-[#1c211e]">
                <span className="w-3 h-3 rounded bg-[#1c211e]" />
                <span>Доимий</span>
              </span>
              <span className="flex items-center gap-1.5 text-[#e06d53]">
                <span className="w-3 h-3 rounded bg-[#e06d53]" />
                <span>Ўзгарувчан</span>
              </span>
            </div>
          </div>

          <div className="h-72 sm:h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {chartMode === 'stacked' ? (
                <BarChart data={reportData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="monthName" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={v => formatCompactMoney(v, currency, language, exchangeRate)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="fixedAmount" name="Доимий" stackId="a" fill="#1c211e" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="variableAmount" name="Ўзгарувчан" stackId="a" fill="#e06d53" radius={[6, 6, 0, 0]} />
                </BarChart>
              ) : chartMode === 'percentage' ? (
                <AreaChart data={reportData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fixedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1c211e" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#1c211e" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="variableGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e06d53" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#e06d53" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="monthName" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                    tickFormatter={v => `${v}%`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={50} stroke="#547f69" strokeDasharray="4 4" label={{ value: '50% Таргет', fill: '#547f69', fontSize: 10 }} />
                  <Area
                    type="monotone"
                    dataKey="fixedRatio"
                    name="Доимий %"
                    stroke="#1c211e"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#fixedGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="variableRatio"
                    name="Ўзгарувчан %"
                    stroke="#e06d53"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#variableGradient)"
                  />
                </AreaChart>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <PieChart width={300} height={260}>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => formatMoney(Number(value), currency, language, exchangeRate)}
                    />
                  </PieChart>
                </div>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Month Selector & Specific Month Analysis */}
        <div className="bg-white p-6 rounded-3xl border border-black/[0.04] shadow-xs space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-[#1c211e] text-sm">
                Ойни Танлаш ва Деталлар
              </h4>
              <span className="text-xs font-mono font-bold text-[#547f69]">
                {currentMonthData.monthName} 2026
              </span>
            </div>

            {/* Month selector pill chips */}
            <div className="grid grid-cols-3 gap-2 my-4">
              {reportData.map((m, idx) => (
                <button
                  key={m.monthKey}
                  onClick={() => setSelectedMonthIndex(idx)}
                  className={`py-2 px-1.5 rounded-2xl text-xs font-bold transition-all text-center border ${
                    selectedMonthIndex === idx
                      ? 'bg-[#1c211e] text-white border-[#1c211e] shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {m.monthShort}
                </button>
              ))}
            </div>

            {/* Selected Month Ratio Meter */}
            <div className="space-y-4 pt-2">
              <div className="p-4 bg-[#f3f0ea] rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#1c211e]">Доимий Харажатлар</span>
                  <span className="font-mono font-bold text-[#1c211e]">
                    {formatMoney(currentMonthData.fixedAmount, currency, language, exchangeRate)} ({currentMonthData.fixedRatio}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1c211e] rounded-full transition-all duration-500"
                    style={{ width: `${currentMonthData.fixedRatio}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="font-bold text-[#e06d53]">Ўзгарувчан Харажатлар</span>
                  <span className="font-mono font-bold text-[#e06d53]">
                    {formatMoney(currentMonthData.variableAmount, currency, language, exchangeRate)} ({currentMonthData.variableRatio}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#e06d53] rounded-full transition-all duration-500"
                    style={{ width: `${currentMonthData.variableRatio}%` }}
                  />
                </div>
              </div>

              {/* 50/30/20 Rule Comparison Badge */}
              <div className="p-3.5 bg-[#547f69]/10 rounded-2xl border border-[#547f69]/20 flex items-start gap-3">
                <Info className="w-4 h-4 text-[#547f69] shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 space-y-1">
                  <span className="font-bold block text-[#1c211e]">
                    50/30/20 Молиявий Қоида Буйича:
                  </span>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    {currentMonthData.fixedRatio <= 50
                      ? `Ушбу ойда доимий харажатларингиз ${currentMonthData.fixedRatio}% ташкил этди (50% тавсия этиладиган нормада).`
                      : `Ушбу ойда доимий харажатлар ${currentMonthData.fixedRatio}% га етди. Молиявий эркинлик учун доимий харажатларни қисқартириш мақсадга мувофиқ.`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Жами ойлик чиқим:</span>
            <span className="font-mono font-bold text-[#1c211e] text-sm">
              {formatMoney(currentMonthData.totalExpense, currency, language, exchangeRate)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
