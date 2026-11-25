import React from 'react';
import { useApp } from '../../context/AppContext';
import { getT } from '../../constants/translations';
import { formatMoney, formatDateUz } from '../../utils/formatters';
import { CategoryIcon } from '../Common/CategoryIcon';
import { ArrowRight, Trash2 } from 'lucide-react';

export const RecentTransactions: React.FC = () => {
  const {
    transactions,
    categories,
    wallets,
    members,
    currency,
    language,
    exchangeRate,
    deleteTransaction,
    setActiveTab,
    openAddTxModal,
  } = useApp();

  const t = getT(language);

  // Take top 6 latest transactions
  const latestTxs = [...transactions]
    .sort((a, b) => (b.date > a.date ? 1 : -1))
    .slice(0, 6);

  const getCategory = (id: string) => categories.find(c => c.id === id);
  const getWallet = (id: string) => wallets.find(w => w.id === id);
  const getMember = (id: string) => members.find(m => m.id === id);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            {t.recentTransactionsTitle}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Охирги киритилган операциялар рўйхати
          </p>
        </div>

        <button
          onClick={() => setActiveTab('transactions')}
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 hover:underline"
        >
          <span>{t.viewAll}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {latestTxs.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-xs">
          Ҳозирча операциялар мавжуд эмас. Янгисини қўшиш учун тугмани босинг.
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {latestTxs.map(tx => {
            const cat = getCategory(tx.categoryId);
            const wal = getWallet(tx.walletId);
            const mem = getMember(tx.memberId);
            const isIncome = tx.type === 'income';

            return (
              <div
                key={tx.id}
                className="py-3 flex items-center justify-between gap-3 group hover:bg-slate-50/60 -mx-2 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-white"
                    style={{ backgroundColor: cat?.color || '#94A3B8' }}
                  >
                    <CategoryIcon name={cat?.icon || 'MoreHorizontal'} className="w-4 h-4" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-xs sm:text-sm truncate">
                        {language === 'uz_cyrl' ? cat?.name_cyrl : cat?.name_latn}
                      </span>
                      {tx.note && (
                        <span className="hidden sm:inline text-xs text-slate-500 truncate">
                          · {tx.note}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{formatDateUz(tx.date, language)}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-600">
                        {language === 'uz_cyrl' ? wal?.name_cyrl : wal?.name_latn}
                      </span>
                      {mem && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-slate-500">
                            {language === 'uz_cyrl' ? mem.name_cyrl : mem.name_latn}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span
                      className={`font-mono text-xs sm:text-sm font-bold tabular-nums ${
                        isIncome ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                    >
                      {isIncome ? '+' : '-'}
                      {formatMoney(tx.amount, currency, language, exchangeRate)}
                    </span>
                  </div>

                  <button
                    onClick={() => deleteTransaction(tx.id)}
                    title="Ўчириш"
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
