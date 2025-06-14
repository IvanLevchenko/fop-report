import {
  type SubmitOptions,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useSubmit,
} from "@remix-run/react";

import LocalizationContext from "./context/localization-context";
import { useState } from "react";
import prisma from "./db.server";

export const loader = async () => {
  const session = await prisma.session.findFirst();
  const currentLocalization = session?.localization || "en";

  return { currentLocalization };
};

export default function App() {
  const { currentLocalization } = useLoaderData<typeof loader>();
  const [localization, setLocalization] = useState(currentLocalization);
  const submitter = useSubmit();

  const handleLocalization = (value: string) => {
    const options: SubmitOptions = {
      method: "PUT",
      action: "/i18n",
      encType: "application/json",
      navigate: false,
    };

    submitter({ language: value }, options);

    setLocalization(value);
  };

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://cdn.shopify.com/" />
        <link
          rel="stylesheet"
          href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
        />
        <Meta />
        <Links />
      </head>
      <body>
        <LocalizationContext.Provider
          value={{ localization, setLocalization: handleLocalization }}
        >
          <Outlet />
          <ScrollRestoration />
          <Scripts />
        </LocalizationContext.Provider>
      </body>
    </html>
  );
}
