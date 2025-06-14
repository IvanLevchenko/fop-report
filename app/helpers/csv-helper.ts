import fs, { createReadStream, type ReadStream } from "node:fs";
import { join } from "node:path";

import type { ExportOrder } from "app/types/export-order";
import type { RateHelper } from "./rate-helper";
import { unlink } from "node:fs/promises";

const __dirname = new URL(".", import.meta.url).pathname;

export type GeneratedCsv = {
  base64: string;
  type: string;
  path: string;
};

export class CsvHelper {
  public static async generateCsv(
    orders: ExportOrder[],
    rateHelper: RateHelper,
    language = "en",
  ): Promise<GeneratedCsv> {
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

    const filePath = `${filesPath}/${date}.csv`;

    try {
      await fs.promises.writeFile(filePath, dataColumns + "\n" + data, "utf8");
    } catch (e) {
      throw new Error("File generation failed.");
    }

    const blob = await CsvHelper.streamToBlob(
      createReadStream(filePath, { highWaterMark: 5 * 1024 * 1024 }),
    );
    const arrayBuffer = await blob.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    await unlink(filePath);

    return {
      base64,
      type: blob.type,
      path: filePath,
    };
  }

  private static streamToBlob = async (
    readableStream: ReadStream,
    mimeType = "text/csv",
  ) => {
    const chunks: (string | Buffer<ArrayBufferLike>)[] = [];
    const promise: boolean = await new Promise((resolve) => {
      readableStream.on("data", (chunk) => chunks.push(chunk));
      readableStream.on("end", () => resolve(true));
      readableStream.on("error", () => resolve(false));
    });

    if (!promise) {
      return new Blob();
    }

    return new Blob(chunks, { type: mimeType });
  };
}
