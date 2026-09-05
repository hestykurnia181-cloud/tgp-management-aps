export enum UserRole {
  MASTER = 'MASTER',
  OWNER = 'OWNER',
  ADMIN_OWNER = 'ADMIN_OWNER',
  ADMIN_DIVISI = 'ADMIN_DIVISI',
  MANAGER = 'MANAGER',
  KASIR = 'KASIR',
  WAREHOUSE = 'WAREHOUSE',
  STAFF = 'STAFF',
}

export const RoleHierarchyInfo: Record<
  UserRole,
  {
    displayName: string;
    level: number;
    description: string;
    badgeColor: string;
    scope: 'PLATFORM' | 'TENANT_OWNER' | 'MULTI_BUSINESS' | 'SINGLE_DIVISION' | 'OUTLET_OPERATIONAL';
    responsibilities: string[];
  }
> = {
  [UserRole.MASTER]: {
    displayName: 'MASTER',
    level: 100,
    description: 'Membuat & mengelola OWNER serta mengontrol platform.',
    badgeColor: 'amber',
    scope: 'PLATFORM',
    responsibilities: [
      'Membuat dan mengelola akun OWNER',
      'Audit log platform & keamanan sistem',
      'Kontrol platform TGP global',
    ],
  },
  [UserRole.OWNER]: {
    displayName: 'OWNER',
    level: 90,
    description: 'Pemilik tenant/bisnis. Memiliki akses tertinggi terhadap seluruh bisnis miliknya, Business Builder, dashboard global, laporan dan keuangan.',
    badgeColor: 'purple',
    scope: 'TENANT_OWNER',
    responsibilities: [
      'Business Builder (membuat/mengubah unit bisnis)',
      'Akses tertinggi seluruh keuangan & laba bersih sensitif',
      'Dashboard global multi-bisnis',
      'Persetujuan (approval) mutasi transfer & write-off barang rusak',
      'Menunjuk ADMIN OWNER & ADMIN DIVISI',
    ],
  },
  [UserRole.ADMIN_OWNER]: {
    displayName: 'ADMIN OWNER',
    level: 80,
    description: 'Pengelola yang ditunjuk OWNER. Memiliki akses operasional luas, tetapi TIDAK memiliki akses penuh terhadap keuangan sensitif OWNER.',
    badgeColor: 'blue',
    scope: 'MULTI_BUSINESS',
    responsibilities: [
      'Akses operasional luas pada bisnis yang ditugaskan',
      'Manajemen outlet & stan cabang',
      'Membuat dan mengelola akun staf operasional',
      'Pengawasan inventaris & transfer',
    ],
  },
  [UserRole.ADMIN_DIVISI]: {
    displayName: 'ADMIN DIVISI',
    level: 70,
    description: 'Mengelola satu bisnis/divisi tertentu seperti SEKAP, TEBOO, SKY, atau Tasya Jaya. Tidak boleh mengakses divisi lain tanpa permission.',
    badgeColor: 'cyan',
    scope: 'SINGLE_DIVISION',
    responsibilities: [
      'Pengelolaan penuh 1 divisi/bisnis terisolasi',
      'Manajemen stok katalog & harga jual divisi',
      'Kelola staf internal divisi',
      'Laporan penjualan & kas operasional internal',
    ],
  },
  [UserRole.MANAGER]: {
    displayName: 'MANAGER',
    level: 60,
    description: 'Mengawasi operasional sesuai bisnis/lokasi yang ditugaskan.',
    badgeColor: 'indigo',
    scope: 'OUTLET_OPERATIONAL',
    responsibilities: [
      'Supervisi operasional harian cabang/lokasi',
      'Pengawasan kasir & staf lokasi',
      'Monitoring absensi kerja',
    ],
  },
  [UserRole.KASIR]: {
    displayName: 'KASIR',
    level: 40,
    description: 'POS, transaksi penjualan, pembayaran, dan aktivitas kasir.',
    badgeColor: 'pink',
    scope: 'OUTLET_OPERATIONAL',
    responsibilities: [
      'Aplikasi POS (Kasir Penjualan)',
      'Pembayaran Cash, QRIS, dan Transfer',
      'Pencatatan nota & rekap shift kasir',
    ],
  },
  [UserRole.WAREHOUSE]: {
    displayName: 'WAREHOUSE',
    level: 40,
    description: 'Penerimaan, stok, mutasi, transfer, dan aktivitas gudang.',
    badgeColor: 'orange',
    scope: 'SINGLE_DIVISION',
    responsibilities: [
      'Penerimaan restock barang & bahan baku',
      'Pencatatan mutasi stok gudang',
      'Permintaan transfer stok antar-gudang/stan',
      'Produksi barang dengan resep BOM',
      'Pelaporan barang rusak/basi',
    ],
  },
  [UserRole.STAFF]: {
    displayName: 'STAFF',
    level: 30,
    description: 'Menjalankan aktivitas operasional sesuai permission yang diberikan.',
    badgeColor: 'emerald',
    scope: 'OUTLET_OPERATIONAL',
    responsibilities: [
      'Aktivitas operasional sesuai hak akses yang diberikan',
      'Pencatatan kehadiran (absensi masuk/pulang)',
    ],
  },
};

