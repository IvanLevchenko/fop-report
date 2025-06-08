import { createContext } from "react";

export default createContext({
  localization: "en",
  setLocalization: (value: string) => {},
});
