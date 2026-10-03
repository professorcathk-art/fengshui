import { readFileSync, writeFileSync } from "node:fs";
import { caseChart, caseStudies } from "../src/lib/cases";
import { narrateChart, type PlainReading } from "../src/lib/ai/narrate";

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (match && !process.env[match[1]]) process.env[match[1]] = match[2].trim();
}

type Pair = { en: PlainReading; "zh-Hant": PlainReading };

async function one(slug: string) {
  const item = caseStudies.find((entry) => entry.slug === slug);
  if (!item) throw new Error(slug);
  const chart = caseChart(item);
  const notes = `${item.formEn} ${item.formZh}`;
  const [en, zh] = await Promise.all([
    narrateChart({
      locale: "en",
      audience: "case",
      subject: item.name,
      place: item.place,
      year: item.year,
      notes,
      chart,
    }),
    narrateChart({
      locale: "zh-Hant",
      audience: "case",
      subject: item.nameZh,
      place: item.placeZh,
      year: item.year,
      notes,
      chart,
    }),
  ]);
  return { slug, en, "zh-Hant": zh } satisfies { slug: string } & Pair;
}

function save(readings: Record<string, Pair>) {
  const body =
    `import type { PlainReading } from "./ai/narrate";\n\n` +
    `export const caseReadings: Record<string, { en: PlainReading; "zh-Hant": PlainReading }> = ${JSON.stringify(readings, null, 2)};\n`;
  writeFileSync("src/lib/case-readings.ts", body);
}

async function main() {
  const readings: Record<string, Pair> = {};
  for (const item of caseStudies) {
    try {
      const entry = await one(item.slug);
      const { slug, ...pair } = entry;
      readings[slug] = pair;
      save(readings);
      console.log("wrote", slug);
    } catch (error) {
      console.error("failed", item.slug, error instanceof Error ? error.message : error);
    }
  }
  if (Object.keys(readings).length !== caseStudies.length) process.exit(1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
