import type { Table } from "./types/table";

const STORAGE_KEY = "zomin:menuProductsPath";

export type MenuProductsPath = "/products" | "/products-link";

export function setMenuProductsPath(path: MenuProductsPath): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, path);
  } catch {
    /* private mode */
  }
}

/**
 * Navbar/footer "Menyu / Mahsulotlar" manzili:
 * - havola orqali (`/products-link`) kirgan — `/products-link`
 * - QR orqali stol sessiyasi — `/products`
 */
export function getMenuProductsPath(authTable: Table | null | undefined): MenuProductsPath {
  try {
    const v = sessionStorage.getItem(STORAGE_KEY);
    if (v === "/products" || v === "/products-link") {
      return v;
    }
  } catch {
    /* ignore */
  }
  if (authTable != null) return "/products";
  return "/products-link";
}

/** Havola (`/products-link`) orqali kirgan a'zo — QR stol emas */
export function isLinkFlowCustomer(
  authTable: Table | null | undefined,
  authMember: unknown
): boolean {
  if (!authMember || authTable != null) return false;
  return getMenuProductsPath(null) === "/products-link";
}

/** Buyurtmalar sahifasi: havola a'zolari `/orders-link`, QR stol — `/orders` */
export function getOrdersPath(
  authTable: Table | null | undefined,
  authMember: unknown
): "/orders" | "/orders-link" {
  return isLinkFlowCustomer(authTable, authMember) ? "/orders-link" : "/orders";
}

/** `/products-link` `/products` bilan boshlanmasin — faqat `/products/...` */
export function isMenuProductsActive(
  pathname: string,
  menuPath: MenuProductsPath
): boolean {
  if (menuPath === "/products-link") {
    return pathname.startsWith("/products-link");
  }
  if (pathname.startsWith("/products-link")) {
    return false;
  }
  return pathname === "/products" || pathname.startsWith("/products/");
}
