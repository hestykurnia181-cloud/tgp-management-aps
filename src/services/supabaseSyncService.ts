import { getSupabaseClient, isSupabaseConfigured, supabaseUrl } from '../lib/supabase';
import {
  AttendanceEntity,
  AuditLogEntity,
  BusinessEntity,
  DamagedGoodsReportEntity,
  ItemEntity,
  LedgerTransactionEntity,
  OutletEntity,
  OutletStockEntity,
  SaleOrderEntity,
  StanTransferEntity,
  StockMutationEntity,
  TransferEntity,
  UserEntity,
} from '../types';

export type RealtimeStatus = 'CONNECTED' | 'CONNECTING' | 'LOCAL_OFFLINE' | 'ERROR';

export interface SyncHandlers {
  onBusinessesUpdated: (businesses: BusinessEntity[]) => void;
  onUsersUpdated: (users: UserEntity[]) => void;
  onItemsUpdated: (items: ItemEntity[]) => void;
  onSalesUpdated: (sales: SaleOrderEntity[]) => void;
  onLedgersUpdated: (ledgers: LedgerTransactionEntity[]) => void;
  onTransfersUpdated: (transfers: TransferEntity[]) => void;
  onDamagedUpdated: (reports: DamagedGoodsReportEntity[]) => void;
  onAttendancesUpdated: (attendances: AttendanceEntity[]) => void;
  onOutletsUpdated: (outlets: OutletEntity[]) => void;
  onOutletStocksUpdated: (stocks: OutletStockEntity[]) => void;
  onStanTransfersUpdated: (transfers: StanTransferEntity[]) => void;
  onStockMutationsUpdated: (mutations: StockMutationEntity[]) => void;
  onAuditLogsUpdated: (logs: AuditLogEntity[]) => void;
  onStatusChanged: (status: RealtimeStatus, message?: string) => void;
}

// Data Mappers: Database (snake_case) <-> Entity (camelCase)
export function mapBusinessFromDb(row: any): BusinessEntity {
  return {
    businessId: row.business_id,
    name: row.name,
    templateType: row.template_type,
    ownerId: row.owner_id,
    activeModules: Array.isArray(row.active_modules) ? row.active_modules : [],
    createdAt: Number(row.created_at),
  };
}

export function mapBusinessToDb(entity: BusinessEntity): any {
  return {
    business_id: entity.businessId,
    name: entity.name,
    template_type: entity.templateType,
    owner_id: entity.ownerId,
    active_modules: entity.activeModules,
    created_at: entity.createdAt,
  };
}

export function mapUserFromDb(row: any): UserEntity {
  return {
    userId: row.user_id,
    username: row.username,
    fullName: row.full_name,
    passwordHash: row.password_hash,
    role: row.role,
    ownerId: row.owner_id || null,
    businessId: row.business_id || null,
    outletId: row.outlet_id || null,
    assignedBusinessIds: Array.isArray(row.assigned_business_ids) ? row.assigned_business_ids : [],
    department: row.department || undefined,
    permissions: row.permissions || undefined,
    createdAt: Number(row.created_at),
  };
}

export function mapUserToDb(entity: UserEntity): any {
  return {
    user_id: entity.userId,
    username: entity.username,
    full_name: entity.fullName,
    password_hash: entity.passwordHash,
    role: entity.role,
    owner_id: entity.ownerId || null,
    business_id: entity.businessId || null,
    outlet_id: entity.outletId || null,
    assigned_business_ids: entity.assignedBusinessIds || [],
    department: entity.department || null,
    permissions: entity.permissions || null,
    created_at: entity.createdAt,
  };
}

export function mapItemFromDb(row: any): ItemEntity {
  return {
    itemId: row.item_id,
    businessId: row.business_id,
    name: row.name,
    sku: row.sku,
    category: row.category,
    type: row.type,
    sellingPrice: Number(row.selling_price || 0),
    costPrice: Number(row.cost_price || 0),
    stockQuantity: Number(row.stock_quantity || 0),
    unit: row.unit,
    minStockAlert: row.min_stock_alert ? Number(row.min_stock_alert) : undefined,
    location: row.location,
    recipeBom: row.recipe_bom || undefined,
    bomIngredients: Array.isArray(row.bom_ingredients) ? row.bom_ingredients : undefined,
    updatedAt: Number(row.updated_at),
  };
}