export enum BusinessTemplate {
  RETAIL = 'RETAIL',
  SERVICE = 'SERVICE',
  FNB = 'FNB',
  CUSTOM = 'CUSTOM',
}

export const BusinessTemplateInfo: Record<BusinessTemplate, { displayName: string; description: string }> = {
  [BusinessTemplate.RETAIL]: {
    displayName: 'TOKO / RETAIL',
    description: 'Produk, gudang, stok, POS pembayaran, transfer, absensi, laporan.',
  },
  [BusinessTemplate.SERVICE]: {
    displayName: 'JASA',
    description: 'Layanan jasa, kategori, harga, staff komisi, POS, absensi, laporan.',
  },
  [BusinessTemplate.FNB]: {
    displayName: 'F&B',
    description: 'Menu, resep BOM, bahan baku, gudang & outlet, POS, transfer, barang rusak.',
  },
  [BusinessTemplate.CUSTOM]: {
    displayName: 'CUSTOM',
    description: 'Konfigurasi kustom dengan modul pilihan operasional fleksibel.',
  },
};

export enum BusinessModule {
  POS = 'POS',
  INVENTORY = 'INVENTORY',
  TRANSFER = 'TRANSFER',
  DAMAGED_GOODS = 'DAMAGED_GOODS',
  FINANCE = 'FINANCE',
  ATTENDANCE = 'ATTENDANCE',
  REPORTS = 'REPORTS',
  STAN_OUTLET = 'STAN_OUTLET',
}

export const BusinessModuleInfo: Record<BusinessModule, { id: string; title: string; description: string }> = {
  [BusinessModule.POS]: {
    id: 'POS',
    title: 'POS (Kasir)',
    description: 'Transaksi kasir, metode pembayaran Cash/Transfer/QRIS.',
  },
  [BusinessModule.INVENTORY]: {
    id: 'INVENTORY',
    title: 'Gudang & Stok',
    description: 'Manajemen katalog item, lokasi gudang, dan tingkat stok.',
  },
  [BusinessModule.TRANSFER]: {
    id: 'TRANSFER',
    title: 'Transfer Antar Bisnis',
    description: 'Perpindahan stok aman antar bisnis dalam satu Owner.',
  },
  [BusinessModule.DAMAGED_GOODS]: {
    id: 'DAMAGED_GOODS',
    title: 'Laporan Barang Rusak',
    description: 'Pencatatan dan approval pemotongan stok rusak.',
  },
  [BusinessModule.FINANCE]: {
    id: 'FINANCE',
    title: 'Keuangan & Ledger',
    description: 'Buku kas terpisah: Pemasukan, Pengeluaran, Saldo, dan Laba/Rugi.',
  },
  [BusinessModule.ATTENDANCE]: {
    id: 'ATTENDANCE',
    title: 'Absensi & Staff',
    description: 'Pencatatan kehadiran staff, performer, dan shift kerja.',
  },
  [BusinessModule.REPORTS]: {
    id: 'REPORTS',
    title: 'Laporan & Audit',
    description: 'Laporan mutasi, penjualan, dan riwayat operasional.',
  },
  [BusinessModule.STAN_OUTLET]: {
    id: 'STAN_OUTLET',
    title: 'STAN / Outlet Cabang',
    description: 'Cabang stand penjualan, gudang stok jual mandiri dari produksi, laporan per stand & penugasan kasir.',
  },
};

