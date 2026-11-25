import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getT } from '../../constants/translations';
import { formatMoney, formatDateUz } from '../../utils/formatters';
import {
  X,
  Bell,
  AlertTriangle,
  AlertOctagon,
  CheckCircle,
  Sliders,
  Calendar,
  Layers,
  ArrowRight,
  TrendingDown,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CategoryIcon } from '../Common/CategoryIcon';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCategoryLimits: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  onOpenCategoryLimits,
}) => {
  const {
    categoryLimitAlerts,
    debts,
    recurringItems,
    currency,
    language,
    exchangeRate,
    setActiveTab,
    isBudget80Alert,
    isBudget100Alert,
    budgetUsagePercent,
    monthlyBudgetLimit,
  } = useApp();

  const t = getT(language);

  const [activeTab, setActiveTabFilter] = useState<'all' | 'categories' | 'debts' | 'recurring'>('all');

  if (!isOpen) return null;

  // Urgent debts
  const urgentDebts = debts.filter(d => d.status !== 'settled');

  // Urgent recurring bills
  const activeRecurring = recurringItems.filter(r => r.isActive);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden my-auto"
        >
          {/* Header */}
          <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-400/30 flex items-center justify-center relative">
                <Bell className="w-5 h-5" />
                {categoryLimitAlerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 ring-2 ring-slate-900" />
                )}
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg tracking-tight">
                  {language === 'uz_cyrl' ? 'Огоҳлантиришлар ва Эслатмалар' : 'Ogohlantirishlar va Eslatmalar'}
                </h3>
                <p className="text-xs text-slate-300">
                  {language === 'uz_cyrl' ? 'Тоифалар кунлик/ҳафталик лимитлари ва муҳим тўловлар' : 'Toifalar kunlik/haftalik limitlari va muhim to\'lovlar'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Actions & Category Limits Settings Trigger */}
          <div className="bg-amber-50/80 border-b border-amber-200/60 px-5 py-3 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-900 font-semibold">
              <Sliders className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Тоифалар кунлик ва ҳафталик лимитларини созлашни хоҳлайсизми?</span>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenCategoryLimits();
              }}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] rounded-xl transition-all shadow-xs shrink-0 whitespace-nowrap"
            >
              ⚙️ Лимитларни Созлаш
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-100 bg-slate-50 px-5 pt-3 gap-2">
            <button
              onClick={() => setActiveTabFilter('all')}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 ${
                activeTab === 'all'
                  ? 'border-rose-600 text-rose-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Барчаси ({categoryLimitAlerts.length + urgentDebts.length})
            </button>

            <button
              onClick={() => setActiveTabFilter('categories')}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1 ${
                activeTab === 'categories'
                  ? 'border-rose-600 text-rose-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Тоифалар лимитлари</span>
              {categoryLimitAlerts.length > 0 && (
                <span className="px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded-full text-[10px] font-mono">
                  {categoryLimitAlerts.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTabFilter('debts')}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 ${
                activeTab === 'debts'
                  ? 'border-rose-600 text-rose-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Қарзлар ({urgentDebts.length})
            </button>
          </div>

          {/* Alert List Content */}
          <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
            {/* Monthly Budget General Alert Banner */}
            {(isBudget80Alert || isBudget100Alert) && (
              <div
                className={`p-4 rounded-2xl border flex items-start gap-3 ${
                  isBudget100Alert
                    ? 'bg-rose-50 border-rose-200 text-rose-950'
                    : 'bg-amber-50 border-amber-200 text-amber-950'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isBudget100Alert ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {isBudget100Alert ? <AlertOctagon className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm">
                    {isBudget100Alert
                      ? 'Ойлик Умумий Бюджет Лимити (100%) Ошди!'
                      : 'Ойлик Умумий Бюджет Лимити 80% га етди!'}
                  </h4>
                  <p className="text-xs opacity-90 mt-0.5">
                    Умумий ойлик бюджет: {formatMoney(monthlyBudgetLimit, currency, language, exchangeRate)} (Сарфланиш: {budgetUsagePercent}%)
                  </p>
                </div>
              </div>
            )}

            {/* CATEGORY DAILY & WEEKLY LIMIT ALERTS */}
            {(activeTab === 'all' || activeTab === 'categories') && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4 text-rose-600" />
                  <span>Тоифалар бўйича кунлик ва ҳафталик ортиқча сарфланмалар:</span>
                </div>

                {categoryLimitAlerts.length === 0 ? (
                  <div className="p-6 bg-slate-50 rounded-2xl text-center border border-slate-200">
                    <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto mb-1" />
                    <p className="text-xs text-slate-600 font-semibold">
                      Тоифалар бўйича кунлик ва ҳафталик лимитлар меъёрида!
                    </p>
                  </div>
                ) : (
                  categoryLimitAlerts.map(alert => {
                    const isDanger = alert.severity === 'danger';
                    const isDaily = alert.period === 'daily';

                    return (
                      <div
                        key={alert.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col gap-2 ${
                          isDanger
                            ? 'bg-rose-50/70 border-rose-200/90'
                            : 'bg-amber-50/70 border-amber-200/90'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                              style={{ backgroundColor: alert.categoryColor }}
                            >
                              <CategoryIcon name={alert.categoryIcon} className="w-4 h-4" />
                            </span>
                            <div>
                              <span className="font-bold text-slate-900 text-xs sm:text-sm block">
                                {language === 'uz_cyrl' ? alert.categoryNameCyrl : alert.categoryNameLatn}
                              </span>
                              <span className="text-[10px] text-slate-500 font-semibold block">
                                {isDaily ? '📅 Бугунги кунлик харажат' : '🗓️ Шу ҳафталик харажат'}
                              </span>
                            </div>
                          </div>

                          <span
                            className={`text-xs font-black font-mono px-2.5 py-1 rounded-lg ${
                              isDanger ? 'bg-rose-200 text-rose-900' : 'bg-amber-200 text-amber-900'
                            }`}
                          >
                            {alert.percentExceeded}% {isDanger ? '(Ошди!)' : '(80%+ Лимит)'}
                          </span>
                        </div>

                        {/* Progress visual bar */}
                        <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isDanger ? 'bg-rose-600' : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(100, alert.percentExceeded)}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-xs font-mono font-semibold pt-1">
                          <span className="text-slate-700">
                            Сарфланди: <strong className={isDanger ? 'text-rose-700' : 'text-amber-800'}>{formatMoney(alert.spentAmount, currency, language, exchangeRate)}</strong>
                          </span>
                          <span className="text-slate-500">
                            Лимит: {formatMoney(alert.limitAmount, currency, language, exchangeRate)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* DEBTS NOTIFICATIONS */}
            {(activeTab === 'all' || activeTab === 'debts') && (
              <div className="space-y-3 pt-2">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Қарзлар ва муҳим муддатлар:</span>
                </div>

                {urgentDebts.map(debt => (
                  <div
                    key={debt.id}
                    className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 block">{debt.personName}</span>
                      <span className="text-[10px] text-slate-500">
                        Муддати: {formatDateUz(debt.dueDate, language)} ({debt.type === 'they_owe' ? 'Менга қайтаради' : 'Мен тўлашим шарт'})
                      </span>
                    </div>
                    <div className="text-right font-mono font-bold">
                      <span className="text-slate-900 block">{formatMoney(debt.remainingAmount, currency, language, exchangeRate)}</span>
                      <button
                        onClick={() => {
                          onClose();
                          setActiveTab('debts');
                        }}
                        className="text-[10px] text-emerald-700 font-bold hover:underline"
                      >
                        Дафтарга ўтиш →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