export function mapItemToDb(entity: ItemEntity): any {
  return {
    item_id: entity.itemId,
    business_id: entity.businessId,
    name: entity.name,
    sku: entity.sku,
    category: entity.category,
    type: entity.type,
    selling_price: entity.sellingPrice,
    cost_price: entity.costPrice,
    stock_quantity: entity.stockQuantity,
    unit: entity.unit,
    min_stock_alert: entity.minStockAlert || null,
    location: entity.location,
    recipe_bom: entity.recipeBom || null,
    bom_ingredients: entity.bomIngredients || null,
    updated_at: entity.updatedAt,
  };
}

export function mapSaleFromDb(row: any): SaleOrderEntity {
  return {
    saleId: row.sale_id,
    receiptNumber: row.receipt_number,
    businessId: row.business_id,
    businessName: row.business_name || undefined,
    outletId: row.outlet_id || null,
    outletName: row.outlet_name || null,
    cashierName: row.cashier_name,
    totalAmount: Number(row.total_amount || 0),
    paidAmount: Number(row.paid_amount || 0),
    changeAmount: Number(row.change_amount || 0),
    paymentMethod: row.payment_method,
    itemsSummary: row.items_summary,
    items: Array.isArray(row.items) ? row.items : [],
    timestamp: Number(row.timestamp),
  };
}

export function mapSaleToDb(entity: SaleOrderEntity): any {
  return {
    sale_id: entity.saleId,
    receipt_number: entity.receiptNumber,
    business_id: entity.businessId,
    business_name: entity.businessName || null,
    outlet_id: entity.outletId || null,
    outlet_name: entity.outletName || null,
    cashier_name: entity.cashierName,
    total_amount: entity.totalAmount,
    paid_amount: entity.paidAmount || 0,
    change_amount: entity.changeAmount || 0,
    payment_method: entity.paymentMethod,
    items_summary: entity.itemsSummary,
    items: entity.items,
    timestamp: entity.timestamp,
  };
}

export function mapLedgerFromDb(row: any): LedgerTransactionEntity {
  return {
    transactionId: row.transaction_id,
    businessId: row.business_id,
    outletId: row.outlet_id || null,
    outletName: row.outlet_name || null,
    type: row.type,
    category: row.category,
    amount: Number(row.amount || 0),
    description: row.description,
    referenceId: row.reference_id,
    createdBy: row.created_by,
    timestamp: Number(row.timestamp),
  };
}

export function mapLedgerToDb(entity: LedgerTransactionEntity): any {
  return {
    transaction_id: entity.transactionId,
    business_id: entity.businessId,
    outlet_id: entity.outletId || null,
    outlet_name: entity.outletName || null,
    type: entity.type,
    category: entity.category,
    amount: entity.amount,
    description: entity.description,
    reference_id: entity.referenceId,
    created_by: entity.createdBy,
    timestamp: entity.timestamp,
  };
}

export function mapTransferFromDb(row: any): TransferEntity {
  return {
    transferId: row.transfer_id,
    transferReference: row.transfer_reference,
    ownerId: row.owner_id || '',
    sourceBusinessId: row.source_business_id,
    sourceBusinessName: row.source_business_name,
    sourceLocation: row.source_location || 'Gudang Pusat',
    destBusinessId: row.dest_business_id,
    destBusinessName: row.dest_business_name,
    destLocation: row.dest_location || 'Outlet / Cabang',
    itemId: row.item_id,
    itemName: row.item_name,
    quantity: Number(row.quantity || 0),
    unitValue: Number(row.unit_value || row.unit_price || 0),
    totalValue: Number(row.total_value || 0),
    status: row.status,
    requestedBy: row.requested_by,
    approvedBy: row.approved_by || null,
    notes: row.notes || '',
    createdAt: Number(row.created_at),
    processedAt: row.processed_at ? Number(row.processed_at) : (row.updated_at ? Number(row.updated_at) : null),
  };
}

export function mapTransferToDb(entity: TransferEntity): any {
  return {
    transfer_id: entity.transferId,
    transfer_reference: entity.transferReference,
    owner_id: entity.ownerId || null,
    source_business_id: entity.sourceBusinessId,
    source_business_name: entity.sourceBusinessName,
    source_location: entity.sourceLocation,
    dest_business_id: entity.destBusinessId,
    dest_business_name: entity.destBusinessName,
    dest_location: entity.destLocation,
    item_id: entity.itemId,
    item_name: entity.itemName,
    quantity: entity.quantity,
    unit_value: entity.unitValue,
    total_value: entity.totalValue,
    status: entity.status,
    requested_by: entity.requestedBy,
    approved_by: entity.approvedBy || null,
    notes: entity.notes || null,
    created_at: entity.createdAt,
    processed_at: entity.processedAt || null,
  };
}

