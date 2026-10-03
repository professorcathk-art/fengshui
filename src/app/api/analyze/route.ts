import { NextResponse } from "next/server";
import { analyzeFormSchool, type FormSchool } from "@/lib/ai/form-school";
import { lifeGua, type Gender, type LifeGua } from "@/lib/fengshui/kua";
import { periodFromYear } from "@/lib/fengshui/period";
import { satelliteForAddress } from "@/lib/maps/satellite";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const hits = new Map<string, { count: number; reset: number }>();

type Body = {
  auditType?: "floorplan" | "room" | "map";
  facingDegree?: number;
  yearBuilt?: number;
  dob?: string;
  gender?: Gender;
  address?: string;
  imageDataUrl?: string;
  resultLocale?: "en" | "zh-Hant";
};

function limited(ip: string) {
  const now = Date.now();
  const current = hits.get(ip);
  if (!current || current.reset < now) {
    hits.set(ip, { count: 1, reset: now + 60 * 60 * 1000 });
    return false;
  }
  current.count += 1;
  return current.count > 12;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limited(ip)) {
    return NextResponse.json(
      { error: "Too many audits from this network. Try again in an hour." },
      { status: 429 },
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "The upload could not be read." }, { status: 400 });
  }

  const auditType = body.auditType;
  const facingDegree = Number(body.facingDegree);
  const yearBuilt = Number(body.yearBuilt);

  if (auditType !== "floorplan" && auditType !== "room" && auditType !== "map") {
    return NextResponse.json({ error: "Choose a floor plan, room photo, or address." }, { status: 400 });
  }
  if (!Number.isFinite(facingDegree) || facingDegree < 0 || facingDegree >= 360) {
    return NextResponse.json({ error: "Facing must be a degree from 0 up to 359." }, { status: 400 });
  }
  if (!Number.isInteger(yearBuilt) || yearBuilt < 1600 || yearBuilt > 2100) {
    return NextResponse.json({ error: "Year built must be between 1600 and 2100." }, { status: 400 });
  }

  let gua: LifeGua | null = null;
  if (body.dob && body.gender) {
    try {
      gua = lifeGua(body.dob, body.gender);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Birth date could not be read.";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  }

  try {
    let imageDataUrl = body.imageDataUrl;
    let addressLabel = body.address?.trim();

    const resultLocale = body.resultLocale === "zh-Hant" ? "zh-Hant" : "en";

    if (auditType === "floorplan" && (!addressLabel || addressLabel.length < 4)) {
      return NextResponse.json(
        { error: "A floor plan also needs the street address of the building." },
        { status: 400 },
      );
    }

    if (auditType === "map") {
      if (!addressLabel) {
        return NextResponse.json({ error: "Enter an address for the satellite audit." }, { status: 400 });
      }
      const satellite = await satelliteForAddress(addressLabel);
      imageDataUrl = satellite.dataUrl;
      addressLabel = satellite.label;
    } else if (!imageDataUrl?.startsWith("data:image/")) {
      return NextResponse.json({ error: "Upload a JPEG, PNG, or WebP image." }, { status: 400 });
    }

    if (imageDataUrl && imageDataUrl.length > 2_500_000) {
      return NextResponse.json({ error: "That image is still too large. Use a photo under about 2 MB." }, { status: 400 });
    }

    const formSchool = await analyzeFormSchool({
      auditType,
      imageDataUrl,
      address: addressLabel,
      facingDegree,
      yearBuilt,
      locale: resultLocale,
    });

    const saved = await persistAudit({
      auditType,
      facingDegree,
      yearBuilt,
      address: addressLabel,
      dob: body.dob,
      formSchool,
    });

    return NextResponse.json({
      formSchool,
      period: periodFromYear(yearBuilt),
      facingDegree,
      yearBuilt,
      auditType,
      address: addressLabel ?? null,
      dob: body.dob ?? null,
      gender: body.gender ?? null,
      guaPreview: gua ? { kua: gua.kua, group: gua.group, trigram: gua.trigram } : null,
      auditId: saved.auditId,
      reportId: saved.reportId,
      saveError: saved.saveError,
      resultLocale,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The audit failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

async function persistAudit(input: {
  auditType: "floorplan" | "room" | "map";
  facingDegree: number;
  yearBuilt: number;
  address?: string;
  dob?: string;
  formSchool: FormSchool;
}) {
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) return { auditId: null, reportId: null, saveError: null };

    if (input.dob) {
      await supabase.from("users").update({ dob: input.dob }).eq("id", user.id);
    }

    const { data: audit, error: auditError } = await supabase
      .from("audits")
      .insert({
        user_id: user.id,
        audit_type: input.auditType,
        image_url: input.address ?? null,
        facing_degree: input.facingDegree,
        year_built: input.yearBuilt,
        status: "free",
      })
      .select("id")
      .single();

    if (auditError || !audit) {
      return { auditId: null, reportId: null, saveError: auditError?.message ?? "Audit was not saved." };
    }

    const { data: report, error: reportError } = await supabase
      .from("reports")
      .insert({
        audit_id: audit.id,
        form_school_json: input.formSchool,
        compass_school_json: null,
        remedy_text: null,
        is_unlocked: false,
      })
      .select("id")
      .single();

    return {
      auditId: audit.id,
      reportId: report?.id ?? null,
      saveError: reportError?.message ?? null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Audit was not saved.";
    return { auditId: null, reportId: null, saveError: message };
  }
}
