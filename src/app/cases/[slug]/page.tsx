import Link from "next/link";
import { notFound } from "next/navigation";
import { StarGrid } from "@/components/star-grid";
import { businessOutlook, caseChart, findCase } from "@/lib/cases";
import { getMessages } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default function CasePage({ params }: { params: { slug: string } }) {
  const item = findCase(params.slug);
  if (!item) notFound();
  const { locale, t } = getMessages();
  const chart = caseChart(item);
  const outlook = businessOutlook(chart, locale);

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-6 py-16">
      <Link href="/cases" className="text-sm text-gold">
        {locale === "zh-Hant" ? "全部案例" : "All case studies"}
      </Link>
      <div>
        <p className="text-xs tracking-[0.22em] text-gold uppercase">
          {locale === "zh-Hant" ? item.placeZh : item.place}
        </p>
        <h1 className="mt-2 font-display text-6xl">{locale === "zh-Hant" ? item.nameZh : item.name}</h1>
        <p className="mt-3 text-muted-foreground">
          {item.year} · {locale === "zh-Hant" ? `示意向 ${item.facing}°` : `illustrative facing ${item.facing}°`} ·{" "}
          {locale === "zh-Hant" ? `${chart.period} 運` : `Period ${chart.period}`}
        </p>
      </div>
      <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
        {locale === "zh-Hant" ? item.formZh : item.formEn}
      </p>
      <div className="rounded-2xl border border-border bg-card/50 p-4">
        <StarGrid chart={chart} locale={locale} />
      </div>
      <section className="rounded-2xl border border-gold/40 p-6">
        <h2 className="font-display text-3xl">{locale === "zh-Hant" ? "業績的風水讀法" : "A feng shui reading of the business"}</h2>
        <p className="mt-4 text-sm leading-7">{outlook}</p>
      </section>
      <p className="text-sm text-muted-foreground">{t.disclaimer}</p>
    </main>
  );
}
