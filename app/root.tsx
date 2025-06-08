import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import LocalizationContext from "./context/localization-context";
import { useState } from "react";

export default function App() {
  const [localization, setLocalization] = useState("en");

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
        <LocalizationContext.Provider value={{ localization, setLocalization }}>
          <Outlet />
          <ScrollRestoration />
          <Scripts />
        </LocalizationContext.Provider>
      </body>
    </html>
  );
}