export function mapDamagedFromDb(row: any): DamagedGoodsReportEntity {
  return {
    reportId: row.report_id,
    businessId: row.business_id,
    itemId: row.item_id,
    itemName: row.item_name,
    quantity: Number(row.quantity || 0),
    lossValue: Number(row.loss_value || 0),
    location: row.location,
    reason: row.reason,
    reportedBy: row.reported_by,
    status: row.status,
    approvedBy: row.approved_by || row.reviewed_by || null,
    processedAt: row.processed_at ? Number(row.processed_at) : null,
    timestamp: Number(row.timestamp),
  };
}

export function mapDamagedToDb(entity: DamagedGoodsReportEntity): any {
  return {
    report_id: entity.reportId,
    business_id: entity.businessId,
    item_id: entity.itemId,
    item_name: entity.itemName,
    quantity: entity.quantity,
    loss_value: entity.lossValue,
    location: entity.location,
    reason: entity.reason,
    reported_by: entity.reportedBy,
    status: entity.status,
    approved_by: entity.approvedBy || null,
    processed_at: entity.processedAt || null,
    timestamp: entity.timestamp,
  };
}

export function mapAttendanceFromDb(row: any): AttendanceEntity {
  return {
    attendanceId: row.attendance_id,
    businessId: row.business_id,
    userId: row.user_id,
    userName: row.user_name,
    type: row.type,
    note: row.note || '',
    timestamp: Number(row.timestamp),
  };
}

export function mapAttendanceToDb(entity: AttendanceEntity): any {
  return {
    attendance_id: entity.attendanceId,
    business_id: entity.businessId,
    user_id: entity.userId,
    user_name: entity.userName,
    type: entity.type,
    note: entity.note,
    timestamp: entity.timestamp,
  };
}

export function mapOutletFromDb(row: any): OutletEntity {
  return {
    outletId: row.outlet_id,
    businessId: row.business_id,
    ownerId: row.owner_id,
    name: row.name,
    code: row.code,
    location: row.location,
    phone: row.phone || undefined,
    assignedStaffId: row.assigned_staff_id || undefined,
    assignedStaffName: row.assigned_staff_name || undefined,
    status: row.status,
    createdAt: Number(row.created_at),
  };
}

export function mapOutletToDb(entity: OutletEntity): any {
  return {
    outlet_id: entity.outletId,
    business_id: entity.businessId,
    owner_id: entity.ownerId,
    name: entity.name,
    code: entity.code,
    location: entity.location,
    phone: entity.phone || null,
    assigned_staff_id: entity.assignedStaffId || null,
    assigned_staff_name: entity.assignedStaffName || null,
    status: entity.status,
    created_at: entity.createdAt,
  };
}

export function mapOutletStockFromDb(row: any): OutletStockEntity {
  return {
    stockId: row.stock_id,
    outletId: row.outlet_id,
    businessId: row.business_id,
    itemId: row.item_id,
    itemName: row.item_name,
    sku: row.sku,
    category: row.category,
    sellingPrice: Number(row.selling_price || 0),
    costPrice: Number(row.cost_price || 0),
    unit: row.unit,
    stockQuantity: Number(row.stock_quantity || 0),
    updatedAt: Number(row.updated_at),
  };
}

export function mapOutletStockToDb(entity: OutletStockEntity): any {
  return {
    stock_id: entity.stockId,
    outlet_id: entity.outletId,
    business_id: entity.businessId,
    item_id: entity.itemId,
    item_name: entity.itemName,
    sku: entity.sku,
    category: entity.category,
    selling_price: entity.sellingPrice,
    cost_price: entity.costPrice,
    unit: entity.unit,
    stock_quantity: entity.stockQuantity,
    updated_at: entity.updatedAt,
  };
}

export function mapStanTransferFromDb(row: any): StanTransferEntity {
  return {
    transferId: row.transfer_id,
    transferReference: row.transfer_reference,
    businessId: row.business_id,
    outletId: row.outlet_id,
    outletName: row.outlet_name,
    direction: row.direction,
    itemId: row.item_id,
    itemName: row.item_name,
    quantity: Number(row.quantity || 0),
    timestamp: Number(row.timestamp),
    performedBy: row.performed_by,
    notes: row.notes || '',
  };
}

