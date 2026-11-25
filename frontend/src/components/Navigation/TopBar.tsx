import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getT } from '../../constants/translations';
import {
  Search,
  Bell,
  Sparkles,
  Plus,
  ArrowUpRight,
  Shield,
  Moon,
  Sun,
} from 'lucide-react';

export const TopBar: React.FC = () => {
  const {
    language,
    setLanguage,
    currency,
    setCurrency,
    theme,
    toggleTheme,
    openAddTxModal,
    openPresentation,
    totalUrgentAlertsCount,
    setActiveTab,
    openNotificationsModal,
    wallets,
    goals,
    debts,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      {/* Left: Sunburst Brand Icon & Welcome Greeting */}
      <div className="flex items-center gap-3.5">
        {/* Geometric Sunburst icon matching screenshot */}
        <div className="w-11 h-11 flex items-center justify-center shrink-0">
          <svg
            viewBox="0 0 48 48"
            className="w-10 h-10 text-[#1c211e] dark:text-slate-100"
            fill="currentColor"
          >
            {/* 8 radiating rounded spokes */}
            {Array.from({ length: 8 }).map((_, i) => (
              <rect
                key={i}
                x="21.5"
                y="3"
                width="5"
                height="15"
                rx="2.5"
                transform={`rotate(${i * 45} 24 24)`}
              />
            ))}
            <circle cx="24" cy="24" r="3.5" fill="#547f69" />
          </svg>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#1c211e] dark:text-white tracking-tight">
              {language === 'ru'
                ? 'Здравствуйте, Сардор!'
                : language === 'en'
                ? 'Hello, Sardor!'
                : language === 'uz_latn'
                ? 'Assalomu alaykum, Sardor!'
                : 'Ассалому алайкум, Сардор!'}
            </h1>
            
            {/* Minimal Info Badges moved from the right panel */}
            <div className="hidden lg:flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-black/[0.04] dark:border-white/[0.04] shadow-2xs">
                <span className="text-[10px] font-bold text-[#797e7a] dark:text-slate-400 uppercase tracking-wider">
                  {language === 'uz_cyrl' ? 'Ҳамён' : 'Wallet'}
                </span>
                <span className="text-xs font-black text-[#1c211e] dark:text-slate-100">{wallets.length}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-black/[0.04] dark:border-white/[0.04] shadow-2xs">
                <span className="text-[10px] font-bold text-[#797e7a] dark:text-slate-400 uppercase tracking-wider">
                  {language === 'uz_cyrl' ? 'Жамғарма' : 'Savings'}
                </span>
                <span className="text-xs font-black text-[#1c211e] dark:text-slate-100">{goals.length}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-black/[0.04] dark:border-white/[0.04] shadow-2xs">
                <span className="text-[10px] font-bold text-[#797e7a] dark:text-slate-400 uppercase tracking-wider">
                  {language === 'uz_cyrl' ? 'Қарзлар' : 'Debts'}
                </span>
                <span className="text-xs font-black text-[#1c211e] dark:text-slate-100">{debts.length}</span>
              </div>
              
              {/* Stable Protection Badge */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#e8ede8] dark:bg-emerald-950/30 border border-[#547f69]/10 dark:border-emerald-500/10 shadow-2xs">
                <Shield className="w-3 h-3 text-[#547f69] dark:text-emerald-400" />
                <span className="text-[10px] font-extrabold text-[#547f69] dark:text-emerald-400 uppercase tracking-wider">
                  {language === 'uz_cyrl' ? 'Барқарор ҳимоя!' : 'Stable protection!'}
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-[#797e7a] dark:text-slate-400 font-normal mt-0.5">
            {language === 'ru'
              ? 'Центр управления семейным бюджетом, накоплениями и долгами'
              : language === 'en'
              ? 'Family budget, savings & debt management center'
              : language === 'uz_latn'
              ? 'Oilaviy byudjet, jamg\'armalar va qarzlar boshqaruv markazi'
              : 'Оилавий бюджет, жамғармалар ва қарзлар бошқарув маркази'}
          </p>
        </div>
      </div>

      {/* Right: Search Capsule Pill & Controls */}
      <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
        {/* Capsule Search Bar */}
        <div className="flex items-center bg-white dark:bg-slate-800 rounded-full pl-4 pr-1.5 py-1.5 shadow-xs border border-black/[0.04] dark:border-white/[0.04] w-full sm:w-64 md:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={
              language === 'ru'
                ? 'Поиск...'
                : language === 'en'
                ? 'Search...'
                : language === 'uz_latn'
                ? 'Qidiruv...'
                : 'Қидирув...'
            }
            className="w-full bg-transparent text-xs text-[#1c211e] dark:text-slate-100 placeholder-[#9ca39e] outline-none"
          />
          <button
            onClick={() => {
              if (searchQuery.trim()) {
                setActiveTab('transactions');
              }
            }}
            className="w-8 h-8 rounded-full bg-[#1c211e] dark:bg-slate-700 text-white flex items-center justify-center shrink-0 hover:bg-[#2c332f] dark:hover:bg-slate-600 active:scale-95 transition-all shadow-xs"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Currency Switcher Pill */}
        <div className="flex items-center bg-white dark:bg-slate-800 rounded-full p-1 shadow-xs border border-black/[0.04] dark:border-white/[0.04]">
          <button
            onClick={() => setCurrency('UZS')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all ${
              currency === 'UZS'
                ? 'bg-[#1c211e] dark:bg-slate-700 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
            }`}
          >
            UZS
          </button>
          <button
            onClick={() => setCurrency('USD')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all ${
              currency === 'USD'
                ? 'bg-[#1c211e] dark:bg-slate-700 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
            }`}
          >
            USD
          </button>
        </div>

        {/* Language Switcher Pill */}
        <button
          onClick={() => {
            const nextLang: Record<string, 'uz_cyrl' | 'uz_latn' | 'ru' | 'en'> = {
              uz_cyrl: 'uz_latn',
              uz_latn: 'ru',
              ru: 'en',
              en: 'uz_cyrl',
            };
            setLanguage(nextLang[language] || 'uz_cyrl');
          }}
          className="bg-white dark:bg-slate-800 rounded-full px-3 py-1.5 text-xs font-semibold text-[#1c211e] dark:text-slate-100 shadow-xs border border-black/[0.04] dark:border-white/[0.04] hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
          title="Тилни ўзгартириш / Change Language"
        >
          {language === 'uz_cyrl' && 'Ўзб (Кир)'}
          {language === 'uz_latn' && 'O\'zb (Lot)'}
          {language === 'ru' && 'Русский'}
          {language === 'en' && 'English'}
        </button>

        {/* 2026 Presentation Showcase Pill */}
        <button
          onClick={openPresentation}
          className="bg-gradient-to-r from-[#547f69] to-[#3f6551] text-white rounded-full px-3.5 py-1.5 text-xs font-bold shadow-xs hover:opacity-95 transition-all flex items-center gap-1.5 active:scale-95 whitespace-nowrap"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-200 animate-pulse" />
          <span className="hidden sm:inline">2026 Тақдимот</span>
          <span className="sm:hidden">2026</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 text-[#1c211e] dark:text-slate-100 flex items-center justify-center shadow-xs border border-black/[0.04] dark:border-white/[0.04] hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shrink-0"
          title={theme === 'light' ? 'Тунги режимга ўтиш' : 'Кундузги режимга ўтиш'}
        >
          {theme === 'light' ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>

        {/* Notifications Button with badge */}
        <button
          onClick={openNotificationsModal}
          className="relative w-9 h-9 rounded-full bg-white dark:bg-slate-800 text-[#1c211e] dark:text-slate-100 flex items-center justify-center shadow-xs border border-black/[0.04] dark:border-white/[0.04] hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shrink-0"
          title="Огоҳлантиришлар ва ортиқча сарфланмалар муҳити"
        >
          <Bell className="w-4 h-4 text-slate-700 dark:text-slate-300" />
          {totalUrgentAlertsCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          )}
        </button>
      </div>
    </header>
  );
};
