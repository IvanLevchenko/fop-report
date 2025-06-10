import type { Operation } from "@prisma/client/runtime/library";
import type { AdminOperations } from "@shopify/admin-api-client";
import type { GraphqlQueryOptions } from "@shopify/shopify-api";

export function orders(
  rangeStart: Date | string,
  rangeEnd: Date | string,
  first = 250,
) {
  if (typeof rangeStart === "string") {
    rangeStart = new Date(rangeStart);
  }
  if (typeof rangeEnd === "string") {
    rangeEnd = new Date(rangeEnd);
  }

  const request: [string, GraphqlQueryOptions<Operation, AdminOperations>] = [
    `query orders($first: Int!) {
      orders(first: $first, query: "created_at:>=${rangeStart.toISOString()} created_at:<=${rangeEnd.toISOString()}", sortKey: CREATED_AT, reverse: true) {
        edges {
          node {
            id
            name
            closed
            closedAt
            createdAt
            totalPriceSet {
              shopMoney {
                amount
                currencyCode
              }
            }
            netPaymentSet {
              shopMoney {
                amount
                currencyCode
              }
            }
            totalTaxSet {
              shopMoney {
                amount
                currencyCode
              }
            }
          }
        }

        pageInfo {
          hasNextPage
        }
      }
    }`,
    { variables: { first } },
  ];

  return request;
}
