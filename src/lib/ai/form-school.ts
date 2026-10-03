import { deepseekChat, parseJsonObject } from "./deepseek";

export type FormSchool = {
  identified_features: string[];
  negative_energies: string[];
  structural_score: number;
  reading?: string;
};

const LABELS = {
  floorplan: "Floor Plan",
  room: "Room Photo",
  map: "Satellite Map",
} as const;

function asList(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean).slice(0, 8);
}

export async function analyzeFormSchool(input: {
  auditType: keyof typeof LABELS;
  imageDataUrl?: string;
  address?: string;
  facingDegree: number;
  yearBuilt: number;
  locale?: "en" | "zh-Hant";
}): Promise<FormSchool> {
  const label = LABELS[input.auditType];
  const language =
    input.locale === "zh-Hant"
      ? `用通順的繁體中文，像在跟屋主說話，不要文言，不要簡體。
reading 寫三段，每段三到五句，像在跟屋主說話。解釋這棟建築的形狀會讓人有什麼感覺、哪裡不舒服、第一步可以做什麼。
identified_features 和 negative_energies 每一條都是完整的一句話。
不要寫「煞」「氣場」「巒頭」「尖角煞」「路煞」。改成具體的話，例如「樓角正對門口，人一進門會覺得被什麼東西指著」。`
      : `Write in native English for a homeowner who has never studied feng shui.
reading is three paragraphs, three to five sentences each: what the shape does to the people inside, what feels uncomfortable, and the first practical change.
Every item in identified_features and negative_energies is a full sentence. Do not say "sha", "poison arrow", "qi", or "Form School". Say what a person would notice, for example "a corner aimed at the front door, so people walk in feeling pointed at."`;
  const system = `You read buildings in the Form School tradition: shape, roads, doors, beams, and how a room is laid out.
Identify the main door, windows, and bed or desk if you can see them.
Look for roads aimed at the door, sharp corners pointing at a wall, highways, beams over a bed, doors facing other doors, and a stair in the middle.
If the picture is ambiguous, say so. Do not invent a door you cannot see.
Output JSON only, with English keys: identified_features (list), negative_energies (list), structural_score (1-100), reading (string).
${language}`;

  const userText = [
    `Audit type: ${label}.`,
    input.address ? `Address: ${input.address}.` : "",
    `Compass facing supplied by the resident: ${input.facingDegree} degrees.`,
    `Year built: ${input.yearBuilt}.`,
    "If the image is ambiguous, say so inside the lists. Do not invent a precise door you cannot see.",
  ]
    .filter(Boolean)
    .join(" ");

  const content = await deepseekChat({
    system,
    userText,
    imageDataUrl: input.imageDataUrl,
    maxTokens: 1800,
  });
  const parsed = parseJsonObject(content) as Partial<FormSchool>;
  const score = Number(parsed.structural_score);

  const reading = String(parsed.reading ?? "").trim();

  return {
    identified_features: asList(parsed.identified_features),
    negative_energies: asList(parsed.negative_energies),
    structural_score: Number.isFinite(score)
      ? Math.max(1, Math.min(100, Math.round(score)))
      : 50,
    reading: reading || undefined,
  };
}
