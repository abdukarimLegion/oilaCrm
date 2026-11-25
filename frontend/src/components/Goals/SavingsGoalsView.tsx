import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { getT } from '../../constants/translations';
import {
  formatMoney,
  formatCompactMoney,
  formatDateUz,
  calculateGoalTimeline,
  CURRENT_DATE_STR,
} from '../../utils/formatters';
import { CategoryIcon } from '../Common/CategoryIcon';
import {
  Plus,
  Sliders,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle,
  Calendar,
  ArrowRight,
  PiggyBank,
  Zap,
  Edit2,
  Trash2,
  ArrowDownLeft,
  ArrowUpRight,
  X,
  Maximize2,
  AlertCircle,
  History,
  CheckCircle2,
  FileText,
  CreditCard,
  Target,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Tilt3DCard } from '../Common/Tilt3DCard';
import { SavingsGoal } from '../../types';

export const SavingsGoalsView: React.FC = () => {
  const {
    goals,
    wallets,
    currency,
    language,
    exchangeRate,
    openAddGoalModal,
    contributeToGoal,
    withdrawFromGoal,
    editGoal,
    deleteGoal,
    monthlyBudgetLimit,
    setMonthlyBudgetLimit,
    setBudgetAlertSettings,
  } = useApp();

  const t = getT(language);

  // Simulation modal & selected goal state
  const [simGoalId, setSimGoalId] = useState<string | null>(null);
  const [incomeBoostPercent, setIncomeBoostPercent] = useState<number>(15);
  const [expenseCutPercent, setExpenseCutPercent] = useState<number>(20);
  const [customMonthlySavings, setCustomMonthlySavings] = useState<number>(0);

  // Goal History Modal state
  const [historyGoalId, setHistoryGoalId] = useState<string | null>(null);

  // Modal for deposit / withdrawal
  const [txModalType, setTxModalType] = useState<'deposit' | 'withdraw' | null>(null);
  const [txModalGoalId, setTxModalGoalId] = useState<string | null>(null);
  const [txAmount, setTxAmount] = useState<number>(1000000);
  const [txWalletId, setTxWalletId] = useState<string>(wallets[0]?.id || '');
  const [txNote, setTxNote] = useState<string>('');

  // Modal for Editing Goal
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTargetAmount, setEditTargetAmount] = useState<number>(0);
  const [editMonthlyContribution, setEditMonthlyContribution] = useState<number>(0);
  const [editTargetDate, setEditTargetDate] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editPriority, setEditPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Active goal for simulation
  const activeGoalForSim = useMemo(() => {
    if (!simGoalId) return goals[0];
    return goals.find(g => g.id === simGoalId) || goals[0];
  }, [goals, simGoalId]);

  // Active goal for history modal
  const historyGoal = useMemo(() => {
    if (!historyGoalId) return null;
    return goals.find(g => g.id === historyGoalId) || null;
  }, [goals, historyGoalId]);

  // Simulation calculations
  const simulationResults = useMemo(() => {
    if (!activeGoalForSim) return null;

    const baseMonthly = activeGoalForSim.monthlyContribution;
    const baseline = calculateGoalTimeline(
      activeGoalForSim.targetAmount,
      activeGoalForSim.currentAmount,
      baseMonthly,
      0,
      CURRENT_DATE_STR
    );

    const estimatedExtraFromIncome = 15000000 * (incomeBoostPercent / 100);
    const estimatedExtraFromCut = 8000000 * (expenseCutPercent / 100);
    const totalExtraMonthly = estimatedExtraFromIncome + estimatedExtraFromCut + customMonthlySavings;

    const simulated = calculateGoalTimeline(
      activeGoalForSim.targetAmount,
      activeGoalForSim.currentAmount,
      baseMonthly,
      totalExtraMonthly,
      CURRENT_DATE_STR
    );

    const monthsSaved = Math.max(0, baseline.monthsNeeded - simulated.monthsNeeded);

    return {
      baseline,
      simulated,
      totalExtraMonthly,
      monthsSaved,
      baseMonthly,
      newMonthlyTotal: baseMonthly + totalExtraMonthly,
    };
  }, [activeGoalForSim, incomeBoostPercent, expenseCutPercent, customMonthlySavings]);

  // Handle deposit or withdrawal submit
  const handleTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txModalGoalId || txAmount <= 0) return;

    if (txModalType === 'deposit') {
      contributeToGoal(txModalGoalId, txAmount, txWalletId, txNote);
    } else if (txModalType === 'withdraw') {
      withdrawFromGoal(txModalGoalId, txAmount, txWalletId, txNote);
    }

    setTxModalType(null);
    setTxModalGoalId(null);
    setTxNote('');
  };

  // Open goal edit modal
  const openEditModal = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setEditTitle(language === 'uz_cyrl' ? goal.title_cyrl : goal.title_latn);
    setEditTargetAmount(goal.targetAmount);
    setEditMonthlyContribution(goal.monthlyContribution);
    setEditTargetDate(goal.targetDate);
    setEditNotes(goal.notes || '');
    setEditPriority(goal.priority);
  };

  // Save edited goal
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGoal || editTargetAmount <= 0) return;

    editGoal(editingGoal.id, {
      title_cyrl: editTitle,
      title_latn: editTitle,
      targetAmount: Number(editTargetAmount),
      monthlyContribution: Number(editMonthlyContribution),
      targetDate: editTargetDate,
      notes: editNotes,
      priority: editPriority,
    });

    setEditingGoal(null);
  };

  const currentMonthPrefix = CURRENT_DATE_STR.substring(0, 7); // e.g. "2026-10"

  return (
    <div className="space-y-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {t.goalsTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Жамғармалар кирим-чиқим тарихи, кўп томонлама симулятор ва ойлик бадаллар эслатмаси
          </p>
        </div>

        <button
          onClick={openAddGoalModal}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl transition-all shadow-xs self-start sm:self-auto whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addGoal}</span>
        </button>
      </div>

      {/* Target Savings Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {goals.map(goal => {
          const title = language === 'uz_cyrl' ? goal.title_cyrl : goal.title_latn;
          const timeline = calculateGoalTimeline(
            goal.targetAmount,
            goal.currentAmount,
            goal.monthlyContribution,
            0,
            CURRENT_DATE_STR
          );

          const isAchieved = goal.currentAmount >= goal.targetAmount;

          // Check if current month contribution has been deposited
          const hasPaidThisMonth = goal.history.some(
            h => (h.type === 'deposit' || (h.amount && h.amount > 0)) && h.date.startsWith(currentMonthPrefix)
          );

          return (
            <Tilt3DCard key={goal.id}>
              <div
                onDoubleClick={() => setSimGoalId(goal.id)}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-md hover:border-emerald-300 h-full cursor-pointer relative group"
                title="Икки марта босинг (double-click) — симуляцияни очиш"
              >
                {/* Double click quick hint badge */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-emerald-900/90 text-emerald-200 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-xs">
                  <Maximize2 className="w-2.5 h-2.5" />
                  <span>2x-click Симуляция</span>
                </div>

                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: goal.color || '#3B82F6' }}
                    >
                      <CategoryIcon name={goal.icon} className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isAchieved
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {isAchieved ? 'Эришилди!' : `${timeline.progressPercent}%`}
                      </span>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          openEditModal(goal);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Таҳрирлаш"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mb-1 leading-snug">
                    {title}
                  </h3>
                  {goal.notes && (
                    <p className="text-[11px] text-slate-500 mb-3 line-clamp-1">
                      {goal.notes}
                    </p>
                  )}

                  {/* Monthly Contribution Alert callout if unpaid */}
                  {!hasPaidThisMonth && !isAchieved && goal.monthlyContribution > 0 && (
                    <div className="p-2.5 bg-amber-50 border border-amber-200/80 rounded-xl mb-3 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-amber-900 font-semibold truncate">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="truncate">Октябрь бадали кутилмоқда</span>
                      </div>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setTxModalType('deposit');
                          setTxModalGoalId(goal.id);
                          setTxAmount(goal.monthlyContribution);
                          setTxNote('Октябрь ойи режадаги бадали');
                        }}
                        className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] rounded-lg transition-all shadow-2xs whitespace-nowrap shrink-0"
                      >
                        ⚡ Тўлаш ({formatCompactMoney(goal.monthlyContribution, currency, language, exchangeRate)})
                      </button>
                    </div>
                  )}

                  {/* Amount display */}
                  <div className="mt-1 mb-3">
                    <div className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                      {formatMoney(goal.currentAmount, currency, language, exchangeRate)}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center justify-between mt-0.5">
                      <span>
                        Мақсад: {formatCompactMoney(goal.targetAmount, currency, language, exchangeRate)}
                      </span>
                      <span>
                        Қолди: {formatCompactMoney(timeline.remainingAmount, currency, language, exchangeRate)}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${timeline.progressPercent}%`,
                        backgroundColor: goal.color || '#10B981',
                      }}
                    />
                  </div>

                  {/* Timeline estimation */}
                  <div className="text-[11px] text-slate-500 space-y-1 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Ойлик ажратма:
                      </span>
                      <span className="font-semibold text-slate-800 font-mono tabular-nums">
                        {formatMoney(goal.monthlyContribution, currency, language, exchangeRate)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Эришиш муддати:
                      </span>
                      <span className="font-semibold text-emerald-700">
                        {timeline.monthsNeeded === 0
                          ? 'Эришилган'
                          : `${timeline.monthsNeeded} ой (${formatDateUz(timeline.projectedDate, language).split(',')[0]})`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions: Deposit, Withdraw, History, Simulation */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="grid grid-cols-3 gap-1.5">
                    {/* Deposit */}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setTxModalType('deposit');
                        setTxModalGoalId(goal.id);
                        setTxAmount(goal.monthlyContribution || 1000000);
                      }}
                      className="py-1.5 px-1.5 text-[11px] font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl flex items-center justify-center gap-1 transition-colors active:scale-95"
                    >
                      <Plus className="w-3 h-3 text-emerald-400" />
                      <span>Бадал</span>
                    </button>

                    {/* Withdraw (Чиқим қилиш) */}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setTxModalType('withdraw');
                        setTxModalGoalId(goal.id);
                        setTxAmount(1000000);
                      }}
                      className="py-1.5 px-1.5 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl flex items-center justify-center gap-1 transition-colors active:scale-95"
                    >
                      <ArrowUpRight className="w-3 h-3 text-rose-600" />
                      <span>Чиқим</span>
                    </button>

                    {/* History */}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setHistoryGoalId(goal.id);
                      }}
                      className="py-1.5 px-1.5 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl flex items-center justify-center gap-1 transition-colors active:scale-95"
                      title="Жамғарма кирим-чиқим тарихи"
                    >
                      <History className="w-3 h-3 text-slate-600" />
                      <span>Тарих</span>
                    </button>
                  </div>

                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setSimGoalId(goal.id);
                    }}
                    className="w-full py-1.5 px-3 text-xs font-bold text-emerald-800 bg-emerald-50/80 hover:bg-emerald-100 border border-emerald-200/80 rounded-xl flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                  >
                    <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Симуляцияни очиш</span>
                  </button>
                </div>
              </div>
            </Tilt3DCard>
          );
        })}
      </div>

      {/* Embedded Quick Multi-Goal Simulation Engine Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Кўп Тармақли Муддат ва Бюджет Симулятори
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Ихтиёрий жамғармани танлаб, даромад ошиши ёки тежамкорлик ҳисобига мақсадга эришиш муддатини симуляция қилинг ва лимитларни ўрнатинг
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Goal Selector */}
            <select
              value={simGoalId || goals[0]?.id || ''}
              onChange={e => setSimGoalId(e.target.value)}
              className="text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500"
            >
              {goals.map(g => (
                <option key={g.id} value={g.id}>
                  {language === 'uz_cyrl' ? g.title_cyrl : g.title_latn}
                </option>
              ))}
            </select>

            <button
              onClick={() => setSimGoalId(simGoalId || goals[0]?.id || '')}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 shadow-xs active:scale-95 whitespace-nowrap"
            >
              <Maximize2 className="w-4 h-4" />
              <span>3D Ойнада Очиш</span>
            </button>
          </div>
        </div>
      </div>

      {/* Goal Simulation Modal Overlay */}
      {simGoalId && activeGoalForSim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 my-auto overflow-hidden">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                  style={{ backgroundColor: activeGoalForSim.color || '#3B82F6' }}
                >
                  <CategoryIcon name={activeGoalForSim.icon} className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-emerald-400 font-mono font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>3D Жамғарма Симуляцияси</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold tracking-tight">
                    {language === 'uz_cyrl' ? activeGoalForSim.title_cyrl : activeGoalForSim.title_latn}
                  </h3>
                </div>
              </div>

              {/* Multi-Goal Selector inside Modal */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300 font-semibold hidden sm:inline">Жамғармани танлаш:</span>
                <select
                  value={activeGoalForSim.id}
                  onChange={e => setSimGoalId(e.target.value)}
                  className="text-xs font-bold bg-slate-800 text-white border border-slate-700 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {goals.map(g => (
                    <option key={g.id} value={g.id}>
                      {language === 'uz_cyrl' ? g.title_cyrl : g.title_latn}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setSimGoalId(null)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-6">
              {/* Goal Quick Summary Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Йиғилди</span>
                  <span className="text-sm font-bold text-slate-900 font-mono">
                    {formatMoney(activeGoalForSim.currentAmount, currency, language, exchangeRate)}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Мақсад</span>
                  <span className="text-sm font-bold text-slate-900 font-mono">
                    {formatMoney(activeGoalForSim.targetAmount, currency, language, exchangeRate)}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Ойлик ажратма</span>
                  <span className="text-sm font-bold text-slate-900 font-mono">
                    {formatMoney(activeGoalForSim.monthlyContribution, currency, language, exchangeRate)}
                  </span>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase block">Прогресс</span>
                  <span className="text-sm font-bold text-emerald-900 font-mono">
                    {Math.round((activeGoalForSim.currentAmount / activeGoalForSim.targetAmount) * 100)}%
                  </span>
                </div>
              </div>

              {/* Sliders and Outcome Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sliders */}
                <div className="space-y-5 bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
                    Симуляция кўрсаткичларини мослаш:
                  </h4>

                  {/* Slider 1 */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-700">Даромаднинг ошиши (%):</span>
                      <span className="font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        +{incomeBoostPercent}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-20"
                      max="60"
                      step="5"
                      value={incomeBoostPercent}
                      onChange={e => setIncomeBoostPercent(Number(e.target.value))}
                      className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Slider 2 */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-700">Харажатларни тежаш (%):</span>
                      <span className="font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                        -{expenseCutPercent}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="5"
                      value={expenseCutPercent}
                      onChange={e => setExpenseCutPercent(Number(e.target.value))}
                      className="w-full accent-amber-500 h-2 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Slider 3 */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-700">Қўшимча ойлик жамғарма:</span>
                      <span className="font-mono font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                        +{formatMoney(customMonthlySavings, currency, language, exchangeRate)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10000000"
                      step="500000"
                      value={customMonthlySavings}
                      onChange={e => setCustomMonthlySavings(Number(e.target.value))}
                      className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* Outcome Comparison */}
                {simulationResults && (
                  <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white p-5 rounded-2xl flex flex-col justify-between shadow-md space-y-4">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest block mb-1">
                        Симуляция натижаси
                      </span>
                      <h4 className="text-base font-bold mb-3 text-emerald-100">
                        {simulationResults.monthsSaved > 0
                          ? `⚡ Мақсадга ${simulationResults.monthsSaved} ой тезроқ эришилади!`
                          : 'Жорий режа бўйича эришиш'}
                      </h4>

                      <div className="space-y-3 text-xs">
                        <div className="p-3 bg-white/10 rounded-xl backdrop-blur-xs flex items-center justify-between">
                          <span className="text-slate-300">Одатий муддат:</span>
                          <span className="font-mono font-bold text-white">
                            {simulationResults.baseline.monthsNeeded} ой ({formatDateUz(simulationResults.baseline.projectedDate, language).split(',')[0]})
                          </span>
                        </div>

                        <div className="p-3 bg-emerald-500/20 border border-emerald-400/40 rounded-xl backdrop-blur-xs flex items-center justify-between">
                          <span className="text-emerald-200 font-bold">Симуляция қилинган:</span>
                          <span className="font-mono font-bold text-emerald-300 text-sm">
                            {simulationResults.simulated.monthsNeeded} ой ({formatDateUz(simulationResults.simulated.projectedDate, language).split(',')[0]})
                          </span>
                        </div>

                        <div className="p-2.5 bg-white/5 rounded-xl text-[11px] text-slate-300">
                          Янги ойлик ажратма: <strong className="text-emerald-400 font-mono">{formatMoney(simulationResults.newMonthlyTotal, currency, language, exchangeRate)}</strong> / ой
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/10 space-y-2">
                      {/* Action 1: Set as Active Monthly Budget Limit */}
                      <button
                        type="button"
                        onClick={() => {
                          setMonthlyBudgetLimit(simulationResults.newMonthlyTotal);
                          setBudgetAlertSettings(prev => ({ ...prev, monthlyLimit: simulationResults.newMonthlyTotal }));
                          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
                          alert(`Ойлик бюджет лимити ${formatMoney(simulationResults.newMonthlyTotal, currency, language, exchangeRate)} сўмга созланди!`);
                        }}
                        className="w-full py-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                      >
                        <Sliders className="w-3.5 h-3.5 text-slate-900" />
                        <span>Симулятор асосида Ойлик Бюджет Лимитини ўрнатиш ({formatCompactMoney(simulationResults.newMonthlyTotal, currency, language, exchangeRate)})</span>
                      </button>

                      {/* Action 2: Deposit Now */}
                      <button
                        onClick={() => {
                          setTxModalType('deposit');
                          setTxModalGoalId(activeGoalForSim.id);
                          setSimGoalId(null);
                        }}
                        className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all active:scale-95 shadow-xs"
                      >
                        Ҳозироқ Бадал Киритиш
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Goal History Modal Overlay */}
      {historyGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden my-auto">
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                  style={{ backgroundColor: historyGoal.color || '#3B82F6' }}
                >
                  <CategoryIcon name={historyGoal.icon} className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-emerald-400 font-mono font-bold flex items-center gap-1">
                    <History className="w-3.5 h-3.5" />
                    <span>Кирим ва Чиқимлар Тарихи</span>
                  </div>
                  <h3 className="text-base font-bold tracking-tight">
                    {language === 'uz_cyrl' ? historyGoal.title_cyrl : historyGoal.title_latn}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setHistoryGoalId(null)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Summary Stats Bar */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Жами йиғилди:</span>
                  <span className="text-sm font-bold text-emerald-700 font-mono">
                    {formatMoney(historyGoal.currentAmount, currency, language, exchangeRate)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Амалиётлар сони:</span>
                  <span className="text-sm font-bold text-slate-900 font-mono">
                    {historyGoal.history.length} та
                  </span>
                </div>
              </div>

              {/* Transactions List */}
              {historyGoal.history.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs space-y-1">
                  <FileText className="w-8 h-8 mx-auto text-slate-300" />
                  <p>Ушбу жамғарма бўйича ҳали амалиётлар мавжуд эмас</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {historyGoal.history.map(item => {
                    const isDeposit = item.type === 'deposit' || (item.amount && item.amount > 0);
                    const wallet = wallets.find(w => w.id === item.walletId);
                    const walletName = wallet
                      ? language === 'uz_cyrl'
                        ? wallet.name_cyrl
                        : wallet.name_latn
                      : 'Пул манбаси';

                    return (
                      <div
                        key={item.id}
                        className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                          isDeposit ? 'bg-emerald-50/50 border-emerald-200/80' : 'bg-rose-50/50 border-rose-200/80'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0 ${
                              isDeposit ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {isDeposit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">
                              {isDeposit ? 'Кирим (Бадал)' : 'Чиқим (Ечиб олиш)'}
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                              <span>{formatDateUz(item.date, language)}</span>
                              <span>•</span>
                              <span className="font-semibold text-slate-700">{walletName}</span>
                            </div>
                            {item.note && (
                              <p className="text-[11px] text-slate-600 mt-0.5 italic">"{item.note}"</p>
                            )}
                          </div>
                        </div>

                        <div className="text-right font-mono font-bold">
                          <span className={isDeposit ? 'text-emerald-700' : 'text-rose-700'}>
                            {isDeposit ? '+' : '-'}{formatMoney(Math.abs(item.amount), currency, language, exchangeRate)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  setTxModalType('deposit');
                  setTxModalGoalId(historyGoal.id);
                  setHistoryGoalId(null);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs active:scale-95 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Янги Бадал Қўшиш</span>
              </button>

              <button
                onClick={() => setHistoryGoalId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Ёпиш
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deposit or Withdraw Modal */}
      {txModalType && txModalGoalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                {txModalType === 'deposit' ? (
                  <>
                    <Plus className="w-5 h-5 text-emerald-600" />
                    <span>Жамғармага бадал киритиш</span>
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="w-5 h-5 text-rose-600" />
                    <span>Жамғармадан чиқим қилиш</span>
                  </>
                )}
              </h3>
              <button
                onClick={() => {
                  setTxModalType(null);
                  setTxModalGoalId(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTxSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Сумма (сўм)
                </label>
                <input
                  type="number"
                  min="1000"
                  step="10000"
                  required
                  autoFocus
                  value={txAmount}
                  onChange={e => setTxAmount(Number(e.target.value))}
                  className="w-full text-base font-mono font-bold tabular-nums px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {txModalType === 'deposit'
                    ? 'Қайси ҳамён/картадан ечилади?'
                    : 'Қайси ҳамён/картага ўтказилади (чиқим)?'}
                </label>
                <select
                  value={txWalletId}
                  onChange={e => setTxWalletId(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                >
                  {wallets.map(w => (
                    <option key={w.id} value={w.id}>
                      {language === 'uz_cyrl' ? w.name_cyrl : w.name_latn} ({formatMoney(w.balance, currency, language, exchangeRate)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Изоҳ (ихтиёрий)
                </label>
                <input
                  type="text"
                  placeholder={txModalType === 'deposit' ? 'Масалан: Ойликдан ажратма' : 'Масалан: Зарур харажат учун ечиб олинди'}
                  value={txNote}
                  onChange={e => setTxNote(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setTxModalType(null);
                    setTxModalGoalId(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-xs active:scale-95 ${
                    txModalType === 'deposit' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {txModalType === 'deposit' ? 'Бадални сақлаш' : 'Чиқимни бажариш'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Goal Edit Modal */}
      {editingGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-emerald-600" />
                <span>Жамғарма мақсадини таҳрирлаш</span>
              </h3>
              <button
                onClick={() => setEditingGoal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Мақсад номи
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Мақсад суммаси (сўм)
                  </label>
                  <input
                    type="number"
                    min="100000"
                    step="500000"
                    required
                    value={editTargetAmount}
                    onChange={e => setEditTargetAmount(Number(e.target.value))}
                    className="w-full text-xs font-mono font-bold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ойлик ажратма (сўм)
                  </label>
                  <input
                    type="number"
                    min="50000"
                    step="100000"
                    required
                    value={editMonthlyContribution}
                    onChange={e => setEditMonthlyContribution(Number(e.target.value))}
                    className="w-full text-xs font-mono font-bold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Эришиш санаси
                  </label>
                  <input
                    type="date"
                    required
                    value={editTargetDate}
                    onChange={e => setEditTargetDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Муҳимлик даражаси
                  </label>
                  <select
                    value={editPriority}
                    onChange={e => setEditPriority(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold"
                  >
                    <option value="low">Паст</option>
                    <option value="medium">Одатий</option>
                    <option value="high">Юқори (Муҳим)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Изоҳ (ихтиёрий)
                </label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Ушбу мақсадни ўчирасизми?')) {
                      deleteGoal(editingGoal.id);
                      setEditingGoal(null);
                    }
                  }}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Ўчириш</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingGoal(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-xs"
                  >
                    Ўзгаришларни Сақлаш
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
