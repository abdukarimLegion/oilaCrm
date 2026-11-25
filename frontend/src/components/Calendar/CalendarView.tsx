import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { getT } from '../../constants/translations';
import { formatMoney, formatDateUz } from '../../utils/formatters';
import { CategoryIcon } from '../Common/CategoryIcon';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Target,
  HandCoins,
  RefreshCw,
  CheckCircle,
  X,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

export const CalendarView: React.FC = () => {
  const {
    recurringItems,
    goals,
    debts,
    categories,
    wallets,
    payRecurringItem,
    currency,
    language,
    exchangeRate,
    setActiveTab,
  } = useApp();

  const t = getT(language);

  // Default to October 2026 (year 2026, month 9 for 0-indexed)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(9); // October
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  // Month names in different languages
  const monthNames = {
    uz_cyrl: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
    uz_latn: ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'],
    ru: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  };

  const currentMonthName = (monthNames[language] || monthNames.uz_cyrl)[currentMonth];

  // Navigate months
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  // Generate days in month grid
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    // Adjust so week starts Monday (0 = Mon, 6 = Sun)
    const adjustedFirstDay = (firstDayIndex + 6) % 7;
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const daysList: Array<{ dayNum: number; dateStr: string; isCurrentMonth: boolean }> = [];

    // Previous month padding days
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = adjustedFirstDay - 1; i >= 0; i--) {
      const dNum = prevMonthDays - i;
      const mNum = currentMonth === 0 ? 12 : currentMonth;
      const yNum = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${yNum}-${String(mNum).padStart(2, '0')}-${String(dNum).padStart(2, '0')}`;
      daysList.push({ dayNum: dNum, dateStr, isCurrentMonth: false });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const mNum = currentMonth + 1;
      const dateStr = `${currentYear}-${String(mNum).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      daysList.push({ dayNum: d, dateStr, isCurrentMonth: true });
    }

    // Next month padding days to complete 35 or 42 cells
    const totalCells = daysList.length <= 35 ? 35 : 42;
    const remaining = totalCells - daysList.length;
    for (let d = 1; d <= remaining; d++) {
      const mNum = currentMonth === 11 ? 1 : currentMonth + 2;
      const yNum = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${yNum}-${String(mNum).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      daysList.push({ dayNum: d, dateStr, isCurrentMonth: false });
    }

    return daysList;
  }, [currentYear, currentMonth]);

  // Map events to date strings
  const dateEventsMap = useMemo(() => {
    const map = new Map<string, Array<{ type: 'recurring' | 'goal' | 'debt'; title: string; amount?: number; id: string; raw: any }>>();

    // 1. Recurring Items (due on dueDayOfMonth of this month)
    recurringItems.forEach(item => {
      if (!item.isActive) return;
      const dayStr = String(item.dueDayOfMonth).padStart(2, '0');
      const monthStr = String(currentMonth + 1).padStart(2, '0');
      const dateStr = `${currentYear}-${monthStr}-${dayStr}`;

      const list = map.get(dateStr) || [];
      list.push({
        type: 'recurring',
        title: item.title,
        amount: item.amount,
        id: item.id,
        raw: item,
      });
      map.set(dateStr, list);
    });

    // 2. Goal target dates
    goals.forEach(goal => {
      if (!goal.targetDate) return;
      const dateStr = goal.targetDate; // YYYY-MM-DD
      const list = map.get(dateStr) || [];
      list.push({
        type: 'goal',
        title: language === 'uz_cyrl' ? goal.title_cyrl : goal.title_latn,
        amount: goal.targetAmount,
        id: goal.id,
        raw: goal,
      });
      map.set(dateStr, list);
    });

    // 3. Debt due dates
    debts.forEach(debt => {
      if (debt.status === 'settled' || !debt.dueDate) return;
      const dateStr = debt.dueDate;
      const list = map.get(dateStr) || [];
      list.push({
        type: 'debt',
        title: `${debt.personName} (${debt.type === 'they_owe' ? 'Қарз ундируви' : 'Қарз тўлови'})`,
        amount: debt.remainingAmount,
        id: debt.id,
        raw: debt,
      });
      map.set(dateStr, list);
    });

    return map;
  }, [recurringItems, goals, debts, currentYear, currentMonth, language]);

  // Selected date events
  const selectedDateEvents = useMemo(() => {
    if (!selectedDateStr) return [];
    return dateEventsMap.get(selectedDateStr) || [];
  }, [selectedDateStr, dateEventsMap]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {t.calendarTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t.calendarSubtitle}
          </p>
        </div>

        {/* Month Selector Controls */}
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-xs self-start sm:self-auto">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-sm text-slate-900 min-w-[130px] text-center font-mono">
            {currentMonthName} {currentYear}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Legend Bar */}
      <div className="flex items-center gap-4 flex-wrap bg-white p-3.5 rounded-2xl border border-slate-200 text-xs">
        <span className="font-bold text-slate-500">Белгилар:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
          <span className="text-slate-700 font-medium">Такрорланувчи тўлов</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
          <span className="text-slate-700 font-medium">Жамғарма муддати</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
          <span className="text-slate-700 font-medium">Қарз муддати</span>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Weekdays header */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center py-3 text-xs font-bold text-slate-600">
          <span>Душанба</span>
          <span>Сешанба</span>
          <span>Чоршанба</span>
          <span>Пайшанба</span>
          <span>Жума</span>
          <span>Шанба</span>
          <span>Якшанба</span>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100">
          {calendarDays.map((cell, idx) => {
            const events = dateEventsMap.get(cell.dateStr) || [];
            const isToday = cell.dateStr === '2026-10-28';
            const isSelected = cell.dateStr === selectedDateStr;

            return (
              <div
                key={idx}
                onClick={() => setSelectedDateStr(cell.dateStr)}
                className={`min-h-[105px] p-2.5 flex flex-col justify-between transition-all cursor-pointer group ${
                  cell.isCurrentMonth ? 'bg-white hover:bg-slate-50/80' : 'bg-slate-50/50 text-slate-400'
                } ${isSelected ? 'ring-2 ring-emerald-500 bg-emerald-50/20' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold font-mono ${
                      isToday
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : cell.isCurrentMonth
                        ? 'text-slate-900 group-hover:bg-slate-200/60'
                        : 'text-slate-400'
                    }`}
                  >
                    {cell.dayNum}
                  </span>

                  {events.length > 0 && (
                    <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {events.length} та
                    </span>
                  )}
                </div>

                {/* Event badges preview */}
                <div className="space-y-1 mt-2 overflow-hidden">
                  {events.slice(0, 2).map((ev, eIdx) => {
                    const badgeColor =
                      ev.type === 'recurring'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : ev.type === 'goal'
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-rose-100 text-rose-900 border-rose-300';

                    return (
                      <div
                        key={eIdx}
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border truncate ${badgeColor}`}
                        title={ev.title}
                      >
                        {ev.title}
                      </div>
                    );
                  })}
                  {events.length > 2 && (
                    <span className="text-[9px] text-slate-400 font-bold block pl-0.5">
                      +{events.length - 2} яна...
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Date Detail Modal */}
      {selectedDateStr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden my-auto">
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-emerald-400 font-mono font-bold block">
                    Сана тафсилотлари
                  </span>
                  <h3 className="text-base font-bold tracking-tight">
                    {formatDateUz(selectedDateStr, language)}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedDateStr(null)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-3 max-h-[70vh] overflow-y-auto">
              {selectedDateEvents.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs space-y-1">
                  <CalendarIcon className="w-8 h-8 mx-auto text-slate-300" />
                  <p>Ushbu sanada rejalashtirilgan voqealar mavjud emas</p>
                </div>
              ) : (
                selectedDateEvents.map((ev, idx) => {
                  const isRecurring = ev.type === 'recurring';
                  const isGoal = ev.type === 'goal';
                  const isDebt = ev.type === 'debt';

                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                        isRecurring
                          ? 'bg-emerald-50/60 border-emerald-200'
                          : isGoal
                          ? 'bg-amber-50/60 border-amber-200'
                          : 'bg-rose-50/60 border-rose-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0 ${
                            isRecurring
                              ? 'bg-emerald-100 text-emerald-700'
                              : isGoal
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {isRecurring && <RefreshCw className="w-4 h-4" />}
                          {isGoal && <Target className="w-4 h-4" />}
                          {isDebt && <HandCoins className="w-4 h-4" />}
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                            {isRecurring && t.recurringPaymentEvent}
                            {isGoal && t.goalMilestoneEvent}
                            {isDebt && t.debtDueEvent}
                          </span>
                          <h4 className="font-bold text-slate-900 text-sm mt-0.5">
                            {ev.title}
                          </h4>
                          {ev.amount !== undefined && (
                            <span className="font-mono font-bold text-slate-800 text-xs block mt-0.5">
                              {formatMoney(ev.amount, currency, language, exchangeRate)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action button */}
                      {isRecurring && (
                        <button
                          onClick={() => {
                            payRecurringItem(ev.raw.id, selectedDateStr);
                            confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95"
                        >
                          Тўлаш
                        </button>
                      )}

                      {isGoal && (
                        <button
                          onClick={() => {
                            setSelectedDateStr(null);
                            setActiveTab('goals');
                          }}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95"
                        >
                          Жамғармага ўтиш
                        </button>
                      )}

                      {isDebt && (
                        <button
                          onClick={() => {
                            setSelectedDateStr(null);
                            setActiveTab('debts');
                          }}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95"
                        >
                          Қарзга ўтиш
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setSelectedDateStr(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                Ёпиш
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
