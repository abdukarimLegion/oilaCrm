import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatMoney,
  formatDateUz,
  CURRENT_DATE_STR,
} from '../../utils/formatters';
import {
  ChevronLeft,
  ChevronRight,
  Zap,
  HandCoins,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CategoryIcon } from '../Common/CategoryIcon';

export const BudgetCalendar: React.FC = () => {
  const {
    recurringItems,
    debts,
    categories,
    wallets,
    currency,
    language,
    exchangeRate,
    payRecurringItem,
    settleDebt,
  } = useApp();

  const [viewDate, setViewDate] = useState(() => {
    const [y, m, d] = CURRENT_DATE_STR.split('-').map(Number);
    return new Date(y, m - 1, d);
  });

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  const monthNamesCyrl = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];
  const monthNamesLatn = [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
    'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
  ];
  const weekDaysCyrl = ['Душ', 'Сеш', 'Чор', 'Пай', 'Жум', 'Шан', 'Якш'];
  const weekDaysLatn = ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yaksh'];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday
  
  // Adjust first day to start from Monday (1) instead of Sunday (0)
  const startingDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const calendarDays = useMemo(() => {
    const days = [];
    // Padding days from previous month
    for (let i = 0; i < startingDay; i++) {
      days.push({ day: null, month: currentMonth - 1, year: currentYear });
    }
    // Days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, month: currentMonth, year: currentYear });
    }
    return days;
  }, [currentYear, currentMonth, daysInMonth, startingDay]);

  const getItemsForDay = (day: number) => {
    const dayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const dayRecurrings = recurringItems.filter(item => {
      if (!item.isActive) return false;
      // Simple monthly recurring logic
      if (item.frequency === 'monthly' && item.dueDayOfMonth === day) return true;
      // Handle weekly/daily could be more complex, keeping it simple for now
      return false;
    });

    const dayDebts = debts.filter(debt => {
      if (debt.status === 'settled') return false;
      return debt.dueDate === dayStr;
    });

    return [...dayRecurrings.map(r => ({ ...r, calendarType: 'recurring' as const })), 
            ...dayDebts.map(d => ({ ...d, calendarType: 'debt' as const }))];
  };

  const nextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const prevMonth = () => {
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const [selectedDayItems, setSelectedDayItems] = useState<any[] | null>(null);
  const [selectedDayLabel, setSelectedDayLabel] = useState<string>('');

  const handleDayClick = (day: number) => {
    const items = getItemsForDay(day);
    if (items.length > 0) {
      setSelectedDayItems(items);
      setSelectedDayLabel(`${day}-${language === 'uz_cyrl' ? monthNamesCyrl[currentMonth] : monthNamesLatn[currentMonth]}, ${currentYear}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs overflow-hidden">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-extrabold text-[#1c211e] tracking-tight">
              {language === 'uz_cyrl' ? monthNamesCyrl[currentMonth] : monthNamesLatn[currentMonth]} {currentYear}
            </h3>
            <div className="flex items-center gap-1 bg-[#f3f0ea] p-1 rounded-xl">
              <button
                onClick={prevMonth}
                className="p-1.5 hover:bg-white hover:shadow-xs rounded-lg transition-all text-[#1c211e]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 hover:bg-white hover:shadow-xs rounded-lg transition-all text-[#1c211e]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
              <div className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>{language === 'uz_cyrl' ? 'Тўловлар' : 'To\'lovlar'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
              <div className="w-2 h-2 rounded-full bg-rose-500" />
              <span>{language === 'uz_cyrl' ? 'Қарзлар' : 'Qarzlar'}</span>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-2xl overflow-hidden">
          {/* Weekday Labels */}
          {(language === 'uz_cyrl' ? weekDaysCyrl : weekDaysLatn).map(day => (
            <div key={day} className="bg-slate-50 py-3 text-center text-[11px] font-black text-slate-400 uppercase tracking-widest">
              {day}
            </div>
          ))}

          {/* Day Cells */}
          {calendarDays.map((date, idx) => {
            if (date.day === null) {
              return <div key={`empty-${idx}`} className="bg-slate-50/50 min-h-[100px] sm:min-h-[120px]" />;
            }

            const items = getItemsForDay(date.day);
            const isToday = `${date.year}-${String(date.month + 1).padStart(2, '0')}-${String(date.day).padStart(2, '0')}` === CURRENT_DATE_STR;

            return (
              <div
                key={`${date.year}-${date.month}-${date.day}`}
                onClick={() => date.day && handleDayClick(date.day)}
                className={`bg-white min-h-[100px] sm:min-h-[120px] p-2 sm:p-3 transition-colors hover:bg-slate-50 cursor-pointer group relative ${
                  isToday ? 'bg-emerald-50/30' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-bold font-mono ${
                    isToday 
                      ? 'w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs' 
                      : 'text-slate-400 group-hover:text-[#1c211e]'
                  }`}>
                    {date.day}
                  </span>
                  {items.length > 0 && (
                    <span className="text-[10px] font-black text-slate-300">
                      {items.length}
                    </span>
                  )}
                </div>

                <div className="mt-2 space-y-1 overflow-hidden">
                  {items.slice(0, 3).map((item: any, i) => {
                    const isDebt = item.calendarType === 'debt';
                    const isIncome = item.type === 'income';
                    const color = isDebt ? 'bg-rose-500' : (isIncome ? 'bg-emerald-500' : 'bg-indigo-500');
                    
                    return (
                      <div
                        key={item.id + i}
                        className={`h-1.5 rounded-full ${color} opacity-80`}
                        title={item.title || item.personName}
                      />
                    );
                  })}
                  {items.length > 3 && (
                    <div className="text-[9px] font-bold text-slate-400 pl-1">
                      +{items.length - 3}
                    </div>
                  )}
                </div>
                
                {/* Labels for larger screens */}
                <div className="hidden sm:block mt-1 space-y-1">
                  {items.slice(0, 2).map((item: any, i) => (
                    <div
                      key={item.id + i + '-label'}
                      className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold truncate ${
                        item.calendarType === 'debt'
                          ? 'bg-rose-50 text-rose-700 border border-rose-100'
                          : item.type === 'income'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                      }`}
                    >
                      {item.title || item.personName}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Details Modal / Drawer for selected day */}
      <AnimatePresence>
        {selectedDayItems && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200"
            >
              <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-black text-[#1c211e]">
                    {selectedDayLabel}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    {selectedDayItems.length} та режалаштирилган ҳаракат
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDayItems(null)}
                  className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#1c211e] hover:shadow-xs transition-all"
                >
                  <ChevronRight className="w-5 h-5 rotate-90" />
                </button>
              </div>

              <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
                {selectedDayItems.map((item: any) => {
                  const isDebt = item.calendarType === 'debt';
                  const isRecurring = item.calendarType === 'recurring';
                  const isExpense = item.type === 'expense';
                  
                  return (
                    <div
                      key={item.id}
                      className="group bg-slate-50/50 rounded-2xl border border-slate-200 p-4 transition-all hover:bg-white hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm ${
                            isDebt ? 'bg-rose-500' : 'bg-indigo-500'
                          }`}>
                            {isDebt ? <HandCoins className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                          </div>
                          <div>
                            <h5 className="font-bold text-slate-900 text-sm">
                              {item.title || item.personName}
                            </h5>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                isDebt ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700'
                              }`}>
                                {isDebt ? (language === 'uz_cyrl' ? 'ҚАРЗ' : 'QARZ') : (language === 'uz_cyrl' ? 'ТУЛОВ' : 'TO\'LOV')}
                              </span>
                              {isRecurring && (
                                <span className="text-[10px] font-bold text-slate-400">
                                  {item.frequency === 'monthly' ? (language === 'uz_cyrl' ? 'Ойлик' : 'Oylik') : item.frequency}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-mono text-base font-black tabular-nums ${isExpense ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {isExpense ? '-' : '+'}{formatMoney(isDebt ? item.remainingAmount : item.amount, currency, language, exchangeRate)}
                          </div>
                          {isDebt && (
                            <div className="text-[10px] text-slate-400 font-bold mt-0.5 italic">
                              {language === 'uz_cyrl' ? 'Тўлиқ сумма: ' : 'Total: '} 
                              {formatMoney(item.totalAmount, currency, language, exchangeRate)}
                            </div>
                          )}
                        </div>
                      </div>

                      {item.notes && (
                        <p className="mt-3 text-xs text-slate-500 leading-relaxed bg-white/80 p-2 rounded-xl border border-slate-100 italic">
                          "{item.notes}"
                        </p>
                      )}

                      <div className="mt-4 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                        {isRecurring && (
                          <button
                            onClick={() => {
                              payRecurringItem(item.id);
                              setSelectedDayItems(null);
                            }}
                            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#1c211e] hover:bg-emerald-700 rounded-xl transition-all shadow-sm active:scale-95"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{language === 'uz_cyrl' ? 'Тўланди' : 'To\'landi'}</span>
                          </button>
                        )}
                        {isDebt && (
                          <button
                            onClick={() => {
                              settleDebt(item.id);
                              setSelectedDayItems(null);
                            }}
                            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-sm active:scale-95"
                          >
                            <HandCoins className="w-3.5 h-3.5" />
                            <span>{language === 'uz_cyrl' ? 'Ёпиш' : 'Yopish'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
