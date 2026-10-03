"use client";

import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/dictionary";

export function LanguageSwitch({ locale }: { locale: Locale }) {
  const router = useRouter();

  function choose(next: Locale) {
    document.cookie = `geomancy-locale=${next};path=/;max-age=31536000;samesite=lax`;
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1 text-xs">
      <button
        className={locale === "en" ? "text-gold" : "hover:text-foreground"}
        onClick={() => choose("en")}
        type="button"
      >
        EN
      </button>
      <span className="text-border">/</span>
      <button
        className={locale === "zh-Hant" ? "text-gold" : "hover:text-foreground"}
        onClick={() => choose("zh-Hant")}
        type="button"
      >
        繁中
      </button>
    </div>
  );
}
