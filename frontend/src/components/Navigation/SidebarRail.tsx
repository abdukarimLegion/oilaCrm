import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getT } from '../../constants/translations';
import {
  LayoutGrid,
  Receipt,
  Target,
  HandCoins,
  BarChart3,
  Sparkles,
  Settings,
  RefreshCw,
  Plus,
  SlidersHorizontal,
  Tag,
  X,
  Filter,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const SidebarRail: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    openAddTxModal,
    openPresentation,
    totalUrgentAlertsCount,
    resetToSampleData,
    language,
    selectedTagFilter,
    setSelectedTagFilter,
    allTags,
  } = useApp();

  const t = getT(language);

  const [isTagFlyoutOpen, setIsTagFlyoutOpen] = useState(false);
  const flyoutRef = useRef<HTMLDivElement>(null);

  // Close flyout on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (flyoutRef.current && !flyoutRef.current.contains(e.target as Node)) {
        setIsTagFlyoutOpen(false);
      }
    };
    if (isTagFlyoutOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTagFlyoutOpen]);

  const navItems = [
    {
      key: 'dashboard' as const,
      icon: LayoutGrid,
      label: t.navDashboard,
    },
    {
      key: 'transactions' as const,
      icon: Receipt,
      label: t.navTransactions,
    },
    {
      key: 'analytics' as const,
      icon: BarChart3,
      label: t.navAnalytics,
    },
    {
      key: 'goals' as const,
      icon: Target,
      label: t.navGoals,
    },
    {
      key: 'debts' as const,
      icon: HandCoins,
      label: t.navDebts,
      badge: totalUrgentAlertsCount > 0 ? totalUrgentAlertsCount : undefined,
    },
    {
      key: 'budget' as const,
      icon: SlidersHorizontal,
      label: language === 'uz_cyrl' ? 'Бюджет' : 'Budget',
    },
  ];

  const getTagColorClass = (tag: string, isSelected: boolean) => {
    const t = tag.toLowerCase();
    if (isSelected) return 'bg-slate-900 text-white font-bold border-slate-900 shadow-xs';
    if (t.includes('urgent') || t.includes('шошилинч')) return 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100';
    if (t.includes('shopping') || t.includes('харид')) return 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100';
    if (t.includes('gift') || t.includes('соға')) return 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100';
    if (t.includes('work') || t.includes('salary') || t.includes('иш')) return 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100';
    if (t.includes('family') || t.includes('оила')) return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
    return 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200';
  };

  return (
    <aside className="hidden lg:flex flex-col items-center justify-between w-18 h-[calc(100vh-2.5rem)] sticky top-5 bg-white dark:bg-slate-900 rounded-3xl p-3 shadow-xs border border-black/[0.04] dark:border-white/[0.04] shrink-0 z-20 transition-colors duration-300">
      {/* Top Group: Brand / Active Tab Icon */}
      <div className="flex flex-col items-center gap-3 w-full">
        {/* Main Brand Action button */}
        <button
          onClick={() => setActiveTab('dashboard')}
          title="Бош ойна"
          className="w-12 h-12 rounded-2xl bg-[#1c211e] text-white flex items-center justify-center hover:bg-[#2c332f] active:scale-95 transition-all shadow-sm group"
        >
          <LayoutGrid className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>

        {/* Separator hairline */}
        <div className="w-8 h-[1px] bg-slate-100 my-1" />

        {/* Navigation Items */}
        <div className="flex flex-col items-center gap-2 w-full">
          {navItems.map(item => {
            const isActive = activeTab === item.key;
            const Icon = item.icon;

            return (
              <button
                key={item.key}
                onClick={() => {
                  setActiveTab(item.key);
                  if (item.key !== 'transactions') {
                    // Don't reset tag filter automatically unless user manually clears it
                  }
                }}
                title={item.label}
                className={`relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-[#f3f0ea] text-[#1c211e] font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Dedicated Tag Filter Sidebar Action Button */}
          <div className="relative" ref={flyoutRef}>
            <button
              onClick={() => setIsTagFlyoutOpen(!isTagFlyoutOpen)}
              title={
                selectedTagFilter
                  ? `Сараланган тег: ${selectedTagFilter}`
                  : language === 'uz_cyrl'
                  ? 'Теглар бўйича саралаш (#urgent, #shopping)'
                  : 'Teglar bo\'yicha saralash (#urgent, #shopping)'
              }
              className={`relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                selectedTagFilter
                  ? 'bg-amber-500 text-white font-bold shadow-xs animate-pulse'
                  : isTagFlyoutOpen
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Tag className="w-5 h-5" />
              {selectedTagFilter && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-slate-900 text-white text-[9px] font-bold flex items-center justify-center border border-white">
                  ✓
                </span>
              )}
            </button>

            {/* Tag Filter Sidebar Popover Flyout Menu */}
            <AnimatePresence>
              {isTagFlyoutOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -10, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-14 top-0 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 text-slate-800"
                >
                  <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-bold text-slate-900">
                        {language === 'uz_cyrl' ? 'Теглар бўйича фильтр' : 'Teglar bo\'yicha filtr'}
                      </span>
                    </div>
                    <button
                      onClick={() => setIsTagFlyoutOpen(false)}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500 mb-3">
                    Амалиётларни теглар бўйича саралаб кўриш:
                  </p>

                  {/* Active Selected Tag Banner */}
                  {selectedTagFilter ? (
                    <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-amber-900">
                          {selectedTagFilter}
                        </span>
                        <span className="text-[10px] text-amber-700 bg-amber-200/60 px-1.5 py-0.5 rounded-md font-mono">
                          актив
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedTagFilter(null);
                        }}
                        className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 underline"
                      >
                        Тозалаш
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedTagFilter(null);
                        setActiveTab('transactions');
                        setIsTagFlyoutOpen(false);
                      }}
                      className="w-full text-left text-xs font-medium text-slate-600 hover:text-slate-900 p-2 rounded-lg bg-slate-50 hover:bg-slate-100 mb-3 flex items-center justify-between"
                    >
                      <span>Барча амалиётлар (Фильтрсиз)</span>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    </button>
                  )}

                  {/* List of Available Tag Chips */}
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {allTags.map(({ tag, count }) => {
                      const isSelected = selectedTagFilter === tag;
                      return (
                        <button
                          key={tag}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedTagFilter(null);
                            } else {
                              setSelectedTagFilter(tag);
                              setActiveTab('transactions');
                            }
                            setIsTagFlyoutOpen(false);
                          }}
                          className={`w-full px-2.5 py-1.5 rounded-xl border text-xs flex items-center justify-between transition-all ${getTagColorClass(
                            tag,
                            isSelected
                          )}`}
                        >
                          <span className="font-semibold font-mono">{tag}</span>
                          <span className="text-[10px] opacity-80 bg-white/40 px-1.5 py-0.5 rounded-full font-mono font-bold">
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 2026 Presentation Mode Trigger */}
          <button
            onClick={openPresentation}
            title={language === 'uz_cyrl' ? '2026 Интерактив Тақдимот' : '2026 Interaktiv Taqdimot'}
            className="w-11 h-11 rounded-2xl text-[#547f69] hover:bg-[#547f69]/10 flex items-center justify-center transition-all"
          >
            <Sparkles className="w-5 h-5 text-[#547f69] animate-pulse" />
          </button>
        </div>
      </div>

      {/* Bottom Group: Quick Add, Reset, Profile Avatar */}
      <div className="flex flex-col items-center gap-3 w-full">
        {/* Quick Add Button */}
        <button
          onClick={openAddTxModal}
          title={language === 'uz_cyrl' ? 'Янги амалиёт қўшиш' : 'Yangi amaliyot qo\'shish'}
          className="w-11 h-11 rounded-2xl bg-[#547f69] text-white flex items-center justify-center hover:bg-[#466d59] active:scale-95 transition-all shadow-xs"
        >
          <Plus className="w-5 h-5" />
        </button>

        {/* Reset sample data */}
        <button
          onClick={() => {
            if (window.confirm(language === 'uz_cyrl' ? 'Барча маълумотларни намунавий ҳолатга қайтарасизми?' : 'Barcha ma\'lumotlarni namunaviy holatga qaytarasizmi?')) {
              resetToSampleData();
            }
          }}
          title={language === 'uz_cyrl' ? 'Намунавий маълумотларни тиклаш' : 'Namunaviy ma\'lumotlarni tiklash'}
          className="w-10 h-10 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 flex items-center justify-center transition-all"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* User Avatar matching screenshot */}
        <div
          title="Сардор Раҳимов (Оила бошлиғи)"
          className="w-11 h-11 rounded-full bg-[#f6d776] border-2 border-white shadow-xs flex items-center justify-center overflow-hidden cursor-pointer hover:scale-105 transition-transform"
        >
          <span className="text-xl" role="img" aria-label="avatar">
            👨‍💼
          </span>
        </div>
      </div>
    </aside>
  );
};
