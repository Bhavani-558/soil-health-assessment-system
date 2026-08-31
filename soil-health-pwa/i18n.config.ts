import type { I18nConfig } from "next-i18next/proxy";

const i18nConfig: I18nConfig = {
  supportedLngs: ["en", "hi", "kn"],
  fallbackLng: "en",
  defaultNS: "common",
  ns: ["common"],

  localeInPath: false,

  reloadOnPrerender:
    process.env.NODE_ENV === "development",
};

export default i18nConfig;