export function mapStanTransferToDb(entity: StanTransferEntity): any {
  return {
    transfer_id: entity.transferId,
    transfer_reference: entity.transferReference,
    business_id: entity.businessId,
    outlet_id: entity.outletId,
    outlet_name: entity.outletName,
    direction: entity.direction,
    item_id: entity.itemId,
    item_name: entity.itemName,
    quantity: entity.quantity,
    timestamp: entity.timestamp,
    performed_by: entity.performedBy,
    notes: entity.notes || null,
  };
}

export function mapStockMutationFromDb(row: any): StockMutationEntity {
  return {
    mutationId: row.mutation_id,
    businessId: row.business_id,
    itemId: row.item_id,
    itemName: row.item_name,
    type: row.type,
    changeQty: Number(row.change_qty || 0),
    finalQty: Number(row.final_qty || 0),
    referenceId: row.reference_id || row.mutation_id,
    note: row.note || '',
    performedBy: row.performed_by || 'system',
    timestamp: Number(row.timestamp),
  };
}

export function mapStockMutationToDb(entity: StockMutationEntity): any {
  return {
    mutation_id: entity.mutationId,
    business_id: entity.businessId,
    item_id: entity.itemId,
    item_name: entity.itemName,
    type: entity.type,
    change_qty: entity.changeQty,
    final_qty: entity.finalQty,
    reference_id: entity.referenceId,
    note: entity.note,
    performed_by: entity.performedBy,
    timestamp: entity.timestamp,
  };
}

export function mapAuditLogFromDb(row: any): AuditLogEntity {
  return {
    logId: row.log_id,
    userId: row.user_id,
    username: row.username,
    role: row.role,
    businessId: row.business_id || null,
    action: row.action,
    details: row.details,
    timestamp: Number(row.timestamp),
  };
}

export function mapAuditLogToDb(entity: AuditLogEntity): any {
  return {
    log_id: entity.logId,
    user_id: entity.userId,
    username: entity.username,
    role: entity.role,
    business_id: entity.businessId || null,
    action: entity.action,
    details: entity.details,
    timestamp: entity.timestamp,
  };
}

class SupabaseSyncService {
  private handlers: SyncHandlers | null = null;
  private channel: any = null;

  public initialize(handlers: SyncHandlers) {
    this.handlers = handlers;

    if (!isSupabaseConfigured) {
      handlers.onStatusChanged(
        'LOCAL_OFFLINE',
        'Supabase belum terhubung ke environment (VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY). Berjalan dalam mode penyimpanan lokal offline.'
      );
      return;
    }

    this.startRealtimeSync();
  }

