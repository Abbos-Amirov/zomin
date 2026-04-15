import axios from "axios";
import { serverApi, tableApiBase } from "../../lib/config";
import { clearStoredAccessToken } from "../../lib/accessToken";
import { TableKind } from "../../lib/enums/table.enum";
import { Table } from "../../lib/types/table";

/** Row heuristics — backend may use different field names */
function isTableLikeRow(item: unknown): boolean {
  if (!item || typeof item !== "object") return false;
  const o = item as Record<string, unknown>;
  const tn = o.tableNumber ?? o.table_number;
  return (
    typeof o._id === "string" ||
    typeof tn === "string" ||
    typeof tn === "number"
  );
}

/**
 * Postman may show `{ list: [...] }` or nested `{ data: { result: [...] } }`.
 * Shallow keys first, then deep search for the first array of table-like objects.
 */
function extractTableListFromResponse(data: unknown): unknown[] {
  if (Array.isArray(data)) {
    const direct = data.filter(isTableLikeRow);
    if (direct.length > 0) return direct;
    for (const el of data) {
      const inner = extractTableListFromResponse(el);
      if (inner.length > 0) return inner;
    }
    return [];
  }
  if (!data || typeof data !== "object") return [];
  const root = data as Record<string, unknown>;
  const keys = [
    "tables",
    "data",
    "list",
    "items",
    "result",
    "payload",
    "records",
    "rows",
    "value",
    "body",
    "content",
    "tableList",
  ];
  for (const k of keys) {
    const v = root[k];
    if (Array.isArray(v)) {
      const rows = v.filter(isTableLikeRow);
      if (rows.length > 0) return rows;
    }
    if (v && typeof v === "object") {
      const inner = extractTableListFromResponse(v);
      if (inner.length > 0) return inner;
    }
  }
  const nested = root.data;
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    const inner = extractTableListFromResponse(nested);
    if (inner.length > 0) return inner;
  }
  return findFirstTableLikeArrayDeep(data, 0);
}

function findFirstTableLikeArrayDeep(data: unknown, depth: number): unknown[] {
  if (depth > 14) return [];
  if (Array.isArray(data)) {
    const rows = data.filter(isTableLikeRow);
    if (rows.length > 0) return rows;
    for (const el of data) {
      const found = findFirstTableLikeArrayDeep(el, depth + 1);
      if (found.length > 0) return found;
    }
    return [];
  }
  if (data && typeof data === "object") {
    for (const v of Object.values(data as Record<string, unknown>)) {
      const found = findFirstTableLikeArrayDeep(v, depth + 1);
      if (found.length > 0) return found;
    }
  }
  return [];
}

class TableService {
  private readonly path: string;

  constructor() {
    this.path = serverApi;
  }

  /**
   * GET {tableApiBase}/table/all — withCredentials: cookie (accessToken).
   * Backend: occupiedByMe va h.k. Bearer + cookie bilan ishlaydi.
   */
  public async getAllTables(): Promise<Table[]> {
    try {
      const url = tableApiBase + "/table/all";
      const result = await axios.get(url, { withCredentials: true });
      const raw = result.data;
      const list = extractTableListFromResponse(raw);
      if (list.length === 0 && raw && typeof raw === "object") {
        console.warn(
          "[TableService] GET /table/all: could not find a table array in the response. Top-level keys:",
          Object.keys(raw as object)
        );
      }
      return list.map((row) =>
        this.normalizeTableRow(row as Record<string, unknown>)
      );
    } catch (err) {
      console.log("Error, getAllTables:", err);
      throw err;
    }
  }

  private normalizeTableRow(row: Record<string, unknown>): Table {
    const base = row as unknown as Table;
    const tn = row.tableNumber ?? row.table_number;
    const tableNumber =
      typeof tn === "number" ? String(tn) : typeof tn === "string" ? tn : base.tableNumber;
    const tableType =
      (typeof row.tableType === "string" && row.tableType) ||
      (typeof row.type === "string" && row.type) ||
      (typeof row.table_type === "string" && row.table_type) ||
      base.tableType;
    const rawKind = TableService.pickKindRaw(row);
    const tableKind =
      rawKind && Object.values(TableKind).includes(rawKind as TableKind)
        ? (rawKind as TableKind)
        : base.tableKind;
    const tableKindDisplay = rawKind ?? base.tableKindDisplay;
    const occupiedByMe = Boolean(row.occupiedByMe ?? row.occupied_by_me);
    const selectableByCurrentMember = Boolean(
      row.selectableByCurrentMember ??
        row.selectable_for_current_member ??
        row.canSelectForReorder ??
        row.can_select_for_reorder
    );
    return {
      ...base,
      tableNumber,
      tableType,
      tableKind,
      tableKindDisplay,
      occupiedByMe,
      selectableByCurrentMember,
    };
  }

  /** Backend `tableKind` / `kind` / `table_kind` / raqam — bittasini ham olish */
  private static pickKindRaw(row: Record<string, unknown>): string | undefined {
    const flat = TableService.pickKindRawFlat(row);
    if (flat) return flat;
    const nested = row.table;
    if (nested && typeof nested === "object" && !Array.isArray(nested)) {
      return TableService.pickKindRawFlat(nested as Record<string, unknown>);
    }
    return undefined;
  }

  private static pickKindRawFlat(row: Record<string, unknown>): string | undefined {
    const candidates: unknown[] = [
      row.tableKind,
      row.kind,
      row.table_kind,
      row.kindLabel,
      row.kind_label,
      row.tableCategory,
      row.table_category,
    ];
    for (const v of candidates) {
      if (v == null) continue;
      if (typeof v === "string") {
        const s = v.trim();
        if (s) return s;
      }
      if (typeof v === "number" && !Number.isNaN(v)) {
        return String(v);
      }
      if (typeof v === "object" && !Array.isArray(v)) {
        const o = v as Record<string, unknown>;
        const sub =
          (typeof o.name === "string" && o.name.trim()) ||
          (typeof o.label === "string" && o.label.trim()) ||
          (typeof o.title === "string" && o.title.trim()) ||
          (typeof o.code === "string" && o.code.trim());
        if (sub) return sub;
      }
    }
    return undefined;
  }

  public async qrLanding(id: string): Promise<Table> {
    try {
      const url = this.path + `/table/qr/${id}`;
      const result = await axios.get(url, { withCredentials: true });
      console.log("qrLanding: ", result);
      const table = result.data.table;
      localStorage.setItem("tableData", JSON.stringify(table));
      localStorage.removeItem("memberData");
      clearStoredAccessToken();
      return table;
    } catch (err) {
      console.log("Error, qrLanding: ", err);
      throw err;
    }
  }

  public async tableLogout(): Promise<void> {
    try {
      const url = this.path + `/table/logout`;
      const result = await axios.post(url, {}, { withCredentials: true });
      console.log("tableLogout:", result);
      localStorage.removeItem("tableData");
    } catch (err) {
      console.log("Error, tableLogout:", err);
      throw err;
    }
  }

  public async clickTableCall(id: string): Promise<void> {
    try {
      const url = this.path + `/table/call/${id}`;
      const result = await axios.get(url, { withCredentials: true });
      console.log("clickTableCall:", result);
    } catch (err) {
      console.log("Error, clickTableCall:", err);
      throw err;
    }
  }
}

export default TableService;
