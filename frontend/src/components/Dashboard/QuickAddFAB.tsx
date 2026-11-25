import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Zap,
  MonitorPlay,
  Car,
  Briefcase,
  Home,
  Check,
  X,
  CreditCard,
} from 'lucide-react';
import { formatMoney, getRecurringStatus, CURRENT_DATE_STR } from '../../utils/formatters';

export const QuickAddFAB: React.FC = () => {
  const {
    recurringItems,
    payRecurringItem,
    currency,
    language,
    exchangeRate,
    categories,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);

  // Filter top 4 recurring items to show in quick add
  // 3 expenses (utilities, tech, etc) and 1 income if available
  const quickItems = React.useMemo(() => {
    const expenses = recurringItems
      .filter(item => item.type === 'expense' && item.isActive)
      .map(item => ({
        ...item,
        status: getRecurringStatus(item.dueDayOfMonth, item.lastPaidDate, CURRENT_DATE_STR)
      }))
      .sort((a, b) => {
        // Sort by alert first
        if (a.status.isAlert && !b.status.isAlert) return -1;
        if (!a.status.isAlert && b.status.isAlert) return 1;
        return 0;
      })
      .slice(0, 3);

    const income = recurringItems
      .filter(item => item.type === 'income' && item.isActive)
      .slice(0, 1);

    return [...expenses, ...income];
  }, [recurringItems]);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleQuickAdd = (id: string) => {
    payRecurringItem(id);
    setIsOpen(false);
  };

  const getIcon = (catId: string) => {
    switch (catId) {
      case 'exp_utilities': return <Zap className="w-5 h-5" />;
      case 'exp_tech': return <MonitorPlay className="w-5 h-5" />;
      case 'exp_transport': return <Car className="w-5 h-5" />;
      case 'inc_salary': return <Briefcase className="w-5 h-5" />;
      case 'inc_rent': return <Home className="w-5 h-5" />;
      default: return <CreditCard className="w-5 h-5" />;
    }
  };

  return (
    <div className="fixed bottom-24 right-6 sm:bottom-8 sm:right-8 z-40">
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMenu}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-30"
            />

            {/* Menu Items */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="absolute bottom-16 right-0 mb-4 w-72 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-40 space-y-3 transition-colors duration-300"
            >
              <div className="flex items-center justify-between px-2 mb-2">
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Тезкор тўлов</h4>
                <div className="h-1 w-8 bg-slate-200 dark:bg-slate-700 rounded-full" />
              </div>

              {quickItems.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-xs text-slate-400 font-medium">Такрорланувчи тўловлар мавжуд эмас</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {quickItems.map((item) => {
                    const status = getRecurringStatus(item.dueDayOfMonth, item.lastPaidDate, CURRENT_DATE_STR);
                    const category = categories.find(c => c.id === item.categoryId);
                    const isPaid = status.status === 'paid';

                    return (
                      <motion.button
                        key={item.id}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => !isPaid && handleQuickAdd(item.id)}
                        disabled={isPaid}
                        className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${
                          isPaid 
                            ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 opacity-60 grayscale' 
                            : item.type === 'income'
                              ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/50 hover:border-emerald-300 dark:hover:border-emerald-400/50'
                              : status.isAlert
                                ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/50 hover:border-rose-300 dark:hover:border-rose-400/50'
                                : 'bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div 
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm ${
                            isPaid ? 'bg-slate-300' : ''
                          }`}
                          style={!isPaid ? { backgroundColor: category?.color || '#94a3b8' } : {}}
                        >
                          {getIcon(item.categoryId)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h5 className="font-bold text-slate-900 dark:text-white text-[13px] truncate">
                              {item.title}
                            </h5>
                            {isPaid && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-black text-slate-900 dark:text-white font-mono">
                              {formatMoney(item.amount, currency, language, exchangeRate)}
                            </span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-lg border leading-none ${status.badgeColor}`}>
                              {language === 'uz_cyrl' ? status.labelCyrl : status.labelLatn}
                            </span>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 font-medium">
                  Тўлаш учун бир марта босинг
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleMenu}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl z-50 transition-all ${
          isOpen 
            ? 'bg-slate-900 text-white rotate-45' 
            : 'bg-emerald-600 text-white shadow-emerald-500/20'
        }`}
      >
        {isOpen ? <X className="w-7 h-7" /> : <Plus className="w-8 h-8" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
          </span>
        )}
      </motion.button>
    </div>
  );
};
