import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getT } from '../../constants/translations';
import {
  formatMoney,
  formatDateUz,
  getDueStatus,
  getRecurringStatus,
  CURRENT_DATE_STR,
} from '../../utils/formatters';
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  Copy,
  Phone,
  ArrowRight,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const UrgentAlerts: React.FC = () => {
  const {
    debts,
    recurringItems,
    wallets,
    transactions,
    settleDebt,
    payRecurringItem,
    currency,
    language,
    exchangeRate,
    setActiveTab,
    monthlyBudgetLimit,
    budgetUsagePercent,
    isBudget80Alert,
    isBudget100Alert,
  } = useApp();

  const t = getT(language);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 1. Find alert debts: not settled AND (overdue or due in <= 3 days)
  const urgentDebts = debts
    .filter(d => d.status !== 'settled')
    .map(d => ({
      ...d,
      dueInfo: getDueStatus(d.dueDate, false, CURRENT_DATE_STR),
    }))
    .filter(d => d.dueInfo.isAlert)
    .sort((a, b) => a.dueInfo.daysDiff - b.dueInfo.daysDiff);

  // 2. Find alert recurring items: active AND (due today or in <= 3 days, or overdue)
  const urgentRecurring = recurringItems
    .filter(r => r.isActive)
    .map(r => ({
      ...r,
      dueInfo: getRecurringStatus(r.dueDayOfMonth, r.lastPaidDate, CURRENT_DATE_STR),
    }))
    .filter(r => r.dueInfo.isAlert)
    .sort((a, b) => a.dueInfo.daysDiff - b.dueInfo.daysDiff);

  const hasBudgetAlert = isBudget80Alert || isBudget100Alert;
  const totalAlertCount = urgentDebts.length + urgentRecurring.length + (hasBudgetAlert ? 1 : 0);

  const handleCopyDebtReminder = (debt: typeof urgentDebts[0]) => {
    const isReceivable = debt.type === 'they_owe';
    const msg = isReceivable
      ? `Ассалому алайкум, ҳурматли ${debt.personName}! Келишилган ${formatMoney(
          debt.remainingAmount,
          currency,
          language,
          exchangeRate
        )} миқдоридаги қарзни қайтариш муддати (${formatDateUz(
          debt.dueDate,
          language
        )}) яқинлашди. Иложи бўлса қайтариб берсангиз миннатдор бўлардик. Ташаккур!`
      : `Ассалому алайкум! Мендаги ${formatMoney(
          debt.remainingAmount,
          currency,
          language,
          exchangeRate
        )} қарзни тўлаш муддати бўйича хабар бермоқдаман.`;

    navigator.clipboard.writeText(msg);
    setCopiedId(debt.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  if (totalAlertCount === 0) {
    return null; // All debts & bills are settled/up to date
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 sm:p-5 shadow-xs"
    >
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-2 text-amber-950">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 leading-tight">
              Шошилинч тўлов ва қарз эслатмалари
            </h4>
            <span className="text-[11px] text-amber-900 font-medium">
              {totalAlertCount} та муҳим муддат (қарзлар ва такрорланувчи тўловлар)
            </span>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('debts')}
          className="text-xs font-semibold text-amber-900 hover:text-amber-950 flex items-center gap-1 hover:underline whitespace-nowrap shrink-0"
        >
          <span>Батафсил</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Monthly Budget Threshold Alert Card */}
        {hasBudgetAlert && (
          <motion.div
            whileHover={{ y: -1 }}
            className={`rounded-xl p-3.5 bg-white border shadow-xs flex flex-col justify-between ${
              isBudget100Alert ? 'border-rose-300' : 'border-amber-300'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-1">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {isBudget100Alert
                        ? language === 'uz_cyrl' ? 'Ойлик Бюджет 100% Тугади!' : 'Oylik Byudjet 100% Tugadi!'
                        : language === 'uz_cyrl' ? 'Ойлик Бюджет 80% Лимит!' : 'Oylik Byudjet 80% Limit!'}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isBudget100Alert
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {budgetUsagePercent}%
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {language === 'uz_cyrl' ? 'Белгиланган лимит: ' : 'Belgilangan limit: '}
                    <strong className="text-slate-800">{formatMoney(monthlyBudgetLimit, currency, language, exchangeRate)}</strong>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-[11px] font-bold inline-block ${
                      isBudget100Alert ? 'text-rose-600 animate-pulse' : 'text-amber-700'
                    }`}
                  >
                    {isBudget100Alert ? '100% ошди' : '80% га етди'}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 mb-2">
                {isBudget100Alert
                  ? language === 'uz_cyrl'
                    ? 'Бюджет маблағлари тўлиқ ишлатиб бўлинди. Лимитни кўриб чиқинг ёки харажатларни чекланг.'
                    : 'Byudjet mablag\'lari to\'liq ishlatib bo\'lindi. Limitni ko\'rib chiqing yoki xarajatlarni cheklang.'
                  : language === 'uz_cyrl'
                    ? 'Харажатларингиз ойлик лимитнинг 80% қисмидан ошди. Режани назорат қилинг.'
                    : 'Xarajatlaringiz oylik limitning 80% qismidan oshdi. Rejani nazorat qiling.'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setActiveTab('dashboard')}
                className="px-3 py-1.5 min-h-[36px] text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-95 rounded-lg flex items-center gap-1.5 transition-all shadow-xs"
              >
                <span>{language === 'uz_cyrl' ? 'Дашбордда кўриш' : 'Dashbordda ko\'rish'}</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Recurring bills alerts */}
        {urgentRecurring.map(item => {
          const isOverdue = item.dueInfo.status === 'overdue';
          const isToday = item.dueInfo.status === 'today';
          const wallet = wallets.find(w => w.id === item.walletId);

          return (
            <motion.div
              key={item.id}
              whileHover={{ y: -1 }}
              className="rounded-xl p-3.5 bg-white border border-amber-200/80 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {item.title}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                        Обуна / Доимий
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>Ҳар ойнинг {item.dueDayOfMonth}-санаси</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-600">
                        {language === 'uz_cyrl' ? wallet?.name_cyrl : wallet?.name_latn}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-slate-900 text-sm tabular-nums">
                      {formatMoney(item.amount, currency, language, exchangeRate)}
                    </div>
                    <span
                      className={`text-[11px] font-bold inline-block mt-0.5 ${
                        isOverdue
                          ? 'text-rose-600'
                          : isToday
                          ? 'text-amber-700 animate-pulse'
                          : 'text-amber-700'
                      }`}
                    >
                      {language === 'uz_cyrl' ? item.dueInfo.labelCyrl : item.dueInfo.labelLatn}
                    </span>
                  </div>
                </div>

                {item.notes && (
                  <p className="text-[11px] text-slate-500 mb-2 italic">
                    "{item.notes}"
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => payRecurringItem(item.id)}
                  className="px-3 py-1.5 min-h-[36px] text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-95 rounded-lg flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Тўланди деб белгилаш</span>
                </button>
              </div>
            </motion.div>
          );
        })}

        {/* Debts alerts */}
        {urgentDebts.map(debt => {
          const isOverdue = debt.dueInfo.status === 'overdue';
          const isTheyOwe = debt.type === 'they_owe';

          return (
            <motion.div
              key={debt.id}
              whileHover={{ y: -1 }}
              className={`rounded-xl p-3.5 bg-white border shadow-xs flex flex-col justify-between ${
                isOverdue ? 'border-rose-200' : 'border-amber-200/80'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {debt.personName}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isTheyOwe
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-indigo-50 text-indigo-700'
                        }`}
                      >
                        {isTheyOwe ? 'Мендан қарз' : 'Менинг қарзим'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      {debt.phone && (
                        <span className="flex items-center gap-1 font-mono text-emerald-700">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {debt.phone}
                        </span>
                      )}
                      <span aria-hidden="true">·</span>
                      <span>Муддати: {formatDateUz(debt.dueDate, language)}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-slate-900 text-sm tabular-nums">
                      {formatMoney(debt.remainingAmount, currency, language, exchangeRate)}
                    </div>
                    <span
                      className={`text-[11px] font-bold inline-block mt-0.5 ${
                        isOverdue ? 'text-rose-600' : 'text-amber-700'
                      }`}
                    >
                      {language === 'uz_cyrl' ? debt.dueInfo.labelCyrl : debt.dueInfo.labelLatn}
                    </span>
                  </div>
                </div>

                {debt.notes && (
                  <p className="text-[11px] text-slate-500 mb-2 italic">
                    "{debt.notes}"
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleCopyDebtReminder(debt)}
                  className="px-2.5 py-1.5 min-h-[36px] text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 rounded-lg flex items-center gap-1 transition-all"
                  title="SMS ёки Telegram учун хушмуомала эслатма матни"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedId === debt.id ? 'Нусхаланди!' : 'Эслатма'}</span>
                </button>

                <button
                  onClick={() => settleDebt(debt.id)}
                  className="px-3 py-1.5 min-h-[36px] text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-lg flex items-center gap-1 transition-all shadow-xs"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{t.markSettled}</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
