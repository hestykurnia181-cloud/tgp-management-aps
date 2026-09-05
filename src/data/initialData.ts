import {
  BusinessEntity,
  DamagedGoodsReportEntity,
  ItemEntity,
  LedgerTransactionEntity,
  SaleOrderEntity,
  TransferEntity,
  UserEntity,
  UserRole,
} from '../types';

export const CANONICAL_MASTER_EMAIL = 'mdqputra@gmail.com';
export const CANONICAL_MASTER_PASS = '990830Ok';
export const CANONICAL_MASTER_NAME = 'Master Administrator (MDQ Putra)';

const now = Date.now();

// Sole master user initialized for the entire platform
export const INITIAL_USERS: UserEntity[] = [
  {
    userId: 'user-master-canonical',
    username: CANONICAL_MASTER_EMAIL,
    passwordHash: CANONICAL_MASTER_PASS,
    fullName: CANONICAL_MASTER_NAME,
    role: UserRole.MASTER,
    ownerId: null,
    createdAt: now,
  },
];

// Clean initial data - all demo entities removed
export const INITIAL_BUSINESSES: BusinessEntity[] = [];
export const INITIAL_ITEMS: ItemEntity[] = [];
export const INITIAL_LEDGERS: LedgerTransactionEntity[] = [];
export const INITIAL_SALES: SaleOrderEntity[] = [];
export const INITIAL_TRANSFERS: TransferEntity[] = [];
export const INITIAL_DAMAGED: DamagedGoodsReportEntity[] = [];

export const INITIAL_AUDIT_LOGS = [
  {
    logId: 'audit-01',
    userId: 'user-master-canonical',
    username: CANONICAL_MASTER_EMAIL,
    role: UserRole.MASTER,
    action: 'PLATFORM_INITIALIZED',
    details: `Sistem TGP Management siap digunakan dengan 1 akun MASTER tunggal (${CANONICAL_MASTER_EMAIL}).`,
    timestamp: now,
  },
];
