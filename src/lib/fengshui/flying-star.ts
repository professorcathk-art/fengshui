export type PalaceId = "N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW" | "C";

export type ChartKind =
  | "wang-shan-wang-shui"
  | "shang-shan-xia-shui"
  | "double-facing"
  | "double-sitting"
  | "mixed";

export type PalaceChart = {
  id: PalaceId;
  direction: string;
  mountain: number;
  period: number;
  water: number;
};

export type MountainReading = {
  character: string;
  pinyin: string;
  ring: "Earth" | "Heaven" | "Man";
  yang: boolean;
};

export type FlyingStarChart = {
  period: number;
  facingDegree: number;
  facing: MountainReading & { palace: PalaceId };
  sitting: MountainReading & { palace: PalaceId };
  mountainFliesForward: boolean;
  waterFliesForward: boolean;
  kind: ChartKind;
  palaces: PalaceChart[];
};

const FLIGHT: PalaceId[] = ["C", "NW", "W", "NE", "S", "N", "SW", "E", "SE"];

const SECTORS: { id: Exclude<PalaceId, "C">; palaceNumber: number; start: number }[] = [
  { id: "N", palaceNumber: 1, start: 337.5 },
  { id: "NE", palaceNumber: 8, start: 22.5 },
  { id: "E", palaceNumber: 3, start: 67.5 },
  { id: "SE", palaceNumber: 4, start: 112.5 },
  { id: "S", palaceNumber: 9, start: 157.5 },
  { id: "SW", palaceNumber: 2, start: 202.5 },
  { id: "W", palaceNumber: 7, start: 247.5 },
  { id: "NW", palaceNumber: 6, start: 292.5 },
];

const MOUNTAINS: Record<
  Exclude<PalaceId, "C">,
  { character: string; pinyin: string }[]
> = {
  N: [
    { character: "壬", pinyin: "Ren" },
    { character: "子", pinyin: "Zi" },
    { character: "癸", pinyin: "Gui" },
  ],
  NE: [
    { character: "丑", pinyin: "Chou" },
    { character: "艮", pinyin: "Gen" },
    { character: "寅", pinyin: "Yin" },
  ],
  E: [
    { character: "甲", pinyin: "Jia" },
    { character: "卯", pinyin: "Mao" },
    { character: "乙", pinyin: "Yi" },
  ],
  SE: [
    { character: "辰", pinyin: "Chen" },
    { character: "巽", pinyin: "Xun" },
    { character: "巳", pinyin: "Si" },
  ],
  S: [
    { character: "丙", pinyin: "Bing" },
    { character: "午", pinyin: "Wu" },
    { character: "丁", pinyin: "Ding" },
  ],
  SW: [
    { character: "未", pinyin: "Wei" },
    { character: "坤", pinyin: "Kun" },
    { character: "申", pinyin: "Shen" },
  ],
  W: [
    { character: "庚", pinyin: "Geng" },
    { character: "酉", pinyin: "You" },
    { character: "辛", pinyin: "Xin" },
  ],
  NW: [
    { character: "戌", pinyin: "Xu" },
    { character: "乾", pinyin: "Qian" },
    { character: "亥", pinyin: "Hai" },
  ],
};

const DIRECTION_LABEL: Record<PalaceId, string> = {
  N: "North",
  NE: "Northeast",
  E: "East",
  SE: "Southeast",
  S: "South",
  SW: "Southwest",
  W: "West",
  NW: "Northwest",
  C: "Center",
};

const STAR_PALACE: Record<number, number> = {
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
};

const RINGS = ["Earth", "Heaven", "Man"] as const;

function normalize(degree: number) {
  const wrapped = degree % 360;
  return wrapped < 0 ? wrapped + 360 : wrapped;
}

function sectorOf(degree: number) {
  const deg = normalize(degree);
  const sector = SECTORS.find((item) => {
    const offset = (deg - item.start + 360) % 360;
    return offset < 45;
  });
  if (!sector) throw new Error("Facing degree is outside 0–359.");
  const offset = (deg - sector.start + 360) % 360;
  const ring = Math.min(2, Math.floor(offset / 15)) as 0 | 1 | 2;
  return { ...sector, ring, offset };
}

