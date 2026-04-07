export enum TableStatus {
  AVAILABLE = "AVAILABLE",
  OCCUPIED = "OCCUPIED",
  CLEANING = "CLEANING",
}

/** Stol turi (backend may send `tableKind` or `kind`) */
export enum TableKind {
  STANDARD = "STANDARD",
  VIP = "VIP",
  FAMILY = "FAMILY",
  BAR = "BAR",
  OUTDOOR = "OUTDOOR",
}

export enum TableCall {
  ACTIVE = "ACTIVE",
  PAUSE = "PAUSE",
}
