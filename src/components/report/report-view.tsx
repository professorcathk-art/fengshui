"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/locale-provider";
import { StarGrid } from "@/components/star-grid";
import { REPORT_PRICE_LABEL } from "@/lib/pricing";
import type { Locale } from "@/lib/i18n/dictionary";
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
  resultLocale?: Locale;
};

export function ReportView({
  initial,
  sessionId,
}: {
  initial: PreviewPayload;
  sessionId?: string | null;
}) {
  const { locale } = useLocale();
  const resultLocale = initial.resultLocale === "zh-Hant" ? "zh-Hant" : "en";
  const zh = locale === "zh-Hant";
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
        locale: resultLocale,
      }),
    });
    const payload = (await response.json()) as {
      url?: string;
      error?: string;
      bypass?: boolean;
      chart?: FlyingStarChart;
      remedy?: string;
      gua?: LifeGua | null;
    };
    setPending(false);
    if (payload.bypass && payload.chart && payload.remedy) {
      setPaid({ chart: payload.chart, remedy: payload.remedy, gua: payload.gua ?? null });
      setMessage(
        zh
          ? "Stripe 尚未接上，所以這次沒有收款，飛星盤已打開。"
          : "Stripe is not connected, so this chart opened without a charge.",
      );
      return;
    }
    if (!response.ok || !payload.url) {
      setMessage(payload.error || (zh ? "無法開始付款。" : "Checkout could not start."));
      return;
    }
    window.location.href = payload.url;
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs tracking-[0.18em] text-gold uppercase">
          {zh ? "巒頭 · 免費" : "Form School · free"}
        </p>
        <h1 className="mt-2 font-display text-5xl">{zh ? `結構分數 ${score}` : `Structural score ${score}`}</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          {zh ? `${initial.period} 運，向 ${initial.facingDegree}°。` : `Period ${initial.period}, facing ${initial.facingDegree}°. `}
          {initial.address ? initial.address : zh ? "圖像審計。" : "Image audit."}
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-border p-5">
          <h2 className="text-sm tracking-wide text-muted-foreground uppercase">{zh ? "可見的形" : "What is visible"}</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {initial.formSchool.identified_features.map((item, index) => (
              <li key={`${index}-${item}`}>{item}</li>
            ))}
          </ul>
        </article>
        <article className="rounded-2xl border border-destructive/40 p-5">
          <h2 className="text-sm tracking-wide text-muted-foreground uppercase">{zh ? "煞氣" : "Sha Qi"}</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {initial.formSchool.negative_energies.map((item, index) => (
              <li key={`${index}-${item}`}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      {initial.guaPreview ? (
        <p className="text-sm text-muted-foreground">
          {zh
            ? `命卦 ${initial.guaPreview.kua} ${initial.guaPreview.trigram}，${initial.guaPreview.group}。四個吉方在飛星盤裡。`
            : `Life Gua ${initial.guaPreview.kua} ${initial.guaPreview.trigram}, ${initial.guaPreview.group} group. The four lucky directions stay in the paid chart.`}
        </p>
      ) : null}

      {initial.saveError ? (
        <p className="text-sm text-muted-foreground">
          The reading is on this page. It was not stored in your account: {initial.saveError}
        </p>
      ) : null}

      {paid ? (
        <section className="space-y-6 rounded-2xl border border-gold/40 p-5">
          <StarGrid chart={paid.chart} locale={resultLocale} />
          <div className="whitespace-pre-wrap text-sm leading-7 text-foreground/90">{paid.remedy}</div>
        </section>
      ) : (
        <section className="rounded-2xl border border-gold/40 bg-gold/5 p-6">
          <p className="text-xs tracking-[0.18em] text-gold uppercase">{zh ? "理氣" : "Compass School"}</p>
          <h2 className="mt-2 font-display text-4xl">
            {zh ? `解鎖 ${initial.period} 運飛星報告` : `Unlock the Period ${initial.period} Flying Star report`}
          </h2>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            {zh
              ? `九宮飛星、各宮化煞，以及個人吉方。接上 Stripe 後收費 ${REPORT_PRICE_LABEL}。上面的巒頭仍然免費。Stripe 還沒接上時，這個按鈕會直接打開飛星盤，方便測試。`
              : `The nine-palace chart, sector remedies, and personal directions. One payment of ${REPORT_PRICE_LABEL} once Stripe is connected. The Form School notes above stay free. Until then, this button opens the chart so you can test it.`}
          </p>
          <Button className="mt-5" disabled={pending} onClick={() => void unlock()} type="button">
            {pending
              ? zh
                ? "正在打開"
                : "Opening checkout"
              : zh
                ? `以 ${REPORT_PRICE_LABEL} 解鎖`
                : `Unlock for ${REPORT_PRICE_LABEL}`}
          </Button>
        </section>
      )}
      {message ? <p className="text-sm text-gold">{message}</p> : null}
    </div>
  );
}
