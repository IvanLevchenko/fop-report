import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "app/shopify.server";

import shopify from "app/api/shopify";
import { orders } from "app/calls/orders";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const client = new shopify.clients.Graphql({ session });
  const result = await client.request(...orders());

  return result.data;
};
