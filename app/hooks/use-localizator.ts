import { useContext } from "react";

import LocalizationContext from "app/context/localization-context";

export function useLocalizator() {
  return useContext(LocalizationContext);
}
