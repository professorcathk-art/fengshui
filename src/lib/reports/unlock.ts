import { createAdminClient } from "@/lib/billing";
import { flyingStar, type FlyingStarChart } from "@/lib/fengshui/flying-star";
import { lifeGua, type Gender, type LifeGua } from "@/lib/fengshui/kua";
import { periodFromYear } from "@/lib/fengshui/period";
import { remedyText } from "@/lib/fengshui/remedies";
import { formatReading, narrateChart, type PlainReading } from "@/lib/ai/narrate";
import type { Locale } from "@/lib/i18n/dictionary";

export function paidReading(input: {
  facing: number;
  year: number;
  dob?: string;
  gender?: string;
  locale?: string;
}) {
  const locale: Locale = input.locale === "zh-Hant" ? "zh-Hant" : "en";
  const chart = flyingStar({
    period: periodFromYear(input.year),
    facingDegree: input.facing,
  });
  const gua =
    input.dob && (input.gender === "female" || input.gender === "male")
      ? lifeGua(input.dob, input.gender as Gender)
      : null;
  return { chart, gua, remedy: remedyText(chart, gua, locale) };
}

export async function narratedPaidReading(input: {
  facing: number;
  year: number;
  dob?: string;
  gender?: string;
  locale?: string;
  subject?: string;
  place?: string;
  notes?: string;
  audience?: "case" | "home";
}) {
  const base = paidReading(input);
  const locale: Locale = input.locale === "zh-Hant" ? "zh-Hant" : "en";
  try {
    const narrative = await narrateChart({
      locale,
      audience: input.audience ?? "home",
      subject: input.subject || (locale === "zh-Hant" ? "這個空間" : "This space"),
      place: input.place,
      year: input.year,
      notes: input.notes,
      chart: base.chart,
      gua: base.gua,
    });
    return { ...base, narrative, remedy: formatReading(narrative, locale) };
  } catch (error) {
    console.error(error);
    return { ...base, narrative: null as PlainReading | null };
  }
}

export async function unlockStoredReport(input: {
  reportId: string;
  facing: number;
  year: number;
  chart: FlyingStarChart;
  gua: LifeGua | null;
  remedy: string;
}) {
  const admin = createAdminClient();
  if (!admin || !input.reportId) return;

  const { data: report } = await admin
    .from("reports")
    .select("audit_id")
    .eq("id", input.reportId)
    .maybeSingle();
  if (!report?.audit_id) return;

  const { data: audit } = await admin
    .from("audits")
    .select("facing_degree, year_built")
    .eq("id", report.audit_id)
    .maybeSingle();
  if (!audit) return;
  if (Number(audit.facing_degree) !== input.facing || Number(audit.year_built) !== input.year) {
    return;
  }

  await admin
    .from("reports")
    .update({
      is_unlocked: true,
      compass_school_json: input.chart,
      remedy_text: input.remedy,
    })
    .eq("id", input.reportId);
  await admin.from("audits").update({ status: "paid" }).eq("id", report.audit_id);
}