  private async startRealtimeSync() {
    const supabase = getSupabaseClient();
    if (!supabase || !this.handlers) return;

    this.handlers.onStatusChanged('CONNECTING', 'Menghubungkan ke Supabase Realtime...');

    try {
      // 1. Initial State Fetch from Supabase
      await this.fetchAllData();

      // 2. Setup Realtime Channel
      if (this.channel) {
        supabase.removeChannel(this.channel);
      }

      this.channel = supabase
        .channel('tgp-realtime-room')
        .on('broadcast', { event: 'tgp_mutation' }, (payload: any) => {
          this.handleBroadcastEvent(payload);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'sales' }, () => this.fetchTable('sales'))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'ledgers' }, () => this.fetchTable('ledgers'))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, () => this.fetchTable('items'))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'transfers' }, () => this.fetchTable('transfers'))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'damaged_goods' }, () => this.fetchTable('damaged_goods'))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'attendances' }, () => this.fetchTable('attendances'))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'outlets' }, () => this.fetchTable('outlets'))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'outlet_stocks' }, () => this.fetchTable('outlet_stocks'))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'stan_transfers' }, () => this.fetchTable('stan_transfers'))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'stock_mutations' }, () => this.fetchTable('stock_mutations'))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'businesses' }, () => this.fetchTable('businesses'))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => this.fetchTable('users'))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'audit_logs' }, () => this.fetchTable('audit_logs'))
        .subscribe((status: string) => {
          if (status === 'SUBSCRIBED') {
            this.handlers?.onStatusChanged('CONNECTED', `Terhubung secara Live Realtime ke Supabase (${new URL(supabaseUrl).hostname})`);
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            this.handlers?.onStatusChanged('ERROR', `Koneksi Realtime Supabase terputus (${status})`);
          }
        });
    } catch (err: any) {
      console.error('[SupabaseSync] Init error:', err);
      this.handlers.onStatusChanged('ERROR', 'Gagal memuat data dari Supabase: ' + (err?.message || 'Error'));
    }
  }

  private handleBroadcastEvent(payload: any) {
    if (!this.handlers || !payload) return;
    const { type, table } = payload;
    if (type === 'INSERT_OR_UPDATE') {
      this.fetchTable(table);
    }
  }

  public async fetchAllData() {
    await Promise.allSettled([
      this.fetchTable('businesses'),
      this.fetchTable('users'),
      this.fetchTable('items'),
      this.fetchTable('sales'),
      this.fetchTable('ledgers'),
      this.fetchTable('transfers'),
      this.fetchTable('damaged_goods'),
      this.fetchTable('attendances'),
      this.fetchTable('outlets'),
      this.fetchTable('outlet_stocks'),
      this.fetchTable('stan_transfers'),
      this.fetchTable('stock_mutations'),
      this.fetchTable('audit_logs'),
    ]);
  }

  public async fetchTable(table: string) {
    const supabase = getSupabaseClient();
    if (!supabase || !this.handlers) return;

    try {
      const { data, error } = await supabase.from(table).select('*');
      if (error) {
        console.warn(`[SupabaseSync] Table ${table} fetch notice:`, error.message);
        return;
      }
      if (!data) return;

      switch (table) {
        case 'businesses':
          if (data.length > 0) this.handlers.onBusinessesUpdated(data.map(mapBusinessFromDb));
          break;
        case 'users':
          if (data.length > 0) this.handlers.onUsersUpdated(data.map(mapUserFromDb));
          break;
        case 'items':
          if (data.length > 0) this.handlers.onItemsUpdated(data.map(mapItemFromDb));
          break;
        case 'sales':
          if (data.length > 0) this.handlers.onSalesUpdated(data.map(mapSaleFromDb));
          break;
        case 'ledgers':
          if (data.length > 0) this.handlers.onLedgersUpdated(data.map(mapLedgerFromDb));
          break;
        case 'transfers':
          if (data.length > 0) this.handlers.onTransfersUpdated(data.map(mapTransferFromDb));
          break;
        case 'damaged_goods':
          if (data.length > 0) this.handlers.onDamagedUpdated(data.map(mapDamagedFromDb));
          break;
        case 'attendances':
          if (data.length > 0) this.handlers.onAttendancesUpdated(data.map(mapAttendanceFromDb));
          break;
        case 'outlets':
          if (data.length > 0) this.handlers.onOutletsUpdated(data.map(mapOutletFromDb));
          break;
        case 'outlet_stocks':
          if (data.length > 0) this.handlers.onOutletStocksUpdated(data.map(mapOutletStockFromDb));
          break;
        case 'stan_transfers':
          if (data.length > 0) this.handlers.onStanTransfersUpdated(data.map(mapStanTransferFromDb));
          break;
        case 'stock_mutations':
          if (data.length > 0) this.handlers.onStockMutationsUpdated(data.map(mapStockMutationFromDb));
          break;
        case 'audit_logs':
          if (data.length > 0) this.handlers.onAuditLogsUpdated(data.map(mapAuditLogFromDb));
          break;
      }
    } catch (e) {
      console.warn(`[SupabaseSync] Error fetching table ${table}:`, e);
    }
  }

  // --- Push helpers (Upsert to Supabase + Broadcast) ---
  private async upsertRecord(table: string, dbPayload: any) {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      const { error } = await supabase.from(table).upsert(dbPayload);
      if (error) {
        console.warn(`[SupabaseSync] Error upserting to ${table}:`, error.message);
      }
      if (this.channel) {
        this.channel.send({
          type: 'broadcast',
          event: 'tgp_mutation',
          payload: { type: 'INSERT_OR_UPDATE', table, data: dbPayload },
        });
      }
    } catch (err) {
      console.warn(`[SupabaseSync] Upsert failed on ${table}:`, err);
    }
  }

  public async syncSale(sale: SaleOrderEntity) {
    await this.upsertRecord('sales', mapSaleToDb(sale));
  }

  public async syncLedger(ledger: LedgerTransactionEntity) {
    await this.upsertRecord('ledgers', mapLedgerToDb(ledger));
  }

  public async syncItem(item: ItemEntity) {
    await this.upsertRecord('items', mapItemToDb(item));
  }

  public async syncItems(items: ItemEntity[]) {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    try {
      await supabase.from('items').upsert(items.map(mapItemToDb));
      if (this.channel) {
        this.channel.send({
          type: 'broadcast',
          event: 'tgp_mutation',
          payload: { type: 'INSERT_OR_UPDATE', table: 'items' },
        });
      }
    } catch (e) {
      console.warn('[SupabaseSync] Batch items upsert error:', e);
    }
  }

  public async syncTransfer(transfer: TransferEntity) {
    await this.upsertRecord('transfers', mapTransferToDb(transfer));
  }

  public async syncDamaged(report: DamagedGoodsReportEntity) {
    await this.upsertRecord('damaged_goods', mapDamagedToDb(report));
  }

  public async syncAttendance(attendance: AttendanceEntity) {
    await this.upsertRecord('attendances', mapAttendanceToDb(attendance));
  }

  public async syncOutlet(outlet: OutletEntity) {
    await this.upsertRecord('outlets', mapOutletToDb(outlet));
  }

  public async syncOutletStock(stock: OutletStockEntity) {
    await this.upsertRecord('outlet_stocks', mapOutletStockToDb(stock));
  }

  public async syncOutletStocks(stocks: OutletStockEntity[]) {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    try {
      await supabase.from('outlet_stocks').upsert(stocks.map(mapOutletStockToDb));
      if (this.channel) {
        this.channel.send({
          type: 'broadcast',
          event: 'tgp_mutation',
          payload: { type: 'INSERT_OR_UPDATE', table: 'outlet_stocks' },
        });
      }
    } catch (e) {
      console.warn('[SupabaseSync] Batch outlet_stocks upsert error:', e);
    }
  }

  public async syncStanTransfer(transfer: StanTransferEntity) {
    await this.upsertRecord('stan_transfers', mapStanTransferToDb(transfer));
  }

  public async syncStockMutation(mutation: StockMutationEntity) {
    await this.upsertRecord('stock_mutations', mapStockMutationToDb(mutation));
  }

  public async syncStockMutations(mutations: StockMutationEntity[]) {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    try {
      await supabase.from('stock_mutations').upsert(mutations.map(mapStockMutationToDb));
      if (this.channel) {
        this.channel.send({
          type: 'broadcast',
          event: 'tgp_mutation',
          payload: { type: 'INSERT_OR_UPDATE', table: 'stock_mutations' },
        });
      }
    } catch (e) {
      console.warn('[SupabaseSync] Batch stock_mutations upsert error:', e);
    }
  }

  public async syncBusiness(biz: BusinessEntity) {
    await this.upsertRecord('businesses', mapBusinessToDb(biz));
  }

  public async syncUser(user: UserEntity) {
    await this.upsertRecord('users', mapUserToDb(user));
  }

  public async syncAuditLog(log: AuditLogEntity) {
    await this.upsertRecord('audit_logs', mapAuditLogToDb(log));
  }

  public async seedInitialData(initialData: {
    businesses: BusinessEntity[];
    users: UserEntity[];
    items: ItemEntity[];
    ledgers: LedgerTransactionEntity[];
    sales: SaleOrderEntity[];
    transfers: TransferEntity[];
    damaged: DamagedGoodsReportEntity[];
    auditLogs: AuditLogEntity[];
  }) {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      const { count, error } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true });

      if (!error && (count === 0 || count === null)) {
        console.log('[SupabaseSync] Seeding initial data to Supabase...');
        await supabase.from('businesses').upsert(initialData.businesses.map(mapBusinessToDb));
        await supabase.from('users').upsert(initialData.users.map(mapUserToDb));
        await supabase.from('items').upsert(initialData.items.map(mapItemToDb));
        await supabase.from('ledgers').upsert(initialData.ledgers.map(mapLedgerToDb));
        await supabase.from('sales').upsert(initialData.sales.map(mapSaleToDb));
        await supabase.from('transfers').upsert(initialData.transfers.map(mapTransferToDb));
        await supabase.from('damaged_goods').upsert(initialData.damaged.map(mapDamagedToDb));
        await supabase.from('audit_logs').upsert(initialData.auditLogs.map(mapAuditLogToDb));
        console.log('[SupabaseSync] Initial data seeded successfully.');
      }
    } catch (e) {
      console.warn('[SupabaseSync] Seeding warning:', e);
    }
  }
}

export const supabaseSyncService = new SupabaseSyncService();
