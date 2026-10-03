import Link from "next/link";
import { PentagonMap } from "@/components/landing/pentagon-map";
import { StarGrid } from "@/components/star-grid";
import { Button } from "@/components/ui/button";
import { caseStudies } from "@/lib/cases";
import { flyingStar } from "@/lib/fengshui/flying-star";
import { periodFromYear } from "@/lib/fengshui/period";
import { getMessages } from "@/lib/i18n/server";

const pentagonChart = flyingStar({
  period: periodFromYear(1943),
  facingDegree: 175,
});

export default function HomePage() {
  const { locale, t } = getMessages();

  return (
    <main>
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-xs tracking-[0.22em] text-gold uppercase">{t.heroKicker}</p>
          <h1 className="mt-4 font-display text-6xl leading-[0.95] text-balance sm:text-7xl">{t.heroTitle}</h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">{t.heroBody}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/audit">{t.heroCta}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/cases">{t.heroSecondary}</Link>
            </Button>
          </div>
        </div>
        <PentagonMap />
      </section>

      <section id="pentagon" className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-xs tracking-[0.22em] text-gold uppercase">{t.pentagonKicker}</p>
        <h2 className="mt-3 max-w-3xl font-display text-5xl text-balance">{t.pentagonTitle}</h2>
        <div className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4 text-sm leading-7 text-muted-foreground">
            <p>{t.pentagonP1}</p>
            <p>{t.pentagonP2}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card/50 p-4">
            <StarGrid chart={pentagonChart} locale={locale} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <p className="text-xs tracking-[0.22em] text-gold uppercase">{t.casesKicker}</p>
        <h2 className="mt-3 font-display text-4xl">{t.casesTitle}</h2>
        <div className="mt-6 flex flex-wrap gap-2">
          {caseStudies.map((item) => (
            <Link
              key={item.slug}
              href={`/cases/${item.slug}`}
              className="rounded-full border border-border px-4 py-2 text-sm hover:border-gold hover:text-gold"
            >
              {locale === "zh-Hant" ? item.nameZh : item.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-16 md:grid-cols-3">
        {t.steps.map(([index, title, copy]) => (
          <article key={index} className="rounded-2xl border border-border p-6">
            <p className="text-xs text-gold">{index}</p>
            <h3 className="mt-3 font-display text-3xl">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{copy}</p>
          </article>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="rounded-3xl border border-gold/30 bg-gold/5 px-8 py-10">
          <h2 className="font-display text-5xl">{t.priceTitle}</h2>
          <p className="mt-3 max-w-xl text-muted-foreground">{t.priceBody}</p>
          <Button asChild className="mt-6">
            <Link href="/audit">{t.priceCta}</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
