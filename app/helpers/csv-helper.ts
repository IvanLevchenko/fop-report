import fs from "node:fs";
import { join } from "node:path";

import type { ExportOrder } from "app/types/export-order";
import { RateHelper } from "./rate-helper";

const __dirname = new URL(".", import.meta.url).pathname;

export class CsvHelper {
  public static async generateCsv(
    orders: ExportOrder[],
    rateHelper: RateHelper,
    language = "en",
  ) {
    const filesPath = join(__dirname, "..", "files");
    const date = new Date().toDateString().replace(/ /g, "-");

    const dataColumns = (await import(`../i18n/export/${language}.json`))
      .columns;

    const values = [];

    for (const order of orders) {
      const rate =
        (await rateHelper.getRate(
          new Date(order.createdAt),
          order.totalPriceSet?.shopMoney.currencyCode,
        )) || 0;

      const getAmountInUah = (
        amount: string,
        rate: number,
      ): string | number => {
        return amount && rate ? ((Number(amount) || 0) * rate).toFixed(2) : "-";
      };

      const totalNetInUah = getAmountInUah(
        order.netPaymentSet?.shopMoney.amount,
        rate,
      );
      const totalTaxInUah = getAmountInUah(
        order.totalTaxSet?.shopMoney.amount,
        rate,
      );
      const totalAmountInUah = getAmountInUah(
        order.totalPriceSet?.shopMoney.amount,
        rate,
      );

      values.push([
        order.id,
        order.name,
        order.totalPriceSet?.shopMoney.amount,
        order.netPaymentSet?.shopMoney.amount,
        totalNetInUah,
        order.totalTaxSet?.shopMoney.amount,
        totalTaxInUah,
        new Date(order.createdAt)?.toISOString().split("T")[0],
        order.closedAt
          ? new Date(order.closedAt)?.toISOString().split("T")[0]
          : "-",
        rate,
        totalAmountInUah,
      ]);
    }

    const data = values.map((row) => row.join(",")).join("\n");

    if (!fs.existsSync(filesPath)) {
      fs.mkdirSync(filesPath);
    }

    await fs.promises.writeFile(
      `${filesPath}/${date}.csv`,
      dataColumns + "\n" + data,
      "utf8",
    );
  }
}
