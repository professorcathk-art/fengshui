import {
  STAR_NAMES,
  type FlyingStarChart,
  type PalaceChart,
} from "./flying-star";
import type { LifeGua } from "./kua";

const HOSTILE = new Set([2, 3, 5, 7]);

function remedyFor(star: number, sector: string) {
  if (star === 5) {
    return `Place a metal chiming clock in the ${sector} sector to exhaust the #5 Yellow Earth star. Keep this area quiet, bright, and free of clutter.`;
  }
  if (star === 2) {
    return `Place metal in the ${sector} — a brass singing bowl or six coins — to exhaust the #2 Black Earth star. Do not sleep with your head toward an untreated #2.`;
  }
  if (star === 3) {
    return `Soften the #3 Jade Wood star in the ${sector} with a steady lamp or a small red object. Remove sharp corners and argument-prone desks from this sector.`;
  }
  if (star === 7) {
    return `Exhaust the #7 Red Metal star in the ${sector} with still water in a dark bowl, refreshed often. Avoid this sector for a safe or a bedroom if it can be moved.`;
  }
  return null;
}

export function palaceRemedies(chart: FlyingStarChart) {
  return chart.palaces.flatMap((palace) => {
    const stars = [palace.mountain, palace.water].filter((star) => HOSTILE.has(star));
    const unique = stars.filter((star, index) => stars.indexOf(star) === index);
    return unique.map((star) => ({
      sector: palace.direction,
      star,
      starName: STAR_NAMES[star].name,
      text: remedyFor(star, palace.direction) ?? "",
    }));
  });
}

export function remedyText(chart: FlyingStarChart, gua: LifeGua | null) {
  const lines = [
    `Period ${chart.period} chart. Facing ${chart.facing.pinyin} ${chart.facing.character} (${chart.facing.ring}), sitting ${chart.sitting.pinyin} ${chart.sitting.character}.`,
    chart.kind === "double-facing"
      ? "Both timely stars gather at the facing. Favour an open, bright approach and a solid support behind the building."
      : chart.kind === "double-sitting"
        ? "Both timely stars gather at the sitting. People are supported here; the facing wants active water or a lively approach."
        : chart.kind === "wang-shan-wang-shui"
          ? "This is a Wang Shan Wang Shui chart: the timely mountain star sits behind and the timely water star faces out."
          : chart.kind === "shang-shan-xia-shui"
            ? "This is Shang Shan Xia Shui: the timely stars are reversed. Form outside the door matters more than objects inside."
            : "No single special structure dominates. Remedy the hostile stars palace by palace.",
  ];

  for (const item of palaceRemedies(chart)) {
    lines.push(`${item.sector}: ${item.text}`);
  }

  if (gua) {
    lines.push(
      `Life Gua ${gua.kua} ${gua.trigram}, ${gua.group} group (BaZi year ${gua.yearUsed}).`,
      `Best directions — Success: ${gua.directions.shengQi}. Health: ${gua.directions.tianYi}. Relationships: ${gua.directions.yanNian}. Stability: ${gua.directions.fuWei}.`,
      `Use the success direction for a desk facing or a main door approach. Avoid the total-loss direction (${gua.directions.jueMing}) for the bed head and the stove.`,
    );
  }

  return lines.join("\n\n");
}

export function palaceById(chart: FlyingStarChart, id: PalaceChart["id"]) {
  return chart.palaces.find((palace) => palace.id === id);
}
