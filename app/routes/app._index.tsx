import { useEffect, useState } from "react";
import {
  Page,
  Layout,
  BlockStack,
  DatePicker,
  Card,
  InlineStack,
  Text,
  Tooltip,
  Button,
} from "@shopify/polaris";
import { InfoIcon } from "@shopify/polaris-icons";
import { TitleBar } from "@shopify/app-bridge-react";

import Localizator from "app/components/admin/localizator";
import { useLocalizator } from "app/hooks/use-localizator";

import defaultLocalization from "app/i18n/admin/en.json";
import { useFetcher } from "@remix-run/react";

// export const loader = async ({ request }: LoaderFunctionArgs) => {
//   // const { session } = await authenticate.admin(request);

//   // const client = new shopify.clients.Graphql({ session });
//   // const result = await client.request(...orders());

//   // return {
//   //   products: result.data,
//   // };
// };

// export const action = async ({ request }: ActionFunctionArgs) => {
//   const { session } = await authenticate.admin(request);
//   const client = new shopify.clients.Graphql({ session });

//   await client.query({
//     data: {
//       query: `mutation orderCreate($order: OrderCreateOrderInput!, $options: OrderCreateOptionsInput) {
//       orderCreate(order: $order, options: $options) {
//         userErrors {
//           field
//           message
//         }
//         order {
//           id
//           totalTaxSet {
//             shopMoney {
//               amount
//               currencyCode
//             }
//           }
//           lineItems(first: 5) {
//             nodes {
//               variant {
//                 id
//               }
//               id
//               title
//               quantity
//               taxLines {
//                 title
//                 rate
//                 priceSet {
//                   shopMoney {
//                     amount
//                     currencyCode
//                   }
//                 }
//               }
//             }
//           }
//         }
//       }
//     }`,
//       variables: {
//         order: {
//           currency: "EUR",
//           lineItems: [
//             {
//               title: "Big Brown Bear Boots",
//               priceSet: {
//                 shopMoney: {
//                   amount: 74.99,
//                   currencyCode: "EUR",
//                 },
//               },
//               quantity: 3,
//               taxLines: [
//                 {
//                   priceSet: {
//                     shopMoney: {
//                       amount: 13.5,
//                       currencyCode: "EUR",
//                     },
//                   },
//                   rate: 0.06,
//                   title: "State tax",
//                 },
//               ],
//             },
//           ],
//           transactions: [
//             {
//               kind: "SALE",
//               status: "SUCCESS",
//               amountSet: {
//                 shopMoney: {
//                   amount: 238.47,
//                   currencyCode: "EUR",
//                 },
//               },
//             },
//           ],
//         },
//       },
//     },
//   });

//   return null;
// };

export default function Index() {
  const fetcher = useFetcher();

  // Date management
  const today = new Date();

  const [{ month, year }, setDate] = useState({
    month: new Date().getMonth() - 1,
    year: new Date().getFullYear(),
  });
  const [selectedDates, setSelectedDates] = useState({
    start: new Date(today.getFullYear(), today.getMonth() - 1, today.getDate()), // 30 days ago
    end: new Date(Date.now()),
  });

  // i18n
  const [i18n, setI18n] = useState(defaultLocalization);
  const { localization } = useLocalizator();

  const handleMonthChange = (newMonth: number, newYear: number) => {
    setDate({ month: newMonth, year: newYear });
  };

  const handleExport = () => {
    const rangeStart = selectedDates.start.toISOString();
    const rangeEnd = selectedDates.end.toISOString();

    fetcher.load(
      `/orders?rangeStart=${rangeStart}&rangeEnd=${rangeEnd}&language=${localization}`,
    );
  };

  useEffect(() => {
    import(`../i18n/admin/${localization}.json`)
      .then((module) => {
        setI18n(module.default);
      })
      .catch((e) => {
        console.error("Failed to load localization module:", e);
      });
  }, [localization]);

  useEffect(() => {
    if (fetcher.data && fetcher.state === "idle") {
      shopify.toast.show(i18n.successToast);
    }
  }, [fetcher.data]);

  return (
    <Page>
      <TitleBar title="Title"></TitleBar>
      <BlockStack gap="500">
        <InlineStack align="end">
          <Localizator />
        </InlineStack>
        <Layout>
          <Card>
            <InlineStack gap="150" blockAlign="center">
              <Tooltip content={i18n.dateRangeTooltip} dismissOnMouseOut>
                <Button icon={InfoIcon}></Button>
              </Tooltip>
              <Text as="h2" variant="headingMd" fontWeight="bold">
                {i18n.rangeLabel}
              </Text>
            </InlineStack>
            <br />
            <DatePicker
              month={month}
              year={year}
              onChange={setSelectedDates}
              onMonthChange={handleMonthChange}
              selected={selectedDates}
              weekStartsOn={1}
              multiMonth
              allowRange
            />
            <br />
            <InlineStack align="end">
              <Button
                variant="primary"
                loading={fetcher.state === "loading"}
                onClick={handleExport}
              >
                {i18n.exportButton}
              </Button>
            </InlineStack>
          </Card>
        </Layout>
      </BlockStack>
    </Page>
  );
}
