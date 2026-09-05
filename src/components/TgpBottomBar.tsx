import React from 'react';
import {
  BadgeCheck,
  Building2,
  Coins,
  History,
  Home,
  LayoutDashboard,
  Package,
  ShieldAlert,
  ShoppingCart,
  Store,
} from 'lucide-react';
import { useTgp } from '../context/TgpContext';
import { AppScreen, BusinessModule, UserRole } from '../types';

export const TgpBottomBar: React.FC = () => {
  const { currentSession, activeBusiness, activeScreen, navigateTo, pendingTransfersForOwner, pendingDamagedForOwner } = useTgp();

  if (!currentSession || activeScreen === 'LOGIN' || activeScreen === 'SETUP_MASTER') {
    return null;
  }

  const role = currentSession.user.role;
  const totalPending = pendingTransfersForOwner.length + pendingDamagedForOwner.length;

  interface NavItem {
    screen: AppScreen;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }

  let navItems: NavItem[] = [];

  if (role === UserRole.MASTER) {
    navItems = [
      {
        screen: 'MASTER_DASHBOARD',
        label: 'Platform',
        icon: <LayoutDashboard className="w-5 h-5" />,
      },
      {
        screen: 'AUDIT_LOG_VIEWER',
        label: 'Audit Log',
        icon: <ShieldAlert className="w-5 h-5" />,
      },
    ];
  } else if (role === UserRole.OWNER) {
    navItems = [
      {
        screen: 'OWNER_DASHBOARD',
        label: 'Bisnis',
        icon: <Building2 className="w-5 h-5" />,
      },
      {
        screen: 'BUSINESS_HOME',
        label: 'Operasional',
        icon: <Store className="w-5 h-5" />,
      },
      {
        screen: 'APPROVAL_MODULE',
        label: 'Approval',
        icon: <BadgeCheck className="w-5 h-5" />,
        badge: totalPending > 0 ? totalPending : undefined,
      },
      {
        screen: 'FINANCE_MODULE',
        label: 'Keuangan',
        icon: <Coins className="w-5 h-5" />,
      },
    ];
  } else {
    // ADMIN_OWNER, LEADER, STAFF, CASHIER
    navItems = [
      {
        screen: 'BUSINESS_HOME',
        label: 'Beranda',
        icon: <Home className="w-5 h-5" />,
      },
    ];

    if (activeBusiness?.activeModules.includes(BusinessModule.POS)) {
      navItems.push({
        screen: 'POS_MODULE',
        label: 'Kasir',
        icon: <ShoppingCart className="w-5 h-5" />,
      });
    }

    if (activeBusiness?.activeModules.includes(BusinessModule.INVENTORY)) {
      navItems.push({
        screen: 'INVENTORY_MODULE',
        label: 'Stok',
        icon: <Package className="w-5 h-5" />,
      });
    }

    if (role === UserRole.ADMIN_OWNER || role === UserRole.ADMIN_DIVISI) {
      navItems.push({
        screen: 'APPROVAL_MODULE',
        label: 'Approval',
        icon: <BadgeCheck className="w-5 h-5" />,
      });
    }
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-3">
        {navItems.map((item) => {
          const isActive = activeScreen === item.screen;
          return (
            <button
              key={item.screen}
              onClick={() => navigateTo(item.screen)}
              className={`flex flex-col items-center justify-center flex-1 h-full relative transition-colors ${
                isActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-rose-500 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
              {isActive && (
                <span className="absolute bottom-1 w-6 h-1 bg-blue-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
