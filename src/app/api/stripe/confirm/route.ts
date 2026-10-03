import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripeSecret } from "@/lib/billing";
import { paidReading, unlockStoredReport } from "@/lib/reports/unlock";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = stripeSecret();
  if (!secret) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 503 });
  }

  const { sessionId } = (await request.json()) as { sessionId?: string };
  if (!sessionId) {
    return NextResponse.json({ error: "Missing checkout session." }, { status: 400 });
  }

  const stripe = new Stripe(secret);
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid") {
    return NextResponse.json({ error: "Payment is not complete yet." }, { status: 402 });
  }

  const facing = Number(session.metadata?.facing);
  const year = Number(session.metadata?.year);
  const reading = paidReading({
    facing,
    year,
    dob: session.metadata?.dob,
    gender: session.metadata?.gender,
  });

  await unlockStoredReport({
    reportId: session.metadata?.reportId || "",
    facing,
    year,
    chart: reading.chart,
    gua: reading.gua,
    remedy: reading.remedy,
  });

  return NextResponse.json(reading);
}
