import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { StarGrid } from "@/components/star-grid";
import type { FormSchool } from "@/lib/ai/form-school";
import type { FlyingStarChart } from "@/lib/fengshui/flying-star";
import { getLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function isFormSchool(value: unknown): value is FormSchool {
  if (!value || typeof value !== "object") return false;
  const record = value as FormSchool;
  return Array.isArray(record.identified_features) && Array.isArray(record.negative_energies);
}

function isChart(value: unknown): value is FlyingStarChart {
  if (!value || typeof value !== "object") return false;
  return Array.isArray((value as FlyingStarChart).palaces);
}

export default async function SavedReportPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  const { data: audit } = await supabase
    .from("audits")
    .select("id, audit_type, facing_degree, year_built, status, image_url")
    .eq("id", params.id)
    .maybeSingle();

  if (!audit) notFound();
  const locale = getLocale();

  const { data: report } = await supabase
    .from("reports")
    .select("form_school_json, compass_school_json, remedy_text, is_unlocked")
    .eq("audit_id", audit.id)
    .maybeSingle();

  const form = isFormSchool(report?.form_school_json) ? report.form_school_json : null;
  const chart =
    report?.is_unlocked && isChart(report.compass_school_json) ? report.compass_school_json : null;

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-6 py-16">
      <div>
        <p className="text-xs tracking-[0.18em] text-gold uppercase">{audit.status}</p>
        <h1 className="mt-2 font-display text-5xl capitalize">{audit.audit_type} audit</h1>
        <p className="mt-3 text-muted-foreground">
          {audit.year_built} · {audit.facing_degree}°
          {audit.image_url ? ` · ${audit.image_url}` : ""}
        </p>
      </div>

      {form ? (
        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-border p-5 text-sm">
            {form.identified_features.map((item, index) => (
              <p key={`${index}-${item}`} className="mb-2">
                {item}
              </p>
            ))}
          </article>
          <article className="rounded-2xl border border-border p-5 text-sm">
            <p className="mb-3 text-muted-foreground">Score {form.structural_score}</p>
            {form.negative_energies.map((item, index) => (
              <p key={`${index}-${item}`} className="mb-2">
                {item}
              </p>
            ))}
          </article>
        </section>
      ) : (
        <p className="text-sm text-muted-foreground">
          This audit was saved without a Form School record.{" "}
          <Link className="text-gold" href="/audit">
            Run it again
          </Link>{" "}
          to keep the reading on the results page.
        </p>
      )}

      {chart ? (
        <section className="space-y-6">
          <StarGrid chart={chart} locale={locale} />
          {report?.remedy_text ? (
            <div className="whitespace-pre-wrap text-sm leading-7">{report.remedy_text}</div>
          ) : null}
        </section>
      ) : (
        <p className="text-sm text-muted-foreground">
          The Flying Star chart stays locked until checkout completes. Open the reading from the
          same browser to pay, or add Stripe keys and pay again from a new audit.
        </p>
      )}
    </main>
  );
}
