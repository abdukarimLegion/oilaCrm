import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { getT } from '../../constants/translations';
import {
  formatMoney,
  formatCompactMoney,
  formatDateUz,
  getRecurringStatus,
  CURRENT_DATE_STR,
} from '../../utils/formatters';
import { CategoryIcon } from '../Common/CategoryIcon';
import {
  Plus,
  Download,
  Search,
  Filter,
  Trash2,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  CheckCircle,
  Clock,
  Zap,
  X,
  Camera,
  Tag,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RecurringItem } from '../../types';
import { SmartReceiptScannerModal } from '../Common/SmartReceiptScannerModal';
import { BudgetCalendar } from './BudgetCalendar';

export const TransactionsView: React.FC = () => {
  const {
    transactions,
    categories,
    wallets,
    members,
    recurringItems,
    addRecurringItem,
    deleteRecurringItem,
    payRecurringItem,
    currency,
    language,
    exchangeRate,
    openAddTxModal,
    deleteTransaction,
    selectedTagFilter,
    setSelectedTagFilter,
    allTags,
  } = useApp();

  const t = getT(language);

  // Subtab switcher: 'ledger' | 'recurring' | 'calendar'
  const [subTab, setSubTab] = useState<'ledger' | 'recurring' | 'calendar'>('ledger');

  // Smart Receipt Scanner modal state
  const [isReceiptScannerOpen, setIsReceiptScannerOpen] = useState(false);

  // Ledger Filters
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMember, setSelectedMember] = useState<string>('all');
  const [selectedWallet, setSelectedWallet] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Add Recurring Item Modal state
  const [isAddRecurringOpen, setIsAddRecurringOpen] = useState(false);
  const [recTitle, setRecTitle] = useState('');
  const [recAmount, setRecAmount] = useState<number | ''>('');
  const [recType, setRecType] = useState<'expense' | 'income'>('expense');
  const [recDay, setRecDay] = useState<number>(10);
  const [recCategoryId, setRecCategoryId] = useState<string>(categories[5]?.id || '');
  const [recWalletId, setRecWalletId] = useState<string>(wallets[0]?.id || '');
  const [recNotes, setRecNotes] = useState('');
  const [recAutoPost, setRecAutoPost] = useState<boolean>(true);
  const [recFrequency, setRecFrequency] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  const getCategory = (id: string) => categories.find(c => c.id === id);
  const getWallet = (id: string) => wallets.find(w => w.id === id);
  const getMember = (id: string) => members.find(m => m.id === id);

  // Filtered transactions
  const filteredTxs = useMemo(() => {
    return transactions
      .filter(tx => {
        if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
        if (selectedCategory !== 'all' && tx.categoryId !== selectedCategory) return false;
        if (selectedMember !== 'all' && tx.memberId !== selectedMember) return false;
        if (selectedWallet !== 'all' && tx.walletId !== selectedWallet) return false;
        if (selectedTagFilter) {
          if (!tx.tags || !tx.tags.some(t => t.toLowerCase() === selectedTagFilter.toLowerCase())) {
            return false;
          }
        }
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const cat = getCategory(tx.categoryId);
          const catName = language === 'uz_cyrl' ? cat?.name_cyrl : cat?.name_latn;
          const matchNote = tx.note.toLowerCase().includes(q);
          const matchCat = catName?.toLowerCase().includes(q);
          const matchAmount = tx.amount.toString().includes(q);
          const matchTag = tx.tags?.some(t => t.toLowerCase().includes(q));
          if (!matchNote && !matchCat && !matchAmount && !matchTag) return false;
        }
        return true;
      })
      .sort((a, b) => (b.date > a.date ? 1 : -1));
  }, [
    transactions,
    typeFilter,
    selectedCategory,
    selectedMember,
    selectedWallet,
    selectedTagFilter,
    searchQuery,
    categories,
    language,
  ]);

  // Totals for filtered transactions (Separate UZS and USD)
  const totalFilteredIncomeUZS = filteredTxs
    .filter(t => t.type === 'income' && (!t.currency || t.currency === 'UZS'))
    .reduce((sum, t) => sum + t.amount, 0);

  const totalFilteredIncomeUSD = filteredTxs
    .filter(t => t.type === 'income' && t.currency === 'USD')
    .reduce((sum, t) => sum + (t.originalAmount || Math.round(t.amount / exchangeRate)), 0);

  const totalFilteredExpenseUZS = filteredTxs
    .filter(t => t.type === 'expense' && (!t.currency || t.currency === 'UZS'))
    .reduce((sum, t) => sum + t.amount, 0);

  const totalFilteredExpenseUSD = filteredTxs
    .filter(t => t.type === 'expense' && t.currency === 'USD')
    .reduce((sum, t) => sum + (t.originalAmount || Math.round(t.amount / exchangeRate)), 0);

  // Totals for recurring items
  const monthlyRecurringExpense = recurringItems
    .filter(r => r.isActive && r.type === 'expense')
    .reduce((sum, r) => sum + r.amount, 0);

  const monthlyRecurringIncome = recurringItems
    .filter(r => r.isActive && r.type === 'income')
    .reduce((sum, r) => sum + r.amount, 0);

  // CSV Export
  const exportToCSV = () => {
    const headers = ['ID', 'Sana', 'Tur', 'Kategoriya', 'Summa', 'Hamyon', 'Oila azosi', 'Izoh'];
    const rows = filteredTxs.map(tx => {
      const cat = getCategory(tx.categoryId);
      const wal = getWallet(tx.walletId);
      const mem = getMember(tx.memberId);
      return [
        tx.id,
        tx.date,
        tx.type,
        `"${cat?.name_cyrl || ''}"`,
        tx.amount,
        `"${wal?.name_cyrl || ''}"`,
        `"${mem?.name_cyrl || ''}"`,
        `"${(tx.note || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `oilaviy_byudjet_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateRecurring = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recTitle.trim() || !recAmount || Number(recAmount) <= 0) return;

    addRecurringItem({
      title: recTitle.trim(),
      amount: Number(recAmount),
      type: recType,
      frequency: recFrequency,
      dueDayOfMonth: Number(recDay) || 1,
      categoryId: recCategoryId || categories[0]?.id || '',
      walletId: recWalletId || wallets[0]?.id || '',
      memberId: members[0]?.id || 'm_father',
      autoPost: recAutoPost,
      isActive: true,
      notes: recNotes.trim(),
    });

    setIsAddRecurringOpen(false);
    setRecTitle('');
    setRecAmount('');
    setRecNotes('');
    setRecAutoPost(true);
    setRecFrequency('monthly');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Subtab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {subTab === 'ledger' ? 'Амалиётлар тарихи' : subTab === 'recurring' ? 'Такрорланувчи тўловлар ва Обуналар' : 'Бюджет Календари'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {subTab === 'ledger'
              ? 'Барча кирим ва чиқимларнинг ҳисоб қайдномаси'
              : subTab === 'recurring'
              ? 'Ҳар ойлик мунтазам харажатлар, коммунал тўловлар ва уларнинг муддатлари'
              : 'Ойлик режалаштирилган тўловлар ва қарзларни календар кўринишида кузатинг'}
          </p>
        </div>

        {/* Primary Subtab Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setSubTab('ledger')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                subTab === 'ledger'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Амалиётлар
            </button>
            <button
              onClick={() => setSubTab('recurring')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                subTab === 'recurring'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Такрорланувчи</span>
              <span className="sm:hidden">Обуналар</span>
            </button>
            <button
              onClick={() => setSubTab('calendar')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                subTab === 'calendar'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-rose-600" />
              <span>Календарь</span>
            </button>
          </div>

          {subTab === 'ledger' ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsReceiptScannerOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-800 bg-emerald-100/80 hover:bg-emerald-200/80 active:scale-95 border border-emerald-300/80 rounded-xl shadow-xs transition-all whitespace-nowrap shrink-0"
                title="Чек расмини юклаш ва AI орқали ўқиш"
              >
                <Camera className="w-4 h-4 text-emerald-700" />
                <span className="hidden sm:inline"> Чек Сканери</span>
              </button>
              <button
                onClick={openAddTxModal}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-xs transition-all whitespace-nowrap shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>{t.quickAdd}</span>
              </button>
            </div>
          ) : subTab === 'recurring' ? (
            <button
              onClick={() => setIsAddRecurringOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-xs transition-all whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Янги тўлов</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* View 1: Recurring Items Manager */}
      {subTab === 'recurring' && (
        <div className="space-y-6">
          {/* Recurring Top KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">
                Ойлик доимий харажатлар
              </span>
              <div className="text-xl font-bold text-rose-600 font-mono tabular-nums mt-1">
                -{formatMoney(monthlyRecurringExpense, currency, language, exchangeRate)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Ҳар ойлик режалаштирилган чиқимлар
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">
                Ойлик кафолатланган даромад
              </span>
              <div className="text-xl font-bold text-emerald-600 font-mono tabular-nums mt-1">
                +{formatMoney(monthlyRecurringIncome, currency, language, exchangeRate)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Ойлик маош ва ижара тушумлари
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">
                Шошилинч муддатлар
              </span>
              <div className="text-xl font-bold text-amber-600 font-mono tabular-nums mt-1">
                {recurringItems.filter(r => r.isActive && getRecurringStatus(r.dueDayOfMonth, r.lastPaidDate, CURRENT_DATE_STR).isAlert).length} та тўлов
              </div>
              <div className="text-[11px] text-amber-700 mt-1 font-medium">
                Тўлаш муддати етган ёки яқин
              </div>
            </div>
          </div>

          {/* Recurring Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recurringItems.map(item => {
              const cat = getCategory(item.categoryId);
              const wal = getWallet(item.walletId);
              const dueInfo = getRecurringStatus(item.dueDayOfMonth, item.lastPaidDate, CURRENT_DATE_STR);
              const isExpense = item.type === 'expense';
              const isPaid = dueInfo.status === 'paid';

              return (
                <motion.div
                  key={item.id}
                  whileHover={{ y: -2 }}
                  className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-xs transition-all flex flex-col justify-between ${
                    dueInfo.status === 'overdue'
                      ? 'border-rose-300 ring-1 ring-rose-200'
                      : dueInfo.status === 'today'
                      ? 'border-amber-300 ring-1 ring-amber-200 bg-amber-50/10'
                      : 'border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                          style={{ backgroundColor: cat?.color || '#6366F1' }}
                        >
                          <CategoryIcon name={cat?.icon || 'Zap'} className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-bold text-slate-900 text-sm">
                              {item.title}
                            </h4>
                            {item.autoPost !== false && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 flex items-center gap-1">
                                <Zap className="w-3 h-3 text-indigo-600" />
                                <span>Авто-тўлов</span>
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-500">
                            {item.frequency === 'daily'
                              ? (language === 'uz_cyrl' ? 'Кундалик (Ҳар куни)' : 'Kundalik (Har kuni)')
                              : item.frequency === 'weekly'
                              ? (language === 'uz_cyrl' ? `Ҳафталик (${item.dueDayOfMonth}-куни)` : `Haftalik (${item.dueDayOfMonth}-kuni)`)
                              : (language === 'uz_cyrl' ? `Ҳар ойнинг ${item.dueDayOfMonth}-санаси` : `Har oyning ${item.dueDayOfMonth}-sanasi`)}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${dueInfo.badgeColor}`}
                      >
                        {language === 'uz_cyrl' ? dueInfo.labelCyrl : dueInfo.labelLatn}
                      </span>
                    </div>

                    <div className="my-3 flex items-center justify-between">
                      <div className="text-xs text-slate-500">
                        Манба: <strong className="text-slate-800 font-semibold">{language === 'uz_cyrl' ? wal?.name_cyrl : wal?.name_latn}</strong>
                      </div>
                      <div className="font-mono text-base font-bold tabular-nums">
                        <span className={isExpense ? 'text-rose-600' : 'text-emerald-600'}>
                          {isExpense ? '-' : '+'}{formatMoney(item.amount, currency, language, exchangeRate)}
                        </span>
                      </div>
                    </div>

                    {item.notes && (
                      <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg mb-3">
                        {item.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-[11px] text-slate-400">
                      {item.lastPaidDate
                        ? `Охирги тўлов: ${item.lastPaidDate} ${item.lastAutoPostedDate ? '(Авто)' : ''}`
                        : 'Ҳали тўланмаган'}
                    </span>

                    <div className="flex items-center gap-2">
                      {!isPaid && (
                        <button
                          onClick={() => payRecurringItem(item.id)}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-95 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Ҳозир тўлаш</span>
                        </button>
                      )}

                      <button
                        onClick={() => deleteRecurringItem(item.id)}
                        className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg transition-colors"
                        title="Ўчириш"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* View 2: Full Transaction History Ledger */}
      {subTab === 'ledger' && (
        <div className="space-y-5">
          {/* Filter and Search Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Type Segmented Buttons */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl shrink-0">
                <button
                  onClick={() => setTypeFilter('all')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    typeFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Барчаси ({transactions.length})
                </button>
                <button
                  onClick={() => setTypeFilter('income')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
                    typeFilter === 'income'
                      ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t.income}</span>
                </button>
                <button
                  onClick={() => setTypeFilter('expense')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
                    typeFilter === 'expense'
                      ? 'bg-white text-rose-700 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
                  <span>{t.expense}</span>
                </button>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <button
                onClick={exportToCSV}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-xs transition-colors self-end sm:self-auto"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
            </div>

            {/* Category / Wallet / Member filter row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Тоифа:
                </label>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="all">Барча тоифалар</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.type === 'income' ? '🟢' : '🔴'} {language === 'uz_cyrl' ? c.name_cyrl : c.name_latn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Ҳамён / Карта:
                </label>
                <select
                  value={selectedWallet}
                  onChange={e => setSelectedWallet(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="all">Барча ҳамёнлар</option>
                  {wallets.map(w => (
                    <option key={w.id} value={w.id}>
                      {language === 'uz_cyrl' ? w.name_cyrl : w.name_latn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Оила аъзоси:
                </label>
                <select
                  value={selectedMember}
                  onChange={e => setSelectedMember(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="all">Барча оила аъзолари</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>
                      {language === 'uz_cyrl' ? m.name_cyrl : m.name_latn}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tag Filter Chips Bar */}
            <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
                <Tag className="w-3.5 h-3.5 text-amber-500" />
                <span>Теглар:</span>
              </span>
              <button
                onClick={() => setSelectedTagFilter(null)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                  !selectedTagFilter
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Барчаси ({transactions.length})
              </button>
              {allTags.map(({ tag, count }) => {
                const isSelected = selectedTagFilter === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => setSelectedTagFilter(isSelected ? null : tag)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1 ${
                      isSelected
                        ? 'bg-amber-500 text-white border-amber-600 shadow-2xs font-bold'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50 hover:text-amber-900'
                    }`}
                  >
                    <span>{tag}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                        isSelected ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic summary with separate UZS & USD totals */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 gap-2">
              <span>
                Топилди: <strong className="text-slate-800">{filteredTxs.length}</strong> та амалиёт
              </span>
              <div className="flex items-center gap-4 flex-wrap">
                {/* Income Dual Currency Total */}
                <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80 text-emerald-800 font-mono font-bold">
                  <span>Даромад:</span>
                  <span className="text-emerald-700">+{totalFilteredIncomeUZS.toLocaleString('uz-UZ')} сўм</span>
                  {totalFilteredIncomeUSD > 0 && (
                    <span className="text-emerald-900 border-l border-emerald-300 pl-1.5">+${totalFilteredIncomeUSD.toLocaleString()} USD</span>
                  )}
                </div>

                {/* Expense Dual Currency Total */}
                <div className="flex items-center gap-1.5 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200/80 text-rose-800 font-mono font-bold">
                  <span>Харажат:</span>
                  <span className="text-rose-700">-{totalFilteredExpenseUZS.toLocaleString('uz-UZ')} сўм</span>
                  {totalFilteredExpenseUSD > 0 && (
                    <span className="text-rose-900 border-l border-rose-300 pl-1.5">-${totalFilteredExpenseUSD.toLocaleString()} USD</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Сана</th>
                    <th className="py-3 px-4">Тоифа</th>
                    <th className="py-3 px-4">Изоҳ</th>
                    <th className="py-3 px-4">Ҳамён</th>
                    <th className="py-3 px-4">Оила аъзоси</th>
                    <th className="py-3 px-4 text-right">Сумма</th>
                    <th className="py-3 px-4 text-center">Амал</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTxs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        Ҳеч қандай молиявий амалиёт топилмади
                      </td>
                    </tr>
                  ) : (
                    filteredTxs.map(tx => {
                      const cat = getCategory(tx.categoryId);
                      const wal = getWallet(tx.walletId);
                      const mem = getMember(tx.memberId);
                      const isIncome = tx.type === 'income';

                      return (
                        <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                            {tx.date}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-5 h-5 rounded flex items-center justify-center text-white shrink-0"
                                style={{ backgroundColor: cat?.color || '#94A3B8' }}
                              >
                                <CategoryIcon name={cat?.icon || 'MoreHorizontal'} className="w-3 h-3" />
                              </span>
                              <span className="font-semibold text-slate-900 whitespace-nowrap">
                                {language === 'uz_cyrl' ? cat?.name_cyrl : cat?.name_latn}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-700 max-w-xs">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {(tx.isRecurring || tx.note?.includes('Авто-тўлов') || tx.note?.includes('Такрорланувчи')) && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200/80 shrink-0">
                                  <Zap className="w-2.5 h-2.5 text-indigo-600" />
                                  <span>Авто-тўлов</span>
                                </span>
                              )}
                              <span>{tx.note || '—'}</span>
                            </div>
                            {tx.tags && tx.tags.length > 0 && (
                              <div className="flex items-center gap-1 flex-wrap mt-1">
                                {tx.tags.map(rawTag => {
                                  const tag = rawTag.startsWith('#') ? rawTag : `#${rawTag}`;
                                  const isSelected = selectedTagFilter === tag;
                                  return (
                                    <button
                                      key={tag}
                                      onClick={e => {
                                        e.stopPropagation();
                                        setSelectedTagFilter(isSelected ? null : tag);
                                      }}
                                      className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded transition-colors ${
                                        isSelected
                                          ? 'bg-amber-500 text-white'
                                          : 'bg-amber-50 text-amber-900 border border-amber-200/80 hover:bg-amber-100'
                                      }`}
                                    >
                                      {tag}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                            {language === 'uz_cyrl' ? wal?.name_cyrl : wal?.name_latn}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="text-slate-600">
                              {language === 'uz_cyrl' ? mem?.name_cyrl : mem?.name_latn}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold tabular-nums whitespace-nowrap">
                            <span className={isIncome ? 'text-emerald-600' : 'text-slate-900'}>
                              {isIncome ? '+' : '-'}
                              {formatMoney(tx.amount, currency, language, exchangeRate)}
                            </span>
                            {tx.currency && tx.currency !== 'UZS' && tx.originalAmount && (
                              <div className="text-[10px] text-[#547f69] font-bold mt-0.5">
                                ({tx.currency === 'USD' ? '$' : tx.currency === 'EUR' ? '€' : '₽'}{tx.originalAmount} {tx.currency})
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <button
                              onClick={() => deleteTransaction(tx.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                              title="Ўчириш"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {subTab === 'calendar' && (
        <BudgetCalendar />
      )}

      {/* Add Recurring Item Modal */}
      {isAddRecurringOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-indigo-600" />
                <span>Янги такрорланувчи тўлов / Обуна</span>
              </h3>
              <button
                onClick={() => setIsAddRecurringOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRecurring} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setRecType('expense')}
                  className={`py-1.5 text-xs font-semibold rounded-lg text-center ${
                    recType === 'expense' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Чиқим (Харажат)
                </button>
                <button
                  type="button"
                  onClick={() => setRecType('income')}
                  className={`py-1.5 text-xs font-semibold rounded-lg text-center ${
                    recType === 'income' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Кирим (Даромад)
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Такрорланиш даврийлиги (Частота)
                </label>
                <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setRecFrequency('daily')}
                    className={`py-1.5 text-xs font-semibold rounded-lg text-center ${
                      recFrequency === 'daily' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Кундалик
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecFrequency('weekly')}
                    className={`py-1.5 text-xs font-semibold rounded-lg text-center ${
                      recFrequency === 'weekly' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Ҳафталик
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecFrequency('monthly')}
                    className={`py-1.5 text-xs font-semibold rounded-lg text-center ${
                      recFrequency === 'monthly' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Ойлик
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Тўлов номи
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Масалан: Wi-Fi ва Интернет тўлови"
                  value={recTitle}
                  onChange={e => setRecTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Сумма ({currency === 'UZS' ? 'сўм' : '$'})
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="10000"
                    required
                    placeholder="250 000"
                    value={recAmount}
                    onChange={e => setRecAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full text-sm font-bold font-mono px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ҳар ойнинг куни (1-31)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={recDay}
                    onChange={e => setRecDay(Number(e.target.value))}
                    className="w-full text-sm font-bold font-mono px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Тоифа
                  </label>
                  <select
                    value={recCategoryId}
                    onChange={e => setRecCategoryId(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  >
                    {categories
                      .filter(c => c.type === recType)
                      .map(c => (
                        <option key={c.id} value={c.id}>
                          {language === 'uz_cyrl' ? c.name_cyrl : c.name_latn}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ҳамён / Карта
                  </label>
                  <select
                    value={recWalletId}
                    onChange={e => setRecWalletId(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  >
                    {wallets.map(w => (
                      <option key={w.id} value={w.id}>
                        {language === 'uz_cyrl' ? w.name_cyrl : w.name_latn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Изоҳ (ихтиёрий)
                </label>
                <input
                  type="text"
                  placeholder="Шартнома ёки провайдер номи"
                  value={recNotes}
                  onChange={e => setRecNotes(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Auto-Post Toggle Box */}
              <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100/90 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Журналга автоматик ёзиш (Авто-тўлов)</span>
                  </div>
                  <p className="text-[11px] text-indigo-700/90 leading-tight">
                    Тўлов куни келганда (ҳар ойнинг {recDay}-санасида) тизим автоматик равишда журналга чиқим/кирим деб қайд этади ва балансни янгилайди
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={recAutoPost}
                    onChange={e => setRecAutoPost(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddRecurringOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-xl"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-xs"
                >
                  Сақлаш ва Фаоллаштириш
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Smart Receipt Scanner Modal */}
      <SmartReceiptScannerModal
        isOpen={isReceiptScannerOpen}
        onClose={() => setIsReceiptScannerOpen(false)}
      />
    </div>
  );
};
