"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type AuditType = "floorplan" | "room" | "map";
type Gender = "female" | "male";

const TYPES: { id: AuditType; title: string; copy: string }[] = [
  {
    id: "floorplan",
    title: "Floor plan",
    copy: "A drawn plan with the front door visible.",
  },
  {
    id: "room",
    title: "Room photo",
    copy: "The bed, desk, door, and ceiling in one frame.",
  },
  {
    id: "map",
    title: "Address",
    copy: "A satellite view of the building and the roads around it.",
  },
];

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
  const [step, setStep] = useState(0);
  const [auditType, setAuditType] = useState<AuditType>("floorplan");
  const [address, setAddress] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [facing, setFacing] = useState(175);
  const [yearBuilt, setYearBuilt] = useState(2008);
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  const heading = useMemo(
    () => ["What are we reading?", "The picture", "The compass", "The resident"][step],
    [step],
  );

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Use a JPEG, PNG, or WebP image.");
      return;
    }
    const dataUrl = await shrinkImage(file);
    setImageDataUrl(dataUrl);
    setFileName(file.name);
  }

  function next() {
    setError(null);
    if (step === 1 && auditType === "map" && address.trim().length < 4) {
      setError("Enter a street address or landmark.");
      return;
    }
    if (step === 1 && auditType !== "map" && !imageDataUrl) {
      setError("Upload an image to continue.");
      return;
    }
    if (step === 3 && dob && !gender) {
      setError("Life Gua needs both a birth date and sex.");
      return;
    }
    setStep((value) => Math.min(3, value + 1));
  }

  async function submit() {
    setError(null);
    if (dob && !gender) {
      setError("Life Gua needs both a birth date and sex.");
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
          address: auditType === "map" ? address : undefined,
          imageDataUrl: auditType === "map" ? undefined : imageDataUrl,
        }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error || "The audit failed.");
      sessionStorage.setItem("geomancy-report", JSON.stringify(payload));
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
          <p className="mt-6 font-display text-3xl">Reading the form</p>
          <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
            Form School is looking for the door, the bed, and any poison arrows.
          </p>
        </div>
      ) : null}

      <p className="text-xs tracking-[0.18em] text-gold uppercase">Step {step + 1} of 4</p>
      <h1 className="mt-2 font-display text-4xl">{heading}</h1>

      {step === 0 ? (
        <div className="mt-6 grid gap-3">
          {TYPES.map((type) => (
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
        </div>
      ) : null}

      {step === 1 && auditType === "map" ? (
        <label className="mt-6 block space-y-2 text-sm">
          <span className="text-muted-foreground">Address or landmark</span>
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
          <span>{fileName ?? "Choose an image"}</span>
          <span className="mt-2 text-sm text-muted-foreground">JPEG, PNG, or WebP</span>
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
          <label className="block space-y-3 text-sm">
            <span className="flex justify-between text-muted-foreground">
              Facing, looking out the front door
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
            <span className="text-muted-foreground">Year built</span>
            <input
              type="number"
              min={1600}
              max={2100}
              value={yearBuilt}
              onChange={(event) => setYearBuilt(Number(event.target.value))}
              className="h-11 w-full rounded-lg border border-input bg-background px-3 outline-none"
            />
          </label>
          <p className="text-sm text-muted-foreground">
            Stand outside the front door and read the heading while looking away from the building.
            The year sets the Period, the twenty-year cycle of the Flying Star chart.
          </p>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="mt-6 space-y-4">
          <label className="block space-y-2 text-sm">
            <span className="text-muted-foreground">Date of birth, optional</span>
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
                {value === "female" ? "Female" : "Male"}
              </Button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Life Gua uses the BaZi year, which turns on about 4 February. Sex is required because
            the male and female counts run in opposite directions. Skip both fields if you only want
            the building chart.
          </p>
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
          Back
        </Button>
        {step < 3 ? (
          <Button type="button" onClick={next}>
            Continue
          </Button>
        ) : (
          <Button type="button" onClick={() => void submit()}>
            Run the audit
          </Button>
        )}
      </div>
    </div>
  );
}
