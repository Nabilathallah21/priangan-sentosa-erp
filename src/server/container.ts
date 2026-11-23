import "server-only";
import { UserRepository } from "./repositories/contracts/user.repository";
import {
  MasterDataRepository, InventoryRepository, OperationsRepository,
  SalesAndFinanceRepository, AuditLogRepository
} from "./repositories/contracts/erp.repositories";
import { MockUserRepository } from "./repositories/mock/user.mock.repository";
import {
  MockMasterDataRepository, MockInventoryRepository, MockOperationsRepository,
  MockSalesAndFinanceRepository, MockAuditLogRepository
} from "./repositories/mock/erp.mock.repositories";
import { SupabaseUserRepository } from "./repositories/supabase/user.supabase.repository";
import {
  SupabaseMasterDataRepository, SupabaseInventoryRepository, SupabaseOperationsRepository,
  SupabaseSalesAndFinanceRepository, SupabaseAuditLogRepository
} from "./repositories/supabase/erp.supabase.repositories";
import { MockUnitOfWork, SupabaseUnitOfWork, UnitOfWork } from "./uow";
import { ErpService } from "./services/erp.service";

export interface ServiceContainer {
  uow: UnitOfWork;
  userRepository: UserRepository;
  masterRepository: MasterDataRepository;
  inventoryRepository: InventoryRepository;
  operationsRepository: OperationsRepository;
  salesRepository: SalesAndFinanceRepository;
  auditRepository: AuditLogRepository;
  erpService: ErpService;
}

let cachedContainer: ServiceContainer | null = null;

export function getContainer(): ServiceContainer {
  if (cachedContainer) return cachedContainer;

  const dataSource = process.env.DATA_SOURCE ?? "mock";

  if (dataSource === "supabase") {
    const uow = new SupabaseUnitOfWork();
    const userRepository = new SupabaseUserRepository();
    const masterRepository = new SupabaseMasterDataRepository();
    const inventoryRepository = new SupabaseInventoryRepository();
    const operationsRepository = new SupabaseOperationsRepository();
    const salesRepository = new SupabaseSalesAndFinanceRepository();
    const auditRepository = new SupabaseAuditLogRepository();

    const erpService = new ErpService(
      uow,
      masterRepository,
      inventoryRepository,
      operationsRepository,
      salesRepository,
      userRepository,
      auditRepository
    );

    cachedContainer = {
      uow,
      userRepository,
      masterRepository,
      inventoryRepository,
      operationsRepository,
      salesRepository,
      auditRepository,
      erpService,
    };
    return cachedContainer;
  }

  const uow = new MockUnitOfWork();
  const userRepository = new MockUserRepository();
  const masterRepository = new MockMasterDataRepository();
  const inventoryRepository = new MockInventoryRepository();
  const operationsRepository = new MockOperationsRepository();
  const salesRepository = new MockSalesAndFinanceRepository();
  const auditRepository = new MockAuditLogRepository();

  const erpService = new ErpService(
    uow,
    masterRepository,
    inventoryRepository,
    operationsRepository,
    salesRepository,
    userRepository,
    auditRepository
  );

  cachedContainer = {
    uow,
    userRepository,
    masterRepository,
    inventoryRepository,
    operationsRepository,
    salesRepository,
    auditRepository,
    erpService,
  };

  return cachedContainer;
}