export enum TransferStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum DamagedStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum PaymentMethod {
  CASH = 'CASH',
  TUNAI = 'CASH',
  TRANSFER = 'TRANSFER',
  QRIS = 'QRIS',
  DEBIT = 'DEBIT',
}

export enum LedgerType {
  PEMASUKAN = 'PEMASUKAN',
  PENGELUARAN = 'PENGELUARAN',
}

export enum MutationType {
  INITIAL = 'INITIAL',
  POS_SALE = 'POS_SALE',
  TRANSFER_IN = 'TRANSFER_IN',
  TRANSFER_OUT = 'TRANSFER_OUT',
  DAMAGED_GOODS = 'DAMAGED_GOODS',
  ADJUSTMENT = 'ADJUSTMENT',
  PRODUCTION_IN = 'PRODUCTION_IN',
  RAW_CONSUMPTION = 'RAW_CONSUMPTION',
  RESTOCK_RAW = 'RESTOCK_RAW',
}

export interface UserPermissions {
  canManageRawWarehouse?: boolean; // Gudang Bahan Baku
  canManageFinishedWarehouse?: boolean; // Gudang Stok / Bahan Jadi
  canProduceGoods?: boolean; // Produksi dari Resep BOM
  canTransferToStan?: boolean; // Transfer dari Gudang Stok ke STAN
  canViewFinance?: boolean;
  canViewCostPrice?: boolean;
}

export type StaffDepartment =
  | 'GUDANG_BAHAN_BAKU'
  | 'GUDANG_STOK'
  | 'PRODUKSI'
  | 'KASIR_STAN'
  | 'OPERASIONAL_UMUM';

export interface UserEntity {
  userId: string;
  username: string;
  passwordHash: string;
  fullName: string;
  role: UserRole;
  ownerId?: string | null;
  businessId?: string | null;
  outletId?: string | null;
  assignedBusinessIds?: string[];
  department?: StaffDepartment;
  permissions?: UserPermissions;
  createdAt: number;
}

export interface BusinessEntity {
  businessId: string;
  ownerId: string;
  name: string;
  templateType: BusinessTemplate;
  activeModules: string[];
  createdAt: number;
}

export interface OutletEntity {
  outletId: string;
  businessId: string;
  ownerId: string;
  name: string;
  code: string;
  location: string;
  phone?: string;
  assignedStaffId?: string;
  assignedStaffName?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: number;
}

export interface OutletStockEntity {
  stockId: string;
  outletId: string;
  businessId: string;
  itemId: string;
  itemName: string;
  sku: string;
  category: string;
  sellingPrice: number;
  costPrice: number;
  unit: string;
  stockQuantity: number;
  updatedAt: number;
}

export interface StanTransferEntity {
  transferId: string;
  transferReference: string;
  businessId: string;
  outletId: string;
  outletName: string;
  direction: 'PRODUCTION_TO_STAN' | 'STAN_TO_PRODUCTION';
  itemId: string;
  itemName: string;
  quantity: number;
  timestamp: number;
  performedBy: string;
  notes: string;
}

export interface BomIngredient {
  rawItemId: string;
  rawItemName: string;
  quantityNeeded: number;
  unit: string;
}

