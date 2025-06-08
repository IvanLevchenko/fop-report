import type { Operation } from "@prisma/client/runtime/library";
import type { AdminOperations } from "@shopify/admin-api-client";
import type { GraphqlQueryOptions } from "@shopify/shopify-api";

export function orders(first = 250) {
  const request: [string, GraphqlQueryOptions<Operation, AdminOperations>] = [
    `query orders($first: Int!) {
      orders(first: $first, query: "status=closed") {
        edges {
          node {
            id
            displayFinancialStatus
            name
            closed,
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
