"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { StarGrid } from "@/components/star-grid";
import { REPORT_PRICE_LABEL } from "@/lib/pricing";
import type { FormSchool } from "@/lib/ai/form-school";
import type { FlyingStarChart } from "@/lib/fengshui/flying-star";
import type { LifeGua } from "@/lib/fengshui/kua";

export type PreviewPayload = {
  formSchool: FormSchool;
  period: number;
  facingDegree: number;
  yearBuilt: number;
  auditType: string;
  address: string | null;
  dob: string | null;
  gender: string | null;
  guaPreview: { kua: number; group: string; trigram: string } | null;
  reportId: string | null;
  saveError: string | null;
};

export function ReportView({
  initial,
  sessionId,
}: {
  initial: PreviewPayload;
  sessionId?: string | null;
}) {
  const [paid, setPaid] = useState<{
    chart: FlyingStarChart;
    remedy: string;
    gua: LifeGua | null;
  } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const score = initial.formSchool.structural_score;

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    void (async () => {
      const response = await fetch("/api/stripe/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const payload = (await response.json()) as {
        chart?: FlyingStarChart;
        remedy?: string;
        gua?: LifeGua | null;
        error?: string;
      };
      if (cancelled) return;
      if (!response.ok || !payload.chart || !payload.remedy) {
        setMessage(payload.error || "The payment could not be confirmed.");
        return;
      }
      setPaid({ chart: payload.chart, remedy: payload.remedy, gua: payload.gua ?? null });
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  async function unlock() {
    setPending(true);
    setMessage(null);
    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        facingDegree: initial.facingDegree,
        yearBuilt: initial.yearBuilt,
        dob: initial.dob,
        gender: initial.gender,
        auditType: initial.auditType,
        reportId: initial.reportId,
      }),
    });
    const payload = (await response.json()) as { url?: string; error?: string };
    setPending(false);
    if (!response.ok || !payload.url) {
      setMessage(payload.error || "Checkout could not start.");
      return;
    }
    window.location.href = payload.url;
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs tracking-[0.18em] text-gold uppercase">Form School · free</p>
        <h1 className="mt-2 font-display text-5xl">Structural score {score}</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Period {initial.period}, facing {initial.facingDegree}°.{" "}
          {initial.address ? initial.address : "Image audit."}
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-border p-5">
          <h2 className="text-sm tracking-wide text-muted-foreground uppercase">What is visible</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {initial.formSchool.identified_features.map((item, index) => (
              <li key={`${index}-${item}`}>{item}</li>
            ))}
          </ul>
        </article>
        <article className="rounded-2xl border border-destructive/40 p-5">
          <h2 className="text-sm tracking-wide text-muted-foreground uppercase">Sha Qi</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {initial.formSchool.negative_energies.map((item, index) => (
              <li key={`${index}-${item}`}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      {initial.guaPreview ? (
        <p className="text-sm text-muted-foreground">
          Life Gua {initial.guaPreview.kua} {initial.guaPreview.trigram},{" "}
          {initial.guaPreview.group} group. The four lucky directions stay in the paid chart.
        </p>
      ) : null}

      {initial.saveError ? (
        <p className="text-sm text-muted-foreground">
          The reading is on this page. It was not stored in your account: {initial.saveError}
        </p>
      ) : null}

      {paid ? (
        <section className="space-y-6 rounded-2xl border border-gold/40 p-5">
          <StarGrid chart={paid.chart} />
          <div className="whitespace-pre-wrap text-sm leading-7 text-foreground/90">{paid.remedy}</div>
        </section>
      ) : (
        <section className="rounded-2xl border border-gold/40 bg-gold/5 p-6">
          <p className="text-xs tracking-[0.18em] text-gold uppercase">Compass School</p>
          <h2 className="mt-2 font-display text-4xl">
            Unlock the Period {initial.period} Flying Star report
          </h2>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            The nine-palace chart, sector remedies, and personal directions. One payment of{" "}
            {REPORT_PRICE_LABEL}. The Form School notes above stay free.
          </p>
          <Button className="mt-5" disabled={pending} onClick={() => void unlock()} type="button">
            {pending ? "Opening checkout" : `Unlock for ${REPORT_PRICE_LABEL}`}
          </Button>
          {message ? <p className="mt-3 text-sm text-gold">{message}</p> : null}
        </section>
      )}
    </div>
  );
}
