"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, CheckCircle2, FileSpreadsheet, Printer } from "lucide-react";
import { DataTable } from "@/components/tables/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ProductMasterDTO, MaterialMasterDTO, SupplierDTO, CustomerDTO,
  QcDefectCategoryDTO, StockBalanceDTO, InventoryMovementDTO,
  MaterialReceiptDTO, ProductionOrderDTO, QcInspectionDTO,
  StockTransferDTO, SaleDTO, PaymentDTO, MonthlySalaryDTO,
  AuditLogDTO, ProfitReportRowDTO, UserDTO, SalesChannel
} from "@/types/dto";
import {
  createProductAction, toggleProductAction, createMaterialAction,
  createSupplierAction, createCustomerAction, createQcDefectAction,
  postOpeningBalanceAction, postMaterialReceiptAction, postProductionAction,
  approveQcAction, postStockTransferAction, postSaleAction,
  recordPaymentAction, updateOnlineOrderStatusAction, saveMonthlySalaryAction, createUserAction, toggleUserStatusAction
} from "@/server/actions/erp.actions";
import { formatRupiah, formatTanggal, formatTanggalWaktu } from "@/lib/utils";

// --- 1. DATA PRODUK ---
export function ProductMasterView({ initialItems, total, canEdit }: { initialItems: ProductMasterDTO[]; total: number; canEdit: boolean }) {
  const [search, setSearch] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Makanan Ringan");
  const [unit, setUnit] = useState("Pcs");
  const [defaultPrice, setDefaultPrice] = useState("20000");
  const [minStock, setMinStock] = useState("100");
  const [onlineChannel, setOnlineChannel] = useState<"ONLINE_A" | "ONLINE_B" | "NONE">("ONLINE_A");
  const [submitting, setSubmitting] = useState(false);

  const filtered = initialItems.filter((p) =>
    p.code.toLowerCase().includes(search.toLowerCase()) || p.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await createProductAction({
      code, name, category, unit,
      defaultPrice: Number(defaultPrice),
      minStock: Number(minStock),
      onlineChannel,
    });
    setSubmitting(false);
    if (!res.ok) return toast.error(res.error.message);
    toast.success("Produk master berhasil ditambahkan.");
    setCode(""); setName("");
  }

  const columns: ColumnDef<ProductMasterDTO>[] = [
    { accessorKey: "code", header: "Kode" },
    { accessorKey: "name", header: "Nama Produk" },
    { accessorKey: "category", header: "Kategori" },
    { accessorKey: "unit", header: "Satuan" },
    {
      accessorKey: "defaultPrice",
      header: "Harga Default",
      cell: ({ row }) => formatRupiah(row.original.defaultPrice),
    },
    {
      accessorKey: "onlineChannel",
      header: "Kanal Online",
      cell: ({ row }) => <Badge variant="outline" className="bg-[#E8EEF8] text-[#526D9B] border-none">{row.original.onlineChannel}</Badge>,
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <Badge className={row.original.isActive ? "bg-[#DDEBE3] text-[#638773] border-none" : "bg-[#F4DFDF] text-[#BB6D70] border-none"}>
          {row.original.isActive ? "Aktif" : "Nonaktif"}
        </Badge>
      ),
    },
    ...(canEdit
      ? [{
          id: "actions",
          header: "Aksi",
          cell: ({ row }: { row: { original: ProductMasterDTO } }) => (
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                const res = await toggleProductAction(row.original.id, !row.original.isActive);
                if (!res.ok) toast.error(res.error.message);
                else toast.success("Status produk diperbarui.");
              }}
            >
              {row.original.isActive ? "Nonaktifkan" : "Aktifkan"}
            </Button>
          ),
        }]
      : []),
  ];

  return (
    <div className="space-y-6">
      {canEdit && (
        <Card className="border-[#E5E7EB] shadow-none">
          <CardHeader><CardTitle className="text-base">Tambah Produk Jadi Baru</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div><Label>Kode Produk</Label><Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="PRD-005" required /></div>
              <div className="md:col-span-2"><Label>Nama Produk</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama lengkap produk" required /></div>
              <div><Label>Kategori</Label><Input value={category} onChange={(e) => setCategory(e.target.value)} required /></div>
              <div>
                <Label>Satuan</Label>
                <select value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full h-9 rounded-md border border-[#E5E7EB] bg-white px-3 text-sm">
                  <option value="Pcs">Pcs</option><option value="Box">Box</option><option value="Bal">Bal</option>
                </select>
              </div>
              <div><Label>Harga Default (Rp)</Label><Input type="number" value={defaultPrice} onChange={(e) => setDefaultPrice(e.target.value)} required /></div>
              <div><Label>Stok Minimum</Label><Input type="number" value={minStock} onChange={(e) => setMinStock(e.target.value)} required /></div>
              <div>
                <Label>Kanal Online</Label>
                <select value={onlineChannel} onChange={(e) => setOnlineChannel(e.target.value as "ONLINE_A" | "ONLINE_B" | "NONE")} className="w-full h-9 rounded-md border border-[#E5E7EB] bg-white px-3 text-sm">
                  <option value="ONLINE_A">ONLINE_A (Admin Online A)</option>
                  <option value="ONLINE_B">ONLINE_B (Admin Online B)</option>
                  <option value="NONE">Offline Saja</option>
                </select>
              </div>
              <div className="md:col-span-4 flex justify-end">
                <Button type="submit" disabled={submitting} className="bg-[#526D9B] hover:bg-[#435b84]">
                  <Plus className="mr-2 h-4 w-4" /> Simpan Produk
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      <DataTable columns={columns} data={filtered} total={total} page={1} pageSize={20} searchValue={search} onSearchChange={setSearch} searchPlaceholder="Cari kode atau nama produk..." />
    </div>
  );
}

// --- 2. DATA BAHAN ---
export function MaterialMasterView({ initialItems, total, canEdit }: { initialItems: MaterialMasterDTO[]; total: number; canEdit: boolean }) {
  const [search, setSearch] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [materialType, setMaterialType] = useState<"BAHAN_BAKU" | "BAHAN_PELENGKAP">("BAHAN_BAKU");
  const [category, setCategory] = useState("Bahan Utama");
  const [unit, setUnit] = useState("Kg");
  const [minStock, setMinStock] = useState("100");

  const filtered = initialItems.filter((m) =>
    m.code.toLowerCase().includes(search.toLowerCase()) || m.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const res = await createMaterialAction({ code, name, materialType, category, unit, minStock: Number(minStock) });
    if (!res.ok) return toast.error(res.error.message);
    toast.success("Data bahan berhasil disimpan.");
    setCode(""); setName("");
  }

  const columns: ColumnDef<MaterialMasterDTO>[] = [
    { accessorKey: "code", header: "Kode" },
    { accessorKey: "name", header: "Nama Bahan" },
    {
      accessorKey: "materialType",
      header: "Jenis",
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-[#E8EEF8] text-[#526D9B] border-none">
          {row.original.materialType === "BAHAN_BAKU" ? "Bahan Baku" : "Bahan Pelengkap"}
        </Badge>
      ),
    },
    { accessorKey: "unit", header: "Satuan" },
    { accessorKey: "minStock", header: "Stok Min" },
  ];

  return (
    <div className="space-y-6">
      {canEdit && (
        <Card className="border-[#E5E7EB] shadow-none">
          <CardHeader><CardTitle className="text-base">Tambah Master Bahan Baku / Pelengkap</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><Label>Kode Bahan</Label><Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="BHN-004" required /></div>
              <div><Label>Nama Bahan</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama bahan" required /></div>
              <div>
                <Label>Jenis Bahan</Label>
                <select value={materialType} onChange={(e) => setMaterialType(e.target.value as "BAHAN_BAKU" | "BAHAN_PELENGKAP")} className="w-full h-9 rounded-md border border-[#E5E7EB] bg-white px-3 text-sm">
                  <option value="BAHAN_BAKU">Bahan Baku</option>
                  <option value="BAHAN_PELENGKAP">Bahan Pelengkap</option>
                </select>
              </div>
              <div><Label>Kategori</Label><Input value={category} onChange={(e) => setCategory(e.target.value)} required /></div>
              <div>
                <Label>Satuan</Label>
                <select value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full h-9 rounded-md border border-[#E5E7EB] bg-white px-3 text-sm">
                  <option value="Kg">Kg</option><option value="Liter">Liter</option><option value="Pcs">Pcs</option><option value="Roll">Roll</option>
                </select>
              </div>
              <div><Label>Stok Minimum</Label><Input type="number" value={minStock} onChange={(e) => setMinStock(e.target.value)} required /></div>
              <div className="md:col-span-3 flex justify-end">
                <Button type="submit" className="bg-[#526D9B] hover:bg-[#435b84]"><Plus className="mr-2 h-4 w-4" /> Simpan Bahan</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      <DataTable columns={columns} data={filtered} total={total} page={1} pageSize={50} searchValue={search} onSearchChange={setSearch} />
    </div>
  );
}

// --- 3. SUPPLIER & PELANGGAN & KATEGORI QC ---
export function SupplierView({ initialItems, total }: { initialItems: SupplierDTO[]; total: number }) {
  const [name, setName] = useState(""); const [contact, setContact] = useState(""); const [address, setAddress] = useState("");
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await createSupplierAction({ name, contact, address });
    if (!res.ok) return toast.error(res.error.message);
    toast.success("Supplier ditambahkan."); setName(""); setContact(""); setAddress("");
  }
  const cols: ColumnDef<SupplierDTO>[] = [
    { accessorKey: "name", header: "Nama Supplier" },
    { accessorKey: "contact", header: "Kontak" },
    { accessorKey: "address", header: "Alamat" },
  ];
  return (
    <div className="space-y-6">
      <Card className="border-[#E5E7EB] shadow-none">
        <CardHeader><CardTitle className="text-base">Tambah Data Supplier</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><Label>Nama Supplier</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
            <div><Label>Kontak / Telepon</Label><Input value={contact} onChange={(e) => setContact(e.target.value)} required /></div>
            <div><Label>Alamat</Label><Input value={address} onChange={(e) => setAddress(e.target.value)} required /></div>
            <div className="md:col-span-3 flex justify-end"><Button type="submit" className="bg-[#526D9B]">Simpan Supplier</Button></div>
          </form>
        </CardContent>
      </Card>
      <DataTable columns={cols} data={initialItems} total={total} page={1} pageSize={50} />
    </div>
  );
}

export function CustomerView({ initialItems, total }: { initialItems: CustomerDTO[]; total: number }) {
  const [name, setName] = useState(""); const [contact, setContact] = useState(""); const [address, setAddress] = useState(""); const [creditLimit, setCreditLimit] = useState("10000000");
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await createCustomerAction({ name, contact, address, creditLimit: Number(creditLimit) });
    if (!res.ok) return toast.error(res.error.message);
    toast.success("Pelanggan ditambahkan."); setName(""); setContact(""); setAddress("");
  }
  const cols: ColumnDef<CustomerDTO>[] = [
    { accessorKey: "name", header: "Nama Pelanggan" },
    { accessorKey: "contact", header: "Kontak" },
    { accessorKey: "address", header: "Alamat" },
    { accessorKey: "creditLimit", header: "Batas Piutang", cell: ({ row }) => formatRupiah(row.original.creditLimit ?? 0) },
  ];
  return (
    <div className="space-y-6">
      <Card className="border-[#E5E7EB] shadow-none">
        <CardHeader><CardTitle className="text-base">Tambah Data Pelanggan</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div><Label>Nama Pelanggan</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
            <div><Label>Kontak</Label><Input value={contact} onChange={(e) => setContact(e.target.value)} required /></div>
            <div><Label>Alamat</Label><Input value={address} onChange={(e) => setAddress(e.target.value)} required /></div>
            <div><Label>Batas Piutang (Rp)</Label><Input type="number" value={creditLimit} onChange={(e) => setCreditLimit(e.target.value)} /></div>
            <div className="md:col-span-4 flex justify-end"><Button type="submit" className="bg-[#526D9B]">Simpan Pelanggan</Button></div>
          </form>
        </CardContent>
      </Card>
      <DataTable columns={cols} data={initialItems} total={total} page={1} pageSize={50} />
    </div>
  );
}

export function QcDefectView({ items }: { items: QcDefectCategoryDTO[] }) {
  const [name, setName] = useState("");
  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const res = await createQcDefectAction(name);
    if (!res.ok) return toast.error(res.error.message);
    toast.success("Kategori cacat QC ditambahkan."); setName("");
  }
  const cols: ColumnDef<QcDefectCategoryDTO>[] = [
    { accessorKey: "name", header: "Nama Kategori Cacat QC" },
    { accessorKey: "isActive", header: "Status", cell: ({ row }) => row.original.isActive ? "Aktif" : "Nonaktif" },
  ];
  return (
    <div className="space-y-6">
      <Card className="border-[#E5E7EB] shadow-none">
        <CardHeader><CardTitle className="text-base">Tambah Kategori Cacat QC</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="flex gap-3">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Kemasan Penyok" className="max-w-md" required />
            <Button type="submit" className="bg-[#526D9B]">Tambah</Button>
          </form>
        </CardContent>
      </Card>
      <DataTable columns={cols} data={items} total={items.length} page={1} pageSize={50} />
    </div>
  );
}

// --- 4. SALDO AWAL STOK ---
export function OpeningBalanceView({ products, materials, balances }: { products: ProductMasterDTO[]; materials: MaterialMasterDTO[]; balances: StockBalanceDTO[] }) {
  const [itemType, setItemType] = useState<"MATERIAL" | "PRODUCT">("MATERIAL");
  const [itemId, setItemId] = useState(materials[0]?.id ?? "");
  const [locationCode, setLocationCode] = useState("GUDANG_BAHAN_BAKU");
  const [qty, setQty] = useState("100");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await postOpeningBalanceAction({ itemType, itemId, locationCode, qty: Number(qty) });
    if (!res.ok) return toast.error(res.error.message);
    toast.success("Dokumen Saldo Awal berstatus Posted dan Inventory Movement tercatat.");
  }

  const cols: ColumnDef<StockBalanceDTO>[] = [
    { accessorKey: "itemCode", header: "Kode" },
    { accessorKey: "itemName", header: "Item" },
    { accessorKey: "locationCode", header: "Lokasi Gudang" },
    { accessorKey: "physicalQty", header: "Stok Fisik" },
    { accessorKey: "availableQty", header: "Stok Tersedia" },
    { accessorKey: "unit", header: "Satuan" },
  ];

  return (
    <div className="space-y-6">
      <Card className="border-[#E5E7EB] shadow-none">
        <CardHeader><CardTitle className="text-base">Posting Dokumen Saldo Awal Stok</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Jenis Item</Label>
              <select
                value={itemType}
                onChange={(e) => {
                  const t = e.target.value as "MATERIAL" | "PRODUCT";
                  setItemType(t);
                  setItemId(t === "MATERIAL" ? (materials[0]?.id ?? "") : (products[0]?.id ?? ""));
                }}
                className="w-full h-9 rounded-md border border-[#E5E7EB] bg-white px-3 text-sm"
              >
                <option value="MATERIAL">Bahan Baku / Pelengkap</option>
                <option value="PRODUCT">Produk Jadi</option>
              </select>
            </div>
            <div>
              <Label>Pilih Item Master</Label>
              <select value={itemId} onChange={(e) => setItemId(e.target.value)} className="w-full h-9 rounded-md border border-[#E5E7EB] bg-white px-3 text-sm">
                {(itemType === "MATERIAL" ? materials : products).map((i) => (
                  <option key={i.id} value={i.id}>{i.code} — {i.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Lokasi Penyimpanan</Label>
              <select value={locationCode} onChange={(e) => setLocationCode(e.target.value)} className="w-full h-9 rounded-md border border-[#E5E7EB] bg-white px-3 text-sm">
                <option value="GUDANG_BAHAN_BAKU">Gudang Bahan Baku</option>
                <option value="GUDANG_BAHAN_PELENGKAP">Gudang Bahan Pelengkap</option>
                <option value="GUDANG_BARANG_JADI_OK">Gudang Barang Jadi OK</option>
                <option value="STOK_ONLINE_A">Stok Online A</option>
                <option value="STOK_ONLINE_B">Stok Online B</option>
              </select>
            </div>
            <div><Label>Kuantitas Awal</Label><Input type="number" value={qty} onChange={(e) => setQty(e.target.value)} min={1} required /></div>
            <div className="md:col-span-4 flex justify-end"><Button type="submit" className="bg-[#638773] hover:bg-[#527361]">Posting Saldo Awal</Button></div>
          </form>
        </CardContent>
      </Card>
      <DataTable columns={cols} data={balances} total={balances.length} page={1} pageSize={50} />
    </div>
  );
}

// --- 5. PENERIMAAN BAHAN ---
export function MaterialReceiptView({ receipts, suppliers, materials, canPost }: {
  receipts: MaterialReceiptDTO[]; suppliers: SupplierDTO[]; materials: MaterialMasterDTO[]; canPost: boolean;
}) {
  const [receiptDate, setReceiptDate] = useState("2026-11-21");
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id ?? "");
  const [materialId, setMaterialId] = useState(materials[0]?.id ?? "");
  const [qty, setQty] = useState("100");
  const [unitPrice, setUnitPrice] = useState("13000");
  const [externalDocNumber, setExternalDocNumber] = useState("");

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    const res = await postMaterialReceiptAction({
      receiptDate, supplierId, materialId, qty: Number(qty), unitPrice: Number(unitPrice), externalDocNumber,
    });
    if (!res.ok) return toast.error(res.error.message);
    toast.success("Penerimaan bahan berhasil Posted & stok bertambah.");
    setExternalDocNumber("");
  }

  const cols: ColumnDef<MaterialReceiptDTO>[] = [
    { accessorKey: "receiptNumber", header: "No. Penerimaan" },
    { accessorKey: "receiptDate", header: "Tanggal", cell: ({ row }) => formatTanggal(row.original.receiptDate) },
    { accessorKey: "supplierName", header: "Supplier" },
    { accessorKey: "materialName", header: "Bahan" },
    { accessorKey: "qty", header: "Qty", cell: ({ row }) => `${row.original.qty} ${row.original.unit}` },
    { accessorKey: "totalAmount", header: "Total Beli", cell: ({ row }) => formatRupiah(row.original.totalAmount) },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  ];

  return (
    <div className="space-y-6">
      {canPost && (
        <Card className="border-[#E5E7EB] shadow-none">
          <CardHeader><CardTitle className="text-base">Catat Penerimaan Bahan Masuk</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handlePost} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><Label>Tanggal Penerimaan</Label><Input type="date" value={receiptDate} onChange={(e) => setReceiptDate(e.target.value)} required /></div>
              <div>
                <Label>Supplier (Master)</Label>
                <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className="w-full h-9 rounded-md border border-[#E5E7EB] bg-white px-3 text-sm">
                  {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <Label>Bahan (Master)</Label>
                <select value={materialId} onChange={(e) => setMaterialId(e.target.value)} className="w-full h-9 rounded-md border border-[#E5E7EB] bg-white px-3 text-sm">
                  {materials.map((m) => <option key={m.id} value={m.id}>{m.code} — {m.name} ({m.unit})</option>)}
                </select>
              </div>
              <div><Label>Kuantitas Masuk</Label><Input type="number" value={qty} onChange={(e) => setQty(e.target.value)} min={1} required /></div>
              <div><Label>Harga Beli Satuan (Rp)</Label><Input type="number" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} min={0} required /></div>
              <div><Label>No. Surat Jalan / Nota</Label><Input value={externalDocNumber} onChange={(e) => setExternalDocNumber(e.target.value)} placeholder="SJ-2026-..." required /></div>
              <div className="md:col-span-3 flex justify-end"><Button type="submit" className="bg-[#526D9B]">Posting Penerimaan Bahan</Button></div>
            </form>
          </CardContent>
        </Card>
      )}
      <DataTable columns={cols} data={receipts} total={receipts.length} page={1} pageSize={20} />
    </div>
  );
}

// --- 6. PRODUKSI & PENGELUARAN BAHAN ---
export function ProductionView({ productions, products, materials }: {
  productions: ProductionOrderDTO[]; products: ProductMasterDTO[]; materials: MaterialMasterDTO[];
}) {
  const [productionDate, setProductionDate] = useState("2026-11-21");
  const [batchCode, setBatchCode] = useState("BATCH-2611-C");
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [targetQty, setTargetQty] = useState("150");
  const [actualQty, setActualQty] = useState("150");
  const [materialId, setMaterialId] = useState(materials[0]?.id ?? "");
  const [materialQtyUsed, setMaterialQtyUsed] = useState("40");

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    const res = await postProductionAction({
      productionDate, batchCode, productId,
      targetQty: Number(targetQty), actualQty: Number(actualQty),
      materialId, materialQtyUsed: Number(materialQtyUsed),
    });
    if (!res.ok) return toast.error(res.error.message);
    toast.success("Produksi diposting, bahan baku berkurang, dan siap untuk tahap QC.");
  }

  const cols: ColumnDef<ProductionOrderDTO>[] = [
    { accessorKey: "productionNumber", header: "No. Produksi" },
    { accessorKey: "batchCode", header: "Batch" },
    { accessorKey: "productName", header: "Produk Jadi" },
    { accessorKey: "actualQty", header: "Hasil Produksi", cell: ({ row }) => `${row.original.actualQty} ${row.original.unit}` },
    {
      accessorKey: "qcCompleted",
      header: "Status QC",
      cell: ({ row }) => (
        <Badge className={row.original.qcCompleted ? "bg-[#DDEBE3] text-[#638773] border-none" : "bg-[#F5E7D4] text-[#C28B50] border-none"}>
          {row.original.qcCompleted ? "Sudah QC" : "Menunggu QC"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="border-[#E5E7EB] shadow-none">
        <CardHeader><CardTitle className="text-base">Catat Pengeluaran Bahan & Hasil Produksi</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handlePost} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><Label>Tanggal Produksi</Label><Input type="date" value={productionDate} onChange={(e) => setProductionDate(e.target.value)} required /></div>
            <div><Label>Kode Batch</Label><Input value={batchCode} onChange={(e) => setBatchCode(e.target.value)} required /></div>
            <div>
              <Label>Produk Jadi</Label>
              <select value={productId} onChange={(e) => setProductId(e.target.value)} className="w-full h-9 rounded-md border border-[#E5E7EB] bg-white px-3 text-sm">
                {products.map((p) => <option key={p.id} value={p.id}>{p.code} — {p.name}</option>)}
              </select>
            </div>
            <div><Label>Target Produksi</Label><Input type="number" value={targetQty} onChange={(e) => setTargetQty(e.target.value)} min={1} required /></div>
            <div><Label>Hasil Aktual</Label><Input type="number" value={actualQty} onChange={(e) => setActualQty(e.target.value)} min={1} required /></div>
            <div>
              <Label>Bahan Terpakai</Label>
              <select value={materialId} onChange={(e) => setMaterialId(e.target.value)} className="w-full h-9 rounded-md border border-[#E5E7EB] bg-white px-3 text-sm">
                {materials.map((m) => <option key={m.id} value={m.id}>{m.code} — {m.name} ({m.unit})</option>)}
              </select>
            </div>
            <div><Label>Jumlah Bahan Terpakai</Label><Input type="number" value={materialQtyUsed} onChange={(e) => setMaterialQtyUsed(e.target.value)} min={1} required /></div>
            <div className="md:col-span-2 flex items-end justify-end"><Button type="submit" className="bg-[#638773] hover:bg-[#527361]">Posting Produksi</Button></div>
          </form>
        </CardContent>
      </Card>
      <DataTable columns={cols} data={productions} total={productions.length} page={1} pageSize={20} />
    </div>
  );
}

// --- 7. QUALITY CONTROL ---
export function QcInspectionView({ inspections, pendingProductions, defectCategories, canApprove }: {
  inspections: QcInspectionDTO[]; pendingProductions: ProductionOrderDTO[]; defectCategories: QcDefectCategoryDTO[]; canApprove: boolean;
}) {
  const [inspectionDate, setInspectionDate] = useState("2026-11-21");
  const [productionId, setProductionId] = useState(pendingProductions[0]?.id ?? "");
  const [inspectedQty, setInspectedQty] = useState(String(pendingProductions[0]?.actualQty ?? 200));
  const [okQty, setOkQty] = useState("190");
  const [ngQty, setNgQty] = useState("10");
  const [defectCategoryId, setDefectCategoryId] = useState(defectCategories[0]?.id ?? "");

  async function handleApprove(e: React.FormEvent) {
    e.preventDefault();
    const res = await approveQcAction({
      inspectionDate, productionId,
      inspectedQty: Number(inspectedQty),
      okQty: Number(okQty),
      ngQty: Number(ngQty),
      defectCategoryId: Number(ngQty) > 0 ? defectCategoryId : undefined,
    });
    if (!res.ok) return toast.error(res.error.message);
    toast.success("QC disahkan! Barang OK masuk Gudang OK, barang NG terpisah ke Gudang NG.");
  }

  const cols: ColumnDef<QcInspectionDTO>[] = [
    { accessorKey: "qcNumber", header: "No. QC" },
    { accessorKey: "batchCode", header: "Batch" },
    { accessorKey: "productName", header: "Produk" },
    { accessorKey: "inspectedQty", header: "Diperiksa" },
    { accessorKey: "okQty", header: "OK", cell: ({ row }) => <span className="font-semibold text-[#638773]">{row.original.okQty}</span> },
    { accessorKey: "ngQty", header: "NG", cell: ({ row }) => <span className="font-semibold text-[#BB6D70]">{row.original.ngQty}</span> },
    { accessorKey: "defectCategoryName", header: "Kategori Cacat", cell: ({ row }) => row.original.defectCategoryName ?? "-" },
  ];

  return (
    <div className="space-y-6">
      {canApprove && (
        <Card className="border-[#E5E7EB] shadow-none">
          <CardHeader><CardTitle className="text-base">Pengesahan Quality Control (Diperiksa = OK + NG)</CardTitle></CardHeader>
          <CardContent>
            {pendingProductions.length === 0 ? (
              <p className="text-sm text-[#6B7280]">Seluruh batch produksi saat ini sudah selesai diperiksa QC.</p>
            ) : (
              <form onSubmit={handleApprove} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><Label>Tanggal QC</Label><Input type="date" value={inspectionDate} onChange={(e) => setInspectionDate(e.target.value)} required /></div>
                <div className="md:col-span-2">
                  <Label>Batch Produksi Menunggu QC</Label>
                  <select value={productionId} onChange={(e) => setProductionId(e.target.value)} className="w-full h-9 rounded-md border border-[#E5E7EB] bg-white px-3 text-sm">
                    {pendingProductions.map((p) => (
                      <option key={p.id} value={p.id}>{p.productionNumber} ({p.batchCode}) — {p.productName} [{p.actualQty} {p.unit}]</option>
                    ))}
                  </select>
                </div>
                <div><Label>Total Diperiksa</Label><Input type="number" value={inspectedQty} onChange={(e) => setInspectedQty(e.target.value)} min={1} required /></div>
                <div><Label>Jumlah OK (Layak Jual)</Label><Input type="number" value={okQty} onChange={(e) => setOkQty(e.target.value)} min={0} required /></div>
                <div><Label>Jumlah NG (Reject/Cacat)</Label><Input type="number" value={ngQty} onChange={(e) => setNgQty(e.target.value)} min={0} required /></div>
                <div className="md:col-span-2">
                  <Label>Kategori Cacat (Jika NG &gt; 0)</Label>
                  <select value={defectCategoryId} onChange={(e) => setDefectCategoryId(e.target.value)} className="w-full h-9 rounded-md border border-[#E5E7EB] bg-white px-3 text-sm">
                    {defectCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="flex items-end justify-end">
                  <Button type="submit" className="bg-[#526D9B]"><CheckCircle2 className="mr-2 h-4 w-4" /> Sahkan Hasil QC</Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}
      <DataTable columns={cols} data={inspections} total={inspections.length} page={1} pageSize={20} />
    </div>
  );
}

// --- 8. STOK & MUTASI + TRANSFER STOK ONLINE ---
export function StockAndTransferView({ balances, movements, transfers, products, canTransfer }: {
  balances: StockBalanceDTO[]; movements: InventoryMovementDTO[]; transfers: StockTransferDTO[];
  products: ProductMasterDTO[]; canTransfer: boolean;
}) {
  const [transferDate, setTransferDate] = useState("2026-11-21");
  const [toLocation, setToLocation] = useState<"STOK_ONLINE_A" | "STOK_ONLINE_B">("STOK_ONLINE_A");
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [qty, setQty] = useState("25");

  async function handleTransfer(e: React.FormEvent) {
    e.preventDefault();
    const res = await postStockTransferAction({ transferDate, toLocation, productId, qty: Number(qty) });
    if (!res.ok) return toast.error(res.error.message);
    toast.success("Transfer stok ke kanal online berhasil secara atomik.");
  }

  const balCols: ColumnDef<StockBalanceDTO>[] = [
    { accessorKey: "itemCode", header: "Kode" },
    { accessorKey: "itemName", header: "Nama Barang" },
    { accessorKey: "locationCode", header: "Lokasi" },
    { accessorKey: "availableQty", header: "Tersedia", cell: ({ row }) => <span className="font-semibold">{row.original.availableQty} {row.original.unit}</span> },
    {
      id: "alert",
      header: "Status Stok",
      cell: ({ row }) => {
        if (row.original.locationCode === "GUDANG_BARANG_NG") {
          return <Badge className="bg-[#F4DFDF] text-[#BB6D70] border-none">Karantina NG</Badge>;
        }
        const low = row.original.availableQty <= row.original.minStock;
        return low
          ? <Badge className="bg-[#F5E7D4] text-[#C28B50] border-none">Stok Minimum!</Badge>
          : <Badge className="bg-[#DDEBE3] text-[#638773] border-none">Aman</Badge>;
      },
    },
  ];

  const movCols: ColumnDef<InventoryMovementDTO>[] = [
    { accessorKey: "movementDate", header: "Waktu", cell: ({ row }) => formatTanggalWaktu(row.original.movementDate) },
    { accessorKey: "refNumber", header: "No. Referensi" },
    { accessorKey: "itemName", header: "Item" },
    { accessorKey: "locationCode", header: "Lokasi" },
    {
      accessorKey: "direction",
      header: "Arah",
      cell: ({ row }) => (
        <Badge className={row.original.direction === "IN" ? "bg-[#DDEBE3] text-[#638773] border-none" : "bg-[#F4DFDF] text-[#BB6D70] border-none"}>
          {row.original.direction === "IN" ? `+${row.original.qty}` : `-${row.original.qty}`}
        </Badge>
      ),
    },
    { accessorKey: "balanceAfter", header: "Saldo Akhir" },
  ];

  return (
    <div className="space-y-6">
      {canTransfer && (
        <Card className="border-[#E5E7EB] shadow-none">
          <CardHeader><CardTitle className="text-base">Transfer Stok Gudang OK ke Kanal Online</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleTransfer} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div><Label>Tanggal Transfer</Label><Input type="date" value={transferDate} onChange={(e) => setTransferDate(e.target.value)} required /></div>
              <div>
                <Label>Kanal Tujuan</Label>
                <select value={toLocation} onChange={(e) => setToLocation(e.target.value as "STOK_ONLINE_A" | "STOK_ONLINE_B")} className="w-full h-9 rounded-md border border-[#E5E7EB] bg-white px-3 text-sm">
                  <option value="STOK_ONLINE_A">Stok Online A (Produk 1 &amp; 2)</option>
                  <option value="STOK_ONLINE_B">Stok Online B (Produk 3 &amp; 4)</option>
                </select>
              </div>
              <div>
                <Label>Produk</Label>
                <select value={productId} onChange={(e) => setProductId(e.target.value)} className="w-full h-9 rounded-md border border-[#E5E7EB] bg-white px-3 text-sm">
                  {products.map((p) => <option key={p.id} value={p.id}>{p.code} — {p.name} [{p.onlineChannel}]</option>)}
                </select>
              </div>
              <div><Label>Jumlah Transfer</Label><Input type="number" value={qty} onChange={(e) => setQty(e.target.value)} min={1} required /></div>
              <div className="md:col-span-4 flex justify-end"><Button type="submit" className="bg-[#526D9B]">Proses Transfer Atomik</Button></div>
            </form>
          </CardContent>
        </Card>
      )}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-[#1F2937]">Saldo Stok Per Lokasi</h2>
        <DataTable columns={balCols} data={balances} total={balances.length} page={1} pageSize={50} />
      </div>
      {transfers.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-[#1F2937]">Riwayat Inventory Movement (Kartu Stok)</h2>
          <DataTable columns={movCols} data={movements} total={movements.length} page={1} pageSize={20} />
        </div>
      )}
    </div>
  );
}

// --- 9. TRANSAKSI PENJUALAN (OFFLINE & ONLINE) ---
export function SalesEntryAndListView({ channel, sales, products, customers, allowPriceOverride, showForm }: {
  channel: SalesChannel; sales: SaleDTO[]; products: ProductMasterDTO[];
  customers?: CustomerDTO[]; allowPriceOverride: boolean; showForm: boolean;
}) {
  const [saleDate, setSaleDate] = useState("2026-11-21");
  const [customerId, setCustomerId] = useState(customers?.[0]?.id ?? "");
  const [customerName, setCustomerName] = useState(customers?.[0]?.name ?? "");
  const [marketplaceOrderRef, setMarketplaceOrderRef] = useState("");
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [qty, setQty] = useState("5");
  const [unitPrice, setUnitPrice] = useState(String(products[0]?.defaultPrice ?? 18000));
  const [initialPayment, setInitialPayment] = useState("0");

  async function handleSale(e: React.FormEvent) {
    e.preventDefault();
    const selectedCust = customers?.find((c) => c.id === customerId);
    const finalName = channel === "OFFLINE" ? (selectedCust?.name ?? customerName) : customerName;
    const finalPrice = Number(unitPrice);
    const total = Number(qty) * finalPrice;

    const res = await postSaleAction({
      saleDate,
      channel,
      customerId: channel === "OFFLINE" ? customerId : undefined,
      customerName: finalName,
      marketplaceOrderRef: channel !== "OFFLINE" ? marketplaceOrderRef : undefined,
      productId,
      qty: Number(qty),
      unitPrice: finalPrice,
      initialPayment: channel === "OFFLINE" ? Number(initialPayment) : total,
      paymentMethod: channel === "OFFLINE" ? "TUNAI" : "MARKETPLACE_SETTLEMENT",
    });
    if (!res.ok) return toast.error(res.error.message);
    toast.success("Transaksi penjualan berhasil diposting & stok otomatis terpotong.");
  }

  const cols: ColumnDef<SaleDTO>[] = [
    { accessorKey: "invoiceNumber", header: "No. Faktur" },
    { accessorKey: "saleDate", header: "Tanggal", cell: ({ row }) => formatTanggal(row.original.saleDate) },
    { accessorKey: "customerName", header: "Pelanggan / Pembeli" },
    { accessorKey: "totalAmount", header: "Total", cell: ({ row }) => formatRupiah(row.original.totalAmount) },
    { accessorKey: "remainingAmount", header: "Sisa Piutang", cell: ({ row }) => formatRupiah(row.original.remainingAmount) },
    {
      accessorKey: "paymentStatus",
      header: "Pembayaran",
      cell: ({ row }) => (
        <Badge className={row.original.paymentStatus === "PAID" ? "bg-[#DDEBE3] text-[#638773] border-none" : "bg-[#F5E7D4] text-[#C28B50] border-none"}>
          {row.original.paymentStatus}
        </Badge>
      ),
    },
    ...(channel !== "OFFLINE"
      ? [{
          id: "orderStatus",
          header: "Status Pesanan",
          cell: ({ row }: { row: { original: SaleDTO } }) => (
            <select
              value={row.original.orderStatus}
              onChange={async (e) => {
                const res = await updateOnlineOrderStatusAction(row.original.id, e.target.value as SaleDTO["orderStatus"]);
                if (!res.ok) toast.error(res.error.message);
                else toast.success("Status pesanan diperbarui.");
              }}
              className="h-8 rounded border border-[#E5E7EB] bg-white px-2 text-xs"
            >
              <option value="PENDING">PENDING</option>
              <option value="PACKED">PACKED</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          ),
        }]
      : []),
  ];

  return (
    <div className="space-y-6">
      {showForm && (
        <Card className="border-[#E5E7EB] shadow-none">
          <CardHeader><CardTitle className="text-base">Input Transaksi Penjualan ({channel})</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSale} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><Label>Tanggal</Label><Input type="date" value={saleDate} onChange={(e) => setSaleDate(e.target.value)} required /></div>
              {channel === "OFFLINE" ? (
                <div>
                  <Label>Pelanggan (Master)</Label>
                  <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="w-full h-9 rounded-md border border-[#E5E7EB] bg-white px-3 text-sm">
                    {customers?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              ) : (
                <>
                  <div><Label>Username Pembeli Marketplace</Label><Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Shopee — username" required /></div>
                  <div><Label>No. Pesanan Marketplace</Label><Input value={marketplaceOrderRef} onChange={(e) => setMarketplaceOrderRef(e.target.value)} placeholder="SHP-..." required /></div>
                </>
              )}
              <div>
                <Label>Produk</Label>
                <select
                  value={productId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setProductId(id);
                    const p = products.find((x) => x.id === id);
                    if (p) setUnitPrice(String(p.defaultPrice));
                  }}
                  className="w-full h-9 rounded-md border border-[#E5E7EB] bg-white px-3 text-sm"
                >
                  {products.map((p) => <option key={p.id} value={p.id}>{p.code} — {p.name} ({formatRupiah(p.defaultPrice)})</option>)}
                </select>
              </div>
              <div><Label>Kuantitas</Label><Input type="number" value={qty} onChange={(e) => setQty(e.target.value)} min={1} required /></div>
              <div>
                <Label>Harga Satuan (Rp)</Label>
                <Input type="number" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} disabled={!allowPriceOverride} required />
              </div>
              {channel === "OFFLINE" && (
                <div><Label>Pembayaran Awal / DP (Rp)</Label><Input type="number" value={initialPayment} onChange={(e) => setInitialPayment(e.target.value)} min={0} /></div>
              )}
              <div className="md:col-span-3 flex justify-end"><Button type="submit" className="bg-[#526D9B]">Posting Penjualan</Button></div>
            </form>
          </CardContent>
        </Card>
      )}
      <DataTable columns={cols} data={sales} total={sales.length} page={1} pageSize={50} />
    </div>
  );
}

// --- 10. PIUTANG & PEMBAYARAN ---
export function ReceivablesAndPaymentView({ receivables, payments }: { receivables: SaleDTO[]; payments: PaymentDTO[] }) {
  const [saleId, setSaleId] = useState(receivables[0]?.id ?? "");
  const [paymentDate, setPaymentDate] = useState("2026-11-21");
  const [amount, setAmount] = useState(String(receivables[0]?.remainingAmount ?? 0));
  const [method, setMethod] = useState<"TUNAI" | "TRANSFER_BANK" | "QRIS">("TRANSFER_BANK");

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    const res = await recordPaymentAction({ saleId, paymentDate, amount: Number(amount), method });
    if (!res.ok) return toast.error(res.error.message);
    toast.success("Pembayaran piutang berhasil dicatat.");
  }

  const recCols: ColumnDef<SaleDTO>[] = [
    { accessorKey: "invoiceNumber", header: "No. Faktur" },
    { accessorKey: "customerName", header: "Pelanggan" },
    { accessorKey: "totalAmount", header: "Total Tagihan", cell: ({ row }) => formatRupiah(row.original.totalAmount) },
    { accessorKey: "paidAmount", header: "Sudah Dibayar", cell: ({ row }) => formatRupiah(row.original.paidAmount) },
    { accessorKey: "remainingAmount", header: "Sisa Piutang", cell: ({ row }) => <span className="font-semibold text-[#BB6D70]">{formatRupiah(row.original.remainingAmount)}</span> },
  ];

  const payCols: ColumnDef<PaymentDTO>[] = [
    { accessorKey: "paymentNumber", header: "No. Pembayaran" },
    { accessorKey: "paymentDate", header: "Tanggal", cell: ({ row }) => formatTanggal(row.original.paymentDate) },
    { accessorKey: "invoiceNumber", header: "Faktur" },
    { accessorKey: "customerName", header: "Pelanggan" },
    { accessorKey: "amount", header: "Nominal", cell: ({ row }) => formatRupiah(row.original.amount) },
    { accessorKey: "method", header: "Metode" },
  ];

  return (
    <div className="space-y-6">
      {receivables.length > 0 && (
        <Card className="border-[#E5E7EB] shadow-none">
          <CardHeader><CardTitle className="text-base">Catat Pelunasan / Cicilan Piutang</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handlePay} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Label>Faktur Belum Lunas</Label>
                <select value={saleId} onChange={(e) => setSaleId(e.target.value)} className="w-full h-9 rounded-md border border-[#E5E7EB] bg-white px-3 text-sm">
                  {receivables.map((r) => (
                    <option key={r.id} value={r.id}>{r.invoiceNumber} — {r.customerName} (Sisa: {formatRupiah(r.remainingAmount)})</option>
                  ))}
                </select>
              </div>
              <div><Label>Tanggal Bayar</Label><Input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} required /></div>
              <div><Label>Nominal Bayar (Rp)</Label><Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} min={1} required /></div>
              <div>
                <Label>Metode</Label>
                <select value={method} onChange={(e) => setMethod(e.target.value as "TUNAI" | "TRANSFER_BANK" | "QRIS")} className="w-full h-9 rounded-md border border-[#E5E7EB] bg-white px-3 text-sm">
                  <option value="TRANSFER_BANK">Transfer Bank</option>
                  <option value="TUNAI">Tunai</option>
                  <option value="QRIS">QRIS</option>
                </select>
              </div>
              <div className="md:col-span-3 flex items-end justify-end"><Button type="submit" className="bg-[#638773]">Simpan Pembayaran</Button></div>
            </form>
          </CardContent>
        </Card>
      )}
      <DataTable columns={recCols} data={receivables} total={receivables.length} page={1} pageSize={50} />
      <DataTable columns={payCols} data={payments} total={payments.length} page={1} pageSize={30} />
    </div>
  );
}

// --- 11. GAJI BULANAN (NON-HPP) & LAPORAN PROFIT ---
export function SalaryExpenseView({ salaries }: { salaries: MonthlySalaryDTO[] }) {
  const [monthKey, setMonthKey] = useState("2026-11");
  const [totalAmount, setTotalAmount] = useState("18500000");
  const [notes, setNotes] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const res = await saveMonthlySalaryAction({ monthKey, totalAmount: Number(totalAmount), notes });
    if (!res.ok) return toast.error(res.error.message);
    toast.success("Total gaji bulanan berhasil disimpan.");
  }

  const cols: ColumnDef<MonthlySalaryDTO>[] = [
    { accessorKey: "monthKey", header: "Bulan (YYYY-MM)" },
    { accessorKey: "totalAmount", header: "Total Gaji Karyawan", cell: ({ row }) => formatRupiah(row.original.totalAmount) },
    { accessorKey: "notes", header: "Catatan" },
    { accessorKey: "recordedByName", header: "Dicatat Oleh" },
  ];

  return (
    <div className="space-y-6">
      <Card className="border-[#E5E7EB] shadow-none">
        <CardHeader><CardTitle className="text-base">Input Total Gaji Karyawan Per Bulan (Non-HPP)</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><Label>Bulan (YYYY-MM)</Label><Input value={monthKey} onChange={(e) => setMonthKey(e.target.value)} placeholder="2026-11" required /></div>
            <div><Label>Total Gaji Bulanan (Rp)</Label><Input type="number" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} min={0} required /></div>
            <div><Label>Catatan</Label><Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Gaji seluruh tim" /></div>
            <div className="md:col-span-3 flex justify-end"><Button type="submit" className="bg-[#526D9B]">Simpan Gaji Bulanan</Button></div>
          </form>
        </CardContent>
      </Card>
      <DataTable columns={cols} data={salaries} total={salaries.length} page={1} pageSize={20} />
    </div>
  );
}

