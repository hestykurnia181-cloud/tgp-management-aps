import {
  BusinessEntity,
  DamagedGoodsReportEntity,
  ItemEntity,
  LedgerTransactionEntity,
  TransferEntity,
  UserEntity,
  UserRole,
} from '../types';

/**
 * Normalizes any legacy or serialized role to one of the 8 canonical roles.
 */
export function normalizeUserRole(role: string): UserRole {
  if (role === 'LEADER') return UserRole.ADMIN_DIVISI;
  if (role === 'CASHIER') return UserRole.KASIR;
  if (Object.values(UserRole).includes(role as UserRole)) {
    return role as UserRole;
  }
  return UserRole.STAFF;
}

/**
 * Enforces tenant & business boundary check.
 * Strictly prevents cross-business data access.
 */
export function isUserAuthorizedForBusiness(
  user: UserEntity | null | undefined,
  business: BusinessEntity | null | undefined
): boolean {
  if (!user || !business) return false;
  const role = normalizeUserRole(user.role);

  // 1. MASTER manages platform only
  if (role === UserRole.MASTER) return true;

  // 2. OWNER has highest access across ALL businesses in their tenant
  if (role === UserRole.OWNER) {
    return business.ownerId === user.userId;
  }

  // 3. ADMIN_OWNER has access to multi-business assigned by OWNER
  if (role === UserRole.ADMIN_OWNER) {
    const isSameTenant = !user.ownerId || business.ownerId === user.ownerId;
    const isAssigned = (user.assignedBusinessIds || []).includes(business.businessId);
    return isSameTenant && isAssigned;
  }

  // 4. ADMIN_DIVISI: strictly bound to ONE division/business. NO cross-division access!
  if (role === UserRole.ADMIN_DIVISI) {
    return (
      business.businessId === user.businessId ||
      (user.assignedBusinessIds || []).includes(business.businessId)
    );
  }

  // 5. MANAGER: bound to assigned business & outlet location
  if (role === UserRole.MANAGER) {
    return business.businessId === user.businessId;
  }

  // 6. KASIR: bound strictly to assigned business and outlet
  if (role === UserRole.KASIR) {
    return business.businessId === user.businessId;
  }

  // 7. WAREHOUSE: bound strictly to assigned warehouse business
  if (role === UserRole.WAREHOUSE) {
    return business.businessId === user.businessId;
  }

  // 8. STAFF: bound strictly to assigned business
  if (role === UserRole.STAFF) {
    return business.businessId === user.businessId;
  }

  return false;
}

/**
 * Checks whether user has access to confidential OWNER-level finances.
 * Rule: ONLY OWNER has highest access to sensitive owner finances,
 * net profit, withdrawals, and platform tenant ledger summaries.
 */
export function canAccessSensitiveOwnerFinance(user: UserEntity | null | undefined): boolean {
  if (!user) return false;
  return normalizeUserRole(user.role) === UserRole.OWNER;
}

/**
 * Checks operational finance access (viewing daily division ledger).
 */
export function canAccessOperationalFinance(
  user: UserEntity | null | undefined,
  businessId: string | null | undefined
): boolean {
  if (!user) return false;
  const role = normalizeUserRole(user.role);

  // OWNER has full access to all finance
  if (role === UserRole.OWNER) return true;

  // ADMIN_OWNER has operational access to assigned businesses (excluding sensitive owner net profit)
  if (role === UserRole.ADMIN_OWNER) {
    if (!businessId) return true;
    return (user.assignedBusinessIds || []).includes(businessId);
  }

  // ADMIN_DIVISI has operational access only within their own division
  if (role === UserRole.ADMIN_DIVISI) {
    if (!businessId) return false;
    return user.businessId === businessId || (user.assignedBusinessIds || []).includes(businessId);
  }

  // MANAGER or STAFF: requires explicit canViewFinance permission
  if (role === UserRole.MANAGER || role === UserRole.STAFF) {
    if (!businessId || user.businessId !== businessId) return false;
    return !!user.permissions?.canViewFinance;
  }

  // KASIR and WAREHOUSE have ZERO finance ledger access
  return false;
}

/**
 * Verifies if user has authority to approve inter-business stock transfers.
 * High-value asset transfer requires OWNER authority.
 */
export function canApproveStockTransfer(user: UserEntity | null | undefined): boolean {
  if (!user) return false;
  const role = normalizeUserRole(user.role);
  return role === UserRole.OWNER || role === UserRole.MASTER;
}

/**
 * Verifies if user has authority to approve damaged goods write-offs.
 * Damaged write-off directly incurs ledger financial loss, strictly reserved for OWNER.
 */
export function canApproveDamagedGoodsWriteOff(user: UserEntity | null | undefined): boolean {
  if (!user) return false;
  const role = normalizeUserRole(user.role);
  return role === UserRole.OWNER || role === UserRole.MASTER;
}

/**
 * Enforces role creation and management hierarchy:
 * MASTER -> creates OWNER
 * OWNER -> creates ADMIN_OWNER and ADMIN_DIVISI
 * ADMIN_OWNER -> creates ADMIN_DIVISI, MANAGER, KASIR, WAREHOUSE, STAFF (in assigned businesses)
 * ADMIN_DIVISI -> creates MANAGER, KASIR, WAREHOUSE, STAFF (strictly in their division)
 */
