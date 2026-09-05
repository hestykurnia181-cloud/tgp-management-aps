import React, { createContext, useContext, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  AppScreen,
  AttendanceEntity,
  AuditLogEntity,
  BomIngredient,
  BusinessEntity,
  BusinessModule,
  BusinessTemplate,
  CartItem,
  DamagedGoodsReportEntity,
  DamagedStatus,
  ItemEntity,
  LedgerTransactionEntity,
  LedgerType,
  MutationType,
  OutletEntity,
  OutletStockEntity,
  PaymentMethod,
  SaleOrderEntity,
  SaleOrderItem,
  StaffDepartment,
  StanTransferEntity,
  StockMutationEntity,
  TransferEntity,
  TransferStatus,
  UserEntity,
  UserPermissions,
  UserRole,
  UserSession,
} from '../types';
import {
  filterAuthorizedBusinesses,
  filterAuthorizedItems,
  filterAuthorizedLedger,
  normalizeUserRole,
} from '../security/authorizationEngine';
import {
  CANONICAL_MASTER_EMAIL,
  CANONICAL_MASTER_NAME,
  CANONICAL_MASTER_PASS,
  INITIAL_AUDIT_LOGS,
  INITIAL_BUSINESSES,
  INITIAL_DAMAGED,
  INITIAL_ITEMS,
  INITIAL_LEDGERS,
  INITIAL_SALES,
  INITIAL_TRANSFERS,
  INITIAL_USERS,
} from '../data/initialData';
import { RealtimeStatus, supabaseSyncService } from '../services/supabaseSyncService';
import { isSupabaseConfigured } from '../lib/supabase';

interface TgpContextType {
  currentSession: UserSession | null;
  activeScreen: AppScreen;
  activeBusinessId: string | null;
  activeBusiness: BusinessEntity | null;
  authorizedBusinesses: BusinessEntity[];
  allBusinesses: BusinessEntity[];
  allOwners: UserEntity[];
  allUsers: UserEntity[];
  allItems: ItemEntity[];
  allTransfers: TransferEntity[];
  allDamagedGoods: DamagedGoodsReportEntity[];
  allStaffForActiveBusiness: UserEntity[];
  activeItems: ItemEntity[];
  activeTransfers: TransferEntity[];
  pendingTransfersForOwner: TransferEntity[];
  activeDamagedReports: DamagedGoodsReportEntity[];
  pendingDamagedForOwner: DamagedGoodsReportEntity[];
  activeLedger: LedgerTransactionEntity[];
  activeSales: SaleOrderEntity[];
  globalOwnerLedger: LedgerTransactionEntity[];
  globalOwnerSales: SaleOrderEntity[];
  globalOwnerItems: ItemEntity[];
  activeAttendances: AttendanceEntity[];
  allAuditLogs: AuditLogEntity[];
  stockMutations: StockMutationEntity[];
  activeStockMutations: StockMutationEntity[];
  outlets: OutletEntity[];
  activeOutlets: OutletEntity[];
  outletStocks: OutletStockEntity[];
  activeOutletStocks: OutletStockEntity[];
  stanTransfers: StanTransferEntity[];
  activeStanTransfers: StanTransferEntity[];
  posCart: CartItem[];
  userMessage: string | null;
  errorMessage: string | null;
  isLoading: boolean;

  // Supabase Realtime State & Actions
  supabaseStatus: RealtimeStatus;
  supabaseStatusMessage: string;
  isSupabaseActive: boolean;
  isSupabaseConfigured: boolean;
  syncAllWithSupabase: () => Promise<void>;

  // Actions
  navigateTo: (screen: AppScreen) => void;
  setActiveBusiness: (businessId: string | null) => void;
  clearMessages: () => void;
  login: (username: string, pass: string) => boolean;
  logout: () => void;
  resetMasterAccount: () => void;
  createOwner: (username: string, pass: string, fullName: string) => boolean;
  createAdminOwner: (
    username: string,
    pass: string,
    fullName: string,
    businessIds: string[],
    role?: UserRole,
    permissions?: UserPermissions
  ) => boolean;
  createStaff: (
    businessId: string,
    username: string,
    pass: string,
    fullName: string,
    role: UserRole,
    outletId?: string | null,
    department?: StaffDepartment,
    permissions?: UserPermissions
  ) => boolean;
  createBusiness: (name: string, template: BusinessTemplate, modules: BusinessModule[]) => boolean;
  updateBusiness: (businessId: string, name: string, template: BusinessTemplate, modules: BusinessModule[]) => boolean;
  createOutlet: (name: string, code: string, location: string, phone?: string) => boolean;
  updateOutlet: (outletId: string, name: string, code: string, location: string, status: 'ACTIVE' | 'INACTIVE') => boolean;
  deleteOutlet: (outletId: string) => boolean;
  transferStockToStan: (outletId: string, itemId: string, quantity: number, notes?: string) => boolean;
  returnStockFromStan: (outletId: string, itemId: string, quantity: number, notes?: string) => boolean;
  toggleBusinessModule: (businessId: string, module: BusinessModule) => boolean;
  getOutletStockQuantity: (outletId: string, itemId: string) => number;
  addItem: (itemData: Omit<ItemEntity, 'itemId' | 'businessId' | 'updatedAt'>) => boolean;
  produceFinishedGoods: (finishedItemId: string, quantity: number, notes?: string) => boolean;
  restockRawMaterial: (rawItemId: string, quantity: number, unitCost?: number, notes?: string) => boolean;
  updateItemRecipe: (itemId: string, bomFormula: string, ingredients: BomIngredient[]) => boolean;
  addToCart: (item: ItemEntity) => void;
  updateCartQty: (itemId: string, qty: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  checkoutPos: (
    paymentMethod: PaymentMethod,
    stanIdOverride?: string | null,
    paidAmount?: number
  ) => SaleOrderEntity | null;
  requestTransfer: (sourceBusinessId: string, destBusinessId: string, itemId: string, qty: number, notes: string) => boolean;
  approveTransfer: (transferId: string) => boolean;
  rejectTransfer: (transferId: string, reason?: string) => boolean;
  reportDamagedGoods: (location: string, itemId: string, qty: number, reason: string) => boolean;
  approveDamagedGoods: (reportId: string) => boolean;
  rejectDamagedGoods: (reportId: string, reason?: string) => boolean;
  addManualLedgerEntry: (type: LedgerType, category: string, amount: number, description: string) => boolean;
  recordAttendance: (type: 'MASUK' | 'PULANG', note: string) => void;

  // Convenience aliases and computed helpers
  businesses: BusinessEntity[];
  users: UserEntity[];
  items: ItemEntity[];
  auditLogs: AuditLogEntity[];
  activeLedgers: LedgerTransactionEntity[];
  activeDamagedGoods: DamagedGoodsReportEntity[];
  cart: CartItem[];
  cartTotal: number;
  platformStats: {
    totalBusinesses: number;
    totalOwners: number;
    totalUsers: number;
    totalItems: number;
    totalSalesCount: number;
    totalAuditLogs: number;
  };
  ownerFinanceSummary: {
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
  };
  activeBusinessFinance: {
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
  };
  hasModule: (module: BusinessModule) => boolean;
  isOwnerOrAdmin: boolean;
  canAccessFinance: boolean;
  canAccessCostPrice: boolean;
  deleteItem: (itemId: string) => boolean;
  resetToFactoryData: () => void;
  updateCartItemQuantity: (itemId: string, qty: number) => void;
  checkout: (
    paymentMethod: PaymentMethod,
    stanIdOverride?: string | null,
    paidAmount?: number
  ) => SaleOrderEntity | null;
  requestStockTransfer: (destBusinessId: string, itemId: string, qty: number, notes?: string) => boolean;
  approveStockTransfer: (transferId: string) => boolean;
  rejectStockTransfer: (transferId: string, reason?: string) => boolean;
}

const TgpContext = createContext<TgpContextType | null>(null);

const STORAGE_PREFIX = 'tgp_platform_v2_';

function loadStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    // Discard any residual demo objects from older sessions
    if (key === 'users' && Array.isArray(parsed) && parsed.some((u: any) => u.userId === 'user-owner-demo')) {
      return fallback;
    }
    if (key === 'businesses' && Array.isArray(parsed) && parsed.some((b: any) => b.businessId === 'biz-a-retail')) {
      return fallback;
    }
    return parsed;
  } catch {
    return fallback;
  }
}

