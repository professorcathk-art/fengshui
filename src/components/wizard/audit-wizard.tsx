"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/locale-provider";
import type { Locale } from "@/lib/i18n/dictionary";

type AuditType = "floorplan" | "room" | "map";
type Gender = "female" | "male";

const COPY = {
  en: {
    types: [
      { id: "floorplan" as const, title: "Floor plan", copy: "A drawn plan, plus the street address of the building." },
      { id: "room" as const, title: "Room photo", copy: "The bed, desk, door, and ceiling in one frame." },
      { id: "map" as const, title: "Address", copy: "A satellite view of the building and the roads around it." },
    ],
    headings: ["What are we reading?", "The picture", "The compass", "The resident"],
    image: "Use a JPEG, PNG, or WebP image.",
    addressError: "Enter a street address or landmark.",
    planAddressError: "A floor plan also needs the building address.",
    imageError: "Upload an image to continue.",
    guaError: "Life Gua needs both a birth date and sex.",
    scanning: "Reading the form",
    scanningBody: "Form School is looking for the door, the bed, and any poison arrows.",
    addressLabel: "Address or landmark",
    planAddress: "Building address",
    choose: "Choose an image",
    formats: "JPEG, PNG, or WebP",
    facing: "Facing, looking out the front door",
    year: "Year built",
    compassHelp:
      "The top of the picture is the front of the building. North stays fixed. Turning the degree turns that front on the compass.",
    needle: "No picture yet. The needle is the front of the building.",
    resultLanguage: "Language of the audit result",
    dob: "Date of birth, optional",
    female: "Female",
    male: "Male",
    resident:
      "Life Gua uses the BaZi year, which turns on about 4 February. Sex is required because the male and female counts run in opposite directions. Skip both fields if you only want the building chart.",
    back: "Back",
    continue: "Continue",
    run: "Run the audit",
    step: "Step",
    of: "of",
  },
  "zh-Hant": {
    types: [
      { id: "floorplan" as const, title: "平面圖", copy: "一張畫好的平面，加上這棟建築的街道地址。" },
      { id: "room" as const, title: "房間照片", copy: "同一張照片裡要看得到床、桌、門和天花。" },
      { id: "map" as const, title: "地址", copy: "用衛星圖看建築和周圍的道路。" },
    ],
    headings: ["要讀什麼？", "圖像", "方位", "居住者"],
    image: "請用 JPEG、PNG 或 WebP。",
    addressError: "請填街道地址或地標。",
    planAddressError: "平面圖也要填這棟建築的地址。",
    imageError: "請先上傳圖片。",
    guaError: "命卦需要出生日期和性別。",
    scanning: "正在讀形",
    scanningBody: "巒頭正在找門、床，以及尖角煞。",
    addressLabel: "地址或地標",
    planAddress: "建築地址",
    choose: "選擇圖片",
    formats: "JPEG、PNG 或 WebP",
    facing: "向首，站在門外向外看",
    year: "建成年份",
    compassHelp: "圖片的上方是建築的正面。北方固定不動。轉動度數時，正面會在羅盤上跟著轉。",
    needle: "還沒有圖片。指針代表建築的正面。",
    resultLanguage: "審計結果的語言",
    dob: "出生日期，可留空",
    female: "女",
    male: "男",
    resident:
      "命卦用八字年，大約在立春、2 月 4 日交年。男女算法相反，所以需要性別。如果只要建築的盤，兩項都可以留空。",
    back: "返回",
    continue: "繼續",
    run: "開始審計",
    step: "第",
    of: "步，共",
  },
} as const;

async function shrinkImage(file: File) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1280 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser could not prepare the image.");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.72);
}

