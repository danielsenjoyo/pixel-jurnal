// Shared status vocabulary for the Purchases domain (index page tabs +
// detail pages). One label/type map so every screen reads the same status
// the same way — see docs/patterns/StatusBadge.md.

export type PurchaseStatus =
  | "open"
  | "overdue"
  | "paid"
  | "partial"
  | "unpaid"
  | "closed"
  | "partially_sent"
  | "rejected";

export const PURCHASE_STATUS_LABEL: Record<PurchaseStatus, string> = {
  open: "Open",
  overdue: "Overdue",
  paid: "Paid",
  partial: "Partial",
  unpaid: "Unpaid",
  closed: "Closed",
  partially_sent: "Partially sent",
  rejected: "Rejected",
};

export const PURCHASE_STATUS_TYPE: Record<
  PurchaseStatus,
  "completed" | "warning" | "critical" | "information" | "announcement"
> = {
  open: "information",
  overdue: "critical",
  paid: "completed",
  partial: "warning",
  unpaid: "critical",
  closed: "announcement",
  partially_sent: "warning",
  rejected: "critical",
};
