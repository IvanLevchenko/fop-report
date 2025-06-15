import { useEffect, useRef, useState } from "react";
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
import { type loader as ordersLoader } from "./orders";
import { type GeneratedCsv } from "app/helpers/csv-helper";
import { base64ToBlob } from "app/helpers/base64-to-blob";
import { authenticate } from "app/shopify.server";
import { type LoaderFunctionArgs } from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return null;
};

export default function Index() {
  const fetcher = useFetcher<typeof ordersLoader>();
  const exportRef = useRef(false);

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
    exportRef.current = true;
  };

  const handleDownload = async (csv: GeneratedCsv) => {
    const url = URL.createObjectURL(base64ToBlob(csv.base64, csv.type));

    const link = document.createElement("a");
    link.href = url;
    link.download = csv.path.split("/").at(-1) as string;
    link.click();

    URL.revokeObjectURL(url);
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
    if (fetcher.data && fetcher.state === "idle" && exportRef.current) {
      shopify.toast.show(i18n.successToast);
    }

    if (fetcher.data && exportRef.current) {
      handleDownload(fetcher.data as GeneratedCsv);

      exportRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher.data, fetcher]);

  return (
    <Page>
      <TitleBar title={i18n.title}></TitleBar>
      <BlockStack gap="500">
        <InlineStack align="end">
          <Localizator localization={localization} />
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
