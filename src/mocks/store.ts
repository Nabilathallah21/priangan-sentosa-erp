import "server-only";
import { createInitialSeedData, MockDatabaseState } from "./seed";
import { AppError } from "@/lib/errors";

declare global {
  // eslint-disable-next-line no-var
  var __PRIANGAN_MOCK_STORE__: MockDatabaseState | undefined;
}

export function getMockStore(): MockDatabaseState {
  if (!globalThis.__PRIANGAN_MOCK_STORE__) {
    globalThis.__PRIANGAN_MOCK_STORE__ = createInitialSeedData();
  }
  return globalThis.__PRIANGAN_MOCK_STORE__;
}

export function replaceMockStore(nextState: MockDatabaseState): void {
  globalThis.__PRIANGAN_MOCK_STORE__ = nextState;
}

export async function simulateMockNetwork(): Promise<void> {
  const maxDelay = Number(process.env.MOCK_LATENCY_MS ?? "30");
  if (maxDelay > 0) {
    const delay = Math.floor(Math.random() * maxDelay) + 10;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  const errorRate = Number(process.env.MOCK_ERROR_RATE ?? "0");
  if (errorRate > 0 && Math.random() < errorRate) {
    throw new AppError("INTERNAL_ERROR", "Simulasi gangguan jaringan/server (MOCK_ERROR_RATE aktif).");
  }
}
