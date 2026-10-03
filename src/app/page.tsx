import Link from "next/link";
import { PentagonMap } from "@/components/landing/pentagon-map";
import { StarGrid } from "@/components/star-grid";
import { Button } from "@/components/ui/button";
import { flyingStar } from "@/lib/fengshui/flying-star";
import { periodFromYear } from "@/lib/fengshui/period";
import { REPORT_PRICE_LABEL } from "@/lib/pricing";

const pentagonChart = flyingStar({
  period: periodFromYear(1943),
  facingDegree: 175,
});

export default function HomePage() {
  return (
    <main>
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-xs tracking-[0.22em] text-gold uppercase">Form School · Compass School</p>
          <h1 className="mt-4 font-display text-6xl leading-[0.95] text-balance sm:text-7xl">
            Audit the energy of a room before you place the bed.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            GeoMancy reads a floor plan, a photograph, or a satellite view, then calculates the
            Xuan Kong Flying Star chart from the compass degree and the year the building was raised.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/audit">Audit your space</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="#pentagon">See the Pentagon reading</Link>
            </Button>
          </div>
        </div>
        <PentagonMap />
      </section>

      <section id="pentagon" className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-xs tracking-[0.22em] text-gold uppercase">Case study</p>
        <h2 className="mt-3 max-w-3xl font-display text-5xl text-balance">
          The hidden lines of the Pentagon, drawn as a demonstration.
        </h2>
        <div className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4 text-sm leading-7 text-muted-foreground">
            <p>
              The public plan is a five-sided ring of corridors around an open court. In Form School
              that footprint does not offer one calm face. Each corner can throw a glancing arrow at
              the wall beside it, and the highways around the site carry fast sha along the outer
              edges.
            </p>
            <p>
              The court in the middle is the building’s chance to gather qi, provided the main
              approach is not aimed at a corner. The chart beside this text is illustrative: Period{" "}
              {pentagonChart.period}, because the building was completed in 1943, on a notional facing
              of 175°. It is not a measured survey.
            </p>
            <p>
              Your own chart uses the degree you take at the door and the year your building was
              finished. That part is calculated, not guessed.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card/50 p-4">
            <StarGrid chart={pentagonChart} />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-16 md:grid-cols-3">
        {[
          ["01", "Upload", "A plan, a room, or an address. The address path pulls a satellite image."],
          ["02", "Calibrate", "Enter the facing in degrees and the year built. Those two numbers make the chart."],
          ["03", "Read", "Form School is free. The Flying Star grid and remedies unlock for " + REPORT_PRICE_LABEL + "."],
        ].map(([index, title, copy]) => (
          <article key={index} className="rounded-2xl border border-border p-6">
            <p className="text-xs text-gold">{index}</p>
            <h3 className="mt-3 font-display text-3xl">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{copy}</p>
          </article>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="rounded-3xl border border-gold/30 bg-gold/5 px-8 py-10">
          <h2 className="font-display text-5xl">One reading. {REPORT_PRICE_LABEL}.</h2>
          <p className="mt-3 max-w-xl text-muted-foreground">
            The free pass names the structural problems. The paid report is the nine-palace chart,
            a remedy for each hostile star, and the four personal directions from the Life Gua.
          </p>
          <Button asChild className="mt-6">
            <Link href="/audit">Begin an audit</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
