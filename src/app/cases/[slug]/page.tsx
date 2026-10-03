import Link from "next/link";
import { notFound } from "next/navigation";
import { ReadingBlocks } from "@/components/reading-blocks";
import { StarGrid } from "@/components/star-grid";
import { caseReadings } from "@/lib/case-readings";
import { caseChart, findCase } from "@/lib/cases";
import { getMessages } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default function CasePage({ params }: { params: { slug: string } }) {
  const item = findCase(params.slug);
  const reading = caseReadings[params.slug];
  if (!item || !reading) notFound();
  const { locale, t } = getMessages();
  const chart = caseChart(item);
  const text = reading[locale];
  const sections =
    locale === "zh-Hant"
      ? [
          { title: "建築本身", body: text.building },
          { title: "裡面的人", body: text.people },
          { title: "生意與名聲", body: text.outlook },
          { title: "可以怎麼做", body: text.whatToDo },
        ]
      : [
          { title: "The building", body: text.building },
          { title: "The people inside", body: text.people },
          { title: "Money and reputation", body: text.outlook },
          { title: "What to do", body: text.whatToDo },
        ];

  return (
    <main className="mx-auto max-w-5xl space-y-10 px-6 py-16">
      <Link href="/cases" className="text-sm text-gold">
        {locale === "zh-Hant" ? "全部案例" : "All case studies"}
      </Link>
      <div>
        <p className="text-xs tracking-[0.22em] text-gold uppercase">
          {locale === "zh-Hant" ? item.placeZh : item.place}
        </p>
        <h1 className="mt-2 font-display text-6xl">{locale === "zh-Hant" ? item.nameZh : item.name}</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
          {locale === "zh-Hant"
            ? `下面這篇是依照 ${item.year} 年和示意朝向 ${item.facing}° 算出來的風水，再用白話寫成的。沒有人拿羅盤去過大門。它不是營收預測，也不是投資建議。`
            : `The essay below is a plain-language reading of a chart calculated from ${item.year} and an illustrative facing of ${item.facing}°. Nobody took a compass to the front door. It is not a revenue forecast and it is not investment advice.`}
        </p>
      </div>
      <ReadingBlocks sections={sections} />
      <div className="rounded-2xl border border-border bg-card/50 p-4">
        <StarGrid chart={chart} locale={locale} />
      </div>
      <p className="text-sm text-muted-foreground">{t.disclaimer}</p>
    </main>
  );
}