export function AuditWizard() {
  const router = useRouter();
  const { locale } = useLocale();
  const copy = COPY[locale];
  const [step, setStep] = useState(0);
  const [auditType, setAuditType] = useState<AuditType>("floorplan");
  const [address, setAddress] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [facing, setFacing] = useState(175);
  const [yearBuilt, setYearBuilt] = useState(2008);
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [resultLocale, setResultLocale] = useState<Locale>(locale);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  const heading = useMemo(() => copy.headings[step], [copy.headings, step]);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError(copy.image);
      return;
    }
    const dataUrl = await shrinkImage(file);
    setImageDataUrl(dataUrl);
    setFileName(file.name);
  }

  function next() {
    setError(null);
    if (step === 1 && (auditType === "map" || auditType === "floorplan") && address.trim().length < 4) {
      setError(auditType === "floorplan" ? copy.planAddressError : copy.addressError);
      return;
    }
    if (step === 1 && auditType !== "map" && !imageDataUrl) {
      setError(copy.imageError);
      return;
    }
    if (step === 3 && dob && !gender) {
      setError(copy.guaError);
      return;
    }
    setStep((value) => Math.min(3, value + 1));
  }

  async function submit() {
    setError(null);
    if (dob && !gender) {
      setError(copy.guaError);
      return;
    }
    setScanning(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auditType,
          facingDegree: facing,
          yearBuilt,
          dob: dob || undefined,
          gender: gender || undefined,
          address: auditType === "room" ? undefined : address,
          imageDataUrl: auditType === "map" ? undefined : imageDataUrl,
          resultLocale,
        }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error || "The audit failed.");
      sessionStorage.setItem("geomancy-report", JSON.stringify({ ...payload, resultLocale }));
      router.push("/report/preview");
    } catch (reason) {
      setScanning(false);
      setError(reason instanceof Error ? reason.message : "The audit failed.");
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card/60 p-6 sm:p-8">
      {scanning ? (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/85 backdrop-blur">
          <div className="scan-frame relative h-40 w-40 rounded-full border border-gold/40">
            <div className="scan-line absolute inset-x-4 h-px bg-gold" />
          </div>
          <p className="mt-6 font-display text-3xl">{copy.scanning}</p>
          <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">{copy.scanningBody}</p>
        </div>
      ) : null}

      <p className="text-xs tracking-[0.18em] text-gold uppercase">
        {locale === "zh-Hant" ? `${copy.step} ${step + 1} ${copy.of} 4` : `${copy.step} ${step + 1} ${copy.of} 4`}
      </p>
      <h1 className="mt-2 font-display text-4xl">{heading}</h1>

      {step === 0 ? (
        <div className="mt-6 grid gap-3">
          {copy.types.map((type) => (
            <button
              key={type.id}
              className={`rounded-xl border px-4 py-4 text-left ${
                auditType === type.id ? "border-gold bg-gold/10" : "border-border"
              }`}
              onClick={() => setAuditType(type.id)}
              type="button"
            >
              <span className="block text-base">{type.title}</span>
              <span className="mt-1 block text-sm text-muted-foreground">{type.copy}</span>
            </button>
          ))}
          <div className="pt-2">
            <p className="text-sm text-muted-foreground">{copy.resultLanguage}</p>
            <div className="mt-2 flex gap-2">
              <Button type="button" variant={resultLocale === "en" ? "default" : "outline"} onClick={() => setResultLocale("en")}>
                English
              </Button>
              <Button
                type="button"
                variant={resultLocale === "zh-Hant" ? "default" : "outline"}
                onClick={() => setResultLocale("zh-Hant")}
              >
                繁體中文
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {step === 1 && (auditType === "map" || auditType === "floorplan") ? (
        <label className="mt-6 block space-y-2 text-sm">
          <span className="text-muted-foreground">
            {auditType === "floorplan" ? copy.planAddress : copy.addressLabel}
          </span>
          <input
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="1600 Amphitheatre Parkway, Mountain View"
            className="h-11 w-full rounded-lg border border-input bg-background px-3 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </label>
      ) : null}

      {step === 1 && auditType !== "map" ? (
        <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <span>{fileName ?? copy.choose}</span>
          <span className="mt-2 text-sm text-muted-foreground">{copy.formats}</span>
          <input
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            type="file"
            onChange={(event) => void onFile(event.target.files?.[0])}
          />
        </label>
      ) : null}

      {step === 2 ? (
        <div className="mt-6 space-y-6">
          <div className="relative mx-auto h-72 w-72">
            <div className="absolute inset-0 rounded-full border border-gold/40" />
            <span className="absolute top-2 left-1/2 -translate-x-1/2 text-xs text-gold">N</span>
            <span className="absolute top-1/2 right-2 -translate-y-1/2 text-xs text-muted-foreground">E</span>
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">S</span>
            <span className="absolute top-1/2 left-2 -translate-y-1/2 text-xs text-muted-foreground">W</span>
            {imageDataUrl ? (
              // The uploaded plan is the user's own file, shown only on this step.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt=""
                src={imageDataUrl}
                style={{ transform: `rotate(${facing}deg)` }}
                className="absolute inset-10 h-[calc(100%-5rem)] w-[calc(100%-5rem)] object-contain transition-transform duration-300"
              />
            ) : (
              <div
                className="absolute inset-10 transition-transform duration-300"
                style={{ transform: `rotate(${facing}deg)` }}
              >
                <div className="absolute top-0 left-1/2 h-1/2 w-px -translate-x-1/2 bg-gold" />
                <div className="absolute top-0 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-gold" />
              </div>
            )}
          </div>
          <label className="block space-y-3 text-sm">
            <span className="flex justify-between text-muted-foreground">
              {copy.facing}
              <span className="text-foreground">{facing}°</span>
            </span>
            <input
              type="range"
              min={0}
              max={359}
              value={facing}
              onChange={(event) => setFacing(Number(event.target.value))}
              className="w-full accent-[oklch(0.82_0.09_88)]"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              ["N", 0],
              ["E", 90],
              ["S", 180],
              ["W", 270],
            ].map(([label, degree]) => (
              <Button
                key={label}
                type="button"
                variant="outline"
                onClick={() => setFacing(Number(degree))}
              >
                {label} {degree}°
              </Button>
            ))}
          </div>
          <label className="block space-y-2 text-sm">
            <span className="text-muted-foreground">{copy.year}</span>
            <input
              type="number"
              min={1600}
              max={2100}
              value={yearBuilt}
              onChange={(event) => setYearBuilt(Number(event.target.value))}
              className="h-11 w-full rounded-lg border border-input bg-background px-3 outline-none"
            />
          </label>
          <p className="text-sm text-muted-foreground">{copy.compassHelp}</p>
          {!imageDataUrl ? <p className="text-sm text-muted-foreground">{copy.needle}</p> : null}
        </div>
      ) : null}

      {step === 3 ? (
        <div className="mt-6 space-y-4">
          <label className="block space-y-2 text-sm">
            <span className="text-muted-foreground">{copy.dob}</span>
            <input
              type="date"
              value={dob}
              onChange={(event) => setDob(event.target.value)}
              className="h-11 w-full rounded-lg border border-input bg-background px-3 outline-none"
            />
          </label>
          <div className="flex gap-2">
            {(["female", "male"] as const).map((value) => (
              <Button
                key={value}
                type="button"
                variant={gender === value ? "default" : "outline"}
                onClick={() => setGender(value)}
              >
                {value === "female" ? copy.female : copy.male}
              </Button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">{copy.resident}</p>
        </div>
      ) : null}

      {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}

      <div className="mt-8 flex justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          disabled={step === 0 || scanning}
          onClick={() => setStep((value) => Math.max(0, value - 1))}
        >
          {copy.back}
        </Button>
        {step < 3 ? (
          <Button type="button" onClick={next}>
            {copy.continue}
          </Button>
        ) : (
          <Button type="button" onClick={() => void submit()}>
            {copy.run}
          </Button>
        )}
      </div>
    </div>
  );
}
