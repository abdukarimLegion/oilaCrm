import React from 'react';
import { useApp } from '../../context/AppContext';
import { getT } from '../../constants/translations';
import {
  LayoutDashboard,
  Receipt,
  BarChart3,
  SlidersHorizontal,
  BookOpen,
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { activeTab, setActiveTab, language, totalUrgentAlertsCount } = useApp();
  const t = getT(language);

  const navItems = [
    {
      key: 'dashboard' as const,
      label: language === 'uz_cyrl' ? 'Бош ойна' : 'Bosh oyna',
      icon: LayoutDashboard,
    },
    {
      key: 'transactions' as const,
      label: language === 'uz_cyrl' ? 'Амалиёт' : 'Amaliyot',
      icon: Receipt,
    },
    {
      key: 'analytics' as const,
      label: language === 'uz_cyrl' ? 'Таҳлил' : 'Tahlil',
      icon: BarChart3,
    },
    {
      key: 'budget' as const,
      label: language === 'uz_cyrl' ? 'Бюджет' : 'Budget',
      icon: SlidersHorizontal,
    },
    {
      key: 'debts' as const,
      label: language === 'uz_cyrl' ? 'Қарзлар' : 'Qarzlar',
      icon: BookOpen,
      badge: totalUrgentAlertsCount > 0 ? totalUrgentAlertsCount : undefined,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-black/[0.04] shadow-lg md:hidden">
      <div className="grid grid-cols-5 h-16 max-w-md mx-auto items-center px-1">
        {navItems.map(item => {
          const isActive = activeTab === item.key;
          const Icon = item.icon;

          return (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] py-1 transition-all active:scale-95 relative ${
                isActive
                  ? 'text-[#547f69] font-extrabold'
                  : 'text-[#797e7a] hover:text-[#1c211e]'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 text-[#547f69] stroke-[2.3]' : 'stroke-[1.8]'
                  }`}
                />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-1 truncate max-w-[62px]">
                {item.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#547f69] mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
