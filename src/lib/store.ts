import { useEffect, useState } from "react";
import { PRODUCTS as SEED_PRODUCTS, type Product } from "./mock-data";

const PRODUCTS_KEY = "sujee.products.custom";
const INSTALLMENTS_KEY = "sujee.installments";
const EVT = "sujee:store";

export type InstallmentOrder = {
  id: string;
  date: string; // ISO
  customer: { name: string; nic: string; phone: string };
  staff: { name: string; email: string; role: string };
  items: { productId: string; name: string; qty: number; price: number }[];
  subtotal: number;
  discount: number;
  total: number;
  downPayment: number;
  financed: number;
  periodMonths: number;
  monthly: number;
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(EVT));
}

// ---------- Products ----------
export function getCustomProducts(): Product[] {
  return read<Product[]>(PRODUCTS_KEY, []);
}

export function getAllProducts(): Product[] {
  return [...getCustomProducts(), ...SEED_PRODUCTS];
}

export function addProduct(p: Product) {
  const list = getCustomProducts();
  write(PRODUCTS_KEY, [p, ...list]);
}

// ---------- Installment Orders ----------
export function getInstallments(): InstallmentOrder[] {
  return read<InstallmentOrder[]>(INSTALLMENTS_KEY, []);
}

export function addInstallment(o: InstallmentOrder) {
  const list = getInstallments();
  write(INSTALLMENTS_KEY, [o, ...list]);
}

// ---------- Hooks ----------
function useStoreValue<T>(getter: () => T): T {
  const [val, setVal] = useState<T>(getter);
  useEffect(() => {
    const sync = () => setVal(getter());
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return val;
}

export const useProducts = () => useStoreValue(getAllProducts);
export const useInstallments = () => useStoreValue(getInstallments);
