import "server-only";
import { getMockStore, replaceMockStore } from "@/mocks/store";

export interface TransactionContext {
  readonly isMock: boolean;
}

export interface UnitOfWork {
  runInTransaction<T>(fn: (tx: TransactionContext) => Promise<T>): Promise<T>;
}

export class MockUnitOfWork implements UnitOfWork {
  async runInTransaction<T>(fn: (tx: TransactionContext) => Promise<T>): Promise<T> {
    const snapshot = structuredClone(getMockStore());
    try {
      return await fn({ isMock: true });
    } catch (error) {
      replaceMockStore(snapshot);
      throw error;
    }
  }
}

export class SupabaseUnitOfWork implements UnitOfWork {
  async runInTransaction<T>(fn: (tx: TransactionContext) => Promise<T>): Promise<T> {
    return fn({ isMock: false });
  }
}