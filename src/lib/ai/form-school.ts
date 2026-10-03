import { deepseekChat, parseJsonObject } from "./deepseek";

export type FormSchool = {
  identified_features: string[];
  negative_energies: string[];
  structural_score: number;
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
}): Promise<FormSchool> {
  const label = LABELS[input.auditType];
  const system = `Act as a Master of Traditional Chinese Feng Shui (Form School). Analyze this ${label}.

Identify the location of the main door, windows, bed/desk.
Look for external 'Sha Qi' (Poison Arrows) such as T-junctions, sharp corners, or highway curves.
Look for internal 'Sha Qi' such as exposed ceiling beams, doors facing doors, or center staircases.
Output strictly in JSON format containing: identified_features (list), negative_energies (list), structural_score (1-100).`;

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
  });
  const parsed = parseJsonObject(content) as Partial<FormSchool>;
  const score = Number(parsed.structural_score);

  return {
    identified_features: asList(parsed.identified_features),
    negative_energies: asList(parsed.negative_energies),
    structural_score: Number.isFinite(score)
      ? Math.max(1, Math.min(100, Math.round(score)))
      : 50,
  };
}
