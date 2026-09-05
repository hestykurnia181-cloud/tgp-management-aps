/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SwitchBusinessDialog } from './components/Dialogs';
import { TgpBottomBar } from './components/TgpBottomBar';
import { TgpTopBar } from './components/TgpTopBar';
import { TgpProvider, useTgp } from './context/TgpContext';
import { ApprovalScreen } from './screens/ApprovalScreen';
import { AttendanceScreen } from './screens/AttendanceScreen';
import { AuditLogViewerScreen } from './screens/AuditLogViewerScreen';
import { BusinessHomeScreen } from './screens/BusinessHomeScreen';
import { DamagedGoodsScreen } from './screens/DamagedGoodsScreen';
import { FinanceScreen } from './screens/FinanceScreen';
import { InventoryScreen } from './screens/InventoryScreen';
import { LoginScreen } from './screens/LoginScreen';
import { MasterDashboardScreen } from './screens/MasterDashboardScreen';
import { OwnerDashboardScreen } from './screens/OwnerDashboardScreen';
import { PosScreen } from './screens/PosScreen';
import { ReportsScreen } from './screens/ReportsScreen';
import { StanOutletScreen } from './screens/StanOutletScreen';
import { TransferScreen } from './screens/TransferScreen';

const AppContent: React.FC = () => {
  const { currentSession, activeScreen, userMessage, errorMessage, clearMessages } = useTgp();
  const [isSwitchBizOpen, setIsSwitchBizOpen] = useState(false);

  // If not logged in, always show login screen
  if (!currentSession || activeScreen === 'LOGIN') {
    return <LoginScreen />;
  }

  const renderScreen = () => {
    switch (activeScreen) {
      case 'MASTER_DASHBOARD':
        return <MasterDashboardScreen />;
      case 'OWNER_DASHBOARD':
        return <OwnerDashboardScreen />;
      case 'BUSINESS_HOME':
        return <BusinessHomeScreen />;
      case 'POS_MODULE':
        return <PosScreen />;
      case 'INVENTORY_MODULE':
        return <InventoryScreen />;
      case 'STAN_OUTLET_MODULE':
        return <StanOutletScreen />;
      case 'TRANSFER_MODULE':
        return <TransferScreen />;
      case 'APPROVAL_MODULE':
        return <ApprovalScreen />;
      case 'FINANCE_MODULE':
        return <FinanceScreen />;
      case 'DAMAGED_GOODS_MODULE':
        return <DamagedGoodsScreen />;
      case 'ATTENDANCE_MODULE':
        return <AttendanceScreen />;
      case 'REPORTS_MODULE':
        return <ReportsScreen />;
      case 'AUDIT_LOG_VIEWER':
        return <AuditLogViewerScreen />;
      default:
        return <BusinessHomeScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Navigation Bar */}
      <TgpTopBar onOpenSwitchBiz={() => setIsSwitchBizOpen(true)} />

      {/* Floating System Messages */}
      {(userMessage || errorMessage) && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md animate-in fade-in slide-in-from-top-4 duration-200">
          <div
            onClick={clearMessages}
            className={`p-3.5 rounded-2xl shadow-xl border cursor-pointer flex items-center justify-between text-xs font-semibold ${
              errorMessage
                ? 'bg-rose-900 text-rose-100 border-rose-700'
                : 'bg-slate-900 text-emerald-300 border-slate-700'
            }`}
          >
            <span>{errorMessage || userMessage}</span>
            <span className="text-[10px] opacity-70 ml-2 hover:opacity-100">&times;</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {renderScreen()}
      </main>

      {/* Switch Business Dialog */}
      <SwitchBusinessDialog
        isOpen={isSwitchBizOpen}
        onClose={() => setIsSwitchBizOpen(false)}
      />

      {/* Bottom Navigation for Mobile & Quick Shortcuts */}
      <TgpBottomBar />
    </div>
  );
};

export default function App() {
  return (
    <TgpProvider>
      <AppContent />
    </TgpProvider>
  );
}
