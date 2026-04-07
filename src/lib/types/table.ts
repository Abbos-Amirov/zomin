import { TableCall, TableKind, TableStatus } from "../enums/table.enum";

export interface Table {
  _id: string;
  tableNumber: string;
  /** e.g. VIP, STANDARD — backend may send as `type` */
  tableType?: string;
  /** Stol turi (enum bo‘lsa) */
  tableKind?: TableKind;
  /** DB dan kelgan matn — enumga tushmasa ham ko‘rsatish uchun */
  tableKindDisplay?: string;
  qrToken: string;
  tableStatus: TableStatus;
  tableCall: TableCall;
  activeIdentifier: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TableUpdateInput {
  _id: string;
  tableNumber?: string;
  qrToken?: string;
  tableStatus?: TableStatus;
  tableCall?: TableCall;
  activeIdentifier?: string | null;
}
