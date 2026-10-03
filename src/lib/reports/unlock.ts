import { createAdminClient } from "@/lib/billing";
import { flyingStar, type FlyingStarChart } from "@/lib/fengshui/flying-star";
import { lifeGua, type Gender, type LifeGua } from "@/lib/fengshui/kua";
import { periodFromYear } from "@/lib/fengshui/period";
import { remedyText } from "@/lib/fengshui/remedies";

export function paidReading(input: {
  facing: number;
  year: number;
  dob?: string;
  gender?: string;
}) {
  const chart = flyingStar({
    period: periodFromYear(input.year),
    facingDegree: input.facing,
  });
  const gua =
    input.dob && (input.gender === "female" || input.gender === "male")
      ? lifeGua(input.dob, input.gender as Gender)
      : null;
  return { chart, gua, remedy: remedyText(chart, gua) };
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
