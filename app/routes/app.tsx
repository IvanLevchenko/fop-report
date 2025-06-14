import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

import { authenticate } from "../shopify.server";
import { useLocalizator } from "app/hooks/use-localizator";
import { useEffect, useState } from "react";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

export default function App() {
  const { apiKey } = useLoaderData<typeof loader>();
  const { localization } = useLocalizator();

  const [customLocalization, setCustomLocalization] = useState();

  useEffect(() => {
    if (localization !== "en") {
      import(`../i18n/components/date-picker/${localization}.json`)
        .then((module) => {
          setCustomLocalization(module.default);
        })
        .catch((e) => {
          console.error("Failed to load localization module:", e);
        });
    }
  }, [localization]);

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey} i18n={customLocalization}>
      <NavMenu>
        <Link to="/app">FOP Report</Link>
      </NavMenu>
      <Outlet />
    </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
