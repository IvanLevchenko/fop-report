import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "app/shopify.server";
import type { OrderEdge } from "@shopify/hydrogen-react/storefront-api-types";

import shopify from "app/api/shopify";
import { orders } from "app/calls/orders";
import type { ExportOrder } from "app/types/export-order";
import { CsvHelper, type GeneratedCsv } from "app/helpers/csv-helper";
import { RateHelper } from "app/helpers/rate-helper";

export const loader = async ({
  request,
}: LoaderFunctionArgs): Promise<GeneratedCsv> => {
  const { session } = await authenticate.admin(request);
  const url = new URL(request.url);

  const rangeStart = url.searchParams.get("rangeStart");
  const rangeEnd = url.searchParams.get("rangeEnd");
  const language = url.searchParams.get("language");

  if (!rangeStart || !rangeEnd) {
    throw new Error("Range start and end dates are required.");
  }

  const client = new shopify.clients.Graphql({ session });
  const result = await client.request(...orders(rangeStart, rangeEnd));

  const ordersList: ExportOrder[] = [
    ...result.data.orders.edges.map((edge: OrderEdge) => edge.node),
  ];

  while (result.data.orders.pageInfo.hasNextPage) {
    ordersList.push(
      ...result.data.orders.edges.map((edge: OrderEdge) => edge.node),
    );

    const nextPage = await client.request(
      ...orders(rangeStart, rangeEnd, result.data.orders.edges.length + 1),
    );
    result.data.orders = nextPage.data.orders;
  }

  return await CsvHelper.generateCsv(
    ordersList,
    new RateHelper(),
    language || "",
  );
};
