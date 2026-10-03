import { NextResponse } from "next/server";
import Stripe from "stripe";
import { REPORT_PRICE_CENTS, stripeSecret } from "@/lib/billing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = stripeSecret();
  if (!secret) {
    return NextResponse.json(
      { error: "Stripe is not configured yet. Add STRIPE_SECRET_KEY on the server." },
      { status: 503 },
    );
  }

  const body = (await request.json()) as {
    facingDegree?: number;
    yearBuilt?: number;
    dob?: string;
    gender?: string;
    auditType?: string;
    reportId?: string;
  };

  const facing = Number(body.facingDegree);
  const year = Number(body.yearBuilt);
  if (!Number.isFinite(facing) || !Number.isInteger(year)) {
    return NextResponse.json({ error: "This report is missing its compass data." }, { status: 400 });
  }

  const origin = new URL(request.url).origin;
  const stripe = new Stripe(secret);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: REPORT_PRICE_CENTS,
          product_data: {
            name: "Period Flying Star & BaZi report",
            description: "Xuan Kong chart, sector remedies, and personal lucky directions.",
          },
        },
      },
    ],
    success_url: `${origin}/report/preview?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/report/preview?checkout=cancel`,
    metadata: {
      facing: String(facing),
      year: String(year),
      dob: body.dob || "",
      gender: body.gender || "",
      auditType: body.auditType || "",
      reportId: body.reportId || "",
    },
  });

  return NextResponse.json({ url: session.url });
}
