import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { flyingStar } from "@/lib/fengshui/flying-star";
import { lifeGua } from "@/lib/fengshui/kua";
import { periodFromYear } from "@/lib/fengshui/period";

export const dynamic = "force-dynamic";

export function GET() {
  const chart = flyingStar({ period: 8, facingDegree: 180 });
  const north = chart.palaces.find((palace) => palace.id === "N");
  const mathOk =
    chart.kind === "double-facing" &&
    north?.mountain === 9 &&
    north.period === 4 &&
    north.water === 7 &&
    periodFromYear(2024) === 9 &&
    lifeGua("1980-06-01", "male").kua === 2;

  return NextResponse.json({
    ok: mathOk,
    mathOk,
    supabaseConfigured: isSupabaseConfigured(),
    deepseekConfigured: Boolean(process.env.DEEPSEEK_API_KEY),
    stripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY),
    paywallBypass: !process.env.STRIPE_SECRET_KEY,
    supabaseSecretConfigured: Boolean(process.env.SUPABASE_SECRET_KEY),
  });
}
