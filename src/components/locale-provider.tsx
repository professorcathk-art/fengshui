"use client";

import { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { messages, type Copy, type Locale } from "@/lib/i18n/dictionary";

const LocaleContext = createContext<{
  locale: Locale;
  t: Copy;
  choose: (locale: Locale) => void;
} | null>(null);

export function LocaleProvider({
  initial,
  children,
}: {
  initial: Locale;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>(initial);

  function choose(next: Locale) {
    document.cookie = `geomancy-locale=${next};path=/;max-age=31536000;samesite=lax`;
    setLocale(next);
    router.refresh();
  }

  return (
    <LocaleContext.Provider value={{ locale, t: messages(locale), choose }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const value = useContext(LocaleContext);
  if (!value) {
    return { locale: "en" as Locale, t: messages("en"), choose: () => undefined };
  }
  return value;
}
