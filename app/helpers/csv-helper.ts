import fs from "node:fs";
import { join } from "node:path";

import type { ExportOrder } from "app/types/export-order";

const __dirname = new URL(".", import.meta.url).pathname;

export class CsvHelper {
  public static async generateCsv(orders: Partial<ExportOrder>[]) {
    const filesPath = join(__dirname, "..", "files");
    const date = new Date().toDateString().replace(/ /g, "-");

    const dataColumns = "id,name,totalPrice,netPayment,totalTax";
    const data = orders
      .map((order) => {
        return `${order.id},${order.name},${order.createdAt},${order.closedAt},${order.totalPriceSet?.shopMoney.amount},${order.netPaymentSet?.shopMoney.amount},${order.totalTaxSet?.shopMoney.amount}`;
      })
      .join("\n");

    if (!fs.existsSync(filesPath)) {
      fs.mkdirSync(filesPath);
    }

    await fs.promises.writeFile(
      `${filesPath}/report-${date}.csv`,
      dataColumns + "\n" + data,
      "utf8",
    );
  }
}
