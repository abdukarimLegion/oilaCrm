import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getT } from '../../constants/translations';
import { formatMoney } from '../../utils/formatters';
import {
  Users,
  Plus,
  Phone,
  Send,
  MessageCircle,
  Share2,
  Trash2,
  Edit2,
  ExternalLink,
  Smartphone,
  Check,
} from 'lucide-react';
import { Contact } from '../../types';

export const ContactsView: React.FC = () => {
  const {
    contacts,
    debts,
    currency,
    language,
    exchangeRate,
    addContact,
    deleteContact,
    openAddDebtModal,
  } = useApp();

  const t = getT(language);

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactTelegram, setNewContactTelegram] = useState('');
  const [newContactWhatsapp, setNewContactWhatsapp] = useState('');
  const [newContactNotes, setNewContactNotes] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Check if browser supports Contact Picker API
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
                notes: 'Телефон хотирасидан импорт қилинди',
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
      whatsapp: newContactWhatsapp.trim(),
      notes: newContactNotes.trim(),
      avatarColor: randomColor,
    });

    setIsAddContactModalOpen(false);
    setNewContactName('');
    setNewContactPhone('');
    setNewContactTelegram('');
    setNewContactWhatsapp('');
    setNewContactNotes('');
  };

  const filteredContacts = contacts.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.telegram && c.telegram.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            <span>Контактлар ва Мулоқот маркази</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Қарз дафтарига уланган шахслар, уларга тўғридан-тўғри SMS ва Telegram хабарлар юбориш
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasContactPicker && (
            <button
              onClick={handleDeviceContactImport}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-xs transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5 text-blue-600" />
              <span>Телефондан олиш</span>
            </button>
          )}

          <button
            onClick={() => setIsAddContactModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Янги контакт</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs">
        <input
          type="text"
          placeholder="Контактларни қидириш (исми, телефон ёки Telegram)..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      {/* Contacts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContacts.map(contact => {
          // Find associated active debts
          const personDebts = debts.filter(
            d => d.contactId === contact.id || d.phone === contact.phone || d.personName.includes(contact.name)
          );
          const activeReceivable = personDebts
            .filter(d => d.type === 'they_owe' && d.status !== 'settled')
            .reduce((sum, d) => sum + d.remainingAmount, 0);

          const activePayable = personDebts
            .filter(d => d.type === 'i_owe' && d.status !== 'settled')
            .reduce((sum, d) => sum + d.remainingAmount, 0);

          return (
            <div
              key={contact.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
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
                    title="Ўчириш"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {contact.notes && (
                  <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded mb-3">
                    {contact.notes}
                  </p>
                )}

                {/* Associated Debt Status */}
                <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 text-xs mb-3 space-y-1">
                  {activeReceivable > 0 ? (
                    <div className="flex justify-between items-center text-emerald-800">
                      <span>Мендан қарздор:</span>
                      <span className="font-mono font-bold tabular-nums">
                        {formatMoney(activeReceivable, currency, language, exchangeRate)}
                      </span>
                    </div>
                  ) : activePayable > 0 ? (
                    <div className="flex justify-between items-center text-rose-800">
                      <span>Менинг қарзим:</span>
                      <span className="font-mono font-bold tabular-nums">
                        {formatMoney(activePayable, currency, language, exchangeRate)}
                      </span>
                    </div>
                  ) : (
                    <div className="text-slate-400 text-center py-0.5">
                      Фаол қарзлар йўқ
                    </div>
                  )}
                </div>
              </div>

              {/* Action channels: Call, SMS, Telegram, WhatsApp */}
              <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-100">
                <a
                  href={`tel:${contact.phone}`}
                  className="py-2 flex flex-col items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors text-[10px] font-medium"
                  title="Қўнғироқ қилиш"
                >
                  <Phone className="w-4 h-4 text-emerald-600 mb-0.5" />
                  <span>Тел</span>
                </a>

                <a
                  href={`sms:${contact.phone}?body=${encodeURIComponent(
                    `Ассалому алайкум, ${contact.name}! Қарз дафтари бўйича келишув ҳолатини эслатмоқчи эдим.`
                  )}`}
                  className="py-2 flex flex-col items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors text-[10px] font-medium"
                  title="SMS хабар"
                >
                  <MessageCircle className="w-4 h-4 text-blue-600 mb-0.5" />
                  <span>SMS</span>
                </a>

                {contact.telegram ? (
                  <a
                    href={`https://t.me/${contact.telegram}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2 flex flex-col items-center justify-center rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors text-[10px] font-medium"
                    title="Telegram орқали ёзиш"
                  >
                    <Send className="w-4 h-4 text-blue-500 mb-0.5" />
                    <span>Telegram</span>
                  </a>
                ) : (
                  <div className="py-2 flex flex-col items-center justify-center rounded-lg bg-slate-50 text-slate-300 text-[10px]">
                    <Send className="w-4 h-4 mb-0.5 opacity-40" />
                    <span>Telegram</span>
                  </div>
                )}

                {contact.whatsapp || contact.phone ? (
                  <a
                    href={`https://wa.me/${contact.whatsapp || contact.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `Ассалому алайкум, ${contact.name}! Қарз дафтари эслатмаси.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2 flex flex-col items-center justify-center rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors text-[10px] font-medium"
                    title="WhatsApp"
                  >
                    <Share2 className="w-4 h-4 text-emerald-600 mb-0.5" />
                    <span>WhatsApp</span>
                  </a>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

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
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Telegram (@username)
                  </label>
                  <input
                    type="text"
                    placeholder="doniyor_m"
                    value={newContactTelegram}
                    onChange={e => setNewContactTelegram(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    WhatsApp рақами
                  </label>
                  <input
                    type="tel"
                    placeholder="+998901234567"
                    value={newContactWhatsapp}
                    onChange={e => setNewContactWhatsapp(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
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
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddContactModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
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
