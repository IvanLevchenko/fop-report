import { Box, Select } from "@shopify/polaris";
import { PropsWithChildren, useEffect, useState } from "react";

import { useLocalizator } from "app/hooks/use-localizator";

import { label as defaultLabel } from "app/i18n/components/localizator/en.json";

type Props = {
  localization: string;
};

export default function Localizator(props: PropsWithChildren<Props>) {
  const localizations = [
    { label: "English", value: "en" },
    { label: "Українська", value: "ua" },
  ];

  const [label, setLabel] = useState(defaultLabel);
  const [value, setValue] = useState(
    props.localization || localizations[0].value,
  );
  const { localization, setLocalization } = useLocalizator();

  const handleSelectChange = (value: string) => {
    setLocalization(value);
    setValue(value);
  };

  useEffect(() => {
    import(`../../i18n/components/localizator/${localization}.json`)
      .then((module) => {
        setLabel(module.default.label);
      })
      .catch((e) => {
        console.error("Failed to load localization module:", e);
      });
  }, [localization, value]);

  return (
    <Box width="120px">
      <Select
        label={label}
        options={localizations}
        value={value}
        onChange={handleSelectChange}
      />
    </Box>
  );
}
