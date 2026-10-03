import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripeSecret } from "@/lib/billing";
import { paidReading, unlockStoredReport } from "@/lib/reports/unlock";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = stripeSecret();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !webhookSecret) {
    return NextResponse.json({ error: "Stripe webhook is not configured." }, { status: 503 });
  }

  const stripe = new Stripe(secret);
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature." }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    if (session.payment_status === "paid" && session.metadata?.reportId) {
      const facing = Number(session.metadata.facing);
      const year = Number(session.metadata.year);
      const reading = paidReading({
        facing,
        year,
        dob: session.metadata.dob,
        gender: session.metadata.gender,
        locale: session.metadata.locale,
      });
      await unlockStoredReport({
        reportId: session.metadata.reportId,
        facing,
        year,
        chart: reading.chart,
        gua: reading.gua,
        remedy: reading.remedy,
      });
    }
  }

  return NextResponse.json({ received: true });
}