export function ProfitReportView({ rows, period }: { rows: ProfitReportRowDTO[]; period: string }) {
  const cols: ColumnDef<ProfitReportRowDTO>[] = [
    { accessorKey: "periodLabel", header: "Periode" },
    { accessorKey: "totalSales", header: "Total Penjualan", cell: ({ row }) => formatRupiah(row.original.totalSales) },
    { accessorKey: "rawMaterialPayments", header: "Pembayaran Bahan Mentah", cell: ({ row }) => formatRupiah(row.original.rawMaterialPayments) },
    { accessorKey: "salaryExpense", header: "Gaji Karyawan", cell: ({ row }) => formatRupiah(row.original.salaryExpense) },
    {
      accessorKey: "netProfit",
      header: "Profit Bersih",
      cell: ({ row }) => (
        <span className={row.original.netProfit >= 0 ? "font-bold text-[#638773]" : "font-bold text-[#BB6D70]"}>
          {formatRupiah(row.original.netProfit)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          <Button asChild variant={period === "DAILY" ? "default" : "outline"} size="sm"><a href="?period=DAILY">Harian</a></Button>
          <Button asChild variant={period === "WEEKLY" ? "default" : "outline"} size="sm"><a href="?period=WEEKLY">Mingguan</a></Button>
          <Button asChild variant={period === "MONTHLY" ? "default" : "outline"} size="sm"><a href="?period=MONTHLY">Bulanan</a></Button>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <a href={`/api/reports/export?period=${period}&format=csv`}><FileSpreadsheet className="mr-2 h-4 w-4 text-[#638773]" /> Export Excel (CSV)</a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href={`/api/reports/export?period=${period}&format=pdf`} target="_blank" rel="noreferrer"><Printer className="mr-2 h-4 w-4 text-[#526D9B]" /> Export / Cetak PDF</a>
          </Button>
        </div>
      </div>
      <DataTable columns={cols} data={rows} total={rows.length} page={1} pageSize={50} />
    </div>
  );
}

// --- 12. USERS & AUDIT LOG ---
export function UserListView({ users }: { users: UserDTO[] }) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ADMIN_GUDANG" | "ADMIN_ONLINE_A" | "ADMIN_ONLINE_B" | "BOSS">("ADMIN_GUDANG");
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await createUserAction({ name, username, email, password, role });
    setSubmitting(false);
    if (!res.ok) return toast.error(res.error.message);
    toast.success("Akun pengguna baru berhasil dibuat.");
    setName(""); setUsername(""); setEmail(""); setPassword("");
  }

  const cols: ColumnDef<UserDTO>[] = [
    { accessorKey: "name", header: "Nama Lengkap" },
    { accessorKey: "username", header: "Username" },
    { accessorKey: "email", header: "Email" },
    {
      accessorKey: "role",
      header: "Role Akses",
      cell: ({ row }) => <Badge variant="outline" className="bg-[#E8EEF8] text-[#526D9B] border-none">{row.original.role}</Badge>,
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <Badge className={row.original.isActive ? "bg-[#DDEBE3] text-[#638773] border-none" : "bg-[#F4DFDF] text-[#BB6D70] border-none"}>
          {row.original.isActive ? "Aktif" : "Nonaktif"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="outline"
          onClick={async () => {
            const res = await toggleUserStatusAction(row.original.id, !row.original.isActive);
            if (!res.ok) toast.error(res.error.message);
            else toast.success("Status akun diperbarui.");
          }}
        >
          {row.original.isActive ? "Nonaktifkan" : "Aktifkan"}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="border-[#E5E7EB] shadow-none">
        <CardHeader><CardTitle className="text-base">Tambah Pengguna &amp; Hak Akses Baru</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><Label>Nama Lengkap</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Rizky Pratama" required /></div>
            <div><Label>Username Login</Label><Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="gudang1" required /></div>
            <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="gudang@priangansentosa.co.id" required /></div>
            <div><Label>Password Awal</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 6 karakter" required /></div>
            <div>
              <Label>Role / Jabatan</Label>
              <select value={role} onChange={(e) => setRole(e.target.value as "ADMIN_GUDANG" | "ADMIN_ONLINE_A" | "ADMIN_ONLINE_B" | "BOSS")} className="w-full h-9 rounded-md border border-[#E5E7EB] bg-white px-3 text-sm">
                <option value="ADMIN_GUDANG">ADMIN_GUDANG (Pabrik, Stok &amp; Offline)</option>
                <option value="ADMIN_ONLINE_A">ADMIN_ONLINE_A (Produk 1 &amp; 2)</option>
                <option value="ADMIN_ONLINE_B">ADMIN_ONLINE_B (Produk 3 &amp; 4)</option>
                <option value="BOSS">BOSS (Manajemen Penuh)</option>
              </select>
            </div>
            <div className="flex items-end justify-end">
              <Button type="submit" disabled={submitting} className="bg-[#526D9B] hover:bg-[#435b84]">
                <Plus className="mr-2 h-4 w-4" /> Simpan Pengguna
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <DataTable columns={cols} data={users} total={users.length} page={1} pageSize={20} />
    </div>
  );
}

export function AuditLogView({ logs }: { logs: AuditLogDTO[] }) {
  const cols: ColumnDef<AuditLogDTO>[] = [
    { accessorKey: "createdAt", header: "Waktu", cell: ({ row }) => formatTanggalWaktu(row.original.createdAt) },
    { accessorKey: "actorName", header: "Pengguna" },
    { accessorKey: "actorRole", header: "Role" },
    { accessorKey: "module", header: "Modul" },
    { accessorKey: "action", header: "Aksi" },
    { accessorKey: "newValue", header: "Detail Perubahan", cell: ({ row }) => row.original.newValue ?? "-" },
  ];
  return <DataTable columns={cols} data={logs} total={logs.length} page={1} pageSize={30} />;
}
