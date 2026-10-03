import Link from "next/link";
import { caseChart, caseStudies } from "@/lib/cases";
import { getMessages } from "@/lib/i18n/server";

export default function CasesPage() {
  const { locale, t } = getMessages();

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-xs tracking-[0.22em] text-gold uppercase">{t.casesKicker}</p>
      <h1 className="mt-3 font-display text-6xl">{t.casesTitle}</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">{t.casesBody}</p>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {caseStudies.map((item) => {
          const chart = caseChart(item);
          return (
            <Link
              key={item.slug}
              href={`/cases/${item.slug}`}
              className="rounded-2xl border border-border p-5 hover:border-gold"
            >
              <p className="font-display text-3xl">{locale === "zh-Hant" ? item.nameZh : item.name}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {locale === "zh-Hant" ? item.placeZh : item.place} · {item.year} · {item.facing}°
              </p>
              <p className="mt-3 text-sm text-gold">
                {locale === "zh-Hant" ? `${chart.period} 運` : `Period ${chart.period}`}
              </p>
            </Link>
          );
        })}
      </div>
      <p className="mt-10 text-sm text-muted-foreground">{t.disclaimer}</p>
    </main>
  );
}
