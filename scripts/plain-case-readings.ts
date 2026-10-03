import { readFileSync, writeFileSync } from "node:fs";
import { deepseekChat, parseJsonObject } from "../src/lib/ai/deepseek";
import type { PlainReading } from "../src/lib/ai/narrate";

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (match && !process.env[match[1]]) process.env[match[1]] = match[2].trim();
}

type Pair = { en: PlainReading; "zh-Hant": PlainReading };

function clean(value: unknown) {
  return String(value ?? "").trim();
}

async function rewrite(locale: "en" | "zh-Hant", draft: PlainReading): Promise<PlainReading> {
  const system =
    locale === "zh-Hant"
      ? `你在改一篇已經寫好的風水解讀。保留每一側建築的結論，不要把好的一側改成壞的。
用香港、台灣的書面語，繁體中文，像在跟行政經理解釋。
刪掉所有星的數字、八運、五黃、向星、山星、煞、巒頭、當令。
改成「南邊的人容易吵架」「北邊比較留得住團隊」這種句子。
不要加營收或股價。四個欄位各兩段。只輸出 JSON：{"building","people","outlook","whatToDo"}。`
      : `You are editing a feng shui essay that is too technical. Keep the same conclusion about each side of the building. Do not flip a helpful side into a harmful one.
Write native English, the way you would explain the building to a colleague. Delete every star number and the words palace, trigram, sha, and qi.
Say "the south side is where plans stall" rather than "star 5".
Do not add revenue or a share price. Each of the four fields stays two paragraphs. JSON only: {"building","people","outlook","whatToDo"}.`;

  const content = await deepseekChat({
    system,
    userText: JSON.stringify(draft),
    maxTokens: 2200,
  });
  const parsed = parseJsonObject(content) as Partial<PlainReading>;
  const reading = {
    building: clean(parsed.building),
    people: clean(parsed.people),
    outlook: clean(parsed.outlook),
    whatToDo: clean(parsed.whatToDo),
  };
  if (!reading.building || !reading.people || !reading.outlook || !reading.whatToDo) {
    throw new Error("incomplete");
  }
  return reading;
}

async function main() {
  const source = readFileSync("src/lib/case-readings.ts", "utf8");
  const jsonStart = source.indexOf("= {");
  const current = JSON.parse(source.slice(jsonStart + 2).replace(/;\s*$/, "")) as Record<string, Pair>;
  const next: Record<string, Pair> = { ...current };
  for (const [slug, pair] of Object.entries(current)) {
    const [en, zh] = await Promise.all([
      rewrite("en", pair.en),
      rewrite("zh-Hant", pair["zh-Hant"]),
    ]);
    next[slug] = { en, "zh-Hant": zh };
    const body =
      `import type { PlainReading } from "./ai/narrate";\n\n` +
      `export const caseReadings: Record<string, { en: PlainReading; "zh-Hant": PlainReading }> = ${JSON.stringify(next, null, 2)};\n`;
    writeFileSync("src/lib/case-readings.ts", body);
    console.log("rewrote", slug);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
