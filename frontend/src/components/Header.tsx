import React from 'react';
import { useApp } from '../context/AppContext';
import { getT } from '../constants/translations';
import { Plus, Bell, RefreshCw, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    language,
    setLanguage,
    currency,
    setCurrency,
    activeTab,
    setActiveTab,
    openAddTxModal,
    openPresentation,
    urgentDebtsCount,
    totalUrgentAlertsCount,
    resetToSampleData,
  } = useApp();

  const t = getT(language);

  interface NavItem {
    key: 'dashboard' | 'transactions' | 'goals' | 'debts';
    label: string;
    badge?: number;
  }

  const navItems: NavItem[] = [
    {
      key: 'dashboard',
      label: language === 'uz_cyrl' ? 'Бош ойна & Таҳлил' : 'Bosh oyna & Tahlil',
    },
    {
      key: 'transactions',
      label: language === 'uz_cyrl' ? 'Амалиёт & Обуналар' : 'Amaliyot & Obunalar',
    },
    {
      key: 'goals',
      label: t.navGoals,
    },
    {
      key: 'debts',
      label: language === 'uz_cyrl' ? 'Қарз & Контактлар' : 'Qarz & Kontaktlar',
      badge: totalUrgentAlertsCount > 0 ? totalUrgentAlertsCount : undefined,
    },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single Brand wordmark element */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="text-left font-bold text-lg tracking-tight text-slate-900 flex items-center gap-2 whitespace-nowrap shrink-0 hover:opacity-85 transition-opacity"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                Б
              </div>
              <span>{t.appName}</span>
            </button>
          </div>

          {/* Zone 2: 4-5 concise single-line nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => {
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-xs flex items-center justify-center font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Actions + Currency & Language Toggles */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Currency switcher */}
            <div className="flex items-center rounded-md border border-slate-200 p-0.5 bg-slate-50">
              <button
                onClick={() => setCurrency('UZS')}
                className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                  currency === 'UZS'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                UZS
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                  currency === 'USD'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                USD
              </button>
            </div>

            {/* Language Switcher */}
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
              title="Тилни ўзгартириш / Change Language"
              className="text-xs font-medium text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
            >
              {language === 'uz_cyrl' && 'Ўзб (Кир)'}
              {language === 'uz_latn' && 'O\'zb (Lot)'}
              {language === 'ru' && 'Русский'}
              {language === 'en' && 'English'}
            </button>

            {/* Reset data helper */}
            <button
              onClick={() => {
                const resetConfirmText =
                  language === 'ru'
                    ? 'Сбросить все данные к исходным образцам?'
                    : language === 'en'
                    ? 'Reset all data to sample state?'
                    : language === 'uz_latn'
                    ? 'Barcha ma\'lumotlarni namunaviy holatga qaytarasizmi?'
                    : 'Барча маълумотларни намунавий ҳолатга қайтарасизми?';
                if (window.confirm(resetConfirmText)) {
                  resetToSampleData();
                }
              }}
              title={
                language === 'ru'
                  ? 'Восстановить примеры данных'
                  : language === 'en'
                  ? 'Restore Sample Data'
                  : language === 'uz_latn'
                  ? 'Namunaviy ma\'lumotlarni tiklash'
                  : 'Намунавий маълумотларни тиклаш'
              }
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-md hover:bg-slate-100 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            {/* 2026 Interactive Presentation Showcase Button */}
            <button
              onClick={openPresentation}
              title={
                language === 'ru'
                  ? 'Открыть интерактивный 3D режим презентации 2026'
                  : language === 'en'
                  ? 'Open 2026 Interactive 3D Presentation Mode'
                  : language === 'uz_latn'
                  ? '2026 Interaktiv 3D Taqdimot rejimini ochish'
                  : '2026 Интерактив 3D Тақдимот режимини очиш'
              }
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-cyan-900 bg-gradient-to-r from-cyan-100 via-emerald-50 to-teal-100 hover:from-cyan-200 hover:to-emerald-200 border border-cyan-300/80 rounded-lg transition-all shadow-xs active:scale-95 whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-600 animate-pulse" />
              <span className="hidden sm:inline">2026 Тақдимот</span>
              <span className="sm:hidden">2026 ✨</span>
            </button>

            {/* Primary Action Button */}
            <button
              onClick={openAddTxModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 active:scale-98 transition-all shadow-sm whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{t.quickAdd}</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-between overflow-x-auto py-2 border-t border-slate-100 gap-2 no-scrollbar">
          {navItems.map(item => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`px-3 py-1 text-xs font-medium rounded whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {item.label}
                {item.badge !== undefined && ` (${item.badge})`}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
