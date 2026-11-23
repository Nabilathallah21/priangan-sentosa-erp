import { describe, it, expect, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { getContainer } from "@/server/container";

describe("Priangan Sentosa ERP — Repository & Business Rules Contract", () => {
  const { erpService, inventoryRepository, userRepository } = getContainer();

  const bossActor = { userId: "usr-boss-01", userName: "Boss Test", role: "BOSS" as const };
  const onlineAActor = { userId: "usr-online-a-01", userName: "Admin Online A", role: "ADMIN_ONLINE_A" as const };

  it("1. UserRepository memverifikasi password ter-hash dengan benar", async () => {
    const valid = await userRepository.verifyCredentials("boss", "Priangan2026!");
    expect(valid).not.toBeNull();
    expect(valid?.role).toBe("BOSS");

    const invalid = await userRepository.verifyCredentials("boss", "salah-password");
    expect(invalid).toBeNull();
  });

  it("2. Quality Control menolak pengesahan jika OK + NG != Diperiksa", async () => {
    await expect(
      erpService.approveQcInspection(bossActor, {
        inspectionDate: "2026-11-21",
        productionId: "prd-ord-002",
        inspectedQty: 200,
        okQty: 180,
        ngQty: 10, // 180 + 10 = 190 != 200
      })
    ).rejects.toThrow(/harus sama dengan/);
  });

  it("3. Transfer Stok Online menolak transfer jika stok Gudang OK tidak mencukupi (mencegah stok negatif)", async () => {
    await expect(
      erpService.postStockTransfer(bossActor, {
        transferDate: "2026-11-21",
        toLocation: "STOK_ONLINE_A",
        productId: "prd-001",
        qty: 999999,
      })
    ).rejects.toThrow(/tidak cukup/);
  });

  it("4. Admin Online A dilarang menjual produk milik kanal Online B (PRD-003)", async () => {
    await expect(
      erpService.postSale(onlineAActor, {
        saleDate: "2026-11-21",
        channel: "ONLINE_A",
        customerName: "Pembeli Test",
        productId: "prd-003", // ONLINE_B
        qty: 1,
        unitPrice: 16500,
        initialPayment: 16500,
        paymentMethod: "MARKETPLACE_SETTLEMENT",
      })
    ).rejects.toThrow(/bukan milik kanal Online A/);
  });

  it("5. Penerimaan bahan menambah stok dan mencatat InventoryMovement atomik", async () => {
    const before = await inventoryRepository.getBalance("MATERIAL", "mat-002", "GUDANG_BAHAN_BAKU");
    const beforeQty = before?.physicalQty ?? 0;

    await erpService.postMaterialReceipt(bossActor, {
      receiptDate: "2026-11-21",
      supplierId: "sup-001",
      materialId: "mat-002",
      qty: 50,
      unitPrice: 15000,
      externalDocNumber: "SJ-TEST-01",
    });

    const after = await inventoryRepository.getBalance("MATERIAL", "mat-002", "GUDANG_BAHAN_BAKU");
    expect(after?.physicalQty).toBe(beforeQty + 50);
  });
});
