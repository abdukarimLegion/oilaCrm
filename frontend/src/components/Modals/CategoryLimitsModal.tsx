import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getT } from '../../constants/translations';
import { formatMoney } from '../../utils/formatters';
import {
  X,
  Sliders,
  Check,
  Calendar,
  Clock,
  Sparkles,
  PieChart,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { CategoryIcon } from '../Common/CategoryIcon';

interface CategoryLimitsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CategoryLimitsModal: React.FC<CategoryLimitsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    categories,
    updateCategoryBudgets,
    currency,
    language,
    exchangeRate,
  } = useApp();

  const t = getT(language);

  // Expense categories
  const expenseCategories = categories.filter(c => c.type === 'expense');

  // Selected category state for inline editing
  const [selectedCatId, setSelectedCatId] = useState<string>(expenseCategories[0]?.id || '');
  const selectedCat = categories.find(c => c.id === selectedCatId) || expenseCategories[0];

  const [dailyInput, setDailyInput] = useState<number>(selectedCat?.dailyBudget || 250000);
  const [weeklyInput, setWeeklyInput] = useState<number>(selectedCat?.weeklyBudget || 1100000);
  const [monthlyInput, setMonthlyInput] = useState<number>(selectedCat?.monthlyBudget || 4500000);

  // When switching selected category, populate state
  const handleSelectCategory = (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    if (cat) {
      setSelectedCatId(catId);
      setDailyInput(cat.dailyBudget || (cat.monthlyBudget ? Math.round(cat.monthlyBudget / 30) : 250000));
      setWeeklyInput(cat.weeklyBudget || (cat.monthlyBudget ? Math.round(cat.monthlyBudget / 4) : 1100000));
      setMonthlyInput(cat.monthlyBudget || 4500000);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCat) return;

    updateCategoryBudgets(
      selectedCat.id,
      Number(dailyInput),
      Number(weeklyInput),
      Number(monthlyInput)
    );

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-auto"
        >
          {/* Header */}
          <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg tracking-tight">
                  {language === 'uz_cyrl' ? 'Тоифалар бўйича Бюджет Лимитлари' : 'Toifalar bo\'yicha Byudjet Limitlari'}
                </h3>
                <p className="text-xs text-slate-300">
                  {language === 'uz_cyrl' ? 'Ҳар бир тоифа учун Кунлик, Ҳафталик ва Ойлик лимитларни ўрнатинг' : 'Har bir toifa uchun Kunlik, Haftalik va Oylik limitlarni o\'rnating'}
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

          <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Category Selector Cards Horizontal Bar */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Таҳрирланадиган харажат тоифасини танланг:
              </label>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                {expenseCategories.map(cat => {
                  const isSelected = cat.id === selectedCatId;
                  const catName = language === 'uz_cyrl' ? cat.name_cyrl : cat.name_latn;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleSelectCategory(cat.id)}
                      className={`p-2.5 rounded-2xl border text-xs font-bold flex items-center gap-2 shrink-0 transition-all ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-emerald-500'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span
                        className="w-5 h-5 rounded-lg flex items-center justify-center text-white shrink-0 text-xs"
                        style={{ backgroundColor: cat.color }}
                      >
                        <CategoryIcon name={cat.icon} className="w-3 h-3" />
                      </span>
                      <span className="whitespace-nowrap">{catName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Category Limits Form */}
            {selectedCat && (
              <form onSubmit={handleSave} className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                    style={{ backgroundColor: selectedCat.color }}
                  >
                    <CategoryIcon name={selectedCat.icon} className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base">
                      {language === 'uz_cyrl' ? selectedCat.name_cyrl : selectedCat.name_latn}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Ушбу тоифа учун кунлик ва ҳафталик ортиқча сарфланмаларда огоҳлантириш юборилади
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Daily Budget Limit */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Кунлик Лимит (сўм)</span>
                    </label>
                    <input
                      type="number"
                      min="10000"
                      step="50000"
                      required
                      value={dailyInput}
                      onChange={e => setDailyInput(Number(e.target.value))}
                      className="w-full text-base font-bold font-mono px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="text-[10px] text-slate-400 block">
                      Кунига {formatMoney(dailyInput, currency, language, exchangeRate)} дан ошса сигнал беради
                    </span>
                  </div>

                  {/* Weekly Budget Limit */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      <span>Ҳафталик Лимит (сўм)</span>
                    </label>
                    <input
                      type="number"
                      min="50000"
                      step="100000"
                      required
                      value={weeklyInput}
                      onChange={e => setWeeklyInput(Number(e.target.value))}
                      className="w-full text-base font-bold font-mono px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="text-[10px] text-slate-400 block">
                      Ҳафтасига {formatMoney(weeklyInput, currency, language, exchangeRate)}
                    </span>
                  </div>

                  {/* Monthly Budget Limit */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <PieChart className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Ойлик Лимит (сўм)</span>
                    </label>
                    <input
                      type="number"
                      min="100000"
                      step="500000"
                      required
                      value={monthlyInput}
                      onChange={e => setMonthlyInput(Number(e.target.value))}
                      className="w-full text-base font-bold font-mono px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="text-[10px] text-slate-400 block">
                      Ойига {formatMoney(monthlyInput, currency, language, exchangeRate)}
                    </span>
                  </div>
                </div>

                {/* Submit button */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Ушбу Тоифа Лимитини Сақлаш</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
