import prisma from "app/db.server";
import { randomUUID } from "node:crypto";

type RateFromAPI = {
  r030: number;
  txt: string;
  rate: number;
  cc: string;
  exchangedate: string;
};

export class RateHelper {
  private async fetchRateFromAPI(date: Date, cc: string): Promise<number> {
    const formattedDate = `${date.getFullYear()}0${date.getMonth() + 1}0${date.getDate()}`;

    try {
      const response = await fetch(
        `https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?date=${formattedDate}&json`,
      );
      const json: RateFromAPI[] = await response.json();
      const rate = json.find((item: RateFromAPI) => item.cc === cc)?.rate;

      return rate || 0;
    } catch (e) {
      console.error(e);
      return 0;
    }
  }

  public async getRate(
    date: Date,
    currency: string | undefined,
  ): Promise<number | null> {
    if (!currency) {
      return null;
    }

    const isoDate = date.toISOString().split("T")[0];

    const existingRate = await prisma.rate.findFirst({
      where: {
        date: isoDate,
        currency,
      },
    });

    if (!existingRate) {
      const rate = await this.fetchRateFromAPI(date, currency);

      await prisma.rate.create({
        data: {
          id: randomUUID(),
          date: isoDate,
          rate: rate.toString(),
          currency,
        },
      });

      return rate;
    }

    return Number(existingRate.rate);
  }
}
