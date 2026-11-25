import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getT } from '../../constants/translations';
import { CURRENT_DATE_STR, formatMoney } from '../../utils/formatters';
import { CategoryIcon } from '../Common/CategoryIcon';
import { X, ArrowDownLeft, ArrowUpRight, Camera } from 'lucide-react';
import { TransactionType, Currency } from '../../types';

export const AddTransactionModal: React.FC = () => {
  const {
    isAddTxModalOpen,
    closeAddTxModal,
    openReceiptScanner,
    addTransaction,
    categories,
    wallets,
    members,
    currency,
    language,
    exchangeRate,
  } = useApp();

  const t = getT(language);

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<number | ''>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [walletId, setWalletId] = useState<string>(wallets[0]?.id || '');
  const [memberId, setMemberId] = useState<string>(members[0]?.id || '');
  const [date, setDate] = useState<string>(CURRENT_DATE_STR);
  const [note, setNote] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState<string>('');

  const PRESET_TAGS = ['#urgent', '#shopping', '#gift', '#family', '#groceries', '#fuel', '#bills', '#work', '#health'];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (!customTagInput.trim()) return;
    const tag = customTagInput.trim().startsWith('#') ? customTagInput.trim() : `#${customTagInput.trim()}`;
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
    setCustomTagInput('');
  };

  const { liveRates } = useApp();
  const [entryCurrency, setEntryCurrency] = useState<Currency>('UZS');

  if (!isAddTxModalOpen) return null;

  const relevantCategories = categories.filter(c => c.type === type);
  const activeCategoryId = categoryId || relevantCategories[0]?.id || '';

  // Calculate base UZS amount from entered currency
  const getBaseAmountUZS = (amt: number, curr: Currency): number => {
    if (curr === 'USD') return Math.round(amt * (liveRates.USD || 12850));
    return amt;
  };

  const calculatedBaseUZS = amount ? getBaseAmountUZS(Number(amount), entryCurrency) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    const baseAmount = getBaseAmountUZS(Number(amount), entryCurrency);

    addTransaction({
      amount: baseAmount,
      type,
      categoryId: activeCategoryId,
      walletId: walletId || wallets[0]?.id,
      memberId: memberId || members[0]?.id,
      date: date || CURRENT_DATE_STR,
      note: note.trim(),
      currency: entryCurrency,
      originalAmount: Number(amount),
      tags: selectedTags,
    });

    closeAddTxModal();
    setAmount('');
    setNote('');
    setSelectedTags([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">
            {t.quickAdd}
          </h3>
          <button
            onClick={closeAddTxModal}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Smart Receipt Scanner Quick Callout */}
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/80 flex items-center justify-between gap-2">
            <div className="text-xs text-emerald-950 font-medium flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Чек расми борми? AI орқали ўқиш</span>
            </div>
            <button
              type="button"
              onClick={() => {
                closeAddTxModal();
                openReceiptScanner();
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-all shadow-xs whitespace-nowrap shrink-0"
            >
              Чекни Сканерлаш
            </button>
          </div>

          {/* Type switcher */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                setCategoryId('');
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                type === 'expense'
                  ? 'bg-white text-rose-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 text-rose-500" />
              <span>{t.expense}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategoryId('');
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                type === 'income'
                  ? 'bg-white text-emerald-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
              <span>{t.income}</span>
            </button>
          </div>

          {/* Amount input with Currency Selector */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Сумма ва Валюта
              </label>
              {entryCurrency !== 'UZS' && amount && (
                <span className="text-[11px] font-mono font-bold text-[#547f69]">
                  ≈ {calculatedBaseUZS.toLocaleString('uz-UZ')} сўм
                </span>
              )}
            </div>
            <div className="relative flex items-center">
              <input
                type="number"
                min="0.01"
                step="any"
                required
                autoFocus
                placeholder="0"
                value={amount}
                onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full text-xl font-bold font-mono tabular-nums pl-3 pr-24 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <select
                value={entryCurrency}
                onChange={e => setEntryCurrency(e.target.value as Currency)}
                className="absolute right-2 text-xs font-bold bg-slate-200 text-slate-800 rounded-lg px-2 py-1.5 border border-slate-300 focus:outline-none"
              >
                <option value="UZS">UZS (сўм)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
          </div>

          {/* Category selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Тоифа
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1">
              {relevantCategories.map(cat => {
                const isSelected = activeCategoryId === cat.id;
                const catName = language === 'uz_cyrl' ? cat.name_cyrl : cat.name_latn;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`p-2 rounded-lg text-left text-xs border flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/50 text-slate-900 font-semibold ring-1 ring-emerald-500'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded flex items-center justify-center text-white shrink-0 text-xs"
                      style={{ backgroundColor: cat.color }}
                    >
                      <CategoryIcon name={cat.icon} className="w-3 h-3" />
                    </span>
                    <span className="truncate">{catName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Wallet and Family Member Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ҳамён / Карта
              </label>
              <select
                value={walletId}
                onChange={e => setWalletId(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {wallets.map(w => (
                  <option key={w.id} value={w.id}>
                    {language === 'uz_cyrl' ? w.name_cyrl : w.name_latn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Оила аъзоси
              </label>
              <select
                value={memberId}
                onChange={e => setMemberId(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {members.map(m => (
                  <option key={m.id} value={m.id}>
                    {language === 'uz_cyrl' ? m.name_cyrl : m.name_latn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date and Note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Сана
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Изоҳ (ихтиёрий)
              </label>
              <input
                type="text"
                placeholder="Масалан: Бозорлик харидлари"
                value={note}
                onChange={e => setNote(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Custom Tagging Section */}
          <div className="space-y-1.5 pt-1 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700">
              Теглар (ихтиёрий: #urgent, #shopping, #gift)
            </label>

            {/* Selected Tag Badges */}
            {selectedTags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pb-1">
                {selectedTags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500 text-white text-xs font-mono font-bold shadow-2xs"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className="hover:text-amber-200 p-0.5 rounded font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Quick Preset Tags Chips */}
            <div className="flex items-center gap-1 flex-wrap">
              {PRESET_TAGS.map(tag => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold transition-all border ${
                      isSelected
                        ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-amber-50 hover:text-amber-900'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>

            {/* Custom Tag Input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Янги тег киритинг (масалан: #саёҳат)"
                value={customTagInput}
                onChange={e => setCustomTagInput(e.target.value)}
                onKeyDown={handleAddCustomTag}
                className="flex-1 text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
              <button
                type="button"
                onClick={handleAddCustomTag}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition-colors"
              >
                + Қўшиш
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={closeAddTxModal}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
            >
              {t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
