import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getT } from '../../constants/translations';
import { formatMoney } from '../../utils/formatters';
import {
  X,
  CreditCard,
  Plus,
  Edit2,
  Check,
  Wallet as WalletIcon,
  DollarSign,
  Sparkles,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet, Currency } from '../../types';

export const WalletsModal: React.FC = () => {
  const {
    wallets,
    addWallet,
    editWallet,
    isWalletsModalOpen,
    closeWalletsModal,
    currency: globalCurrency,
    language,
    exchangeRate,
  } = useApp();

  const t = getT(language);

  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');

  // New Wallet form state
  const [nameInput, setNameInput] = useState('');
  const [typeInput, setTypeInput] = useState<'card' | 'cash' | 'bank' | 'savings'>('card');
  const [balanceInput, setBalanceInput] = useState<number | ''>('');
  const [walletCurrency, setWalletCurrency] = useState<Currency>('UZS');
  const [colorInput, setColorInput] = useState('#3B82F6');

  // Editing Wallet state
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [editName, setEditName] = useState('');
  const [editBalance, setEditBalance] = useState<number>(0);
  const [editColor, setEditColor] = useState('');

  if (!isWalletsModalOpen) return null;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    addWallet({
      name_cyrl: nameInput.trim(),
      name_latn: nameInput.trim(),
      type: typeInput,
      balance: Number(balanceInput) || 0,
      currency: walletCurrency,
      color: colorInput,
    });

    confetti({
      particleCount: 75,
      spread: 60,
      origin: { y: 0.6 },
    });

    setNameInput('');
    setBalanceInput('');
    setActiveTab('list');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWallet) return;

    editWallet(editingWallet.id, {
      name_cyrl: editName,
      name_latn: editName,
      balance: Number(editBalance),
      color: editColor,
    });

    setEditingWallet(null);
  };

  const PRESET_COLORS = [
    '#3B82F6', // Blue (Uzcard)
    '#8B5CF6', // Purple (Humo)
    '#10B981', // Emerald (Cash)
    '#F59E0B', // Amber (USD Visa)
    '#EF4444', // Rose
    '#1c211e', // Dark Charcoal
    '#0EA5E9', // Sky Blue
  ];

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
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg tracking-tight">
                  {language === 'uz_cyrl' ? 'Ҳамёнлар ва Банк Карталари' : 'Hamyonlar va Bank Kartalari'}
                </h3>
                <p className="text-xs text-slate-300">
                  {language === 'uz_cyrl' ? 'Барча карталар ва нақд пул ҳисобварақлари бошқаруви' : 'Barcha kartalar va naqd pul hisobvaraqlari boshqaruvi'}
                </p>
              </div>
            </div>

            <button
              onClick={closeWalletsModal}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-100 bg-slate-50 px-5 pt-3 gap-2">
            <button
              onClick={() => setActiveTab('list')}
              className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === 'list'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Барча Карталар ({wallets.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('add')}
              className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === 'add'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>+ Янги Карта Қўшиш</span>
            </button>
          </div>

          {/* Content */}
          <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* TAB 1: LIST ALL WALLETS / CARDS */}
            {activeTab === 'list' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {wallets.map(wallet => {
                    const name = language === 'uz_cyrl' ? wallet.name_cyrl : wallet.name_latn;

                    return (
                      <div
                        key={wallet.id}
                        className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group"
                      >
                        {/* Top decorative gradient bar */}
                        <div
                          className="absolute top-0 left-0 right-0 h-1.5"
                          style={{ backgroundColor: wallet.color || '#10B981' }}
                        />

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white font-mono uppercase"
                              style={{ backgroundColor: wallet.color || '#10B981' }}
                            >
                              {wallet.type === 'card' ? 'Банк картаси' : wallet.type === 'cash' ? 'Нақд пул' : 'Ҳисобварақ'}
                            </span>

                            <button
                              onClick={() => {
                                setEditingWallet(wallet);
                                setEditName(name);
                                setEditBalance(wallet.balance);
                                setEditColor(wallet.color || '#3B82F6');
                              }}
                              className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Таҳрирлаш"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <h4 className="font-bold text-slate-900 text-sm mb-1 leading-snug">
                            {name}
                          </h4>

                          <div className="text-lg font-black text-slate-900 font-mono tabular-nums mt-1">
                            {formatMoney(wallet.balance, wallet.currency || 'UZS', language, exchangeRate)}
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                          <span>Валюта: <strong>{wallet.currency || 'UZS'}</strong></span>
                          <span className="text-emerald-700 font-bold">Фаол</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('add')}
                  className="w-full py-3 border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/50 rounded-2xl text-xs font-bold text-slate-700 hover:text-emerald-900 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4 text-emerald-600" />
                  <span>Янги Банк Картаси ёки Ҳамён Қўшиш</span>
                </button>
              </div>
            )}

            {/* TAB 2: ADD NEW WALLET / CARD FORM */}
            {activeTab === 'add' && (
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Карта ёки Ҳамён Номи
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="Масалан: Anorbank Mastercard, TBC Bank, Нақд доллар"
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Тур
                    </label>
                    <select
                      value={typeInput}
                      onChange={e => setTypeInput(e.target.value as any)}
                      className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold"
                    >
                      <option value="card">💳 Банк картаси (Uzcard/Humo/Visa)</option>
                      <option value="cash">💵 Нақд пул</option>
                      <option value="bank">🏦 Банк ҳисобварағи</option>
                      <option value="savings">💰 Жамғарма ҳисоб</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Валюта
                    </label>
                    <select
                      value={walletCurrency}
                      onChange={e => setWalletCurrency(e.target.value as Currency)}
                      className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold"
                    >
                      <option value="UZS">UZS (сўм)</option>
                      <option value="USD">USD ($)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Бошланғич маблағ қолдиғи
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    placeholder="0"
                    value={balanceInput}
                    onChange={e => setBalanceInput(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full text-base font-bold font-mono px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Color theme selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Карта Ранги (Дизайн)
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {PRESET_COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setColorInput(color)}
                        className={`w-8 h-8 rounded-xl transition-all border-2 flex items-center justify-center ${
                          colorInput === color ? 'border-slate-900 scale-110 shadow-sm' : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                      >
                        {colorInput === color && <Check className="w-4 h-4 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setActiveTab('list')}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl"
                  >
                    Бекор қилиш
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-xs flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Картани Сақлаш ва Қўшиш</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* EDIT WALLET MODAL INNER OVERLAY */}
          {editingWallet && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Edit2 className="w-4 h-4 text-emerald-600" />
                    <span>Карта / Ҳамённи Таҳрирлаш</span>
                  </h3>
                  <button
                    onClick={() => setEditingWallet(null)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleEditSubmit} className="space-y-4 pt-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Номи
                    </label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Жорий қолдиқ маблағ
                    </label>
                    <input
                      type="number"
                      required
                      value={editBalance}
                      onChange={e => setEditBalance(Number(e.target.value))}
                      className="w-full text-base font-mono font-bold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Карта Ранги
                    </label>
                    <div className="flex items-center gap-2 flex-wrap">
                      {PRESET_COLORS.map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setEditColor(color)}
                          className={`w-7 h-7 rounded-lg transition-all border-2 flex items-center justify-center ${
                            editColor === color ? 'border-slate-900 scale-110' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                        >
                          {editColor === color && <Check className="w-3.5 h-3.5 text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setEditingWallet(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl"
                    >
                      Бекор қилиш
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-xs"
                    >
                      Сақлаш
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
