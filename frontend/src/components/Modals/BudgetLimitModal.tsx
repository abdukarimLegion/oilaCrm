import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getT } from '../../constants/translations';
import { formatMoney, formatCompactMoney } from '../../utils/formatters';
import {
  X,
  Sliders,
  AlertTriangle,
  AlertOctagon,
  Check,
  ShieldCheck,
  Bell,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BudgetLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BudgetLimitModal: React.FC<BudgetLimitModalProps> = ({ isOpen, onClose }) => {
  const {
    monthlyBudgetLimit,
    setMonthlyBudgetLimit,
    budgetAlertSettings,
    setBudgetAlertSettings,
    transactions,
    currency,
    language,
    exchangeRate,
  } = useApp();

  const t = getT(language);

  const [inputLimit, setInputLimit] = useState<number>(monthlyBudgetLimit);
  const [alert80, setAlert80] = useState<boolean>(budgetAlertSettings.alertAt80);
  const [alert100, setAlert100] = useState<boolean>(budgetAlertSettings.alertAt100);

  // Total current month expenses
  const currentExpenses = transactions
    .filter(t => t.type === 'expense' && t.date.startsWith('2026-10'))
    .reduce((sum, item) => sum + item.amount, 0);

  const previewPercent = inputLimit > 0 ? Math.round((currentExpenses / inputLimit) * 100) : 0;
  const isOverBudget = previewPercent >= 100;
  const isNearLimit = previewPercent >= 80 && previewPercent < 100;

  // Preset thresholds in UZS
  const presets = [
    { label: '5 млн', value: 5000000 },
    { label: '6.5 млн', value: 6500000 },
    { label: '8 млн', value: 8000000 },
    { label: '10 млн', value: 10000000 },
    { label: '15 млн', value: 15000000 },
    { label: '20 млн', value: 20000000 },
  ];

  const handleSave = () => {
    if (inputLimit <= 0) return;
    setMonthlyBudgetLimit(inputLimit);
    setBudgetAlertSettings({
      monthlyLimit: inputLimit,
      alertAt80: alert80,
      alertAt100: alert100,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-xl border border-black/[0.06] overflow-hidden text-[#1c211e]"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#f3f0ea] text-[#547f69] flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-[#1c211e]">
                  {t.budgetLimitTitle}
                </h3>
                <p className="text-xs text-[#797e7a]">
                  {language === 'ru'
                    ? 'Автоматическое напоминание при достижении лимитов 80% и 100%'
                    : language === 'en'
                    ? 'Automatic reminder when reaching 80% and 100% limits'
                    : language === 'uz_latn'
                    ? '80% va 100% limitlarga yetganda avtomatik eslatma'
                    : '80% ва 100% лимитларга етганда автоматик эслатма'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Current Status Preview Box */}
          <div
            className={`p-4 rounded-2xl border mb-5 transition-colors ${
              isOverBudget
                ? 'bg-[#fceeee]/60 border-[#f8d7da]'
                : isNearLimit
                ? 'bg-amber-50/80 border-amber-200'
                : 'bg-[#e8ede8]/50 border-[#d0ded0]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#797e7a]">
                {t.currentSpendingLabel}
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full font-mono tabular-nums ${
                  isOverBudget
                    ? 'bg-rose-100 text-rose-700'
                    : isNearLimit
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {previewPercent}% {isOverBudget ? '(100%+)' : isNearLimit ? '(80%)' : ''}
              </span>
            </div>

            {/* Visual Progress Line */}
            <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden mb-3">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isOverBudget
                    ? 'bg-rose-600'
                    : isNearLimit
                    ? 'bg-amber-500'
                    : 'bg-[#547f69]'
                }`}
                style={{ width: `${Math.min(100, previewPercent)}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[11px] text-[#797e7a] block">
                  {t.currentMonthlyExpenseLabel}
                </span>
                <span className="font-bold text-[#1c211e] font-mono tabular-nums">
                  {formatMoney(currentExpenses, currency, language, exchangeRate)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-[#797e7a] block">
                  {isOverBudget ? t.excessExpenseLabel : t.remainingReserveLabel}
                </span>
                <span
                  className={`font-bold font-mono tabular-nums ${
                    isOverBudget ? 'text-rose-600' : 'text-[#547f69]'
                  }`}
                >
                  {isOverBudget
                    ? `+${formatMoney(currentExpenses - inputLimit, currency, language, exchangeRate)}`
                    : formatMoney(Math.max(0, inputLimit - currentExpenses), currency, language, exchangeRate)}
                </span>
              </div>
            </div>
          </div>

          {/* Budget Limit Input */}
          <div className="mb-4">
            <label className="text-xs font-bold text-[#1c211e] block mb-1.5">
              {t.setMonthlyLimitPrompt}
            </label>
            <div className="relative">
              <input
                type="number"
                min="500000"
                step="500000"
                value={inputLimit}
                onChange={e => setInputLimit(Math.max(0, Number(e.target.value)))}
                className="w-full bg-[#f3f0ea] border border-black/[0.06] rounded-2xl px-4 py-3 text-lg font-bold font-mono text-[#1c211e] tabular-nums outline-none focus:ring-2 focus:ring-[#547f69]"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#797e7a]">
                UZS
              </span>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="mb-6">
            <span className="text-[11px] text-[#797e7a] block mb-2 font-medium">
              {t.quickChoices}
            </span>
            <div className="flex flex-wrap gap-2">
              {presets.map(p => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setInputLimit(p.value)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                    inputLimit === p.value
                      ? 'bg-[#1c211e] text-white border-[#1c211e] shadow-xs'
                      : 'bg-[#f3f0ea] text-[#1c211e] border-black/[0.04] hover:bg-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Alert Toggles */}
          <div className="space-y-3 pt-4 border-t border-slate-100 mb-6">
            <span className="text-xs font-bold text-[#1c211e] block">
              {t.reminderSettings}
            </span>

            {/* 80% Threshold Alert Toggle */}
            <label className="flex items-center justify-between p-3 rounded-2xl bg-[#f3f0ea]/60 border border-black/[0.04] cursor-pointer hover:bg-[#f3f0ea] transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1c211e]">
                    {t.warnAt80Label}
                  </div>
                  <div className="text-[11px] text-[#797e7a]">
                    {t.warnYellowLabel}
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={alert80}
                onChange={e => setAlert80(e.target.checked)}
                className="w-4 h-4 accent-[#547f69] rounded cursor-pointer"
              />
            </label>

            {/* 100% Threshold Alert Toggle */}
            <label className="flex items-center justify-between p-3 rounded-2xl bg-[#f3f0ea]/60 border border-black/[0.04] cursor-pointer hover:bg-[#f3f0ea] transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <AlertOctagon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1c211e]">
                    {t.warnAt100Label}
                  </div>
                  <div className="text-[11px] text-[#797e7a]">
                    {t.warnRedLabel}
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={alert100}
                onChange={e => setAlert100(e.target.checked)}
                className="w-4 h-4 accent-[#547f69] rounded cursor-pointer"
              />
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-[#797e7a] hover:text-[#1c211e] bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#547f69] hover:bg-[#466d59] rounded-xl transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>{t.save}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
