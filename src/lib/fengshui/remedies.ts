import type { Locale } from "@/lib/i18n/dictionary";
import {
  STAR_NAMES,
  type FlyingStarChart,
  type PalaceChart,
} from "./flying-star";
import type { LifeGua } from "./kua";

const HOSTILE = new Set([2, 3, 5, 7]);

const SECTOR_ZH: Record<string, string> = {
  North: "北方",
  Northeast: "東北方",
  East: "東方",
  Southeast: "東南方",
  South: "南方",
  Southwest: "西南方",
  West: "西方",
  Northwest: "西北方",
  Center: "中宮",
};

const TRIGRAM_ZH: Record<string, string> = {
  Kan: "坎",
  Kun: "坤",
  Zhen: "震",
  Xun: "巽",
  Qian: "乾",
  Dui: "兌",
  Gen: "艮",
  Li: "離",
};

function sectorName(sector: string, locale: Locale) {
  return locale === "zh-Hant" ? (SECTOR_ZH[sector] ?? sector) : sector;
}

function remedyFor(star: number, sector: string, locale: Locale) {
  const place = sectorName(sector, locale);
  if (locale === "zh-Hant") {
    if (star === 5) return `在${place}放金屬鳴鐘，以洩五黃土星。此處宜靜、宜明，不要堆雜物。`;
    if (star === 2) return `在${place}放金屬，例如銅磬或六枚銅錢，以洩二黑土星。二黑未化時，不要頭朝這個方向睡覺。`;
    if (star === 3) return `用穩定的燈或一小件紅色物件化${place}的三碧木星。移走尖角，也移走容易爭執的書桌。`;
    if (star === 7) return `用深色碗盛靜水，並經常更換，以洩${place}的七赤金星。保險箱和臥室盡量不要放在這裡。`;
    return null;
  }
  if (star === 5) {
    return `Place a metal chiming clock in the ${place} sector to exhaust the #5 Yellow Earth star. Keep this area quiet, bright, and free of clutter.`;
  }
  if (star === 2) {
    return `Place metal in the ${place} — a brass singing bowl or six coins — to exhaust the #2 Black Earth star. Do not sleep with your head toward an untreated #2.`;
  }
  if (star === 3) {
    return `Soften the #3 Jade Wood star in the ${place} with a steady lamp or a small red object. Remove sharp corners and argument-prone desks from this sector.`;
  }
  if (star === 7) {
    return `Exhaust the #7 Red Metal star in the ${place} with still water in a dark bowl, refreshed often. Avoid this sector for a safe or a bedroom if it can be moved.`;
  }
  return null;
}

export function palaceRemedies(chart: FlyingStarChart, locale: Locale = "en") {
  return chart.palaces.flatMap((palace) => {
    const stars = [palace.mountain, palace.water].filter((star) => HOSTILE.has(star));
    const unique = stars.filter((star, index) => stars.indexOf(star) === index);
    return unique.map((star) => ({
      sector: palace.direction,
      star,
      starName: STAR_NAMES[star].name,
      text: remedyFor(star, palace.direction, locale) ?? "",
    }));
  });
}

export function remedyText(chart: FlyingStarChart, gua: LifeGua | null, locale: Locale = "en") {
  const lines =
    locale === "zh-Hant"
      ? [
          `${chart.period} 運飛星盤。向首 ${chart.facing.pinyin} ${chart.facing.character}（${chart.facing.ring === "Earth" ? "地盤" : chart.facing.ring === "Heaven" ? "天盤" : "人盤"}），坐山 ${chart.sitting.pinyin} ${chart.sitting.character}。`,
          chart.kind === "double-facing"
            ? "兩顆當令星都到向。門前宜開揚明亮，屋後要有實山托住。"
            : chart.kind === "double-sitting"
              ? "兩顆當令星都到坐。人丁有依，向首則需要動水或活躍的來路。"
              : chart.kind === "wang-shan-wang-shui"
                ? "這是旺山旺水：當令山星在後，當令向星在前。"
                : chart.kind === "shang-shan-xia-shui"
                  ? "這是上山下水：當令之星顛倒。門外的形，比屋內的物件更要緊。"
                  : "沒有單一的特殊格局。凶星要逐宮化解。",
        ]
      : [
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

  for (const item of palaceRemedies(chart, locale)) {
    lines.push(`${sectorName(item.sector, locale)}: ${item.text}`);
  }

  if (gua) {
    if (locale === "zh-Hant") {
      const group = gua.group === "East" ? "東四命" : "西四命";
      lines.push(
        `命卦 ${gua.kua} ${TRIGRAM_ZH[gua.trigram] ?? gua.trigram}，${group}（八字年 ${gua.yearUsed}）。`,
        `吉方 — 生氣：${sectorName(gua.directions.shengQi, locale)}。天醫：${sectorName(gua.directions.tianYi, locale)}。延年：${sectorName(gua.directions.yanNian, locale)}。伏位：${sectorName(gua.directions.fuWei, locale)}。`,
        `書桌朝向或大門來路用生氣方。床頭和爐灶避開絕命方（${sectorName(gua.directions.jueMing, locale)}）。`,
      );
    } else {
      lines.push(
        `Life Gua ${gua.kua} ${gua.trigram}, ${gua.group} group (BaZi year ${gua.yearUsed}).`,
        `Best directions — Success: ${gua.directions.shengQi}. Health: ${gua.directions.tianYi}. Relationships: ${gua.directions.yanNian}. Stability: ${gua.directions.fuWei}.`,
        `Use the success direction for a desk facing or a main door approach. Avoid the total-loss direction (${gua.directions.jueMing}) for the bed head and the stove.`,
      );
    }
  }

  return lines.join("\n\n");
}

export function palaceById(chart: FlyingStarChart, id: PalaceChart["id"]) {
  return chart.palaces.find((palace) => palace.id === id);
}
