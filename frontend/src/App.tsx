import React, { useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { SidebarRail } from './components/Navigation/SidebarRail';
import { TopBar } from './components/Navigation/TopBar';
import { CarlicDashboardView } from './components/Dashboard/CarlicDashboardView';
import { TransactionsView } from './components/Transactions/TransactionsView';
import { SavingsGoalsView } from './components/Goals/SavingsGoalsView';
import { DebtLedgerView } from './components/DebtLedger/DebtLedgerView';
import { MobileBottomNav } from './components/Mobile/MobileBottomNav';
import { AddTransactionModal } from './components/Modals/AddTransactionModal';
import { AddGoalModal } from './components/Modals/AddGoalModal';
import { AddDebtModal } from './components/Modals/AddDebtModal';
import { WalletsModal } from './components/Modals/WalletsModal';
import { NotificationsModal } from './components/Modals/NotificationsModal';
import { CategoryLimitsModal } from './components/Modals/CategoryLimitsModal';
import { CategoryLimitToast } from './components/Common/CategoryLimitToast';
import { SmartReceiptScannerModal } from './components/Common/SmartReceiptScannerModal';
import { Presentation2026 } from './components/Presentation/Presentation2026';

import { motion, AnimatePresence } from 'motion/react';

import { AnalyticsView } from './components/Analytics/AnalyticsView';
import { BudgetPlanner } from './components/Budget/BudgetPlanner';
import { MainTabType } from './types';

const ROUTE_TO_TAB: Record<string, MainTabType> = {
  '/': 'dashboard',
  '/transactions': 'transactions',
  '/analytics': 'analytics',
  '/goals': 'goals',
  '/debts': 'debts',
  '/budget': 'budget',
};

/** Router — asosiy tab navigation'ning manzili; activeTab state bilan sinxron */
function RouteSync() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setActiveTab, activeTab } = useApp();

  const TAB_TO_ROUTE: Record<MainTabType, string> = {
    dashboard: '/',
    transactions: '/transactions',
    analytics: '/analytics',
    goals: '/goals',
    debts: '/debts',
    budget: '/budget',
    calendar: '/transactions',
  };

  // tab → URL (nav komponentlardan setActiveTab chaqirilsa, URL ham yangilanadi)
  // urlSyncRef — URL o'zgarishidan kelgan tab yangilanishini qayt "echo" qilmaslik uchun
  const urlSyncRef = useRef(false);
  useEffect(() => {
    const tab = ROUTE_TO_TAB[location.pathname];
    urlSyncRef.current = true;
    if (tab) setActiveTab(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    if (urlSyncRef.current) {
      urlSyncRef.current = false;
      return;
    }
    const target = TAB_TO_ROUTE[activeTab];
    if (target && location.pathname !== target) {
      navigate(target);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  return null;
}

function MainContent() {
  const {
    activeTab,
    setActiveTab,
    language,
    currency,
    exchangeRate,
    isLoaded,
    isPresentationOpen,
    closePresentation,
    isReceiptScannerOpen,
    closeReceiptScanner,
    isNotificationsModalOpen,
    closeNotificationsModal,
    isCategoryLimitsModalOpen,
    closeCategoryLimitsModal,
    openCategoryLimitsModal,
    activeLimitToast,
    clearLimitToast,
  } = useApp();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#f3f0ea] dark:bg-slate-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.1, ease: 'linear' }}
              className="block w-8 h-8 rounded-full border-[3px] border-emerald-500/30 border-t-emerald-500"
            />
          </div>
          <p className="text-lg font-semibold opacity-70">Оилавий Бюджет CRM юкланмоқда...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f0ea] dark:bg-slate-950 text-[#1c211e] dark:text-slate-100 p-3 sm:p-5 lg:p-6 pb-24 md:pb-6 flex gap-5 font-sans transition-colors duration-300">
      {/* Real-time Category Limit Breach Toast Alert */}
      <CategoryLimitToast
        alert={activeLimitToast}
        onDismiss={clearLimitToast}
        onOpenLimits={openCategoryLimitsModal}
        currency={currency}
        language={language}
        exchangeRate={exchangeRate}
      />

      {/* Left Vertical Floating Pill Dock / Sidebar (Desktop) */}
      <SidebarRail />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 max-w-[1440px]">
        {/* TopBar with Sunburst Logo, Welcome Greeting & Capsule Search */}
        <TopBar />

        {/* View Transition Canvas */}
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
            >
              <Routes>
                <Route path="/transactions" element={<TransactionsView />} />
                <Route path="/analytics" element={<AnalyticsView />} />
                <Route path="/goals" element={<SavingsGoalsView />} />
                <Route path="/debts" element={<DebtLedgerView />} />
                <Route path="/budget" element={<BudgetPlanner />} />
                <Route path="/" element={<CarlicDashboardView />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Global Modals */}
      <AddTransactionModal />
      <AddGoalModal />
      <AddDebtModal />
      <WalletsModal />
      <NotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={closeNotificationsModal}
        onOpenCategoryLimits={openCategoryLimitsModal}
      />
      <CategoryLimitsModal
        isOpen={isCategoryLimitsModalOpen}
        onClose={closeCategoryLimitsModal}
      />
      <SmartReceiptScannerModal isOpen={isReceiptScannerOpen} onClose={closeReceiptScanner} />

      {/* 2026 Interactive Presentation Showcase Overlay */}
      <AnimatePresence>
        {isPresentationOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-50"
          >
            <Presentation2026 onClose={closePresentation} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Fixed Bottom Tab Bar */}
      <MobileBottomNav />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <RouteSync />
      <MainContent />
    </AppProvider>
  );
}
