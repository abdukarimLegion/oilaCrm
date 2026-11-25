import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { RefreshCw, ArrowLeftRight, DollarSign } from 'lucide-react';
import { formatMoney } from '../../utils/formatters';

export const CurrencyConverter: React.FC = () => {
  const { liveRates, language, currency: appCurrency, exchangeRate: appExchangeRate } = useApp();
  
  const [amount, setAmount] = useState<string>('1');
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('UZS');
  const [result, setResult] = useState<number>(0);

  const currencies = ['UZS', 'USD', 'EUR', 'RUB'];

  const calculateConversion = () => {
    const numAmount = parseFloat(amount) || 0;
    if (numAmount === 0) {
      setResult(0);
      return;
    }

    // Convert fromSource to UZS (base)
    let amountInUZS = numAmount;
    if (fromCurrency === 'USD') amountInUZS = numAmount * liveRates.USD;
    else if (fromCurrency === 'EUR') amountInUZS = numAmount * liveRates.EUR;
    else if (fromCurrency === 'RUB') amountInUZS = numAmount * liveRates.RUB;

    // Convert from UZS to toSource
    let finalAmount = amountInUZS;
    if (toCurrency === 'USD') finalAmount = amountInUZS / liveRates.USD;
    else if (toCurrency === 'EUR') finalAmount = amountInUZS / liveRates.EUR;
    else if (toCurrency === 'RUB') finalAmount = amountInUZS / liveRates.RUB;

    setResult(finalAmount);
  };

  useEffect(() => {
    calculateConversion();
  }, [amount, fromCurrency, toCurrency, liveRates]);

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-black/[0.04] dark:border-white/[0.04] shadow-xs flex flex-col h-full transition-colors duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <RefreshCw className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            {language === 'uz_cyrl' ? 'Валюта айирбошлаш' : 'Currency Converter'}
          </h3>
        </div>
        <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
          Live Rates
        </div>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-4 py-3 text-lg font-black font-mono tabular-nums text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
            placeholder="0.00"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-2 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              {currencies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={swapCurrencies}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            <ArrowLeftRight className="w-4 h-4 rotate-90" />
          </button>
        </div>

        <div className="relative">
          <div className="w-full bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/30 rounded-2xl px-4 py-3 min-h-[52px] flex items-center justify-between">
            <div className="text-lg font-black font-mono tabular-nums text-emerald-700 dark:text-emerald-400">
              {toCurrency === 'UZS' 
                ? formatMoney(result, 'UZS', language, liveRates)
                : toCurrency === 'USD'
                ? `$${result.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                : `${result.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${toCurrency}`
              }
            </div>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-2 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              {currencies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span>{language === 'uz_cyrl' ? 'Курс' : 'Rate'}</span>
          <span>1 {fromCurrency} = {(result / (parseFloat(amount) || 1)).toLocaleString(undefined, { maximumFractionDigits: 2 })} {toCurrency}</span>
        </div>
      </div>
    </div>
  );
};