export function canCreateUserRole(
  actor: UserEntity | null | undefined,
  targetRole: UserRole,
  targetBusinessId?: string | null
): { allowed: boolean; reason?: string } {
  if (!actor) {
    return { allowed: false, reason: 'Sesi pengguna tidak valid.' };
  }
  const actorRole = normalizeUserRole(actor.role);
  const normalizedTarget = normalizeUserRole(targetRole);

  if (actorRole === UserRole.MASTER) {
    if (normalizedTarget === UserRole.OWNER) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'Akun MASTER hanya dapat membuat dan mengelola akun OWNER.',
    };
  }

  if (actorRole === UserRole.OWNER) {
    if (normalizedTarget === UserRole.ADMIN_OWNER || normalizedTarget === UserRole.ADMIN_DIVISI) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason:
        'Sesuai hierarki TGP: Akun OWNER hanya dapat membuat akun ADMIN OWNER atau ADMIN DIVISI. Pembuatan staf operasional ditugaskan kepada Admin.',
    };
  }

  if (actorRole === UserRole.ADMIN_OWNER) {
    if (
      normalizedTarget === UserRole.ADMIN_DIVISI ||
      normalizedTarget === UserRole.MANAGER ||
      normalizedTarget === UserRole.KASIR ||
      normalizedTarget === UserRole.WAREHOUSE ||
      normalizedTarget === UserRole.STAFF
    ) {
      if (
        targetBusinessId &&
        actor.assignedBusinessIds &&
        !actor.assignedBusinessIds.includes(targetBusinessId)
      ) {
        return {
          allowed: false,
          reason: 'ADMIN OWNER tidak memiliki penugasan pada unit bisnis ini.',
        };
      }
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'ADMIN OWNER hanya dapat membuat akun operasional (Divisi, Manager, Kasir, Warehouse, Staff).',
    };
  }

  if (actorRole === UserRole.ADMIN_DIVISI) {
    if (
      normalizedTarget === UserRole.MANAGER ||
      normalizedTarget === UserRole.KASIR ||
      normalizedTarget === UserRole.WAREHOUSE ||
      normalizedTarget === UserRole.STAFF
    ) {
      if (targetBusinessId && targetBusinessId !== actor.businessId) {
        return {
          allowed: false,
          reason: 'ADMIN DIVISI dilarang membuat akun di luar divisi yang dikelolanya.',
        };
      }
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'ADMIN DIVISI hanya dapat membuat akun Manager, Kasir, Warehouse, atau Staff di divisinya.',
    };
  }

  return {
    allowed: false,
    reason: `Role ${actorRole} tidak memiliki izin membuat akun baru.`,
  };
}

/**
 * Filter businesses to strictly guarantee tenant & division data isolation.
 */
export function filterAuthorizedBusinesses(
  user: UserEntity | null | undefined,
  allBusinesses: BusinessEntity[]
): BusinessEntity[] {
  if (!user) return [];
  const role = normalizeUserRole(user.role);

  if (role === UserRole.MASTER) return allBusinesses;

  if (role === UserRole.OWNER) {
    return allBusinesses.filter((b) => b.ownerId === user.userId);
  }

  if (role === UserRole.ADMIN_OWNER) {
    const assigned = user.assignedBusinessIds || [];
    return allBusinesses.filter(
      (b) => assigned.includes(b.businessId) && (!user.ownerId || b.ownerId === user.ownerId)
    );
  }

  if (role === UserRole.ADMIN_DIVISI || role === UserRole.MANAGER || role === UserRole.KASIR || role === UserRole.WAREHOUSE || role === UserRole.STAFF) {
    return allBusinesses.filter((b) => b.businessId === user.businessId);
  }

  return [];
}

/**
 * Filters ledger records to strictly enforce business isolation and sensitive finance protection.
 */
export function filterAuthorizedLedger(
  user: UserEntity | null | undefined,
  allLedgers: LedgerTransactionEntity[],
  activeBusinessId: string | null
): LedgerTransactionEntity[] {
  if (!user) return [];
  const role = normalizeUserRole(user.role);

  // KASIR & WAREHOUSE never see financial ledger
  if (role === UserRole.KASIR || role === UserRole.WAREHOUSE) {
    return [];
  }

  if (role === UserRole.STAFF || role === UserRole.MANAGER) {
    if (!user.permissions?.canViewFinance) return [];
  }

  let filtered = allLedgers;
  if (activeBusinessId) {
    filtered = filtered.filter((l) => l.businessId === activeBusinessId);
  } else if (role === UserRole.OWNER) {
    // OWNER can view all ledgers under their tenant
    filtered = filtered;
  } else if (role === UserRole.ADMIN_OWNER) {
    const assigned = user.assignedBusinessIds || [];
    filtered = filtered.filter((l) => assigned.includes(l.businessId));
  } else {
    filtered = filtered.filter((l) => l.businessId === user.businessId);
  }

  // Hide sensitive owner withdrawals / owner capital injections from non-owners
  if (role !== UserRole.OWNER && role !== UserRole.MASTER) {
    filtered = filtered.filter(
      (l) =>
        l.category !== 'PRIVE_OWNER' &&
        l.category !== 'MODAL_AWAL_OWNER' &&
        l.category !== 'DIVIDEN_OWNER' &&
        l.category !== 'CONFIDENTIAL_OWNER'
    );
  }

  return filtered;
}

/**
 * Filter items to protect HPP (cost price) from unauthorized roles.
 */
export function filterAuthorizedItems(
  user: UserEntity | null | undefined,
  items: ItemEntity[]
): ItemEntity[] {
  if (!user) return [];
  const role = normalizeUserRole(user.role);

  const canSeeCost =
    role === UserRole.OWNER ||
    role === UserRole.ADMIN_OWNER ||
    role === UserRole.ADMIN_DIVISI ||
    (user.permissions && user.permissions.canViewCostPrice !== false);

  if (canSeeCost) return items;

  // Mask costPrice for KASIR or restricted staff
  return items.map((i) => ({
    ...i,
    costPrice: 0,
  }));
}
