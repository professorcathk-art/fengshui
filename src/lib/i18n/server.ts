import { cookies } from "next/headers";
import { messages, type Locale } from "./dictionary";

export function getLocale(): Locale {
  const value = cookies().get("geomancy-locale")?.value;
  return value === "zh-Hant" ? "zh-Hant" : "en";
}

export function getMessages() {
  const locale = getLocale();
  return { locale, t: messages(locale) };
}
