import { z } from "zod";

export const productSchema = z.object({
  code: z.string().min(2, "Kode minimal 2 karakter").max(30),
  name: z.string().min(3, "Nama produk minimal 3 karakter"),
  category: z.string().min(2, "Kategori wajib diisi"),
  unit: z.string().min(1, "Satuan wajib dipilih"),
  defaultPrice: z.coerce.number().int("Harga harus bilangan bulat Rupiah").min(0, "Harga tidak boleh negatif"),
  minStock: z.coerce.number().int().min(0, "Stok minimum tidak boleh negatif"),
  onlineChannel: z.enum(["ONLINE_A", "ONLINE_B", "NONE"]),
});

export const materialSchema = z.object({
  code: z.string().min(2, "Kode minimal 2 karakter").max(30),
  name: z.string().min(3, "Nama bahan minimal 3 karakter"),
  materialType: z.enum(["BAHAN_BAKU", "BAHAN_PELENGKAP"]),
  category: z.string().min(2, "Kategori wajib diisi"),
  unit: z.string().min(1, "Satuan wajib dipilih"),
  minStock: z.coerce.number().int().min(0),
});

export const supplierSchema = z.object({
  name: z.string().min(3, "Nama supplier wajib diisi"),
  contact: z.string().min(5, "Kontak wajib diisi"),
  address: z.string().min(5, "Alamat wajib diisi"),
  notes: z.string().optional(),
});

export const customerSchema = z.object({
  name: z.string().min(3, "Nama pelanggan wajib diisi"),
  contact: z.string().min(5, "Kontak wajib diisi"),
  address: z.string().min(5, "Alamat wajib diisi"),
  creditLimit: z.coerce.number().int().min(0).optional(),
  notes: z.string().optional(),
});

export const openingBalanceSchema = z.object({
  itemType: z.enum(["MATERIAL", "PRODUCT"]),
  itemId: z.string().min(1, "Pilih item master"),
  locationCode: z.enum([
    "GUDANG_BAHAN_BAKU",
    "GUDANG_BAHAN_PELENGKAP",
    "GUDANG_BARANG_JADI_OK",
    "GUDANG_BARANG_NG",
    "STOK_ONLINE_A",
    "STOK_ONLINE_B",
  ]),
  qty: z.coerce.number().int().min(1, "Jumlah saldo awal minimal 1"),
  notes: z.string().optional(),
});

export const materialReceiptSchema = z.object({
  receiptDate: z.string().min(1),
  supplierId: z.string().min(1, "Supplier wajib dipilih"),
  materialId: z.string().min(1, "Bahan wajib dipilih"),
  qty: z.coerce.number().int().min(1, "Kuantitas minimal 1"),
  unitPrice: z.coerce.number().int().min(0, "Harga beli harus bilangan bulat >= 0"),
  externalDocNumber: z.string().min(1, "Nomor surat jalan/nota wajib diisi"),
  notes: z.string().optional(),
});

export const productionSchema = z.object({
  productionDate: z.string().min(1),
  batchCode: z.string().min(2, "Kode batch wajib diisi"),
  productId: z.string().min(1, "Produk jadi wajib dipilih"),
  targetQty: z.coerce.number().int().min(1),
  actualQty: z.coerce.number().int().min(1, "Hasil produksi minimal 1"),
  materialId: z.string().min(1, "Bahan terpakai wajib dipilih"),
  materialQtyUsed: z.coerce.number().int().min(1, "Jumlah bahan terpakai minimal 1"),
  notes: z.string().optional(),
});

export const qcSchema = z.object({
  inspectionDate: z.string().min(1),
  productionId: z.string().min(1, "Pilih dokumen produksi"),
  inspectedQty: z.coerce.number().int().min(1),
  okQty: z.coerce.number().int().min(0),
  ngQty: z.coerce.number().int().min(0),
  defectCategoryId: z.string().optional(),
  notes: z.string().optional(),
});

export const stockTransferSchema = z.object({
  transferDate: z.string().min(1),
  toLocation: z.enum(["STOK_ONLINE_A", "STOK_ONLINE_B"]),
  productId: z.string().min(1, "Pilih produk"),
  qty: z.coerce.number().int().min(1, "Jumlah transfer minimal 1"),
  notes: z.string().optional(),
});

export const saleSchema = z.object({
  saleDate: z.string().min(1),
  channel: z.enum(["OFFLINE", "ONLINE_A", "ONLINE_B"]),
  customerId: z.string().optional(),
  customerName: z.string().min(2, "Nama pelanggan/pembeli wajib diisi"),
  marketplaceOrderRef: z.string().optional(),
  productId: z.string().min(1, "Pilih produk"),
  qty: z.coerce.number().int().min(1, "Kuantitas minimal 1"),
  unitPrice: z.coerce.number().int().min(0, "Harga satuan tidak valid"),
  initialPayment: z.coerce.number().int().min(0).default(0),
  paymentMethod: z.enum(["TUNAI", "TRANSFER_BANK", "QRIS", "MARKETPLACE_SETTLEMENT"]).default("TUNAI"),
  notes: z.string().optional(),
});

export const paymentSchema = z.object({
  saleId: z.string().min(1, "Pilih faktur penjualan"),
  paymentDate: z.string().min(1),
  amount: z.coerce.number().int().min(1, "Nominal pembayaran minimal Rp 1"),
  method: z.enum(["TUNAI", "TRANSFER_BANK", "QRIS", "MARKETPLACE_SETTLEMENT"]),
  notes: z.string().optional(),
});

export const monthlySalarySchema = z.object({
  monthKey: z.string().regex(/^\d{4}-\d{2}$/, "Format bulan harus YYYY-MM"),
  totalAmount: z.coerce.number().int().min(0, "Total gaji tidak boleh negatif"),
  notes: z.string().optional(),
});
