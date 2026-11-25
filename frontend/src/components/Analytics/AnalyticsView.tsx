import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { getT } from '../../constants/translations';
import { formatMoney, formatCompactMoney } from '../../utils/formatters';
import { CategoryIcon } from '../Common/CategoryIcon';
import { TrendingUp, Users, Wallet, ShieldCheck } from 'lucide-react';
import { ExpenseHierarchyDashboard } from './ExpenseHierarchyDashboard';

export const AnalyticsView: React.FC = () => {
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
  } = useApp();

  const t = getT(language);

  // Income sources breakdown
  const incomeBreakdown = useMemo(() => {
    const incomeCats = categories.filter(c => c.type === 'income');
    const incomeTxs = transactions.filter(t => t.type === 'income');
    const totalInc = incomeTxs.reduce((sum, t) => sum + t.amount, 0);

    return incomeCats.map(cat => {
      const amount = incomeTxs
        .filter(t => t.categoryId === cat.id)
        .reduce((sum, t) => sum + t.amount, 0);
      const percent = totalInc > 0 ? (amount / totalInc) * 100 : 0;
      return {
        ...cat,
        amount,
        percent,
      };
    }).sort((a, b) => b.amount - a.amount);
  }, [categories, transactions]);

  // Family members spending & earnings
  const memberAnalytics = useMemo(() => {
    return members.map(m => {
      const earned = transactions
        .filter(t => t.memberId === m.id && t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const spent = transactions
        .filter(t => t.memberId === m.id && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        ...m,
        earned,
        spent,
        net: earned - spent,
      };
    });
  }, [members, transactions]);

  // Financial Net Worth
  const totalWallets = wallets.reduce((sum, w) => sum + w.balance, 0);
  const totalGoalsSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalReceivable = debts.filter(d => d.type === 'they_owe' && d.status !== 'settled').reduce((sum, d) => sum + d.remainingAmount, 0);
  const totalPayable = debts.filter(d => d.type === 'i_owe' && d.status !== 'settled').reduce((sum, d) => sum + d.remainingAmount, 0);

  const totalAssets = totalWallets + totalGoalsSaved + totalReceivable;
  const netWorth = totalAssets - totalPayable;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t.navAnalytics}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Оилавий бюджетнинг комплекс молиявий таҳлили ва ҳисоботлари
        </p>
      </div>

      {/* Net Worth Summary Strip */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Оилавий соф капитал (Net Worth)
            </span>
            <div className="text-3xl font-bold font-mono tabular-nums text-white mt-1">
              {formatMoney(netWorth, currency, language, exchangeRate)}
              <span className="text-sm text-slate-400 ml-2">
                (~${formatCompactMoney(netWorth / exchangeRate, 'USD', language, exchangeRate)})
              </span>
            </div>
            <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Молиявий барқарорлик: Юқори (активлар мажбуриятлардан 10х кўп)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-400 block">Ҳамёнларда:</span>
              <span className="text-slate-200 font-bold tabular-nums">
                {formatCompactMoney(totalWallets, currency, language, exchangeRate)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Жамғармаларда:</span>
              <span className="text-emerald-400 font-bold tabular-nums">
                {formatCompactMoney(totalGoalsSaved, currency, language, exchangeRate)}
                <span className="text-[10px] text-slate-500 ml-1">
                  (~${formatCompactMoney(totalGoalsSaved / exchangeRate, 'USD', language, exchangeRate)})
                </span>
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Ундириладиган:</span>
              <span className="text-blue-400 font-bold tabular-nums">
                {formatCompactMoney(totalReceivable, currency, language, exchangeRate)}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <span>Жами активлар: <strong className="text-slate-200">{formatMoney(totalAssets, currency, language, exchangeRate)}</strong></span>
          <span>Жами мажбуриятлар (қарз): <strong className="text-rose-400">-{formatMoney(totalPayable, currency, language, exchangeRate)}</strong></span>
        </div>
      </div>

      {/* Modern Expense Hierarchy & Distribution Dashboard */}
      <ExpenseHierarchyDashboard />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Sources Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Даромад манбалари тақсимоти
            </h3>
          </div>

          <div className="space-y-4">
            {incomeBreakdown.map(cat => {
              const catName = language === 'uz_cyrl' ? cat.name_cyrl : cat.name_latn;
              return (
                <div key={cat.id} className="text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-5 h-5 rounded flex items-center justify-center text-white"
                        style={{ backgroundColor: cat.color }}
                      >
                        <CategoryIcon name={cat.icon} className="w-3 h-3" />
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{catName}</span>
                    </div>
                    <div className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                      {formatMoney(cat.amount, currency, language, exchangeRate)}
                      <span className="text-slate-400 text-[11px] ml-1.5 font-normal">
                        ({cat.percent.toFixed(1)}%)
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${cat.percent}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Family Member Matrix */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Оила аъзоларининг ҳиссаси ва харажатлари
            </h3>
          </div>

          <div className="space-y-4">
            {memberAnalytics.map(m => {
              const name = language === 'uz_cyrl' ? m.name_cyrl : m.name_latn;
              const role = language === 'uz_cyrl' ? m.role_cyrl : m.role_latn;

              return (
                <div key={m.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-full text-white font-bold flex items-center justify-center text-xs"
                        style={{ backgroundColor: m.avatarColor }}
                      >
                        {name[0]}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">{name}</span>
                        <span className="text-[10px] text-slate-400">{role}</span>
                      </div>
                    </div>

                    <div className="text-right font-mono font-bold">
                      <span className={m.net >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}>
                        {m.net >= 0 ? '+' : ''}{formatMoney(m.net, currency, language, exchangeRate)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1.5 border-t border-slate-200 dark:border-slate-700 text-slate-500 font-mono">
                    <div>
                      <span>Кирим: </span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        +{formatCompactMoney(m.earned, currency, language, exchangeRate)}
                      </strong>
                    </div>
                    <div className="text-right">
                      <span>Чиқим: </span>
                      <strong className="text-rose-600 dark:text-rose-400 font-semibold">
                        -{formatCompactMoney(m.spent, currency, language, exchangeRate)}
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Wallets liquidity distribution */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            Ҳамёнлар ва банк карталаридаги қолдиқлар
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {wallets.map(w => {
            const wName = language === 'uz_cyrl' ? w.name_cyrl : w.name_latn;
            const pct = totalWallets > 0 ? (w.balance / totalWallets) * 100 : 0;

            return (
              <div key={w.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{wName}</span>
                  <span className="text-[10px] font-mono text-slate-400">{pct.toFixed(0)}%</span>
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                  {formatMoney(w.balance, currency, language, exchangeRate)}
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: w.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
