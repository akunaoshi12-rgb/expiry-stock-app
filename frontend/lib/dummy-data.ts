import type { ExpiryBatch, ExpiryBatchWithProduct, Product } from "@/types";
import { getDaysLeft, getExpiryStatus } from "@/lib/status";

export const products: Product[] = [
  {
    id: "prd-001",
    barcode: "8991234567890",
    internal_code: null,
    name: "Susu UHT Full Cream 1L",
    category: { id: "cat-Minuman Susu", name: "Minuman Susu" },
    is_active: true
  },
  {
    id: "prd-002",
    barcode: "8992222333344",
    internal_code: null,
    name: "Yogurt Strawberry 250ml",
    category: { id: "cat-Dairy", name: "Dairy" },
    is_active: true
  },
  {
    id: "prd-003",
    barcode: "8995555666677",
    internal_code: null,
    name: "Roti Gandum Kupas",
    category: { id: "cat-Roti", name: "Roti" },
    is_active: true
  },
  {
    id: "prd-004",
    barcode: "8997777888899",
    internal_code: null,
    name: "Keju Cheddar Slice",
    category: { id: "cat-Dairy", name: "Dairy" },
    is_active: true
  },
  {
    id: "prd-005",
    barcode: "8999876500012",
    internal_code: null,
    name: "Jus Jeruk 1L",
    category: { id: "cat-Minuman", name: "Minuman" },
    is_active: true
  },
  {
    id: "prd-006",
    barcode: "8991111222233",
    internal_code: null,
    name: "Sosis Ayam 500g",
    category: { id: "cat-Frozen Food", name: "Frozen Food" },
    is_active: true
  },
  {
    id: "prd-007",
    barcode: "8994444555566",
    internal_code: null,
    name: "Kopi Susu Botol",
    category: { id: "cat-Minuman", name: "Minuman" },
    is_active: true
  },
  {
    id: "prd-008",
    barcode: "8990000111122",
    internal_code: null,
    name: "Mentega Tawar 200g",
    category: { id: "cat-Dairy", name: "Dairy" },
    is_active: true
  }
];

const today = new Date();

function dateFromToday(days: number): string {
  const date = new Date(today);
  date.setDate(today.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export const expiryBatches: ExpiryBatch[] = [
  {
    id: "bat-001",
    productId: "prd-001",
    expiryDate: dateFromToday(-2),
    stock: 12,
    batchNumber: "MILK-042",
    location: "Kulkas utama",
    notes: "Cek rak depan pagi ini.",
    updatedAt: new Date().toISOString()
  },
  {
    id: "bat-002",
    productId: "prd-002",
    expiryDate: dateFromToday(3),
    stock: 24,
    batchNumber: "YGT-119",
    location: "Chiller 2",
    updatedAt: new Date().toISOString()
  },
  {
    id: "bat-003",
    productId: "prd-003",
    expiryDate: dateFromToday(9),
    stock: 18,
    batchNumber: "BRD-008",
    location: "Rak roti",
    updatedAt: new Date().toISOString()
  },
  {
    id: "bat-004",
    productId: "prd-004",
    expiryDate: dateFromToday(22),
    stock: 31,
    batchNumber: "CHZ-311",
    location: "Chiller 1",
    updatedAt: new Date().toISOString()
  },
  {
    id: "bat-005",
    productId: "prd-005",
    expiryDate: dateFromToday(45),
    stock: 40,
    batchNumber: "JUS-021",
    location: "Rak minuman",
    updatedAt: new Date().toISOString()
  },
  {
    id: "bat-006",
    productId: "prd-006",
    expiryDate: dateFromToday(6),
    stock: 16,
    batchNumber: "FRZ-221",
    location: "Freezer belakang",
    updatedAt: new Date().toISOString()
  }
];

export function getBatchesWithProduct(): ExpiryBatchWithProduct[] {
  return expiryBatches
    .map((batch) => {
      const product = products.find((item) => item.id === batch.productId);

      if (!product) {
        return null;
      }

      return {
        ...batch,
        product,
        status: getExpiryStatus(batch.expiryDate),
        daysLeft: getDaysLeft(batch.expiryDate)
      };
    })
    .filter((item): item is ExpiryBatchWithProduct => item !== null)
    .sort((a, b) => a.daysLeft - b.daysLeft);
}

export const categories = Array.from(
  new Set(products.map((product) => product.category?.name).filter((category): category is string => Boolean(category)))
).sort();