function saveStored<T>(key: string, data: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save to localStorage: ${key}`, e);
  }
}

export const TgpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserEntity[]>(() => loadStored('users', INITIAL_USERS));
  const [businesses, setBusinesses] = useState<BusinessEntity[]>(() => loadStored('businesses', INITIAL_BUSINESSES));
  const [items, setItems] = useState<ItemEntity[]>(() => loadStored('items', INITIAL_ITEMS));
  const [ledgers, setLedgers] = useState<LedgerTransactionEntity[]>(() => loadStored('ledgers', INITIAL_LEDGERS));
  const [sales, setSales] = useState<SaleOrderEntity[]>(() => loadStored('sales', INITIAL_SALES));
  const [transfers, setTransfers] = useState<TransferEntity[]>(() => loadStored('transfers', INITIAL_TRANSFERS));
  const [damagedReports, setDamagedReports] = useState<DamagedGoodsReportEntity[]>(() => loadStored('damaged', INITIAL_DAMAGED));
  const [attendances, setAttendances] = useState<AttendanceEntity[]>(() => loadStored('attendances', []));
  const [auditLogs, setAuditLogs] = useState<AuditLogEntity[]>(() => loadStored('audit', INITIAL_AUDIT_LOGS));
  const [outlets, setOutlets] = useState<OutletEntity[]>(() => loadStored('outlets', []));
  const [outletStocks, setOutletStocks] = useState<OutletStockEntity[]>(() => loadStored('outlet_stocks', []));
  const [stanTransfers, setStanTransfers] = useState<StanTransferEntity[]>(() => loadStored('stan_transfers', []));
  const [stockMutations, setStockMutations] = useState<StockMutationEntity[]>(() => loadStored('mutations', []));

  const [currentSession, setCurrentSession] = useState<UserSession | null>(() => loadStored('session', null));
  const [activeScreen, setActiveScreen] = useState<AppScreen>(() => {
    const savedSession = loadStored<UserSession | null>('session', null);
    if (!savedSession) return 'LOGIN';
    if (savedSession.user.role === UserRole.MASTER) return 'MASTER_DASHBOARD';
    if (savedSession.user.role === UserRole.OWNER) return 'OWNER_DASHBOARD';
    return 'BUSINESS_HOME';
  });

  const [activeBusinessId, setActiveBusinessIdState] = useState<string | null>(() => loadStored('activeBizId', null));
  const [posCart, setPosCart] = useState<CartItem[]>([]);
  const [userMessage, setUserMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Supabase Realtime State
  const [supabaseStatus, setSupabaseStatus] = useState<RealtimeStatus>('LOCAL_OFFLINE');
  const [supabaseStatusMessage, setSupabaseStatusMessage] = useState<string>(
    'Menginisialisasi sistem penyimpanan...'
  );

  // Initialize Supabase Sync on Mount
  useEffect(() => {
    supabaseSyncService.initialize({
      onBusinessesUpdated: (remote) => {
        setBusinesses((prev) => {
          const map = new Map<string, BusinessEntity>(prev.map((b) => [b.businessId, b]));
          remote.forEach((b) => map.set(b.businessId, b));
          return Array.from(map.values());
        });
      },
      onUsersUpdated: (remote) => {
        setUsers((prev) => {
          const map = new Map<string, UserEntity>(prev.map((u) => [u.userId, u]));
          remote.forEach((u) => map.set(u.userId, u));
          return Array.from(map.values());
        });
      },
      onItemsUpdated: (remote) => {
        setItems((prev) => {
          const map = new Map<string, ItemEntity>(prev.map((i) => [i.itemId, i]));
          remote.forEach((i) => map.set(i.itemId, i));
          return Array.from(map.values());
        });
      },
      onSalesUpdated: (remote) => {
        setSales((prev) => {
          const map = new Map<string, SaleOrderEntity>(prev.map((s) => [s.saleId, s]));
          remote.forEach((s) => map.set(s.saleId, s));
          return Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
        });
      },
      onLedgersUpdated: (remote) => {
        setLedgers((prev) => {
          const map = new Map<string, LedgerTransactionEntity>(prev.map((l) => [l.transactionId, l]));
          remote.forEach((l) => map.set(l.transactionId, l));
          return Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
        });
      },
      onTransfersUpdated: (remote) => {
        setTransfers((prev) => {
          const map = new Map<string, TransferEntity>(prev.map((t) => [t.transferId, t]));
          remote.forEach((t) => map.set(t.transferId, t));
          return Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt);
        });
      },
      onDamagedUpdated: (remote) => {
        setDamagedReports((prev) => {
          const map = new Map<string, DamagedGoodsReportEntity>(prev.map((d) => [d.reportId, d]));
          remote.forEach((d) => map.set(d.reportId, d));
          return Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
        });
      },
      onAttendancesUpdated: (remote) => {
        setAttendances((prev) => {
          const map = new Map<string, AttendanceEntity>(prev.map((a) => [a.attendanceId, a]));
          remote.forEach((a) => map.set(a.attendanceId, a));
          return Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
        });
      },
      onOutletsUpdated: (remote) => {
        setOutlets((prev) => {
          const map = new Map<string, OutletEntity>(prev.map((o) => [o.outletId, o]));
          remote.forEach((o) => map.set(o.outletId, o));
          return Array.from(map.values());
        });
      },
      onOutletStocksUpdated: (remote) => {
        setOutletStocks((prev) => {
          const map = new Map<string, OutletStockEntity>(prev.map((os) => [os.stockId, os]));
          remote.forEach((os) => map.set(os.stockId, os));
          return Array.from(map.values());
        });
      },
      onStanTransfersUpdated: (remote) => {
        setStanTransfers((prev) => {
          const map = new Map<string, StanTransferEntity>(prev.map((st) => [st.transferId, st]));
          remote.forEach((st) => map.set(st.transferId, st));
          return Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
        });
      },
      onStockMutationsUpdated: (remote) => {
        setStockMutations((prev) => {
          const map = new Map<string, StockMutationEntity>(prev.map((m) => [m.mutationId, m]));
          remote.forEach((m) => map.set(m.mutationId, m));
          return Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
        });
      },
      onAuditLogsUpdated: (remote) => {
        setAuditLogs((prev) => {
          const map = new Map<string, AuditLogEntity>(prev.map((al) => [al.logId, al]));
          remote.forEach((al) => map.set(al.logId, al));
          return Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
        });
      },
      onStatusChanged: (status, message) => {
        setSupabaseStatus(status);
        if (message) setSupabaseStatusMessage(message);
      },
    });

    // Seed initial data if DB is empty
    supabaseSyncService.seedInitialData({
      businesses: INITIAL_BUSINESSES,
      users: INITIAL_USERS,
      items: INITIAL_ITEMS,
      ledgers: INITIAL_LEDGERS,
      sales: INITIAL_SALES,
      transfers: INITIAL_TRANSFERS,
      damaged: INITIAL_DAMAGED,
      auditLogs: INITIAL_AUDIT_LOGS,
    });
  }, []);

  const syncAllWithSupabase = async () => {
    setIsLoading(true);
    try {
      await supabaseSyncService.fetchAllData();
      setUserMessage('Data tersinkronisasi langsung dengan server Supabase.');
    } catch (e: any) {
      setErrorMessage('Gagal sinkronisasi Supabase: ' + (e?.message || 'Error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Clean up legacy demo keys from old storage prefix on startup
  useEffect(() => {
    try {
      const legacyKeys = [
        'tgp_platform_users',
        'tgp_platform_businesses',
        'tgp_platform_items',
        'tgp_platform_ledgers',
        'tgp_platform_sales',
        'tgp_platform_transfers',
        'tgp_platform_damaged',
        'tgp_platform_audit',
        'tgp_platform_session',
        'tgp_platform_activeBizId',
      ];
      legacyKeys.forEach((k) => localStorage.removeItem(k));
    } catch {
      // Ignore cleanup error
    }
  }, []);

  // Sync to localStorage
  useEffect(() => saveStored('users', users), [users]);
  useEffect(() => saveStored('businesses', businesses), [businesses]);
  useEffect(() => saveStored('items', items), [items]);
  useEffect(() => saveStored('ledgers', ledgers), [ledgers]);
  useEffect(() => saveStored('sales', sales), [sales]);
  useEffect(() => saveStored('transfers', transfers), [transfers]);
  useEffect(() => saveStored('damaged', damagedReports), [damagedReports]);
  useEffect(() => saveStored('attendances', attendances), [attendances]);
  useEffect(() => saveStored('audit', auditLogs), [auditLogs]);
  useEffect(() => saveStored('outlets', outlets), [outlets]);
  useEffect(() => saveStored('outlet_stocks', outletStocks), [outletStocks]);
  useEffect(() => saveStored('stan_transfers', stanTransfers), [stanTransfers]);
  useEffect(() => saveStored('mutations', stockMutations), [stockMutations]);
  useEffect(() => saveStored('session', currentSession), [currentSession]);
  useEffect(() => saveStored('activeBizId', activeBusinessId), [activeBusinessId]);

  const clearMessages = () => {
    setUserMessage(null);
    setErrorMessage(null);
  };

  const addAuditLog = (action: string, details: string, businessId?: string | null) => {
    const newLog: AuditLogEntity = {
      logId: 'audit-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      userId: currentSession?.user.userId || 'SYSTEM',
      username: currentSession?.user.username || 'system',
      role: currentSession?.user.role || UserRole.MASTER,
      businessId: businessId || null,
      action,
      details,
      timestamp: Date.now(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    supabaseSyncService.syncAuditLog(newLog);
  };

  // Filtered lists based on user role and active business with strict isolation
  const authorizedBusinesses = filterAuthorizedBusinesses(currentSession?.user, businesses);
  const activeBusiness = activeBusinessId
    ? authorizedBusinesses.find((b) => b.businessId === activeBusinessId) || null
    : null;

  const activeItems = activeBusinessId
    ? filterAuthorizedItems(
        currentSession?.user,
        items.filter((item) => item.businessId === activeBusinessId)
      )
    : [];

  const activeTransfers = transfers.filter((t) => {
    if (!currentSession) return false;
    const role = normalizeUserRole(currentSession.user.role);
    if (role === UserRole.OWNER) {
      return t.ownerId === currentSession.user.userId;
    }
    if (activeBusinessId) {
      return t.sourceBusinessId === activeBusinessId || t.destBusinessId === activeBusinessId;
    }
    return false;
  });

  const pendingTransfersForOwner = transfers.filter((t) => {
    if (!currentSession) return false;
    const role = normalizeUserRole(currentSession.user.role);
    if (role !== UserRole.OWNER) return false;
    return t.ownerId === currentSession.user.userId && t.status === TransferStatus.PENDING;
  });

  const activeDamagedReports = activeBusinessId
    ? damagedReports.filter((d) => d.businessId === activeBusinessId)
    : [];

  const pendingDamagedForOwner = damagedReports.filter((d) => {
    if (!currentSession) return false;
    const role = normalizeUserRole(currentSession.user.role);
    if (role !== UserRole.OWNER) return false;
    const biz = businesses.find((b) => b.businessId === d.businessId);
    return biz?.ownerId === currentSession.user.userId && d.status === DamagedStatus.PENDING;
  });

  const activeLedger = activeBusinessId
    ? filterAuthorizedLedger(
        currentSession?.user,
        ledgers.filter((l) => l.businessId === activeBusinessId),
        activeBusinessId
      )
    : [];

  const activeSales = activeBusinessId
    ? sales.filter((s) => s.businessId === activeBusinessId)
    : [];

  const activeOutlets = activeBusinessId
    ? outlets.filter((o) => o.businessId === activeBusinessId)
    : [];

  const activeOutletStocks = activeBusinessId
    ? outletStocks.filter((os) => os.businessId === activeBusinessId)
    : [];

  const activeStanTransfers = activeBusinessId
    ? stanTransfers.filter((st) => st.businessId === activeBusinessId)
    : [];

  const activeStockMutations = activeBusinessId
    ? stockMutations.filter((sm) => sm.businessId === activeBusinessId)
    : [];

  const getOutletStockQuantity = (outletId: string, itemId: string): number => {
    const found = outletStocks.find((os) => os.outletId === outletId && os.itemId === itemId);
    return found ? found.stockQuantity : 0;
  };

  const globalOwnerLedger = currentSession?.user.role === UserRole.OWNER
    ? ledgers.filter((l) => authorizedBusinesses.some((b) => b.businessId === l.businessId))
    : [];

  const globalOwnerSales = currentSession?.user.role === UserRole.OWNER
    ? sales.filter((s) => authorizedBusinesses.some((b) => b.businessId === s.businessId))
    : [];

  const globalOwnerItems = currentSession?.user.role === UserRole.OWNER
    ? items.filter((i) => authorizedBusinesses.some((b) => b.businessId === i.businessId))
    : [];

  const activeAttendances = activeBusinessId
    ? attendances.filter((a) => a.businessId === activeBusinessId)
    : [];

  const allOwners = users.filter((u) => normalizeUserRole(u.role) === UserRole.OWNER);

  const allStaffForActiveBusiness = users.filter((u) => {
    if (u.role === UserRole.MASTER || u.role === UserRole.OWNER) return false;
    if (u.role === UserRole.ADMIN_OWNER) {
      return activeBusinessId ? (u.assignedBusinessIds || []).includes(activeBusinessId) : false;
    }
    return u.staffBinding?.businessId === activeBusinessId || u.businessId === activeBusinessId;
  });

  const cartTotal = posCart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const platformStats = {
    totalBusinesses: businesses.length,
    totalOwners: allOwners.length,
    totalUsers: users.length,
    totalItems: items.length,
    totalSalesCount: sales.length,
    totalAuditLogs: auditLogs.length,
  };

  const ownerFinanceSummary = {
    totalIncome: globalOwnerLedger
      .filter((l) => l.type === LedgerType.PEMASUKAN)
      .reduce((sum, l) => sum + l.amount, 0),
    totalExpense: globalOwnerLedger
      .filter((l) => l.type === LedgerType.PENGELUARAN)
      .reduce((sum, l) => sum + l.amount, 0),
    get netBalance() {
      return this.totalIncome - this.totalExpense;
    },
  };

  const activeBusinessFinance = {
    totalIncome: activeLedger
      .filter((l) => l.type === LedgerType.PEMASUKAN)
      .reduce((sum, l) => sum + l.amount, 0),
    totalExpense: activeLedger
      .filter((l) => l.type === LedgerType.PENGELUARAN)
      .reduce((sum, l) => sum + l.amount, 0),
    get netBalance() {
      return this.totalIncome - this.totalExpense;
    },
  };

  const hasModule = (module: BusinessModule): boolean => {
    return activeBusiness ? (activeBusiness.activeModules || []).includes(module) : false;
  };

  const isOwnerOrAdmin =
    currentSession?.user.role === UserRole.OWNER ||
    currentSession?.user.role === UserRole.ADMIN_OWNER ||
    currentSession?.user.role === UserRole.MASTER;

  const canAccessFinance =
    currentSession?.user.role === UserRole.OWNER ||
    currentSession?.user.role === UserRole.ADMIN_OWNER ||
    (currentSession?.user.role === UserRole.ADMIN_DIVISI &&
      currentSession.user.businessId === activeBusinessId) ||
    !!currentSession?.user.permissions?.canViewFinance;

  const canAccessCostPrice =
    currentSession?.user.role === UserRole.OWNER ||
    currentSession?.user.role === UserRole.MASTER ||
    currentSession?.user.role === UserRole.ADMIN_OWNER ||
    !!currentSession?.user.permissions?.canViewCostPrice;

  const deleteItem = (itemId: string): boolean => {
    if (!activeBusinessId) return false;
    const item = items.find((i) => i.itemId === itemId);
    if (!item) return false;
    setItems((prev) => prev.filter((i) => i.itemId !== itemId));
    setOutletStocks((prev) => prev.filter((os) => os.itemId !== itemId));
    addAuditLog('DELETE_ITEM', `Deleted item '${item.name}' (${item.sku})`, activeBusinessId);
    setUserMessage(`Item '${item.name}' berhasil dihapus.`);
    return true;
  };

  const resetToFactoryData = () => {
    localStorage.clear();
    setUsers(INITIAL_USERS);
    setBusinesses(INITIAL_BUSINESSES);
    setItems(INITIAL_ITEMS);
    setLedgers(INITIAL_LEDGERS);
    setSales(INITIAL_SALES);
    setTransfers(INITIAL_TRANSFERS);
    setDamagedReports(INITIAL_DAMAGED);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setOutlets([]);
    setOutletStocks([]);
    setStanTransfers([]);
    setStockMutations([]);
    setPosCart([]);
    setCurrentSession(null);
    setActiveBusinessIdState(null);
    setActiveScreen('LOGIN');
    setUserMessage('Semua data platform telah direset ke setelan awal pabrik.');
  };

  const requestStockTransfer = (
    destBusinessId: string,
    itemId: string,
    qty: number,
    notes: string = ''
  ): boolean => {
    if (!activeBusinessId) return false;
    return requestTransfer(activeBusinessId, destBusinessId, itemId, qty, notes);
  };

  const approveStockTransfer = (transferId: string): boolean => {
    return approveTransfer(transferId);
  };

  const rejectStockTransfer = (transferId: string, reason?: string): boolean => {
    return rejectTransfer(transferId, reason);
  };

  const navigateTo = (screen: AppScreen) => {
    setActiveScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setActiveBusiness = (businessId: string | null) => {
    setActiveBusinessIdState(businessId);
    setPosCart([]);
  };

  // -------------------------------------------------------------
  // AUTH
  // -------------------------------------------------------------
  const login = (usernameInput: string, passwordInput: string): boolean => {
    const cleanUser = usernameInput.trim().toLowerCase();
    const foundUser = users.find((u) => u.username.toLowerCase() === cleanUser);

    if (!foundUser || foundUser.passwordHash !== passwordInput) {
      setErrorMessage('Username atau password salah.');
      return false;
    }

    const userBizId = foundUser.businessId || (foundUser.assignedBusinessIds && foundUser.assignedBusinessIds[0]) || null;
    const session: UserSession = {
      user: foundUser,
      assignedBusinessIds: foundUser.assignedBusinessIds || (userBizId ? [userBizId] : []),
      staffBinding: userBizId
        ? {
            businessId: userBizId,
            role: foundUser.role,
            outletId: foundUser.outletId || null,
          }
        : null,
    };

    setCurrentSession(session);
    setActiveBusinessIdState(userBizId);
    setPosCart([]);

    const role = normalizeUserRole(foundUser.role);
    if (role === UserRole.MASTER) {
      setActiveScreen('MASTER_DASHBOARD');
    } else if (role === UserRole.OWNER) {
      setActiveScreen('OWNER_DASHBOARD');
    } else if (role === UserRole.KASIR) {
      setActiveScreen('POS_MODULE');
    } else if (role === UserRole.WAREHOUSE) {
      setActiveScreen('INVENTORY_MODULE');
    } else {
      setActiveScreen('BUSINESS_HOME');
    }

    addAuditLog('USER_LOGIN', `User logged in with role ${role}`);
    setUserMessage(`Selamat datang, ${foundUser.fullName} (${role})`);
    return true;
  };

  const logout = () => {
    addAuditLog('USER_LOGOUT', `User ${currentSession?.user.username || 'unknown'} logged out`);
    setCurrentSession(null);
    setActiveBusinessIdState(null);
    setPosCart([]);
    setActiveScreen('LOGIN');
    setUserMessage('Anda telah logout dari sistem.');
  };

  const resetMasterAccount = () => {
    setUsers((prev) =>
      prev.map((u) =>
        u.username.toLowerCase() === CANONICAL_MASTER_EMAIL.toLowerCase()
          ? { ...u, passwordHash: CANONICAL_MASTER_PASS, fullName: CANONICAL_MASTER_NAME }
          : u
      )
    );
    addAuditLog('MASTER_PASSWORD_RESET', `Master password restored to standard for ${CANONICAL_MASTER_EMAIL}`);
    setUserMessage(`Password akun MASTER (${CANONICAL_MASTER_EMAIL}) telah dipulihkan ke: ${CANONICAL_MASTER_PASS}`);
  };

  // -------------------------------------------------------------
  // USER CREATION
  // -------------------------------------------------------------
  const createOwner = (username: string, pass: string, fullName: string): boolean => {
    const actorRole = currentSession?.user ? normalizeUserRole(currentSession.user.role) : null;
    if (actorRole !== UserRole.MASTER) {
      setErrorMessage('Hanya akun MASTER yang memiliki wewenang membuat akun OWNER.');
      return false;
    }

    const cleanUser = username.trim().toLowerCase();
    if (!cleanUser) {
      setErrorMessage('Username akun OWNER wajib diisi.');
      return false;
    }
    if (!fullName.trim()) {
      setErrorMessage('Nama Lengkap pemilik wajib diisi.');
      return false;
    }
    if (!pass || pass.length < 6) {
      setErrorMessage('Password akun minimal 6 karakter.');
      return false;
    }
    if (users.some((u) => u.username.toLowerCase() === cleanUser)) {
      setErrorMessage(`Username '${cleanUser}' sudah digunakan. Silakan gunakan username lain.`);
      return false;
    }

    const newOwner: UserEntity = {
      userId: 'owner-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      username: cleanUser,
      passwordHash: pass,
      fullName: fullName.trim(),
      role: UserRole.OWNER,
      ownerId: null,
      businessId: null,
      assignedBusinessIds: [],
      createdAt: Date.now(),
    };

    setUsers((prev) => [...prev, newOwner]);
    supabaseSyncService.syncUser(newOwner);
    addAuditLog(
      'CREATE_OWNER',
      `MASTER (${currentSession?.user.username || 'master'}) created OWNER: ${newOwner.username} (${newOwner.fullName})`
    );
    setUserMessage(`Akun OWNER '${newOwner.username}' (${newOwner.fullName}) berhasil dibuat dan disimpan.`);
    return true;
  };

  const createAdminOwner = (
    username: string,
    pass: string,
    fullName: string,
    assignedIds: string[],
    role: UserRole = UserRole.ADMIN_OWNER,
    permissions?: UserPermissions
  ): boolean => {
    const actorRole = currentSession?.user.role ? normalizeUserRole(currentSession.user.role) : null;
    if (actorRole !== UserRole.OWNER && actorRole !== UserRole.MASTER) {
      setErrorMessage('Hanya akun OWNER (atau MASTER) yang memiliki wewenang membuat akun ADMIN.');
      return false;
    }
    if (role !== UserRole.ADMIN_OWNER && role !== UserRole.ADMIN_DIVISI) {
      setErrorMessage('Akun OWNER hanya dapat membuat akun ADMIN OWNER atau ADMIN DIVISI.');
      return false;
    }

    const cleanUser = username.trim().toLowerCase();
    if (users.some((u) => u.username.toLowerCase() === cleanUser)) {
      setErrorMessage(`Username '${cleanUser}' sudah digunakan.`);
      return false;
    }
    if (!assignedIds || assignedIds.length === 0) {
      setErrorMessage('Pilih minimal satu bisnis untuk ditugaskan kepada Admin ini.');
      return false;
    }

    const newAdmin: UserEntity = {
      userId: 'admin-' + Date.now(),
      username: cleanUser,
      passwordHash: pass,
      fullName: fullName.trim(),
      role,
      ownerId: currentSession?.user.userId || null,
      assignedBusinessIds: assignedIds,
      businessId: assignedIds[0] || null,
      permissions: permissions || {
        canManageRawWarehouse: true,
        canManageFinishedWarehouse: true,
        canProduceGoods: true,
        canTransferToStan: true,
        canViewFinance: role === UserRole.ADMIN_DIVISI,
        canViewCostPrice: true,
      },
      createdAt: Date.now(),
    };

    setUsers((prev) => [...prev, newAdmin]);
    supabaseSyncService.syncUser(newAdmin);
    addAuditLog(
      'CREATE_ADMIN',
      `OWNER (${currentSession?.user.username}) created ${role}: ${newAdmin.username} (${newAdmin.fullName}), assigned to ${assignedIds.length} businesses.`
    );
    setUserMessage(`Akun ${role} '${newAdmin.username}' berhasil dibuat dan ditugaskan.`);
    return true;
  };

  const createStaff = (
    businessId: string,
    username: string,
    pass: string,
    fullName: string,
    role: UserRole,
    outletId?: string | null,
    department?: StaffDepartment,
    permissions?: UserPermissions
  ): boolean => {
    if (!currentSession) return false;
    const actorRole = normalizeUserRole(currentSession.user.role);

    // Strict rule: OWNER cannot create operational staff directly!
    if (actorRole === UserRole.OWNER) {
      setErrorMessage(
        'Sesuai hierarki TGP: Akun OWNER menunjuk ADMIN OWNER atau ADMIN DIVISI. Pembuatan staf operasional (MANAGER, KASIR, WAREHOUSE, STAFF) ditugaskan kepada Admin.'
      );
      return false;
    }

    // Only ADMIN_OWNER, ADMIN_DIVISI, or MASTER can create operational accounts
    if (
      actorRole !== UserRole.ADMIN_OWNER &&
      actorRole !== UserRole.ADMIN_DIVISI &&
      actorRole !== UserRole.MASTER
    ) {
      setErrorMessage(
        'Hanya ADMIN OWNER atau ADMIN DIVISI yang berwenang membuat akun operasional.'
      );
      return false;
    }

    // Check that ADMIN_OWNER has authority over this business
    if (actorRole === UserRole.ADMIN_OWNER) {
      if (
        currentSession.user.assignedBusinessIds &&
        currentSession.user.assignedBusinessIds.length > 0 &&
        !currentSession.user.assignedBusinessIds.includes(businessId)
      ) {
        setErrorMessage('ADMIN OWNER tidak memiliki izin penugasan untuk unit bisnis ini.');
        return false;
      }
    }

    // Strict check for ADMIN_DIVISI: cannot manage other divisions!
    if (actorRole === UserRole.ADMIN_DIVISI) {
      const allowedBiz = currentSession.user.businessId;
      const assigned = currentSession.user.assignedBusinessIds || [];
      if (businessId !== allowedBiz && !assigned.includes(businessId)) {
        setErrorMessage('Akses Ditolak: ADMIN DIVISI dilarang membuat akun di luar divisi yang dikelolanya.');
        return false;
      }
    }

    // Allowed target roles
    const allowedRoles =
      actorRole === UserRole.ADMIN_OWNER
        ? [UserRole.ADMIN_DIVISI, UserRole.MANAGER, UserRole.KASIR, UserRole.WAREHOUSE, UserRole.STAFF]
        : [UserRole.MANAGER, UserRole.KASIR, UserRole.WAREHOUSE, UserRole.STAFF];

    if (!allowedRoles.includes(role)) {
      setErrorMessage(`Peran '${role}' tidak diizinkan untuk dibuat oleh akun '${actorRole}'.`);
      return false;
    }

    const cleanUser = username.trim().toLowerCase();
    if (users.some((u) => u.username.toLowerCase() === cleanUser)) {
      setErrorMessage(`Username '${cleanUser}' sudah terdaftar.`);
      return false;
    }

    const targetBiz = businesses.find((b) => b.businessId === businessId);
    if (!targetBiz) {
      setErrorMessage('Business tidak ditemukan.');
      return false;
    }

    const hasStanModule = targetBiz.activeModules.includes(BusinessModule.STAN_OUTLET);
    const hasOutlets = outlets.some((o) => o.businessId === businessId && o.status === 'ACTIVE');
    if (role === UserRole.KASIR && hasStanModule && hasOutlets && !outletId) {
      setErrorMessage('Bisnis memiliki cabang STAN. Wajib pilih STAN/Outlet penugasan untuk Kasir ini.');
      return false;
    }

    const targetOutlet = outletId ? outlets.find((o) => o.outletId === outletId) : null;
    const defaultPermissions: UserPermissions = permissions || {
      canManageRawWarehouse: department === 'GUDANG_BAHAN_BAKU' || role === UserRole.WAREHOUSE || role === UserRole.ADMIN_DIVISI,
      canManageFinishedWarehouse: department === 'GUDANG_STOK' || department === 'PRODUKSI' || role === UserRole.WAREHOUSE || role === UserRole.ADMIN_DIVISI,
      canProduceGoods: department === 'PRODUKSI' || department === 'GUDANG_STOK' || role === UserRole.WAREHOUSE || role === UserRole.ADMIN_DIVISI,
      canTransferToStan: department === 'GUDANG_STOK' || role === UserRole.WAREHOUSE || role === UserRole.MANAGER || role === UserRole.ADMIN_DIVISI,
      canViewFinance: role === UserRole.ADMIN_DIVISI,
      canViewCostPrice: role !== UserRole.KASIR,
    };

    const newStaff: UserEntity = {
      userId: 'staff-' + Date.now(),
      username: cleanUser,
      passwordHash: pass,
      fullName: fullName.trim(),
      role,
      ownerId: targetBiz.ownerId,
      businessId: targetBiz.businessId,
      outletId: outletId || null,
      assignedBusinessIds: [targetBiz.businessId],
      department:
        department ||
        (role === UserRole.KASIR
          ? 'KASIR_STAN'
          : role === UserRole.WAREHOUSE
          ? 'GUDANG_STOK'
          : 'OPERASIONAL_UMUM'),
      permissions: defaultPermissions,
      createdAt: Date.now(),
    };

    setUsers((prev) => [...prev, newStaff]);
    supabaseSyncService.syncUser(newStaff);

    const deptInfo = department ? ` [Divisi: ${department}]` : '';
    const outletInfo = targetOutlet ? ` [STAN: ${targetOutlet.name}]` : '';
    addAuditLog(
      'CREATE_STAFF',
      `Admin (${currentSession.user.username}) created ${role} '${newStaff.username}' (${newStaff.fullName}) for business '${targetBiz.name}'${deptInfo}${outletInfo}.`,
      businessId
    );
    setUserMessage(`Akun ${role} '${newStaff.fullName}' berhasil dibuat.`);
    return true;
  };

  // -------------------------------------------------------------
  // BUSINESS CREATION
  // -------------------------------------------------------------
  const createBusiness = (
    name: string,
    template: BusinessTemplate,
    modules: BusinessModule[]
  ): boolean => {
    if (currentSession?.user.role !== UserRole.OWNER) {
      setErrorMessage('Hanya OWNER yang dapat membuat Business.');
      return false;
    }
    if (!name.trim()) {
      setErrorMessage('Nama Business wajib diisi.');
      return false;
    }
    if (modules.length === 0) {
      setErrorMessage('Pilih minimal 1 modul untuk Business.');
      return false;
    }

    const newBiz: BusinessEntity = {
      businessId: 'biz-' + Date.now(),
      ownerId: currentSession.user.userId,
      name: name.trim(),
      templateType: template,
      activeModules: modules,
      createdAt: Date.now(),
    };

    setBusinesses((prev) => [...prev, newBiz]);
    supabaseSyncService.syncBusiness(newBiz);
    setActiveBusinessIdState(newBiz.businessId);
    setActiveScreen('BUSINESS_HOME');
    addAuditLog('CREATE_BUSINESS', `Created Business: ${newBiz.name} [Template: ${template}]`, newBiz.businessId);
    setUserMessage(`Business '${newBiz.name}' berhasil dibuat dan siap dikelola.`);
    return true;
  };

  const updateBusiness = (
    businessId: string,
    name: string,
    template: BusinessTemplate,
    modules: BusinessModule[]
  ): boolean => {
    if (currentSession?.user.role !== UserRole.OWNER && currentSession?.user.role !== UserRole.MASTER) {
      setErrorMessage('Hanya OWNER atau MASTER yang dapat mengubah konfigurasi Business.');
      return false;
    }
    if (!name.trim()) {
      setErrorMessage('Nama Business wajib diisi.');
      return false;
    }
    if (modules.length === 0) {
      setErrorMessage('Pilih minimal 1 modul aktif untuk Business.');
      return false;
    }

    setBusinesses((prev) =>
      prev.map((b) => {
        if (b.businessId === businessId) {
          const updated: BusinessEntity = {
            ...b,
            name: name.trim(),
            templateType: template,
            activeModules: modules,
          };
          supabaseSyncService.syncBusiness(updated);
          return updated;
        }
        return b;
      })
    );

    addAuditLog('UPDATE_BUSINESS', `Updated Business: ${name} [Template: ${template}]`, businessId);
    setUserMessage(`Konfigurasi bisnis '${name}' berhasil diperbarui.`);
    return true;
  };

  const toggleBusinessModule = (businessId: string, module: BusinessModule): boolean => {
    setBusinesses((prev) =>
      prev.map((b) => {
        if (b.businessId === businessId) {
          const exists = b.activeModules.includes(module);
          const newMods = exists
            ? b.activeModules.filter((m) => m !== module)
            : [...b.activeModules, module];
          const updated = { ...b, activeModules: newMods };
          supabaseSyncService.syncBusiness(updated);
          return updated;
        }
        return b;
      })
    );
    setUserMessage(`Pengaturan modul ${module} berhasil diperbarui.`);
    return true;
  };

  // -------------------------------------------------------------
  // STAN / OUTLET CABANG
  // -------------------------------------------------------------
  const createOutlet = (
    name: string,
    code: string,
    location: string,
    phone?: string
  ): boolean => {
    if (!activeBusinessId || !currentSession) {
      setErrorMessage('Pilih bisnis aktif terlebih dahulu.');
      return false;
    }
    const cleanName = name.trim();
    if (!cleanName) {
      setErrorMessage('Nama STAN / Outlet wajib diisi.');
      return false;
    }

    const cleanCode = (code.trim() || cleanName.slice(0, 4).toUpperCase() + '-' + (activeOutlets.length + 1)).toUpperCase();
    const newOutlet: OutletEntity = {
      outletId: 'stan-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      businessId: activeBusinessId,
      ownerId: activeBusiness?.ownerId || currentSession.user.userId,
      name: cleanName,
      code: cleanCode,
      location: location.trim() || 'Lokasi Stand Penjualan',
      phone: phone?.trim() || '',
      status: 'ACTIVE',
      createdAt: Date.now(),
    };

    setOutlets((prev) => [...prev, newOutlet]);
    supabaseSyncService.syncOutlet(newOutlet);
    addAuditLog('CREATE_OUTLET', `Created STAN: ${cleanName} (${cleanCode}) under business ${activeBusiness?.name}`, activeBusinessId);
    setUserMessage(`STAN/Outlet '${cleanName}' berhasil ditambahkan ke divisi bisnis.`);
    return true;
  };

  const updateOutlet = (
    outletId: string,
    name: string,
    code: string,
    location: string,
    status: 'ACTIVE' | 'INACTIVE'
  ): boolean => {
    setOutlets((prev) =>
      prev.map((o) => {
        if (o.outletId === outletId) {
          const updated: OutletEntity = {
            ...o,
            name: name.trim() || o.name,
            code: code.trim().toUpperCase() || o.code,
            location: location.trim() || o.location,
            status,
          };
          supabaseSyncService.syncOutlet(updated);
          return updated;
        }
        return o;
      })
    );
    setUserMessage('Informasi STAN/Outlet berhasil diperbarui.');
    return true;
  };

  const deleteOutlet = (outletId: string): boolean => {
    const target = outlets.find((o) => o.outletId === outletId);
    if (!target) return false;
    setOutlets((prev) => prev.filter((o) => o.outletId !== outletId));
    addAuditLog('DELETE_OUTLET', `Deleted STAN/Outlet: ${target.name}`, target.businessId);
    setUserMessage(`STAN '${target.name}' telah dihapus.`);
    return true;
  };

  const transferStockToStan = (
    outletId: string,
    itemId: string,
    quantity: number,
    notes?: string
  ): boolean => {
    if (!activeBusinessId || quantity <= 0) {
      setErrorMessage('Jumlah transfer pasokan harus lebih besar dari 0.');
      return false;
    }
    const targetItem = items.find((i) => i.itemId === itemId && i.businessId === activeBusinessId);
    if (!targetItem) {
      setErrorMessage('Item di gudang produksi tidak ditemukan.');
      return false;
    }
    if (targetItem.stockQuantity < quantity) {
      setErrorMessage(`Stok di Gudang Produksi tidak mencukupi (Tersedia: ${targetItem.stockQuantity} ${targetItem.unit}).`);
      return false;
    }
    const targetOutlet = outlets.find((o) => o.outletId === outletId);
    if (!targetOutlet) {
      setErrorMessage('STAN/Outlet tujuan tidak ditemukan.');
      return false;
    }

    const nowTs = Date.now();
    const refNo = `DIST-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;

    // 1. Deduct from Production Stock
    const updatedTargetItem: ItemEntity = {
      ...targetItem,
      stockQuantity: Math.max(0, targetItem.stockQuantity - quantity),
      updatedAt: nowTs,
    };
    setItems((prev) =>
      prev.map((i) => (i.itemId === itemId ? updatedTargetItem : i))
    );
    supabaseSyncService.syncItem(updatedTargetItem);

    // 2. Add to STAN Outlet Stock
    let updatedOutletStock: OutletStockEntity;
    const existing = outletStocks.find((os) => os.outletId === outletId && os.itemId === itemId);
    if (existing) {
      updatedOutletStock = { ...existing, stockQuantity: existing.stockQuantity + quantity, updatedAt: nowTs };
      setOutletStocks((prev) =>
        prev.map((os) => (os.stockId === existing.stockId ? updatedOutletStock : os))
      );
    } else {
      updatedOutletStock = {
        stockId: 'ostk-' + nowTs + '-' + Math.floor(Math.random() * 1000),
        outletId,
        businessId: activeBusinessId,
        itemId: targetItem.itemId,
        itemName: targetItem.name,
        sku: targetItem.sku,
        category: targetItem.category,
        sellingPrice: targetItem.sellingPrice,
        costPrice: targetItem.costPrice,
        unit: targetItem.unit,
        stockQuantity: quantity,
        updatedAt: nowTs,
      };
      setOutletStocks((prev) => [...prev, updatedOutletStock]);
    }
    supabaseSyncService.syncOutletStock(updatedOutletStock);

    // 3. Record Stan Transfer Entry
    const transferEntry: StanTransferEntity = {
      transferId: 'strf-' + nowTs,
      transferReference: refNo,
      businessId: activeBusinessId,
      outletId,
      outletName: targetOutlet.name,
      direction: 'PRODUCTION_TO_STAN',
      itemId,
      itemName: targetItem.name,
      quantity,
      timestamp: nowTs,
      performedBy: currentSession?.user.fullName || 'Admin',
      notes: notes?.trim() || `Pasokan stok dari Gudang Produksi ke ${targetOutlet.name}`,
    };
    setStanTransfers((prev) => [transferEntry, ...prev]);
    supabaseSyncService.syncStanTransfer(transferEntry);

    addAuditLog('STAN_STOCK_SUPPLY', `Pasokan ${quantity} ${targetItem.unit} '${targetItem.name}' ke ${targetOutlet.name} (${refNo})`, activeBusinessId);
    setUserMessage(`Berhasil mengirim ${quantity} ${targetItem.unit} '${targetItem.name}' ke ${targetOutlet.name}!`);
    return true;
  };

  const returnStockFromStan = (
    outletId: string,
    itemId: string,
    quantity: number,
    notes?: string
  ): boolean => {
    if (!activeBusinessId || quantity <= 0) return false;
    const targetOutlet = outlets.find((o) => o.outletId === outletId);
    const existingStock = outletStocks.find((os) => os.outletId === outletId && os.itemId === itemId);
    if (!existingStock || existingStock.stockQuantity < quantity) {
      setErrorMessage(`Stok di STAN tidak mencukupi untuk retur (Tersedia: ${existingStock?.stockQuantity || 0}).`);
      return false;
    }
    const targetItem = items.find((i) => i.itemId === itemId);
    if (!targetItem) return false;

    const nowTs = Date.now();
    const refNo = `RTR-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;

    // 1. Deduct from STAN stock
    const updatedStanStock: OutletStockEntity = {
      ...existingStock,
      stockQuantity: Math.max(0, existingStock.stockQuantity - quantity),
      updatedAt: nowTs,
    };
    setOutletStocks((prev) =>
      prev.map((os) =>
        os.outletId === outletId && os.itemId === itemId ? updatedStanStock : os
      )
    );
    supabaseSyncService.syncOutletStock(updatedStanStock);

    // 2. Add back to Production stock
    const updatedProdItem: ItemEntity = {
      ...targetItem,
      stockQuantity: targetItem.stockQuantity + quantity,
      updatedAt: nowTs,
    };
    setItems((prev) =>
      prev.map((i) => (i.itemId === itemId ? updatedProdItem : i))
    );
    supabaseSyncService.syncItem(updatedProdItem);

    // 3. Record transfer entry
    const transferEntry: StanTransferEntity = {
      transferId: 'strf-' + nowTs,
      transferReference: refNo,
      businessId: activeBusinessId,
      outletId,
      outletName: targetOutlet?.name || 'STAN',
      direction: 'STAN_TO_PRODUCTION',
      itemId,
      itemName: targetItem.name,
      quantity,
      timestamp: nowTs,
      performedBy: currentSession?.user.fullName || 'Admin',
      notes: notes?.trim() || `Retur stok dari ${targetOutlet?.name || 'STAN'} ke Gudang Produksi`,
    };
    setStanTransfers((prev) => [transferEntry, ...prev]);
    supabaseSyncService.syncStanTransfer(transferEntry);

    addAuditLog('STAN_STOCK_RETURN', `Retur ${quantity} ${targetItem.unit} '${targetItem.name}' dari ${targetOutlet?.name} ke Gudang Produksi (${refNo})`, activeBusinessId);
    setUserMessage(`Berhasil meretur ${quantity} ${targetItem.unit} '${targetItem.name}' ke Gudang Produksi.`);
    return true;
  };

  // -------------------------------------------------------------
  // ITEMS & INVENTORY
  // -------------------------------------------------------------
  const addItem = (itemData: Omit<ItemEntity, 'itemId' | 'businessId' | 'updatedAt'>): boolean => {
    if (!activeBusinessId) {
      setErrorMessage('Pilih Business terlebih dahulu.');
      return false;
    }

    const newItem: ItemEntity = {
      ...itemData,
      itemId: 'item-' + Date.now(),
      businessId: activeBusinessId,
      updatedAt: Date.now(),
    };

    setItems((prev) => [...prev, newItem]);
    supabaseSyncService.syncItem(newItem);

    if (newItem.stockQuantity > 0) {
      const initMut: StockMutationEntity = {
        mutationId: 'mut-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        businessId: activeBusinessId,
        itemId: newItem.itemId,
        itemName: newItem.name,
        type: MutationType.INITIAL,
        changeQty: newItem.stockQuantity,
        finalQty: newItem.stockQuantity,
        referenceId: newItem.itemId,
        performedBy: currentSession?.user.fullName || currentSession?.user.username || 'System',
        timestamp: Date.now(),
        note: `Pendaftaran stok awal barang (${newItem.location || 'Gudang'})`,
      };
      setStockMutations((prev) => [initMut, ...prev]);
      supabaseSyncService.syncStockMutation(initMut);
    }

    addAuditLog('ITEM_CREATED', `Item ${newItem.name} (SKU: ${newItem.sku}, Type: ${newItem.type}) created with stock ${newItem.stockQuantity} ${newItem.unit}`, activeBusinessId);
    setUserMessage(`Item '${newItem.name}' berhasil disimpan.`);
    return true;
  };

  const produceFinishedGoods = (
    finishedItemId: string,
    quantityToProduce: number,
    notes?: string
  ): boolean => {
    if (!activeBusinessId || !currentSession || quantityToProduce <= 0) {
      setErrorMessage('Kuantitas produksi harus lebih besar dari 0.');
      return false;
    }

    // Permission check: Kasir cannot produce goods!
    if (normalizeUserRole(currentSession.user.role) === UserRole.KASIR) {
      setErrorMessage('Kasir tidak memiliki izin untuk melakukan produksi barang.');
      return false;
    }

    // Permission check for Staff
    if (
      currentSession.user.role === UserRole.STAFF &&
      currentSession.user.permissions?.canProduceGoods === false &&
      currentSession.user.department !== 'PRODUKSI' &&
      currentSession.user.department !== 'GUDANG_STOK'
    ) {
      setErrorMessage('Akun Anda tidak memiliki izin produksi barang jadi.');
      return false;
    }

    const finishedItem = items.find(
      (i) => i.itemId === finishedItemId && i.businessId === activeBusinessId
    );
    if (!finishedItem) {
      setErrorMessage('Item bahan jadi tidak ditemukan.');
      return false;
    }

    const ingredients = finishedItem.bomIngredients || [];
    if (ingredients.length === 0) {
      setErrorMessage(
        `Item '${finishedItem.name}' belum memiliki konfigurasi resep BOM (Bill of Materials). Tambahkan bahan baku resep terlebih dahulu.`
      );
      return false;
    }

    // 1. Check availability of all raw materials in Gudang Bahan Baku
    for (const ing of ingredients) {
      const neededQty = Number((ing.quantityNeeded * quantityToProduce).toFixed(4));
      const rawItem = items.find(
        (i) => i.itemId === ing.rawItemId && i.businessId === activeBusinessId && i.type === 'RAW_MATERIAL'
      );
      if (!rawItem) {
        setErrorMessage(`Bahan mentah '${ing.rawItemName}' tidak ditemukan di Gudang Bahan Baku.`);
        return false;
      }
      if (rawItem.stockQuantity < neededQty) {
        setErrorMessage(
          `Stok bahan baku '${rawItem.name}' di Gudang Bahan Baku tidak mencukupi (Dibutuhkan: ${neededQty} ${rawItem.unit}, Tersedia: ${rawItem.stockQuantity} ${rawItem.unit}). Produksi dibatalkan.`
        );
        return false;
      }
    }

    const nowTs = Date.now();
    const batchNo = `PRD-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 2. Deduct all raw materials from Gudang Bahan Baku & Add to Gudang Stok
    const updatedItemsList: ItemEntity[] = [];
    setItems((prev) =>
      prev.map((i) => {
        const ing = ingredients.find((itemIng) => itemIng.rawItemId === i.itemId);
        if (ing && i.type === 'RAW_MATERIAL') {
          const deductQty = Number((ing.quantityNeeded * quantityToProduce).toFixed(4));
          const updated: ItemEntity = {
            ...i,
            stockQuantity: Math.max(0, Number((i.stockQuantity - deductQty).toFixed(4))),
            updatedAt: nowTs,
          };
          updatedItemsList.push(updated);
          return updated;
        }
        if (i.itemId === finishedItemId) {
          const updated: ItemEntity = {
            ...i,
            stockQuantity: i.stockQuantity + quantityToProduce,
            updatedAt: nowTs,
          };
          updatedItemsList.push(updated);
          return updated;
        }
        return i;
      })
    );
    supabaseSyncService.syncItems(updatedItemsList);

    // 3. Record Stock Mutations
    const newMutations: StockMutationEntity[] = [];
    ingredients.forEach((ing) => {
      const deductQty = Number((ing.quantityNeeded * quantityToProduce).toFixed(4));
      const rawItem = items.find((i) => i.itemId === ing.rawItemId);
      const remainingQty = (rawItem?.stockQuantity || 0) - deductQty;
      newMutations.push({
        mutationId: 'mut-' + nowTs + '-' + Math.floor(Math.random() * 10000),
        businessId: activeBusinessId,
        itemId: ing.rawItemId,
        itemName: ing.rawItemName,
        changeQty: -deductQty,
        finalQty: Math.max(0, Number(remainingQty.toFixed(4))),
        type: MutationType.RAW_CONSUMPTION,
        referenceId: batchNo,
        note: `Konsumsi bahan mentah produksi ${quantityToProduce} ${finishedItem.unit} '${finishedItem.name}'`,
        timestamp: nowTs,
        performedBy: currentSession.user.fullName,
      });
    });

    newMutations.push({
      mutationId: 'mut-' + (nowTs + 1) + '-' + Math.floor(Math.random() * 10000),
      businessId: activeBusinessId,
      itemId: finishedItem.itemId,
      itemName: finishedItem.name,
      changeQty: quantityToProduce,
      finalQty: finishedItem.stockQuantity + quantityToProduce,
      type: MutationType.PRODUCTION_IN,
      referenceId: batchNo,
      note: `Bahan jadi masuk ke Gudang Stok via Resep BOM (${notes || 'Batch Produksi Standar'})`,
      timestamp: nowTs,
      performedBy: currentSession.user.fullName,
    });

    setStockMutations((prev) => [...newMutations, ...prev]);
    supabaseSyncService.syncStockMutations(newMutations);

    addAuditLog(
      'PRODUCE_GOODS',
      `Produksi +${quantityToProduce} ${finishedItem.unit} '${finishedItem.name}' selesai. Bahan mentah terpotong otomatis dari Gudang Bahan Baku (Batch: ${batchNo}).`,
      activeBusinessId
    );
    setUserMessage(
      `Produksi berhasil: +${quantityToProduce} ${finishedItem.unit} '${finishedItem.name}' masuk ke Gudang Stok. Stok bahan mentah terpotong sesuai resep BOM.`
    );
    return true;
  };

  const restockRawMaterial = (
    rawItemId: string,
    quantity: number,
    unitCost?: number,
    notes?: string
  ): boolean => {
    if (!activeBusinessId || !currentSession || quantity <= 0) {
      setErrorMessage('Kuantitas bahan baku harus lebih besar dari 0.');
      return false;
    }

    const rawItem = items.find(
      (i) => i.itemId === rawItemId && i.businessId === activeBusinessId && i.type === 'RAW_MATERIAL'
    );
    if (!rawItem) {
      setErrorMessage('Item bahan baku mentah tidak ditemukan.');
      return false;
    }

    const nowTs = Date.now();
    const refNo = `RAW-IN-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;

    const updatedRawItem: ItemEntity = {
      ...rawItem,
      stockQuantity: rawItem.stockQuantity + quantity,
      costPrice: unitCost && unitCost > 0 ? unitCost : rawItem.costPrice,
      updatedAt: nowTs,
    };

    setItems((prev) =>
      prev.map((i) => (i.itemId === rawItemId ? updatedRawItem : i))
    );
    supabaseSyncService.syncItem(updatedRawItem);

    const mutation: StockMutationEntity = {
      mutationId: 'mut-' + nowTs,
      businessId: activeBusinessId,
      itemId: rawItemId,
      itemName: rawItem.name,
      changeQty: quantity,
      finalQty: rawItem.stockQuantity + quantity,
      type: MutationType.RESTOCK_RAW,
      referenceId: refNo,
      note: notes?.trim() || 'Penerimaan / Pembelian Bahan Mentah Masuk ke Gudang Bahan Baku',
      timestamp: nowTs,
      performedBy: currentSession.user.fullName,
    };

    setStockMutations((prev) => [mutation, ...prev]);
    supabaseSyncService.syncStockMutation(mutation);

    if (unitCost && unitCost > 0) {
      const totalCost = quantity * unitCost;
      const expenseEntry: LedgerTransactionEntity = {
        transactionId: 'ledg-' + nowTs,
        businessId: activeBusinessId,
        type: LedgerType.PENGELUARAN,
        category: 'Pembelian Bahan Baku',
        amount: totalCost,
        referenceId: refNo,
        description: `Bahan Baku: ${quantity} ${rawItem.unit} ${rawItem.name} (@ Rp ${unitCost.toLocaleString('id-ID')})`,
        timestamp: nowTs,
        createdBy: currentSession.user.fullName,
      };
      setLedgers((prev) => [expenseEntry, ...prev]);
      supabaseSyncService.syncLedger(expenseEntry);
    }

    addAuditLog(
      'RESTOCK_RAW_MATERIAL',
      `Restock +${quantity} ${rawItem.unit} '${rawItem.name}' di Gudang Bahan Baku (${refNo})`,
      activeBusinessId
    );
    setUserMessage(`Berhasil menambah +${quantity} ${rawItem.unit} '${rawItem.name}' ke Gudang Bahan Baku.`);
    return true;
  };

  const updateItemRecipe = (
    itemId: string,
    bomFormula: string,
    ingredients: BomIngredient[]
  ): boolean => {
    if (!activeBusinessId) return false;
    let targetUpdated: ItemEntity | null = null;
    setItems((prev) =>
      prev.map((i) => {
        if (i.itemId === itemId) {
          const updated: ItemEntity = {
            ...i,
            recipeBom: bomFormula,
            bomIngredients: ingredients,
            updatedAt: Date.now(),
          };
          targetUpdated = updated;
          return updated;
        }
        return i;
      })
    );
    if (targetUpdated) {
      supabaseSyncService.syncItem(targetUpdated);
    }
    addAuditLog('UPDATE_ITEM_RECIPE', `Updated BOM recipe formula for item ${itemId}`, activeBusinessId);
    setUserMessage('Resep BOM bahan jadi berhasil diperbarui.');
    return true;
  };

  // -------------------------------------------------------------
  // POS
  // -------------------------------------------------------------
  const addToCart = (item: ItemEntity) => {
    // Strict requirement: Gudang Bahan Baku tidak terpengaruh ke stok penjualan dan tidak dapat dijual di POS!
    if (item.type === 'RAW_MATERIAL') {
      setErrorMessage('Bahan baku mentah tidak dapat dijual di kasir POS. Bahan mentah hanya untuk produksi di Gudang Bahan Baku.');
      return;
    }

    const existing = posCart.find((ci) => ci.item.itemId === item.itemId);
    if (existing) {
      if (item.type !== 'SERVICE' && existing.quantity + 1 > item.stockQuantity) {
        setErrorMessage(`Stok '${item.name}' tidak mencukupi (Tersedia: ${item.stockQuantity} ${item.unit}).`);
        return;
      }
      setPosCart((prev) =>
        prev.map((ci) =>
          ci.item.itemId === item.itemId ? { ...ci, quantity: ci.quantity + 1 } : ci
        )
      );
    } else {
      if (item.type !== 'SERVICE' && item.stockQuantity < 1) {
        setErrorMessage(`Stok '${item.name}' habis.`);
        return;
      }
      setPosCart((prev) => [...prev, { item, quantity: 1 }]);
    }
  };

  const updateCartQty = (itemId: string, qty: number) => {
    if (qty <= 0) {
      setPosCart((prev) => prev.filter((ci) => ci.item.itemId !== itemId));
    } else {
      setPosCart((prev) =>
        prev.map((ci) => {
          if (ci.item.itemId === itemId) {
            const max = ci.item.type === 'SERVICE' ? 9999 : ci.item.stockQuantity;
            const finalQty = Math.min(qty, max);
            if (qty > max) {
              setErrorMessage(`Stok maksimal '${ci.item.name}' adalah ${ci.item.stockQuantity}.`);
            }
            return { ...ci, quantity: finalQty };
          }
          return ci;
        })
      );
    }
  };

  const removeFromCart = (itemId: string) => {
    setPosCart((prev) => prev.filter((ci) => ci.item.itemId !== itemId));
  };

  const clearCart = () => {
    setPosCart([]);
  };

  const checkoutPos = (
    paymentMethod: PaymentMethod,
    stanIdOverride?: string | null,
    paidAmount?: number
  ): SaleOrderEntity | null => {
    if (!activeBusinessId || !currentSession || posCart.length === 0) return null;

    const nowTs = Date.now();
    const targetOutletId = stanIdOverride !== undefined ? stanIdOverride : (currentSession.user.outletId || null);
    const targetOutlet = targetOutletId ? outlets.find((o) => o.outletId === targetOutletId) : null;

    // 1. Verify all stock availability
    for (const cartItem of posCart) {
      if (cartItem.item.type !== 'SERVICE') {
        if (targetOutlet) {
          const oStock = outletStocks.find(
            (os) => os.outletId === targetOutlet.outletId && os.itemId === cartItem.item.itemId
          );
          if (!oStock || oStock.stockQuantity < cartItem.quantity) {
            setErrorMessage(
              `Stok di ${targetOutlet.name} tidak mencukupi untuk '${cartItem.item.name}' (Tersedia: ${oStock?.stockQuantity || 0} ${cartItem.item.unit}). Transaksi dibatalkan.`
            );
            return null;
          }
        } else {
          const liveItem = items.find((i) => i.itemId === cartItem.item.itemId);
          if (!liveItem || liveItem.stockQuantity < cartItem.quantity) {
            setErrorMessage(`Stok tidak mencukupi untuk '${cartItem.item.name}'. Transaksi dibatalkan.`);
            return null;
          }
        }
      }
    }

    const totalAmount = posCart.reduce((sum, ci) => sum + ci.quantity * ci.item.sellingPrice, 0);
    const receiptNo = `POS-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const itemsSummary = posCart.map((ci) => `${ci.item.name} (${ci.quantity}x)`).join(', ');
    const effectivePaid = paidAmount !== undefined && paidAmount >= totalAmount ? paidAmount : totalAmount;
    const changeAmount = Math.max(0, effectivePaid - totalAmount);

    const detailedItems: SaleOrderItem[] = posCart.map((ci) => ({
      itemId: ci.item.itemId,
      name: ci.item.name,
      price: ci.item.sellingPrice,
      quantity: ci.quantity,
      unit: ci.item.unit,
      subtotal: ci.quantity * ci.item.sellingPrice,
    }));

    // 2. Deduct inventory safely
    if (targetOutlet) {
      const changedOutletStocks: OutletStockEntity[] = [];
      setOutletStocks((prev) =>
        prev.map((os) => {
          if (os.outletId === targetOutlet.outletId) {
            const cartEntry = posCart.find((ci) => ci.item.itemId === os.itemId);
            if (cartEntry) {
              const updated: OutletStockEntity = {
                ...os,
                stockQuantity: Math.max(0, os.stockQuantity - cartEntry.quantity),
                updatedAt: nowTs,
              };
              changedOutletStocks.push(updated);
              return updated;
            }
          }
          return os;
        })
      );
      supabaseSyncService.syncOutletStocks(changedOutletStocks);
    } else {
      const changedItems: ItemEntity[] = [];
      setItems((prev) =>
        prev.map((item) => {
          const cartEntry = posCart.find((ci) => ci.item.itemId === item.itemId);
          if (cartEntry && item.type !== 'SERVICE') {
            const updated: ItemEntity = {
              ...item,
              stockQuantity: Math.max(0, item.stockQuantity - cartEntry.quantity),
              updatedAt: nowTs,
            };
            changedItems.push(updated);
            return updated;
          }
          return item;
        })
      );
      supabaseSyncService.syncItems(changedItems);
    }

    const activeBiz = businesses.find((b) => b.businessId === activeBusinessId);

    // 3. Create Sale Order
    const newSale: SaleOrderEntity = {
      saleId: 'sale-' + nowTs,
      receiptNumber: receiptNo,
      businessId: activeBusinessId,
      businessName: activeBiz?.name || 'TGP Enterprise',
      outletId: targetOutlet ? targetOutlet.outletId : null,
      outletName: targetOutlet ? targetOutlet.name : null,
      cashierName: currentSession.user.fullName,
      totalAmount,
      paidAmount: effectivePaid,
      changeAmount,
      paymentMethod,
      itemsSummary,
      items: detailedItems,
      timestamp: nowTs,
    };
    setSales((prev) => [newSale, ...prev]);
    supabaseSyncService.syncSale(newSale);

    // 4. Record Ledger Entry (PEMASUKAN)
    const newLedger: LedgerTransactionEntity = {
      transactionId: 'ledger-' + nowTs,
      businessId: activeBusinessId,
      outletId: targetOutlet ? targetOutlet.outletId : null,
      outletName: targetOutlet ? targetOutlet.name : null,
      type: LedgerType.PEMASUKAN,
      category: 'PENJUALAN_POS',
      amount: totalAmount,
      referenceId: receiptNo,
      description: `Penjualan Kasir POS${targetOutlet ? ` (${targetOutlet.name})` : ''} via ${paymentMethod} (${receiptNo})`,
      timestamp: nowTs,
      createdBy: currentSession.user.username,
    };
    setLedgers((prev) => [newLedger, ...prev]);
    supabaseSyncService.syncLedger(newLedger);

    addAuditLog(
      'POS_SALE',
      `Processed POS Sale: ${receiptNo}${targetOutlet ? ` [STAN: ${targetOutlet.name}]` : ''}, Total: Rp ${totalAmount.toLocaleString('id-ID')} via ${paymentMethod} (Bayar: Rp ${effectivePaid.toLocaleString('id-ID')}, Kembali: Rp ${changeAmount.toLocaleString('id-ID')})`,
      activeBusinessId
    );

    setPosCart([]);
    try {
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
    } catch {}

    setUserMessage(
      `Transaksi kasir ${receiptNo} sukses via ${paymentMethod}! Total: Rp ${totalAmount.toLocaleString('id-ID')}${changeAmount > 0 ? ` (Kembalian: Rp ${changeAmount.toLocaleString('id-ID')})` : ''}${targetOutlet ? ` [${targetOutlet.name}]` : ''}`
    );
    return newSale;
  };

  // -------------------------------------------------------------
  // TRANSFERS (Atomic, Same Owner Only)
  // -------------------------------------------------------------
  const requestTransfer = (
    sourceBusinessId: string,
    destBusinessId: string,
    itemId: string,
    qty: number,
    notes: string
  ): boolean => {
    if (sourceBusinessId === destBusinessId) {
      setErrorMessage('Bisnis asal dan tujuan transfer tidak boleh sama.');
      return false;
    }
    if (qty <= 0) {
      setErrorMessage('Jumlah transfer harus lebih besar dari 0.');
      return false;
    }

    const sourceBiz = businesses.find((b) => b.businessId === sourceBusinessId);
    const destBiz = businesses.find((b) => b.businessId === destBusinessId);
    if (!sourceBiz || !destBiz) {
      setErrorMessage('Bisnis tidak ditemukan.');
      return false;
    }
    if (sourceBiz.ownerId !== destBiz.ownerId) {
      setErrorMessage('Ditolak: Transfer hanya diizinkan antar Business yang dimiliki oleh OWNER yang sama.');
      return false;
    }

    const sourceItem = items.find((i) => i.itemId === itemId);
    if (!sourceItem || sourceItem.businessId !== sourceBusinessId) {
      setErrorMessage('Item sumber tidak valid.');
      return false;
    }
    if (sourceItem.stockQuantity < qty) {
      setErrorMessage(`Stok sumber tidak mencukupi (Tersedia: ${sourceItem.stockQuantity} ${sourceItem.unit}).`);
      return false;
    }

    const ref = `TRF-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;
    const unitVal = sourceItem.costPrice > 0 ? sourceItem.costPrice : sourceItem.sellingPrice;
    const totalVal = unitVal * qty;

    const newTransfer: TransferEntity = {
      transferId: 'trf-' + Date.now(),
      transferReference: ref,
      sourceBusinessId,
      sourceBusinessName: sourceBiz.name,
      sourceLocation: sourceItem.location,
      destBusinessId,
      destBusinessName: destBiz.name,
      destLocation: 'Outlet / Gudang Cabang',
      itemId,
      itemName: sourceItem.name,
      quantity: qty,
      unitValue: unitVal,
      totalValue: totalVal,
      ownerId: sourceBiz.ownerId,
      status: TransferStatus.PENDING,
      requestedBy: currentSession?.user.fullName || 'Staff',
      notes,
      createdAt: Date.now(),
    };

    setTransfers((prev) => [newTransfer, ...prev]);
    supabaseSyncService.syncTransfer(newTransfer);

    addAuditLog('TRANSFER_REQUESTED', `Requested Transfer ${ref}: ${sourceItem.name} (${qty} ${sourceItem.unit}) from ${sourceBiz.name} to ${destBiz.name}`, sourceBusinessId);
    setUserMessage(`Permintaan transfer ${ref} berhasil diajukan (Menunggu Approval).`);
    return true;
  };

  const approveTransfer = (transferId: string): boolean => {
    const t = transfers.find((tr) => tr.transferId === transferId);
    if (!t) {
      setErrorMessage('Transfer tidak ditemukan.');
      return false;
    }
    if (t.status !== TransferStatus.PENDING) {
      setErrorMessage(`Transfer sudah diproses sebelumnya (${t.status}).`);
      return false;
    }

    const sourceBiz = businesses.find((b) => b.businessId === t.sourceBusinessId);
    const destBiz = businesses.find((b) => b.businessId === t.destBusinessId);
    const sourceItem = items.find((i) => i.itemId === t.itemId);
    if (!sourceBiz || !destBiz || !sourceItem) {
      setErrorMessage('Data transfer tidak valid.');
      return false;
    }
    if (sourceBiz.ownerId !== destBiz.ownerId) {
      setErrorMessage('Pelanggaran Keamanan: Transfer antar OWNER berbeda dilarang.');
      return false;
    }
    if (sourceItem.stockQuantity < t.quantity) {
      setErrorMessage(`Stok di ${sourceBiz.name} tidak mencukupi untuk transfer.`);
      return false;
    }

    const nowTs = Date.now();

    // 1. Deduct from source and add to dest atomically
    const changedItems: ItemEntity[] = [];
    setItems((prev) => {
      const existingDestItem = prev.find(
        (i) => i.businessId === t.destBusinessId && (i.sku === sourceItem.sku || i.name.toLowerCase() === sourceItem.name.toLowerCase())
      );

      const updatedExisting = prev.map((item) => {
        if (item.itemId === sourceItem.itemId) {
          const updated: ItemEntity = {
            ...item,
            stockQuantity: item.stockQuantity - t.quantity,
            updatedAt: nowTs,
          };
          changedItems.push(updated);
          return updated;
        }
        if (existingDestItem && item.itemId === existingDestItem.itemId) {
          const updated: ItemEntity = {
            ...item,
            stockQuantity: item.stockQuantity + t.quantity,
            updatedAt: nowTs,
          };
          changedItems.push(updated);
          return updated;
        }
        return item;
      });

      if (!existingDestItem) {
        const newDestItem: ItemEntity = {
          itemId: 'item-dest-' + nowTs,
          businessId: t.destBusinessId,
          name: sourceItem.name,
          sku: sourceItem.sku,
          category: sourceItem.category,
          type: sourceItem.type,
          costPrice: sourceItem.costPrice,
          sellingPrice: sourceItem.sellingPrice,
          stockQuantity: t.quantity,
          unit: sourceItem.unit,
          location: t.destLocation,
          recipeBom: sourceItem.recipeBom,
          updatedAt: nowTs,
        };
        changedItems.push(newDestItem);
        return [...updatedExisting, newDestItem];
      }

      return updatedExisting;
    });
    supabaseSyncService.syncItems(changedItems);

    // 2. Add Ledger entry for Source (PEMASUKAN from inventory transfer)
    const sourceLedger: LedgerTransactionEntity = {
      transactionId: 'ledger-trf-src-' + nowTs,
      businessId: t.sourceBusinessId,
      type: LedgerType.PEMASUKAN,
      category: 'TRANSFER_KELUAR',
      amount: t.totalValue,
      referenceId: t.transferReference,
      description: `Nilai transfer persediaan ke ${destBiz.name} (${t.transferReference})`,
      timestamp: nowTs,
      createdBy: currentSession?.user.username || 'owner',
    };

    // 3. Add Ledger entry for Destination (PENGELUARAN acquisition)
    const destLedger: LedgerTransactionEntity = {
      transactionId: 'ledger-trf-dst-' + nowTs,
      businessId: t.destBusinessId,
      type: LedgerType.PENGELUARAN,
      category: 'TRANSFER_MASUK',
      amount: t.totalValue,
      referenceId: t.transferReference,
      description: `Akuisisi persediaan transfer dari ${sourceBiz.name} (${t.transferReference})`,
      timestamp: nowTs,
      createdBy: currentSession?.user.username || 'owner',
    };

    setLedgers((prev) => [sourceLedger, destLedger, ...prev]);
    supabaseSyncService.syncLedger(sourceLedger);
    supabaseSyncService.syncLedger(destLedger);

    // 4. Update transfer record
    const updatedTransfer: TransferEntity = {
      ...t,
      status: TransferStatus.APPROVED,
      approvedBy: currentSession?.user.fullName || 'OWNER',
      processedAt: nowTs,
    };
    setTransfers((prev) =>
      prev.map((tr) => (tr.transferId === transferId ? updatedTransfer : tr))
    );
    supabaseSyncService.syncTransfer(updatedTransfer);

    addAuditLog('TRANSFER_APPROVED', `ATOMIC TRANSFER APPROVED: ${t.transferReference}. Qty: ${t.quantity}, Total: Rp ${t.totalValue.toLocaleString('id-ID')}`, t.sourceBusinessId);
    setUserMessage(`Transfer ${t.transferReference} berhasil disetujui & diproses secara atomic.`);
    return true;
  };

  const rejectTransfer = (transferId: string, reason: string = ''): boolean => {
    const t = transfers.find((tr) => tr.transferId === transferId);
    if (!t) return false;

    const updatedTransfer: TransferEntity = {
      ...t,
      status: TransferStatus.REJECTED,
      approvedBy: currentSession?.user.fullName || 'OWNER',
      processedAt: Date.now(),
      notes: reason ? `${t.notes} [Ditolak: ${reason}]` : t.notes,
    };
    setTransfers((prev) =>
      prev.map((tr) => (tr.transferId === transferId ? updatedTransfer : tr))
    );
    supabaseSyncService.syncTransfer(updatedTransfer);

    addAuditLog('TRANSFER_REJECTED', `Transfer ${t.transferReference} REJECTED. Reason: ${reason}`, t.sourceBusinessId);
    setUserMessage(`Transfer ${t.transferReference} ditolak. Stok dan ledger tidak berubah.`);
    return true;
  };

  // -------------------------------------------------------------
  // DAMAGED GOODS
  // -------------------------------------------------------------
  const reportDamagedGoods = (
    location: string,
    itemId: string,
    qty: number,
    reason: string
  ): boolean => {
    if (!activeBusinessId || qty <= 0 || !reason.trim()) return false;
    const targetItem = items.find((i) => i.itemId === itemId);
    if (!targetItem) {
      setErrorMessage('Item tidak ditemukan.');
      return false;
    }

    const unitCost = targetItem.costPrice > 0 ? targetItem.costPrice : targetItem.sellingPrice;
    const lossValue = unitCost * qty;

    const newReport: DamagedGoodsReportEntity = {
      reportId: 'dmg-' + Date.now(),
      businessId: activeBusinessId,
      location: location || targetItem.location,
      itemId,
      itemName: targetItem.name,
      quantity: qty,
      lossValue,
      reason: reason.trim(),
      reportedBy: currentSession?.user.fullName || 'Staff',
      status: DamagedStatus.PENDING,
      timestamp: Date.now(),
    };

    setDamagedReports((prev) => [newReport, ...prev]);
    supabaseSyncService.syncDamaged(newReport);

    addAuditLog('DAMAGED_GOODS_REPORTED', `Reported damaged: ${targetItem.name} (${qty} ${targetItem.unit}), Reason: ${reason}`, activeBusinessId);
    setUserMessage('Laporan barang rusak berhasil dikirim (Status: PENDING).');
    return true;
  };

  const approveDamagedGoods = (reportId: string): boolean => {
    const report = damagedReports.find((d) => d.reportId === reportId);
    if (!report || report.status !== DamagedStatus.PENDING) return false;

    const nowTs = Date.now();

    // 1. Deduct stock safely
    const targetItem = items.find((i) => i.itemId === report.itemId);
    if (targetItem) {
      const updatedItem: ItemEntity = {
        ...targetItem,
        stockQuantity: Math.max(0, targetItem.stockQuantity - report.quantity),
        updatedAt: nowTs,
      };
      setItems((prev) =>
        prev.map((i) => (i.itemId === report.itemId ? updatedItem : i))
      );
      supabaseSyncService.syncItem(updatedItem);
    }

    // 2. Record ledger expense
    const damageLedger: LedgerTransactionEntity = {
      transactionId: 'ledger-dmg-' + nowTs,
      businessId: report.businessId,
      type: LedgerType.PENGELUARAN,
      category: 'PENGHAPUSAN_RUSAK',
      amount: report.lossValue,
      referenceId: 'DMG-' + report.reportId.slice(-6).toUpperCase(),
      description: `Kerugian Barang Rusak: ${report.itemName} (${report.reason})`,
      timestamp: nowTs,
      createdBy: currentSession?.user.username || 'owner',
    };
    setLedgers((prev) => [damageLedger, ...prev]);
    supabaseSyncService.syncLedger(damageLedger);

    // 3. Mark report approved
    const updatedReport: DamagedGoodsReportEntity = {
      ...report,
      status: DamagedStatus.APPROVED,
      approvedBy: currentSession?.user.fullName || 'OWNER',
      processedAt: nowTs,
    };
    setDamagedReports((prev) =>
      prev.map((d) => (d.reportId === reportId ? updatedReport : d))
    );
    supabaseSyncService.syncDamaged(updatedReport);

    addAuditLog('DAMAGED_GOODS_APPROVED', `Approved damaged stock write-off: ${report.itemName} (${report.quantity})`, report.businessId);
    setUserMessage(`Laporan barang rusak disetujui. Stok dipotong & ledger kerugian dicatat.`);
    return true;
  };

  const rejectDamagedGoods = (reportId: string, reason: string = ''): boolean => {
    const report = damagedReports.find((d) => d.reportId === reportId);
    if (!report || report.status !== DamagedStatus.PENDING) return false;

    const updatedReport: DamagedGoodsReportEntity = {
      ...report,
      status: DamagedStatus.REJECTED,
      approvedBy: currentSession?.user.fullName || 'OWNER',
      processedAt: Date.now(),
      reason: reason ? `${report.reason} [Ditolak: ${reason}]` : report.reason,
    };
    setDamagedReports((prev) =>
      prev.map((d) => (d.reportId === reportId ? updatedReport : d))
    );
    supabaseSyncService.syncDamaged(updatedReport);

    addAuditLog('DAMAGED_GOODS_REJECTED', `Rejected damaged stock write-off: ${report.itemName}${reason ? ` (Alasan: ${reason})` : ''}`, report.businessId);
    setUserMessage('Laporan barang rusak ditolak.');
    return true;
  };

  // -------------------------------------------------------------
  // FINANCE & MANUAL LEDGER
  // -------------------------------------------------------------
  const addManualLedgerEntry = (
    type: LedgerType,
    category: string,
    amount: number,
    description: string
  ): boolean => {
    if (!activeBusinessId || amount <= 0 || !description.trim()) {
      setErrorMessage('Nominal dan keterangan transaksi wajib diisi.');
      return false;
    }

    const nowTs = Date.now();
    const entry: LedgerTransactionEntity = {
      transactionId: 'ledger-manual-' + nowTs,
      businessId: activeBusinessId,
      type,
      category: category.trim() || (type === LedgerType.PEMASUKAN ? 'Pemasukan Lain' : 'Operasional'),
      amount,
      referenceId: 'MANUAL-' + nowTs.toString().slice(-6),
      description: description.trim(),
      timestamp: nowTs,
      createdBy: currentSession?.user.username || 'staff',
    };

    setLedgers((prev) => [entry, ...prev]);
    supabaseSyncService.syncLedger(entry);

    addAuditLog('MANUAL_LEDGER_ENTRY', `Manual ${type}: Rp ${amount.toLocaleString('id-ID')} (${description})`, activeBusinessId);
    setUserMessage(`Transaksi kas manual ${type} berhasil dicatat.`);
    return true;
  };

  // -------------------------------------------------------------
  // ATTENDANCE
  // -------------------------------------------------------------
  const recordAttendance = (type: 'MASUK' | 'PULANG', note: string) => {
    if (!activeBusinessId || !currentSession) return;

    const newAtt: AttendanceEntity = {
      attendanceId: 'att-' + Date.now(),
      businessId: activeBusinessId,
      userId: currentSession.user.userId,
      userName: currentSession.user.fullName,
      type,
      timestamp: Date.now(),
      note: note.trim(),
    };

    setAttendances((prev) => [newAtt, ...prev]);
    supabaseSyncService.syncAttendance(newAtt);

    addAuditLog('ATTENDANCE_RECORDED', `Presensi ${type} oleh ${currentSession.user.fullName} (${note || 'Tanpa catatan'})`, activeBusinessId);
    setUserMessage(`Presensi ${type} berhasil dicatat.`);
  };

  return (
    <TgpContext.Provider
      value={{
        currentSession,
        activeScreen,
        activeBusinessId,
        activeBusiness,
        authorizedBusinesses,
        allBusinesses: businesses,
        allOwners,
        allUsers: users,
        allItems: items,
        allTransfers: transfers.map((t) => ({
          ...t,
          targetBusinessId: t.targetBusinessId || t.destBusinessId,
        })),
        allDamagedGoods: damagedReports,
        allStaffForActiveBusiness,
        activeItems,
        activeTransfers,
        pendingTransfersForOwner,
        activeDamagedReports,
        pendingDamagedForOwner,
        activeLedger,
        activeSales,
        globalOwnerLedger,
        globalOwnerSales,
        globalOwnerItems,
        activeAttendances,
        allAuditLogs: auditLogs,
        stockMutations,
        activeStockMutations,
        outlets,
        activeOutlets,
        outletStocks,
        activeOutletStocks,
        stanTransfers,
        activeStanTransfers,
        posCart,
        userMessage,
        errorMessage,
        isLoading,
        supabaseStatus,
        supabaseStatusMessage,
        isSupabaseActive: supabaseStatus === 'CONNECTED',
        isSupabaseConfigured,
        syncAllWithSupabase,
        navigateTo,
        setActiveBusiness,
        clearMessages,
        login,
        logout,
        resetMasterAccount,
        createOwner,
        createAdminOwner,
        createStaff,
        createBusiness,
        updateBusiness,
        createOutlet,
        updateOutlet,
        deleteOutlet,
        transferStockToStan,
        returnStockFromStan,
        toggleBusinessModule,
        getOutletStockQuantity,
        addItem,
        produceFinishedGoods,
        restockRawMaterial,
        updateItemRecipe,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        checkoutPos,
        requestTransfer,
        approveTransfer,
        rejectTransfer,
        reportDamagedGoods,
        approveDamagedGoods,
        rejectDamagedGoods,
        addManualLedgerEntry,
        recordAttendance,
        businesses,
        users,
        items,
        auditLogs,
        activeLedgers: activeLedger,
        activeDamagedGoods: activeDamagedReports,
        cart: posCart,
        cartTotal,
        platformStats,
        ownerFinanceSummary,
        activeBusinessFinance,
        hasModule,
        isOwnerOrAdmin,
        canAccessFinance,
        canAccessCostPrice,
        deleteItem,
        resetToFactoryData,
        updateCartItemQuantity: updateCartQty,
        checkout: checkoutPos,
        requestStockTransfer,
        approveStockTransfer,
        rejectStockTransfer,
      }}
    >
      {children}
    </TgpContext.Provider>
  );
};

export const useTgp = (): TgpContextType => {
  const context = useContext(TgpContext);
  if (!context) {
    throw new Error('useTgp must be used within a TgpProvider');
  }
  return context;
};
