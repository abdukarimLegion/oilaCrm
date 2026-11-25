import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { getT } from '../../constants/translations';
import {
  formatMoney,
  formatCompactMoney,
  formatDateUz,
  getDueStatus,
  CURRENT_DATE_STR,
} from '../../utils/formatters';
import { Debt, Contact } from '../../types';
import {
  Plus,
  Phone,
  Calendar,
  CheckCircle,
  Copy,
  Clock,
  AlertTriangle,
  FileText,
  DollarSign,
  Trash2,
  Send,
  Check,
  Share2,
  MessageCircle,
  PiggyBank,
  Wallet as WalletIcon,
  X,
  Users,
  Edit3,
  ExternalLink,
  Smartphone,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const DebtLedgerView: React.FC = () => {
  const {
    debts,
    wallets,
    goals,
    contacts,
    addContact,
    deleteContact,
    currency,
    language,
    exchangeRate,
    openAddDebtModal,
    settleDebt,
    addPartialDebtPayment,
    deleteDebt,
  } = useApp();

  const t = getT(language);

  // Subtab switcher: 'debts' | 'contacts'
  const [activeMainSubtab, setActiveMainSubtab] = useState<'debts' | 'contacts'>('debts');

  // Debts ledger subtab: 'they_owe' | 'i_owe'
  const [activeTabType, setActiveTabType] = useState<'they_owe' | 'i_owe'>('they_owe');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'overdue' | 'settled'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals for collection / settlement into wallet or goal
  const [settleModalDebt, setSettleModalDebt] = useState<Debt | null>(null);
  const [settleTargetType, setSettleTargetType] = useState<'wallet' | 'goal'>('wallet');
  const [settleTargetId, setSettleTargetId] = useState<string>(wallets[0]?.id || '');

  // Partial payment modal
  const [partialPaymentDebt, setPartialPaymentDebt] = useState<Debt | null>(null);
  const [partialAmount, setPartialAmount] = useState<number>(500000);
  const [partialTargetType, setPartialTargetType] = useState<'wallet' | 'goal'>('wallet');
  const [partialTargetId, setPartialTargetId] = useState<string>(wallets[0]?.id || '');
  const [partialNote, setPartialNote] = useState<string>('');

  // Social reminder messenger modal with LIVE EDITABLE TEXT
  const [reminderModalDebt, setReminderModalDebt] = useState<Debt | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<'polite' | 'urgent' | 'card' | 'thanks'>('polite');
  const [customCardNumber, setCustomCardNumber] = useState('8600 1234 5678 9012');
  const [editableMessage, setEditableMessage] = useState('');
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // New Contact modal inside Contacts subtab
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactTelegram, setNewContactTelegram] = useState('');
  const [newContactNotes, setNewContactNotes] = useState('');

  // Check Contact Picker API support
  const hasContactPicker = typeof window !== 'undefined' && 'contacts' in navigator && 'ContactsManager' in window;

  const handleDeviceContactImport = async () => {
    if (hasContactPicker) {
      try {
        const props = ['name', 'tel'];
        const opts = { multiple: true };
        const selected = await (navigator as any).contacts.select(props, opts);
        if (selected && selected.length > 0) {
          selected.forEach((c: any) => {
            const name = c.name?.[0] || 'Янги контакт';
            const phone = c.tel?.[0] || '';
            if (phone) {
              addContact({
                name,
                phone,
                avatarColor: '#3B82F6',
                notes: 'Телефон хотирасидан олинди',
              });
            }
          });
        }
      } catch (err) {
        console.error('Contact picker canceled or error', err);
      }
    } else {
      setIsAddContactModalOpen(true);
    }
  };

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) return;

    const colors = ['#2563EB', '#059669', '#D97706', '#DB2777', '#7C3AED', '#0891B2'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    addContact({
      name: newContactName.trim(),
      phone: newContactPhone.trim(),
      telegram: newContactTelegram.trim().replace('@', ''),
      notes: newContactNotes.trim(),
      avatarColor: randomColor,
    });

    setIsAddContactModalOpen(false);
    setNewContactName('');
    setNewContactPhone('');
    setNewContactTelegram('');
    setNewContactNotes('');
  };

  // Filtered debts
  const filteredDebts = useMemo(() => {
    return debts
      .filter(d => d.type === activeTabType)
      .map(d => ({
        ...d,
        dueStatus: getDueStatus(d.dueDate, d.status === 'settled', CURRENT_DATE_STR),
      }))
      .filter(d => {
        if (statusFilter === 'all') return true;
        if (statusFilter === 'active') return d.status !== 'settled';
        if (statusFilter === 'overdue') return d.dueStatus.status === 'overdue' && d.status !== 'settled';
        if (statusFilter === 'settled') return d.status === 'settled';
        return true;
      })
      .filter(d => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          d.personName.toLowerCase().includes(q) ||
          d.phone.includes(q) ||
          d.notes.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (a.status === 'settled' && b.status !== 'settled') return 1;
        if (a.status !== 'settled' && b.status === 'settled') return -1;
        return a.dueStatus.daysDiff - b.dueStatus.daysDiff;
      });
  }, [debts, activeTabType, statusFilter, searchQuery]);

  // Totals for top statistics
  const totals = useMemo(() => {
    const theyOweActive = debts
      .filter(d => d.type === 'they_owe' && d.status !== 'settled')
      .reduce((sum, d) => sum + d.remainingAmount, 0);

    const iOweActive = debts
      .filter(d => d.type === 'i_owe' && d.status !== 'settled')
      .reduce((sum, d) => sum + d.remainingAmount, 0);

    const overdueCount = debts.filter(d => {
      if (d.status === 'settled') return false;
      const st = getDueStatus(d.dueDate, false, CURRENT_DATE_STR);
      return st.status === 'overdue';
    }).length;

    const dueSoonCount = debts.filter(d => {
      if (d.status === 'settled') return false;
      const st = getDueStatus(d.dueDate, false, CURRENT_DATE_STR);
      return st.status === 'soon' || st.status === 'today';
    }).length;

    return {
      theyOweActive,
      iOweActive,
      overdueCount,
      dueSoonCount,
    };
  }, [debts]);

  // Generate dynamic reminder template text
  const generateTemplateText = (debt: Debt, template: 'polite' | 'urgent' | 'card' | 'thanks', cardNum: string) => {
    const isReceivable = debt.type === 'they_owe';
    const formattedAmt = formatMoney(debt.remainingAmount, currency, language, exchangeRate);
    const dueDateStr = formatDateUz(debt.dueDate, language);

    if (!isReceivable) {
      return `Ассалому алайкум, ${debt.personName}!
Сиздан олинган ${formattedAmt} қарз бўйича қайтариш муддати (${dueDateStr}) яқинлашди. Тўловни тайёрлаб қўйдим, келишилган ҳисобга ўтказиб бераман. Раҳмат!`;
    }

    switch (template) {
      case 'polite':
        return `Ассалому алайкум, ҳурматли ${debt.personName}!
Келишилган ${formattedAmt} миқдоридаги қарзни қайтариш муддати (${dueDateStr}) яқинлашмоқда. Иложи бўлса қайтариб бериш ҳолатини маълум қилсангиз миннатдор бўлардим. Ҳурмат билан!`;

      case 'urgent':
        return `⚠️ Диққат, ${debt.personName}!
Сиз билан келишилган ${formattedAmt} қарзни қайтариш муддати (${dueDateStr}) ўтиб кетди. Илтимос, тўловни кечиктирмасдан қуйидаги пластик картага қайтариб юборсангиз:
💳 ${cardNum}
Алоқа учун рақамим очиқ. Ташаккур!`;

      case 'card':
        return `Ассалому алайкум, ${debt.personName}!
Қарз бўйича келишилган қолдиқ сумма: ${formattedAmt}.
Тўлов учун қулай пластик карта реквизити:
💳 ${cardNum} (Акмал К.)
Ўтказма қилганингиздан сўнг чек ёки скриншот юборсангиз кифоя. Ташаккур!`;

      case 'thanks':
        return `Ассалому алайкум, ${debt.personName}!
Сиздан ${formattedAmt} миқдоридаги қарз тўлови тўлиқ қабул қилинди ва қарз дафтаримизда ёпилди. Ҳалол ва ўз вақтида қайтарганингиз учун катта раҳмат! Барака топинг!`;
    }
  };

  const handleOpenReminderModal = (debt: Debt) => {
    const isOverdue = debt.status === 'overdue';
    const initialTmpl = isOverdue ? 'urgent' : 'polite';
    setSelectedTemplate(initialTmpl);
    setEditableMessage(generateTemplateText(debt, initialTmpl, customCardNumber));
    setReminderModalDebt(debt);
  };

  const handleSelectTemplate = (tmpl: 'polite' | 'urgent' | 'card' | 'thanks') => {
    setSelectedTemplate(tmpl);
    if (reminderModalDebt) {
      setEditableMessage(generateTemplateText(reminderModalDebt, tmpl, customCardNumber));
    }
  };

  // Settle full debt confirmation
  const handleConfirmSettle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settleModalDebt) return;
    settleDebt(settleModalDebt.id, settleTargetType, settleTargetId);
    setSettleModalDebt(null);
  };

  // Partial payment submission
  const handlePartialPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (partialPaymentDebt && partialAmount > 0) {
      addPartialDebtPayment(
        partialPaymentDebt.id,
        partialAmount,
        partialTargetType,
        partialTargetId,
        partialNote
      );
      setPartialPaymentDebt(null);
      setPartialNote('');
    }
  };

  // Native Mobile Share with the user's edited message
  const handleNativeShare = async () => {
    if (!reminderModalDebt) return;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Қарз эслатмаси: ${reminderModalDebt.personName}`,
          text: editableMessage,
        });
      } catch (err) {
        console.log('Share canceled or unsupported', err);
      }
    } else {
      navigator.clipboard.writeText(editableMessage);
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 2000);
    }
  };

  const handleCopyEditedText = () => {
    navigator.clipboard.writeText(editableMessage);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Subtab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {activeMainSubtab === 'debts' ? 'Оилавий Қарз Дафтари' : 'Контактлар ва Алоқа Базаси'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {activeMainSubtab === 'debts'
              ? 'Олинган ва берилган қарзлар, қайтариш муддатлари ва таҳрирланувчи эслатмалар'
              : 'Қарз дафтарига боғланган барча шахслар, тўғридан-тўғри қўнғироқ ва чат'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Subtab Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setActiveMainSubtab('debts')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeMainSubtab === 'debts'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Қарзлар
            </button>
            <button
              onClick={() => setActiveMainSubtab('contacts')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeMainSubtab === 'contacts'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>Контактлар ({contacts.length})</span>
            </button>
          </div>

          {activeMainSubtab === 'debts' ? (
            <button
              onClick={openAddDebtModal}
              className="flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-xs transition-all whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addDebt}</span>
            </button>
          ) : (
            <button
              onClick={() => setIsAddContactModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl shadow-xs transition-all whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Янги контакт</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW A: DEBTS LEDGER */}
      {activeMainSubtab === 'debts' && (
        <div className="space-y-6">
          {/* Summary KPI Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4 shadow-xs">
              <span className="text-[11px] text-slate-500 uppercase font-semibold block">
                {t.theyOweTotal}
              </span>
              <div className="text-lg sm:text-xl font-bold text-emerald-600 font-mono tabular-nums mt-1 truncate">
                {formatMoney(totals.theyOweActive, currency, language, exchangeRate)}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Мендан олинган қарз
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4 shadow-xs">
              <span className="text-[11px] text-slate-500 uppercase font-semibold block">
                {t.iOweTotal}
              </span>
              <div className="text-lg sm:text-xl font-bold text-rose-600 font-mono tabular-nums mt-1 truncate">
                {formatMoney(totals.iOweActive, currency, language, exchangeRate)}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Менинг тўлашим керак
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4 shadow-xs">
              <span className="text-[11px] text-slate-500 uppercase font-semibold block">
                Муддати ўтган
              </span>
              <div className="text-lg sm:text-xl font-bold text-rose-600 font-mono tabular-nums mt-1 flex items-center gap-1.5">
                <span>{totals.overdueCount} та</span>
                {totals.overdueCount > 0 && (
                  <AlertTriangle className="w-4 h-4 text-rose-500 animate-bounce" />
                )}
              </div>
              <div className="text-[10px] text-rose-500 mt-1 font-medium">
                Шошилинч қайтариб олиш
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4 shadow-xs">
              <span className="text-[11px] text-slate-500 uppercase font-semibold block">
                Муддати яқин (≤3 кун)
              </span>
              <div className="text-lg sm:text-xl font-bold text-amber-600 font-mono tabular-nums mt-1">
                {totals.dueSoonCount} та
              </div>
              <div className="text-[10px] text-amber-600 mt-1">
                Эслатма юбориш тавсия этилади
              </div>
            </div>
          </div>

          {/* Subtab & Search Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl shrink-0 w-full sm:w-auto">
                <button
                  onClick={() => setActiveTabType('they_owe')}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap text-center ${
                    activeTabType === 'they_owe'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.tabTheyOwe}
                </button>
                <button
                  onClick={() => setActiveTabType('i_owe')}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap text-center ${
                    activeTabType === 'i_owe'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.tabIOwe}
                </button>
              </div>

              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Status Filter Buttons */}
            <div className="flex items-center gap-1.5 text-xs pt-1 border-t border-slate-100 overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'Барчаси' },
                { id: 'active', label: 'Фаоллар' },
                { id: 'overdue', label: 'Муддати ўтган' },
                { id: 'settled', label: 'Ундирилган' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap min-h-[36px] flex items-center ${
                    statusFilter === f.id
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Debts Cards List */}
          {filteredDebts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">{t.noDebts}</p>
              <p className="text-xs text-slate-400 mt-1">Янги қарз ёзиш учун "+ Янги қарз ёзиш" тугмасидан фойдаланинг.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDebts.map(debt => {
                const isSettled = debt.status === 'settled';
                const isOverdue = debt.dueStatus.status === 'overdue' && !isSettled;
                const isDueSoon = (debt.dueStatus.status === 'soon' || debt.dueStatus.status === 'today') && !isSettled;

                const sourceWallet = wallets.find(w => w.id === debt.sourceId);
                const sourceGoal = goals.find(g => g.id === debt.sourceId);
                const sourceName =
                  debt.sourceType === 'wallet'
                    ? sourceWallet ? (language === 'uz_cyrl' ? sourceWallet.name_cyrl : sourceWallet.name_latn) : 'Ҳамён'
                    : sourceGoal ? (language === 'uz_cyrl' ? sourceGoal.title_cyrl : sourceGoal.title_latn) : 'Жамғарма';

                return (
                  <motion.div
                    key={debt.id}
                    whileHover={{ y: -1 }}
                    className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-xs transition-all ${
                      isSettled
                        ? 'border-slate-200 opacity-80 bg-slate-50/50'
                        : isOverdue
                        ? 'border-rose-300 ring-1 ring-rose-200 bg-rose-50/15'
                        : isDueSoon
                        ? 'border-amber-300 ring-1 ring-amber-200'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-base font-bold text-slate-900">
                            {debt.personName}
                          </span>

                          <span
                            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                              debt.dueStatus.badgeColor
                            }`}
                          >
                            {language === 'uz_cyrl' ? debt.dueStatus.labelCyrl : debt.dueStatus.labelLatn}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                          {debt.phone && (
                            <a
                              href={`tel:${debt.phone}`}
                              className="flex items-center gap-1 font-mono text-emerald-700 hover:underline"
                            >
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{debt.phone}</span>
                            </a>
                          )}
                          <span aria-hidden="true">·</span>
                          <span className="text-slate-600">
                            Манба: <strong className="font-semibold text-slate-800">{sourceName}</strong>
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="flex items-center gap-1 font-medium text-slate-700">
                            <Clock className="w-3 h-3 text-slate-400" />
                            Муддати: {formatDateUz(debt.dueDate, language)}
                          </span>
                        </div>

                        {debt.notes && (
                          <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100 max-w-2xl">
                            "{debt.notes}"
                          </p>
                        )}

                        {debt.payments.length > 0 && (
                          <div className="mt-2 text-[11px] text-slate-500 space-y-0.5">
                            <span className="font-semibold text-slate-700">Тўловлар қайдномаси:</span>
                            {debt.payments.map(p => {
                              const destW = wallets.find(w => w.id === p.targetId);
                              const destG = goals.find(g => g.id === p.targetId);
                              const destLabel = p.targetType === 'wallet' ? (destW?.name_cyrl || 'Ҳамён') : (destG?.title_cyrl || 'Жамғарма');

                              return (
                                <div key={p.id} className="text-emerald-700 font-mono">
                                  · {formatDateUz(p.date, language)}: +{formatMoney(p.amount, currency, language, exchangeRate)} ➔ {destLabel} ({p.note})
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 shrink-0 lg:border-l lg:border-slate-100 lg:pl-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <div className="text-left sm:text-right">
                          <div className="text-[11px] text-slate-400 uppercase font-semibold">
                            {isSettled ? 'Тўлиқ ёпилган' : 'Қолган қарз'}
                          </div>
                          <div
                            className={`text-xl font-bold font-mono tabular-nums ${
                              isSettled
                                ? 'text-slate-400 line-through'
                                : debt.type === 'they_owe'
                                ? 'text-emerald-600'
                                : 'text-rose-600'
                            }`}
                          >
                            {formatMoney(debt.remainingAmount, currency, language, exchangeRate)}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Жами: {formatCompactMoney(debt.totalAmount, currency, language, exchangeRate)} | Тўланди: {formatCompactMoney(debt.paidAmount, currency, language, exchangeRate)}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          {!isSettled ? (
                            <>
                              <button
                                onClick={() => {
                                  setSettleModalDebt(debt);
                                  setSettleTargetType('wallet');
                                  setSettleTargetId(wallets[0]?.id || '');
                                }}
                                title="Ундирилди деб белгилаш ва балансга қўшиш"
                                className="px-3 py-2 min-h-[44px] text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl flex items-center gap-1.5 shadow-xs transition-all whitespace-nowrap"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span>{t.markSettled}</span>
                              </button>

                              <button
                                onClick={() => {
                                  setPartialPaymentDebt(debt);
                                  setPartialAmount(Math.min(debt.remainingAmount, 500000));
                                  setPartialTargetType('wallet');
                                  setPartialTargetId(wallets[0]?.id || '');
                                }}
                                title="Қисман тўлов киритиш"
                                className="px-2.5 py-2 min-h-[44px] text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 rounded-xl transition-all whitespace-nowrap"
                              >
                                {t.partialPayment}
                              </button>

                              <button
                                onClick={() => handleOpenReminderModal(debt)}
                                title="Хабарни таҳрирлаш ва SMS/Telegram орқали юбориш"
                                className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-700 bg-blue-50 hover:bg-blue-100 active:scale-95 rounded-xl transition-all"
                              >
                                <Send className="w-4 h-4 text-blue-600" />
                              </button>
                            </>
                          ) : (
                            <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-semibold bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
                              <Check className="w-4 h-4" />
                              <span>{t.settledBadge}</span>
                            </div>
                          )}

                          <button
                            onClick={() => deleteDebt(debt.id)}
                            title="Ўчириш"
                            className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-300 hover:text-rose-600 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW B: CONTACTS DIRECTORY */}
      {activeMainSubtab === 'contacts' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <input
              type="text"
              placeholder="Контактларни қидириш (исм, телефон, Telegram)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500"
            />
            {hasContactPicker && (
              <button
                onClick={handleDeviceContactImport}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-xs transition-colors shrink-0"
              >
                <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                <span>Телефондан олиш</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contacts
              .filter(c => {
                if (!searchQuery) return true;
                const q = searchQuery.toLowerCase();
                return c.name.toLowerCase().includes(q) || c.phone.includes(q) || (c.telegram && c.telegram.includes(q));
              })
              .map(contact => {
                const personDebts = debts.filter(
                  d => d.contactId === contact.id || d.phone === contact.phone || d.personName.includes(contact.name)
                );
                const activeReceivable = personDebts
                  .filter(d => d.type === 'they_owe' && d.status !== 'settled')
                  .reduce((sum, d) => sum + d.remainingAmount, 0);

                return (
                  <motion.div
                    key={contact.id}
                    whileHover={{ y: -2 }}
                    className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0"
                            style={{ backgroundColor: contact.avatarColor }}
                          >
                            {contact.name[0]}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm leading-tight">
                              {contact.name}
                            </h4>
                            <a
                              href={`tel:${contact.phone}`}
                              className="text-xs font-mono text-slate-500 hover:text-emerald-600 block mt-0.5"
                            >
                              {contact.phone}
                            </a>
                          </div>
                        </div>

                        <button
                          onClick={() => deleteContact(contact.id)}
                          className="text-slate-300 hover:text-rose-500 p-1 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {contact.notes && (
                        <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg mb-3">
                          {contact.notes}
                        </p>
                      )}

                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs mb-3">
                        {activeReceivable > 0 ? (
                          <div className="flex justify-between items-center text-emerald-800">
                            <span>Мендан қарздор:</span>
                            <span className="font-mono font-bold tabular-nums">
                              {formatMoney(activeReceivable, currency, language, exchangeRate)}
                            </span>
                          </div>
                        ) : (
                          <div className="text-slate-400 text-center py-0.5">
                            Фаол қарзлар йўқ
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-100 text-center text-[10px] font-semibold">
                      <a
                        href={`tel:${contact.phone}`}
                        className="py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex flex-col items-center justify-center gap-0.5"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Тел</span>
                      </a>

                      <a
                        href={`sms:${contact.phone}?body=${encodeURIComponent(
                          `Ассалому алайкум, ${contact.name}! Қарз дафтари бўйича эслатма.`
                        )}`}
                        className="py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex flex-col items-center justify-center gap-0.5"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
                        <span>SMS</span>
                      </a>

                      {contact.telegram ? (
                        <a
                          href={`https://t.me/${contact.telegram}`}
                          target="_blank"
                          rel="noreferrer"
                          className="py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 flex flex-col items-center justify-center gap-0.5"
                        >
                          <Send className="w-3.5 h-3.5 text-blue-600" />
                          <span>Telegram</span>
                        </a>
                      ) : (
                        <div className="py-2 rounded-lg bg-slate-50 text-slate-300 flex flex-col items-center justify-center gap-0.5">
                          <Send className="w-3.5 h-3.5 opacity-40" />
                          <span>Telegram</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
          </div>
        </div>
      )}

      {/* Settle Full Debt Modal (Destination Selection) */}
      {settleModalDebt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span>Қарзни тўлиқ ундириш ва йўналтириш</span>
              </h3>
              <button
                onClick={() => setSettleModalDebt(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmSettle} className="space-y-4 pt-4">
              <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200">
                <div className="text-xs text-emerald-800">
                  Қарздор: <strong className="text-emerald-950">{settleModalDebt.personName}</strong>
                </div>
                <div className="text-lg font-bold font-mono text-emerald-900 tabular-nums mt-1">
                  +{formatMoney(settleModalDebt.remainingAmount, currency, language, exchangeRate)}
                </div>
                <p className="text-[11px] text-emerald-700 mt-1">
                  Ушбу сумма қуйида танланган манба ҳисобига тўғридан-тўғри қўшилади.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Маблағ қайси ҳисобга йўналтирилсин?
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setSettleTargetType('wallet');
                      setSettleTargetId(wallets[0]?.id || '');
                    }}
                    className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      settleTargetType === 'wallet' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    <WalletIcon className="w-3.5 h-3.5 text-blue-600" />
                    <span>Карта / Ҳамён</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSettleTargetType('goal');
                      setSettleTargetId(goals[0]?.id || '');
                    }}
                    className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      settleTargetType === 'goal' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    <PiggyBank className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Мақсадли жамғарма</span>
                  </button>
                </div>
              </div>

              <div>
                {settleTargetType === 'wallet' ? (
                  <select
                    value={settleTargetId}
                    onChange={e => setSettleTargetId(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  >
                    {wallets.map(w => (
                      <option key={w.id} value={w.id}>
                        {language === 'uz_cyrl' ? w.name_cyrl : w.name_latn} (қолдиқ: {formatMoney(w.balance, currency, language, exchangeRate)})
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={settleTargetId}
                    onChange={e => setSettleTargetId(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  >
                    {goals.map(g => (
                      <option key={g.id} value={g.id}>
                        {language === 'uz_cyrl' ? g.title_cyrl : g.title_latn} (йиғилган: {formatMoney(g.currentAmount, currency, language, exchangeRate)})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSettleModalDebt(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-xl"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-xs transition-colors"
                >
                  Ундирилди ва балансга қўшилсин
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Partial Payment Modal */}
      {partialPaymentDebt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Қисман тўловни қабул қилиш
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {partialPaymentDebt.personName} бўйича тўлов қайдномаси
            </p>

            <form onSubmit={handlePartialPaymentSubmit} className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 flex justify-between">
                <span>Жами қолган қарз:</span>
                <span className="font-bold text-slate-900 font-mono tabular-nums">
                  {formatMoney(partialPaymentDebt.remainingAmount, currency, language, exchangeRate)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Тўланаётган сумма (сўм)
                </label>
                <input
                  type="number"
                  min="1000"
                  max={partialPaymentDebt.remainingAmount}
                  step="10000"
                  required
                  value={partialAmount}
                  onChange={e => setPartialAmount(Number(e.target.value))}
                  className="w-full text-base font-mono tabular-nums px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Қайси карта ёки жамғармага қўшилсин?
                </label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPartialTargetType('wallet');
                      setPartialTargetId(wallets[0]?.id || '');
                    }}
                    className={`py-1.5 text-xs font-medium rounded-lg border text-center ${
                      partialTargetType === 'wallet' ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-200'
                    }`}
                  >
                    Ҳамён / Карта
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPartialTargetType('goal');
                      setPartialTargetId(goals[0]?.id || '');
                    }}
                    className={`py-1.5 text-xs font-medium rounded-lg border text-center ${
                      partialTargetType === 'goal' ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-200'
                    }`}
                  >
                    Жамғарма
                  </button>
                </div>

                <select
                  value={partialTargetId}
                  onChange={e => setPartialTargetId(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                >
                  {partialTargetType === 'wallet'
                    ? wallets.map(w => (
                        <option key={w.id} value={w.id}>
                          {language === 'uz_cyrl' ? w.name_cyrl : w.name_latn} ({formatMoney(w.balance, currency, language, exchangeRate)})
                        </option>
                      ))
                    : goals.map(g => (
                        <option key={g.id} value={g.id}>
                          {language === 'uz_cyrl' ? g.title_cyrl : g.title_latn}
                        </option>
                      ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Изоҳ (ихтиёрий)
                </label>
                <input
                  type="text"
                  placeholder="Масалан: Картага ўтказилди"
                  value={partialNote}
                  onChange={e => setPartialNote(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPartialPaymentDebt(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-xl"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-xs"
                >
                  Тўловни киритиш
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Social Messenger & Reminder Modal with LIVE EDITABLE TEXTAREA */}
      {reminderModalDebt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-600" />
                <span>Эслатмани таҳрирлаш ва юбориш</span>
              </h3>
              <button
                onClick={() => setReminderModalDebt(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 pt-4">
              {/* Template quick pickers */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Шаблонни танланг:
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleSelectTemplate('polite')}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      selectedTemplate === 'polite'
                        ? 'border-emerald-500 bg-emerald-50 font-semibold text-emerald-900 ring-1 ring-emerald-500'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    🤝 Хушмуомала эслатма
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectTemplate('urgent')}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      selectedTemplate === 'urgent'
                        ? 'border-rose-500 bg-rose-50 font-semibold text-rose-900 ring-1 ring-rose-500'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    ⏰ Муддати ўтган огоҳлантириш
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectTemplate('card')}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      selectedTemplate === 'card'
                        ? 'border-blue-500 bg-blue-50 font-semibold text-blue-900 ring-1 ring-blue-500'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    💳 Карта рақами билан
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectTemplate('thanks')}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      selectedTemplate === 'thanks'
                        ? 'border-emerald-500 bg-emerald-50 font-semibold text-emerald-900 ring-1 ring-emerald-500'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    ✨ Раҳматнома (ёпилганда)
                  </button>
                </div>
              </div>

              {/* Card number customizer */}
              {selectedTemplate === 'card' && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Пластик карта рақамингиз:
                  </label>
                  <input
                    type="text"
                    value={customCardNumber}
                    onChange={e => {
                      setCustomCardNumber(e.target.value);
                      setEditableMessage(generateTemplateText(reminderModalDebt, selectedTemplate, e.target.value));
                    }}
                    className="w-full text-xs font-mono px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* LIVE EDITABLE TEXTAREA */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Юбориладиган хабар матни (бемалол таҳрирлашингиз мумкин):</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {editableMessage.length} та белги
                  </span>
                </div>
                <textarea
                  rows={6}
                  value={editableMessage}
                  onChange={e => setEditableMessage(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-800 leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
                />
              </div>

              {/* Direct channels: SMS, Telegram, WhatsApp, Share */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
                {/* 1. Direct SMS */}
                <a
                  href={`sms:${reminderModalDebt.phone}?body=${encodeURIComponent(editableMessage)}`}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  <MessageCircle className="w-4 h-4 text-blue-600" />
                  <span>SMS</span>
                </a>

                {/* 2. Direct Telegram */}
                {reminderModalDebt.telegram ? (
                  <a
                    href={`https://t.me/${reminderModalDebt.telegram}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 active:scale-95 text-blue-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Send className="w-4 h-4 text-blue-600" />
                    <span>Telegram</span>
                  </a>
                ) : (
                  <a
                    href={`https://t.me/share/url?url=&text=${encodeURIComponent(editableMessage)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 active:scale-95 text-blue-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Send className="w-4 h-4 text-blue-600" />
                    <span>TG Улашиш</span>
                  </a>
                )}

                {/* 3. WhatsApp */}
                <a
                  href={`https://wa.me/${reminderModalDebt.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    editableMessage
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Share2 className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp</span>
                </a>

                {/* 4. Native Device Share or Copy */}
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{copiedSuccess ? 'Нусхаланди!' : 'Улашиш'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      {isAddContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Янги контакт қўшиш
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Қарздор ёки яқин инсоннинг маълумотлари
            </p>

            <form onSubmit={handleCreateContact} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Исм-фамилия
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Масалан: Дониёр Муродов"
                  value={newContactName}
                  onChange={e => setNewContactName(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Телефон рақами
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+998 90 123 45 67"
                  value={newContactPhone}
                  onChange={e => setNewContactPhone(e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Telegram (@username)
                </label>
                <input
                  type="text"
                  placeholder="doniyor_m"
                  value={newContactTelegram}
                  onChange={e => setNewContactTelegram(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Изоҳ (дўст, ҳамкасб, уста ва ҳ.к.)
                </label>
                <input
                  type="text"
                  placeholder="Масалан: Тоғаваччам, савдогар"
                  value={newContactNotes}
                  onChange={e => setNewContactNotes(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddContactModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-xl"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-xs"
                >
                  Сақлаш
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