function isYang(palaceNumber: number, ring: 0 | 1 | 2) {
  const cardinal = palaceNumber === 1 || palaceNumber === 3 || palaceNumber === 7 || palaceNumber === 9;
  if (ring === 0) return cardinal;
  return !cardinal;
}

function fliesForward(star: number, period: number, ring: 0 | 1 | 2) {
  const resolved = star === 5 ? period : star;
  if (resolved === 5) return true;
  return isYang(STAR_PALACE[resolved], ring);
}

function fly(center: number, forward: boolean): Record<PalaceId, number> {
  const rest = FLIGHT.slice(1);
  const order = ["C" as PalaceId, ...(forward ? rest : [...rest].reverse())];
  const chart = {} as Record<PalaceId, number>;
  order.forEach((palace, index) => {
    chart[palace] = ((center - 1 + index) % 9) + 1;
  });
  return chart;
}

function mountainAt(degree: number): MountainReading & { palace: PalaceId; ringIndex: 0 | 1 | 2 } {
  const sector = sectorOf(degree);
  const mountain = MOUNTAINS[sector.id][sector.ring];
  return {
    palace: sector.id,
    character: mountain.character,
    pinyin: mountain.pinyin,
    ring: RINGS[sector.ring],
    yang: isYang(sector.palaceNumber, sector.ring),
    ringIndex: sector.ring,
  };
}

const GRID: PalaceId[] = ["SE", "S", "SW", "E", "C", "W", "NE", "N", "NW"];

export function flyingStar(input: { period: number; facingDegree: number }): FlyingStarChart {
  const period = input.period;
  if (period < 1 || period > 9) throw new Error("Period must be 1–9.");
  const facingDegree = normalize(input.facingDegree);
  const facing = mountainAt(facingDegree);
  const sitting = mountainAt(facingDegree + 180);

  const periodStars = fly(period, true);
  const waterForward = fliesForward(periodStars[facing.palace], period, facing.ringIndex);
  const mountainForward = fliesForward(periodStars[sitting.palace], period, sitting.ringIndex);
  const water = fly(periodStars[facing.palace], waterForward);
  const mountain = fly(periodStars[sitting.palace], mountainForward);

  const facingPalace = facing.palace;
  const sittingPalace = sitting.palace;
  let kind: ChartKind = "mixed";
  if (mountain[facingPalace] === period && water[facingPalace] === period) {
    kind = "double-facing";
  } else if (mountain[sittingPalace] === period && water[sittingPalace] === period) {
    kind = "double-sitting";
  } else if (mountain[sittingPalace] === period && water[facingPalace] === period) {
    kind = "wang-shan-wang-shui";
  } else if (mountain[facingPalace] === period && water[sittingPalace] === period) {
    kind = "shang-shan-xia-shui";
  }

  return {
    period,
    facingDegree,
    facing,
    sitting,
    mountainFliesForward: mountainForward,
    waterFliesForward: waterForward,
    kind,
    palaces: GRID.map((id) => ({
      id,
      direction: DIRECTION_LABEL[id],
      mountain: mountain[id],
      period: periodStars[id],
      water: water[id],
    })),
  };
}

export const STAR_NAMES: Record<number, { name: string; element: string }> = {
  1: { name: "White Water", element: "Water" },
  2: { name: "Black Earth", element: "Earth" },
  3: { name: "Jade Wood", element: "Wood" },
  4: { name: "Green Wood", element: "Wood" },
  5: { name: "Yellow Earth", element: "Earth" },
  6: { name: "White Metal", element: "Metal" },
  7: { name: "Red Metal", element: "Metal" },
  8: { name: "White Earth", element: "Earth" },
  9: { name: "Purple Fire", element: "Fire" },
};

export const CHART_KIND_LABEL: Record<ChartKind, string> = {
  "wang-shan-wang-shui": "Wang Shan Wang Shui — mountain and water both timely",
  "shang-shan-xia-shui": "Shang Shan Xia Shui — the timely stars are reversed",
  "double-facing": "Double Facing — both timely stars gather at the facing",
  "double-sitting": "Double Sitting — both timely stars gather at the sitting",
  mixed: "Mixed chart — read each palace on its own stars",
};
