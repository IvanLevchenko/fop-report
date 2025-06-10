import { MoneySet } from "./money-set";

export type ExportOrder = {
  id: string;
  name: string;
  closed: boolean;
  closedAt: string | null;
  createdAt: string;
  totalPriceSet: MoneySet;
  netPaymentSet: MoneySet;
  totalTaxSet: MoneySet;
};
