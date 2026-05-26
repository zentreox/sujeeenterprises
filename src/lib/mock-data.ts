export type Product = {
  id: string;
  name: string;
  code: string;
  barcode: string;
  category: string;
  brand: string;
  costPrice: number;
  cashPrice: number;
  installmentPrice: number;
  warehouseQty: number;
  lowStockAt: number;
  image?: string;
};

export type Sale = {
  id: string;
  date: string;
  customer: string;
  items: number;
  total: number;
  type: "cash" | "installment";
  staff: string;
};

export type Purchase = {
  id: string;
  date: string;
  supplier: string;
  items: number;
  total: number;
  status: "received" | "pending";
};

import p001 from "@/assets/products/p001.jpg";
import p002 from "@/assets/products/p002.jpg";
import p003 from "@/assets/products/p003.jpg";
import p004 from "@/assets/products/p004.jpg";
import p005 from "@/assets/products/p005.jpg";
import p006 from "@/assets/products/p006.jpg";
import p007 from "@/assets/products/p007.jpg";
import p008 from "@/assets/products/p008.jpg";
import p009 from "@/assets/products/p009.jpg";
import p010 from "@/assets/products/p010.jpg";

export const PRODUCTS: Product[] = [
  { id: "P001", name: "Singer Rice Cooker 2.8L", code: "RC-28", barcode: "4891234500011", category: "Kitchen", brand: "Singer", costPrice: 8500, cashPrice: 11500, installmentPrice: 13900, warehouseQty: 42, lowStockAt: 10, image: p001 },
  { id: "P002", name: "Abans Electric Kettle", code: "EK-15", barcode: "4891234500028", category: "Kitchen", brand: "Abans", costPrice: 3200, cashPrice: 4500, installmentPrice: 5400, warehouseQty: 18, lowStockAt: 10, image: p002 },
  { id: "P003", name: "Innovex Stand Fan 16\"", code: "SF-16", barcode: "4891234500035", category: "Appliances", brand: "Innovex", costPrice: 7800, cashPrice: 10900, installmentPrice: 13200, warehouseQty: 27, lowStockAt: 8, image: p003 },
  { id: "P004", name: "LG TV 32\" HD", code: "TV-32H", barcode: "4891234500042", category: "Electronics", brand: "LG", costPrice: 42000, cashPrice: 54900, installmentPrice: 64500, warehouseQty: 9, lowStockAt: 5, image: p004 },
  { id: "P005", name: "Singer Gas Cooker 2B", code: "GC-2B", barcode: "4891234500059", category: "Kitchen", brand: "Singer", costPrice: 11500, cashPrice: 15400, installmentPrice: 18200, warehouseQty: 14, lowStockAt: 6, image: p005 },
  { id: "P006", name: "Hitachi Refrigerator 190L", code: "RF-190", barcode: "4891234500066", category: "Appliances", brand: "Hitachi", costPrice: 78000, cashPrice: 96500, installmentPrice: 114000, warehouseQty: 6, lowStockAt: 4, image: p006 },
  { id: "P007", name: "Damro Plastic Chair", code: "PC-01", barcode: "4891234500073", category: "Furniture", brand: "Damro", costPrice: 1800, cashPrice: 2600, installmentPrice: 3100, warehouseQty: 120, lowStockAt: 30, image: p007 },
  { id: "P008", name: "Philips Iron Steam", code: "IR-ST", barcode: "4891234500080", category: "Appliances", brand: "Philips", costPrice: 4200, cashPrice: 5900, installmentPrice: 7100, warehouseQty: 4, lowStockAt: 8, image: p008 },
  { id: "P009", name: "Singer Sewing Machine", code: "SM-01", barcode: "4891234500097", category: "Appliances", brand: "Singer", costPrice: 28000, cashPrice: 36500, installmentPrice: 43500, warehouseQty: 11, lowStockAt: 4, image: p009 },
  { id: "P010", name: "Innovex Blender 1.5L", code: "BL-15", barcode: "4891234500103", category: "Kitchen", brand: "Innovex", costPrice: 3900, cashPrice: 5400, installmentPrice: 6500, warehouseQty: 22, lowStockAt: 10, image: p010 },
];

export const SALES: Sale[] = Array.from({ length: 24 }).map((_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - i);
  const type = i % 3 === 0 ? "installment" : "cash";
  return {
    id: `S${(2400 - i).toString().padStart(4, "0")}`,
    date: d.toISOString().slice(0, 10),
    customer: ["K. Perera", "S. Fernando", "M. Bandara", "N. Silva", "R. Jayasinghe"][i % 5],
    items: 1 + (i % 4),
    total: 4500 + (i * 1320) % 90000,
    type,
    staff: ["Lorry-03 / Nuwan", "Lorry-07 / Kasun", "Counter / Dilshan", "Lorry-11 / Saman"][i % 4],
  };
});

export const PURCHASES: Purchase[] = Array.from({ length: 12 }).map((_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - i * 3);
  return {
    id: `PO${(1200 - i).toString().padStart(4, "0")}`,
    date: d.toISOString().slice(0, 10),
    supplier: ["Singer Lanka", "Abans Distribution", "Innovex SL", "Damro Holdings"][i % 4],
    items: 5 + (i % 8),
    total: 120000 + ((i * 47000) % 600000),
    status: i % 5 === 0 ? "pending" : "received",
  };
});

export const SALES_TREND = Array.from({ length: 14 }).map((_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (13 - i));
  return {
    day: d.toLocaleDateString("en-LK", { weekday: "short", day: "numeric" }),
    cash: 35000 + Math.round(Math.sin(i / 2) * 18000 + i * 1800),
    installment: 22000 + Math.round(Math.cos(i / 3) * 12000 + i * 1100),
  };
});

export const LORRY_PERFORMANCE = Array.from({ length: 12 }).map((_, i) => ({
  lorry: `L-${(i + 1).toString().padStart(2, "0")}`,
  sales: 45000 + Math.round(Math.abs(Math.sin(i + 1)) * 120000),
}));

export function fmtLKR(n: number) {
  return "Rs " + n.toLocaleString("en-LK");
}
