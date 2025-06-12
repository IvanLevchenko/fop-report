import { MoneySet } from "./money-set";

export type ExportOrder = {
  id: string;
  name: string;
  closed: boolean;
  closedAt: Date | null;
  createdAt: Date;
  totalPriceSet: MoneySet;
  netPaymentSet: MoneySet;
  totalTaxSet: MoneySet;
};
