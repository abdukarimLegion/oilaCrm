import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatMoney,
  formatCompactMoney,
  formatDateUz,
} from '../../utils/formatters';
import {
  X,
  TrendingDown,
  TrendingUp,
  PiggyBank,
  ShieldCheck,
  CreditCard,
  Users,
  Calendar,
  Zap,
  ArrowRight,
  PieChart,
  CheckCircle,
} from 'lucide-react';
import { CategoryIcon } from '../Common/CategoryIcon';
import { motion, AnimatePresence } from 'motion/react';

interface KpiDetailModalProps {
  type: 'expense' | 'income' | 'savings' | 'networth' | null;
  onClose: () => void;
}

export const KpiDetailModal: React.FC<KpiDetailModalProps> = ({ type, onClose }) => {
  const {
    transactions,
    categories,
    wallets,
    members,
    goals,
    debts,
    currency,
    language,
    exchangeRate,
    setActiveTab,
  } = useApp();

  if (!type) return null;

  // Filter October 2026 / current period transactions
  const monthExpenses = transactions.filter(t => t.type === 'expense');
  const monthIncomes = transactions.filter(t => t.type === 'income');

  const totalExpense = monthExpenses.reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = monthIncomes.reduce((sum, t) => sum + t.amount, 0);

  const expenseUZS = monthExpenses.filter(t => !t.currency || t.currency === 'UZS').reduce((sum, t) => sum + (t.originalAmount || t.amount), 0);
  const expenseUSD = monthExpenses.filter(t => t.currency === 'USD').reduce((sum, t) => sum + (t.originalAmount || t.amount), 0);

  const incomeUZS = monthIncomes.filter(t => !t.currency || t.currency === 'UZS').reduce((sum, t) => sum + (t.originalAmount || t.amount), 0);
  const incomeUSD = monthIncomes.filter(t => t.currency === 'USD').reduce((sum, t) => sum + (t.originalAmount || t.amount), 0);

  const totalWallets = wallets.reduce((sum, w) => sum + w.balance, 0);
  const totalGoalsSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTheyOwe = debts
    .filter(d => d.type === 'they_owe' && d.status !== 'settled')
    .reduce((sum, d) => sum + d.remainingAmount, 0);
  const totalIOwe = debts
    .filter(d => d.type === 'i_owe' && d.status !== 'settled')
    .reduce((sum, d) => sum + d.remainingAmount, 0);

  const netWorth = totalWallets + totalGoalsSaved + totalTheyOwe - totalIOwe;

  const getCategory = (id: string) => categories.find(c => c.id === id);
  const getWallet = (id: string) => wallets.find(w => w.id === id);
  const getMember = (id: string) => members.find(m => m.id === id);

  // Group Expenses by Category
  const expenseByCategory = categories
    .filter(c => c.type === 'expense')
    .map(c => {
      const sum = monthExpenses
        .filter(t => t.categoryId === c.id)
        .reduce((a, b) => a + b.amount, 0);
      const percent = totalExpense > 0 ? Math.round((sum / totalExpense) * 100) : 0;
      return { category: c, sum, percent };
    })
    .filter(item => item.sum > 0)
    .sort((a, b) => b.sum - a.sum);

  // Group Income by Category
  const incomeByCategory = categories
    .filter(c => c.type === 'income')
    .map(c => {
      const sum = monthIncomes
        .filter(t => t.categoryId === c.id)
        .reduce((a, b) => a + b.amount, 0);
      const percent = totalIncome > 0 ? Math.round((sum / totalIncome) * 100) : 0;
      return { category: c, sum, percent };
    })
    .filter(item => item.sum > 0)
    .sort((a, b) => b.sum - a.sum);

  // Group Expenses by Wallet
  const expenseByWallet = wallets.map(w => {
    const sum = monthExpenses
      .filter(t => t.walletId === w.id)
      .reduce((a, b) => a + b.amount, 0);
    const percent = totalExpense > 0 ? Math.round((sum / totalExpense) * 100) : 0;
    return { wallet: w, sum, percent };
  }).filter(item => item.sum > 0);

  // Group Income by Wallet
  const incomeByWallet = wallets.map(w => {
    const sum = monthIncomes
      .filter(t => t.walletId === w.id)
      .reduce((a, b) => a + b.amount, 0);
    const percent = totalIncome > 0 ? Math.round((sum / totalIncome) * 100) : 0;
    return { wallet: w, sum, percent };
  }).filter(item => item.sum > 0);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-auto"
        >
          {/* Header depending on type */}
          <div
            className={`p-5 text-white flex items-center justify-between ${
              type === 'expense'
                ? 'bg-gradient-to-r from-rose-900 via-slate-900 to-rose-950'
                : type === 'income'
                ? 'bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950'
                : type === 'savings'
                ? 'bg-gradient-to-r from-amber-900 via-slate-900 to-amber-950'
                : 'bg-gradient-to-r from-teal-900 via-slate-900 to-emerald-950'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center text-white">
                {type === 'expense' && <TrendingDown className="w-5 h-5 text-rose-300" />}
                {type === 'income' && <TrendingUp className="w-5 h-5 text-emerald-300" />}
                {type === 'savings' && <PiggyBank className="w-5 h-5 text-amber-300" />}
                {type === 'networth' && <ShieldCheck className="w-5 h-5 text-teal-300" />}
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-300 block">
                  Толиқ таҳлил ва статистика
                </span>
                <h3 className="text-base sm:text-lg font-bold">
                  {type === 'expense' && 'Ойлик харажатларнинг батафсил ҳисоботи'}
                  {type === 'income' && 'Ойлик даромадларнинг батафсил манбалари'}
                  {type === 'savings' && 'Жамғармалар ва капитал ажратмалари'}
                  {type === 'networth' && 'Соф капитал (Net Worth) структураси'}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-5 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* TYPE 1: EXPENSE DETAIL */}
            {type === 'expense' && (
              <div className="space-y-6">
                {/* Dual Currency Top KPI Box */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-rose-50 border border-rose-200/80 p-4 rounded-2xl">
                    <span className="text-xs font-semibold text-rose-800 uppercase block">
                      Харажатлар (сўмда):
                    </span>
                    <div className="text-xl font-black text-rose-950 font-mono tabular-nums mt-1">
                      {formatMoney(expenseUZS, 'UZS', language, exchangeRate)}
                    </div>
                  </div>

                  <div className="bg-rose-50 border border-rose-200/80 p-4 rounded-2xl">
                    <span className="text-xs font-semibold text-rose-800 uppercase block">
                      Харажатлар (Долларда $):
                    </span>
                    <div className="text-xl font-black text-rose-950 font-mono tabular-nums mt-1">
                      ${expenseUSD.toLocaleString()} USD
                    </div>
                  </div>
                </div>

                {/* Category Breakdown */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <PieChart className="w-4 h-4 text-rose-600" />
                    <span>Тоифалар бўйича тақсимот:</span>
                  </h4>
                  <div className="space-y-2.5">
                    {expenseByCategory.map(({ category, sum, percent }) => (
                      <div key={category.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-5 h-5 rounded flex items-center justify-center text-white shrink-0"
                              style={{ backgroundColor: category.color }}
                            >
                              <CategoryIcon name={category.icon} className="w-3 h-3" />
                            </span>
                            <span className="text-slate-900">
                              {language === 'uz_cyrl' ? category.name_cyrl : category.name_latn}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 font-mono">
                            <span className="text-slate-900 font-bold">
                              {formatMoney(sum, currency, language, exchangeRate)}
                            </span>
                            <span className="text-rose-600 bg-rose-100 text-[10px] px-1.5 py-0.2 rounded font-bold">
                              {percent}%
                            </span>
                          </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${percent}%`, backgroundColor: category.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Expense by Wallet */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-rose-600" />
                    <span>Тўланган манбалар (Ҳамён/Карталар):</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {expenseByWallet.map(({ wallet, sum, percent }) => (
                      <div key={wallet.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-xs font-bold text-slate-800 block">
                          {language === 'uz_cyrl' ? wallet.name_cyrl : wallet.name_latn}
                        </span>
                        <div className="text-sm font-bold text-slate-900 font-mono mt-1">
                          {formatMoney(sum, currency, language, exchangeRate)}
                        </div>
                        <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                          Харажатнинг {percent}% и
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TYPE 2: INCOME DETAIL */}
            {type === 'income' && (
              <div className="space-y-6">
                {/* Dual Currency Top KPI Box */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-emerald-50 border border-emerald-200/80 p-4 rounded-2xl">
                    <span className="text-xs font-semibold text-emerald-800 uppercase block">
                      Даромадлар (сўмда):
                    </span>
                    <div className="text-xl font-black text-emerald-950 font-mono tabular-nums mt-1">
                      {formatMoney(incomeUZS, 'UZS', language, exchangeRate)}
                    </div>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200/80 p-4 rounded-2xl">
                    <span className="text-xs font-semibold text-emerald-800 uppercase block">
                      Даромадлар (Долларда $):
                    </span>
                    <div className="text-xl font-black text-emerald-950 font-mono tabular-nums mt-1">
                      ${incomeUSD.toLocaleString()} USD
                    </div>
                  </div>
                </div>

                {/* Category Breakdown */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <PieChart className="w-4 h-4 text-emerald-600" />
                    <span>Даромад манбалари бўйича тақсимот:</span>
                  </h4>
                  <div className="space-y-2.5">
                    {incomeByCategory.map(({ category, sum, percent }) => (
                      <div key={category.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-5 h-5 rounded flex items-center justify-center text-white shrink-0"
                              style={{ backgroundColor: category.color }}
                            >
                              <CategoryIcon name={category.icon} className="w-3 h-3" />
                            </span>
                            <span className="text-slate-900">
                              {language === 'uz_cyrl' ? category.name_cyrl : category.name_latn}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 font-mono">
                            <span className="text-emerald-700 font-bold">
                              +{formatMoney(sum, currency, language, exchangeRate)}
                            </span>
                            <span className="text-emerald-800 bg-emerald-100 text-[10px] px-1.5 py-0.2 rounded font-bold">
                              {percent}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500 bg-emerald-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Income by Receiving Wallet */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    <span>Қабул қилувчи ҳамёнлар:</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {incomeByWallet.map(({ wallet, sum, percent }) => (
                      <div key={wallet.id} className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200/80">
                        <span className="text-xs font-bold text-slate-800 block">
                          {language === 'uz_cyrl' ? wallet.name_cyrl : wallet.name_latn}
                        </span>
                        <div className="text-sm font-bold text-emerald-900 font-mono mt-1">
                          +{formatMoney(sum, currency, language, exchangeRate)}
                        </div>
                        <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                          Даромаднинг {percent}% и
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TYPE 3: SAVINGS DETAIL */}
            {type === 'savings' && (
              <div className="space-y-6">
                {/* Total Top KPI Box */}
                <div className="bg-amber-50 border border-amber-200/80 p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-amber-800 uppercase block">
                      Жамғармалардаги умумий маблағ
                    </span>
                    <div className="text-2xl font-black text-amber-950 font-mono tabular-nums mt-1">
                      {formatMoney(totalGoalsSaved, currency, language, exchangeRate)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-amber-800 block">Фаол мақсадлар</span>
                    <span className="text-lg font-bold text-amber-900 font-mono">
                      {goals.length} та
                    </span>
                  </div>
                </div>

                {/* Individual Goals List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <PiggyBank className="w-4 h-4 text-amber-600" />
                    <span>Жамғарма мақсадлари кўрсаткичлари:</span>
                  </h4>

                  {goals.map(goal => {
                    const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                    return (
                      <div key={goal.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
                              style={{ backgroundColor: goal.color }}
                            >
                              <CategoryIcon name={goal.icon} className="w-4 h-4" />
                            </span>
                            <div>
                              <span className="text-xs font-bold text-slate-900 block">
                                {language === 'uz_cyrl' ? goal.title_cyrl : goal.title_latn}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                Ойлик ажратма: {formatMoney(goal.monthlyContribution, currency, language, exchangeRate)}
                              </span>
                            </div>
                          </div>

                          <div className="text-right font-mono">
                            <div className="text-xs font-bold text-slate-900">
                              {formatMoney(goal.currentAmount, currency, language, exchangeRate)}
                            </div>
                            <span className="text-[10px] text-amber-700 font-bold bg-amber-100 px-1.5 py-0.2 rounded">
                              {percent}%
                            </span>
                          </div>
                        </div>

                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${percent}%`, backgroundColor: goal.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => {
                    onClose();
                    setActiveTab('goals');
                  }}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
                >
                  <span>Жамғармалар Ойнасига Ўтиш ва Симуляция Қилиш</span>
                  <ArrowRight className="w-4 h-4 text-emerald-400" />
                </button>
              </div>
            )}

            {/* TYPE 4: NET WORTH DETAIL */}
            {type === 'networth' && (
              <div className="space-y-6">
                {/* Net Worth Equation Box */}
                <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white p-5 rounded-2xl border border-emerald-800/60 shadow-md">
                  <span className="text-[10px] font-mono text-emerald-300 uppercase tracking-widest block mb-1">
                    Соф капитал формуласи
                  </span>
                  <div className="text-3xl font-black font-mono text-emerald-300 tabular-nums">
                    {formatMoney(netWorth, currency, language, exchangeRate)}
                  </div>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    Соф капитал = (Ҳамёнлар қолдиғи + Жамғармалар + Қайтариладиган қарзлар) - (Мендаги қарз мажбуриятлари)
                  </p>
                </div>

                {/* Net Worth Structure Breakdown */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    <span>Актив ва Пассивлар тақсимоти:</span>
                  </h4>

                  {/* Asset 1: Wallets */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">💳 Ҳамёнлар ва Карталардаги қолдиқ</span>
                      <span className="text-[10px] text-slate-500">{wallets.length} та фаол ҳисобварақ</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-700 text-sm">
                      +{formatMoney(totalWallets, currency, language, exchangeRate)}
                    </span>
                  </div>

                  {/* Asset 2: Goals */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">💰 Жамғармалар ва Мақсадлар</span>
                      <span className="text-[10px] text-slate-500">{goals.length} та жамғарма фонди</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-700 text-sm">
                      +{formatMoney(totalGoalsSaved, currency, language, exchangeRate)}
                    </span>
                  </div>

                  {/* Asset 3: Receivables */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">🤝 Мендан қарздорлар (Ундириладиган)</span>
                      <span className="text-[10px] text-slate-500">Олинадиган қарз маблағлари</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-700 text-sm">
                      +{formatMoney(totalTheyOwe, currency, language, exchangeRate)}
                    </span>
                  </div>

                  {/* Liability: My Debts */}
                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-rose-950 block">⚠️ Мен қарздорман (Мажбурият)</span>
                      <span className="text-[10px] text-rose-700">Тўланиши керак бўлган қарзлар</span>
                    </div>
                    <span className="font-mono font-bold text-rose-700 text-sm">
                      -{formatMoney(totalIOwe, currency, language, exchangeRate)}
                    </span>
                  </div>
                </div>

                {/* Health Score */}
                <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div className="text-xs text-emerald-950">
                    <strong className="block font-bold">Молиявий барқарорлик даражаси: Юқори</strong>
                    Активларингиз пассив қарз мажбуриятларингиздан <strong>{(totalWallets + totalGoalsSaved + totalTheyOwe) > 0 ? Math.round((netWorth / (totalWallets + totalGoalsSaved + totalTheyOwe)) * 100) : 100}%</strong> кўпроқ.
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
