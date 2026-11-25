import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getT } from '../../constants/translations';
import { CURRENT_DATE_STR, formatMoney } from '../../utils/formatters';
import { X, ArrowDownLeft, ArrowUpRight, Wallet as WalletIcon, PiggyBank, UserPlus } from 'lucide-react';

export const AddDebtModal: React.FC = () => {
  const {
    isAddDebtModalOpen,
    closeAddDebtModal,
    addDebt,
    contacts,
    wallets,
    goals,
    language,
    currency,
    exchangeRate,
  } = useApp();

  const t = getT(language);

  const [type, setType] = useState<'they_owe' | 'i_owe'>('they_owe');
  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const [personName, setPersonName] = useState('');
  const [phone, setPhone] = useState('');
  const [telegram, setTelegram] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [totalAmount, setTotalAmount] = useState<number | ''>('');
  const [givenDate, setGivenDate] = useState(CURRENT_DATE_STR);
  const [dueDate, setDueDate] = useState('2026-11-20');
  const [notes, setNotes] = useState('');

  // Source selection: Wallet or Goal
  const [sourceType, setSourceType] = useState<'wallet' | 'goal'>('wallet');
  const [sourceId, setSourceId] = useState<string>(wallets[0]?.id || '');

  if (!isAddDebtModalOpen) return null;

  // Handle contact picker selection
  const handleContactSelect = (contactId: string) => {
    setSelectedContactId(contactId);
    const c = contacts.find(item => item.id === contactId);
    if (c) {
      setPersonName(c.name);
      setPhone(c.phone);
      setTelegram(c.telegram || '');
      setWhatsapp(c.whatsapp || '');
    } else {
      setPersonName('');
      setPhone('');
      setTelegram('');
      setWhatsapp('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName.trim() || !totalAmount || Number(totalAmount) <= 0) return;

    addDebt({
      contactId: selectedContactId || undefined,
      personName: personName.trim(),
      phone: phone.trim(),
      telegram: telegram.trim().replace('@', ''),
      whatsapp: whatsapp.trim(),
      type,
      totalAmount: Number(totalAmount),
      givenDate: givenDate || CURRENT_DATE_STR,
      dueDate: dueDate || '2026-11-30',
      notes: notes.trim(),
      sourceType,
      sourceId: sourceId || wallets[0]?.id || 'w_cash',
    });

    closeAddDebtModal();
    setPersonName('');
    setPhone('');
    setTelegram('');
    setWhatsapp('');
    setTotalAmount('');
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">
            {t.addDebt}
          </h3>
          <button
            onClick={closeAddDebtModal}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Type switcher */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setType('they_owe')}
              className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                type === 'they_owe'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
              <span>Мендан қарздор (Ундириш)</span>
            </button>
            <button
              type="button"
              onClick={() => setType('i_owe')}
              className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                type === 'i_owe'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 text-rose-600" />
              <span>Менинг қарзим (Тўлаш)</span>
            </button>
          </div>

          {/* Contact Picker or Direct Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Контактлардан танлаш (ихтиёрий):
              </label>
              {selectedContactId && (
                <button
                  type="button"
                  onClick={() => handleContactSelect('')}
                  className="text-[10px] text-rose-600 hover:underline"
                >
                  Тозалаш
                </button>
              )}
            </div>
            <select
              value={selectedContactId}
              onChange={e => handleContactSelect(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-2"
            >
              <option value="">-- Контактлар рўйхатидан танлаш --</option>
              {contacts.map(c => (
                <option key={c.id} value={c.id}>
                  👤 {c.name} ({c.phone})
                </option>
              ))}
            </select>
          </div>

          {/* Name and Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Шахс исми / Муассаса
              </label>
              <input
                type="text"
                required
                placeholder="Сардор Алимов"
                value={personName}
                onChange={e => setPersonName(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Телефон рақами (SMS ва қўнғироқ)
              </label>
              <input
                type="tel"
                placeholder="+998 90 123 45 67"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Telegram and WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Telegram (@username)
              </label>
              <input
                type="text"
                placeholder="sardor_alim"
                value={telegram}
                onChange={e => setTelegram(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                WhatsApp рақами
              </label>
              <input
                type="tel"
                placeholder="+998901234567"
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Amount input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Қарз суммаси ({currency === 'UZS' ? 'сўм' : '$'})
            </label>
            <input
              type="number"
              min="1000"
              step="10000"
              required
              placeholder="5 000 000"
              value={totalAmount}
              onChange={e => setTotalAmount(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full text-lg font-bold font-mono tabular-nums px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Financial Source/Destination Linking */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              {type === 'they_owe'
                ? 'Маблағ қайси ҳисобдан/жамғармадан берилмоқда?'
                : 'Олинган қарз қайси ҳисобга қабул қилинади?'}
            </label>

            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                type="button"
                onClick={() => {
                  setSourceType('wallet');
                  setSourceId(wallets[0]?.id || '');
                }}
                className={`py-1.5 text-xs font-semibold rounded-lg border flex items-center justify-center gap-1 ${
                  sourceType === 'wallet'
                    ? 'border-emerald-500 bg-white text-emerald-800 shadow-xs'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                <WalletIcon className="w-3.5 h-3.5" />
                <span>Карта / Ҳамён</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSourceType('goal');
                  setSourceId(goals[0]?.id || '');
                }}
                className={`py-1.5 text-xs font-semibold rounded-lg border flex items-center justify-center gap-1 ${
                  sourceType === 'goal'
                    ? 'border-emerald-500 bg-white text-emerald-800 shadow-xs'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                <PiggyBank className="w-3.5 h-3.5" />
                <span>Жамғарма ҳисоби</span>
              </button>
            </div>

            {sourceType === 'wallet' ? (
              <select
                value={sourceId}
                onChange={e => setSourceId(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {wallets.map(w => (
                  <option key={w.id} value={w.id}>
                    {language === 'uz_cyrl' ? w.name_cyrl : w.name_latn} (мавжуд: {formatMoney(w.balance, currency, language, exchangeRate)})
                  </option>
                ))}
              </select>
            ) : (
              <select
                value={sourceId}
                onChange={e => setSourceId(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {goals.map(g => (
                  <option key={g.id} value={g.id}>
                    {language === 'uz_cyrl' ? g.title_cyrl : g.title_latn} (йиғилган: {formatMoney(g.currentAmount, currency, language, exchangeRate)})
                  </option>
                ))}
              </select>
            )}

            <p className="text-[11px] text-slate-500 mt-1.5">
              {type === 'they_owe'
                ? 'Танланган карта/жамғарма қолдиғидан шу сумма автоматик ечилади.'
                : 'Танланган карта/ҳамён қолдиғига ушбу қарз суммаси автоматик қўшилади.'}
            </p>
          </div>

          {/* Dates: Given Date and Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Берилган сана
              </label>
              <input
                type="date"
                value={givenDate}
                onChange={e => setGivenDate(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Қайтариш / Ундириш муддати
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Изоҳ ва сабаб
            </label>
            <input
              type="text"
              placeholder="Масалан: Товар сотиб олиш учун 1 ойга олган"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={closeAddDebtModal}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
            >
              Қарзни қайд қилиш
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
