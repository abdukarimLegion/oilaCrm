import React from 'react';
import { CategoryLimitAlert, Language } from '../../types';
import { formatMoney } from '../../utils/formatters';
import { AlertOctagon, AlertTriangle, X, Sliders } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CategoryIcon } from './CategoryIcon';

interface CategoryLimitToastProps {
  alert: CategoryLimitAlert | null;
  onDismiss: () => void;
  onOpenLimits: () => void;
  currency: 'UZS' | 'USD';
  language: Language;
  exchangeRate: number;
}

export const CategoryLimitToast: React.FC<CategoryLimitToastProps> = ({
  alert,
  onDismiss,
  onOpenLimits,
  currency,
  language,
  exchangeRate,
}) => {
  if (!alert) return null;

  const isDanger = alert.severity === 'danger';
  const isDaily = alert.period === 'daily';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-lg w-[92%] sm:w-full"
      >
        <div
          className={`rounded-2xl p-4 shadow-2xl border flex items-start justify-between gap-3 text-white backdrop-blur-md ${
            isDanger
              ? 'bg-gradient-to-r from-rose-900 via-slate-900 to-rose-950 border-rose-500/50 shadow-rose-900/30'
              : 'bg-gradient-to-r from-amber-900 via-slate-900 to-amber-950 border-amber-500/50 shadow-amber-900/30'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs mt-0.5"
              style={{ backgroundColor: alert.categoryColor }}
            >
              <CategoryIcon name={alert.categoryIcon} className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/20 text-white font-mono">
                  {isDaily ? '📅 Кунлик Лимит Ошди!' : '🗓️ Ҳафталик Лимит Ошди!'}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-500 text-white font-mono">
                  {alert.percentExceeded}%
                </span>
              </div>

              <h4 className="font-extrabold text-sm sm:text-base mt-1 leading-snug">
                {language === 'uz_cyrl' ? alert.categoryNameCyrl : alert.categoryNameLatn}
              </h4>

              <p className="text-xs text-slate-200 mt-0.5">
                {isDaily ? 'Бугунги сарфланиш' : 'Ҳафталик сарфланиш'}:{' '}
                <strong className="text-rose-300 font-mono">
                  {formatMoney(alert.spentAmount, currency, language, exchangeRate)}
                </strong>{' '}
                (Лимит: {formatMoney(alert.limitAmount, currency, language, exchangeRate)})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                onDismiss();
                onOpenLimits();
              }}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all"
              title="Лимитни созлаш"
            >
              <Sliders className="w-4 h-4" />
            </button>

            <button
              onClick={onDismiss}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