export interface ItemEntity {
  itemId: string;
  businessId: string;
  name: string;
  sku: string;
  category: string;
  type: 'PRODUCT' | 'SERVICE' | 'RAW_MATERIAL' | 'MENU_DISH' | 'FINISHED_GOODS';
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  unit: string;
  minStockAlert?: number;
  recipeBom?: string | null;
  bomIngredients?: BomIngredient[];
  location: string;
  updatedAt: number;
}

export interface StockMutationEntity {
  mutationId: string;
  businessId: string;
  itemId: string;
  itemName: string;
  changeQty: number;
  finalQty: number;
  type: MutationType;
  referenceId: string;
  note: string;
  timestamp: number;
  performedBy: string;
}

export interface LedgerTransactionEntity {
  transactionId: string;
  ledgerId?: string;
  businessId: string;
  outletId?: string | null;
  outletName?: string | null;
  type: LedgerType;
  category: string;
  amount: number;
  referenceId: string;
  description: string;
  timestamp: number;
  date?: number;
  createdBy: string;
}

export interface TransferEntity {
  transferId: string;
  transferReference: string;
  sourceBusinessId: string;
  sourceBusinessName: string;
  sourceLocation: string;
  destBusinessId: string;
  targetBusinessId?: string;
  destBusinessName: string;
  destLocation: string;
  itemId: string;
  itemName: string;
  quantity: number;
  unitValue: number;
  totalValue: number;
  ownerId: string;
  status: TransferStatus;
  requestedBy: string;
  approvedBy?: string | null;
  createdAt: number;
  processedAt?: number | null;
  notes: string;
}

export interface DamagedGoodsReportEntity {
  reportId: string;
  businessId: string;
  location: string;
  itemId: string;
  itemName: string;
  quantity: number;
  lossValue: number;
  reason: string;
  reportedBy: string;
  status: DamagedStatus;
  approvedBy?: string | null;
  timestamp: number;
  processedAt?: number | null;
}

export interface SaleOrderItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  unit?: string;
  subtotal: number;
}

export interface SaleOrderEntity {
  saleId: string;
  receiptNumber: string;
  invoiceNumber?: string;
  businessId: string;
  businessName?: string;
  outletId?: string | null;
  outletName?: string | null;
  cashierName: string;
  customerName?: string;
  totalAmount: number;
  paidAmount?: number;
  changeAmount?: number;
  paymentMethod: PaymentMethod;
  itemsSummary: string;
  items?: SaleOrderItem[];
  timestamp: number;
  createdAt?: number;
}

export interface AttendanceEntity {
  attendanceId: string;
  businessId: string;
  userId: string;
  userName: string;
  type: 'MASUK' | 'PULANG';
  timestamp: number;
  note: string;
}

export interface AuditLogEntity {
  logId: string;
  userId: string;
  username: string;
  role: UserRole;
  businessId?: string | null;
  action: string;
  details: string;
  timestamp: number;
}

export interface UserSession {
  user: UserEntity;
  assignedBusinessIds: string[];
  staffBinding?: {
    businessId: string;
    role: UserRole;
    outletId?: string | null;
  } | null;
}

export interface CartItem {
  item: ItemEntity;
  quantity: number;
}

export type AppScreen =
  | 'SETUP_MASTER'
  | 'LOGIN'
  | 'MASTER_DASHBOARD'
  | 'OWNER_DASHBOARD'
  | 'BUSINESS_HOME'
  | 'POS_MODULE'
  | 'INVENTORY_MODULE'
  | 'TRANSFER_MODULE'
  | 'APPROVAL_MODULE'
  | 'DAMAGED_GOODS_MODULE'
  | 'FINANCE_MODULE'
  | 'ATTENDANCE_MODULE'
  | 'REPORTS_MODULE'
  | 'STAN_OUTLET_MODULE'
  | 'AUDIT_LOG_VIEWER';
