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
    if (star === 5) {
      return `${place}容易出事、計畫卡住。這裡放一個金屬時鐘，保持明亮，不要堆東西，也不要在這裡睡覺。`;
    }
    if (star === 2) {
      return `${place}跟身體不舒服、提不起勁有關。放金屬，例如銅碗或六枚銅錢。頭不要朝這個方向睡。`;
    }
    if (star === 3) {
      return `${place}容易吵架、決定下得太急。用一盞穩定的燈，把尖角和會讓人對立的座位移走。`;
    }
    if (star === 7) {
      return `${place}容易有閒話、東西壞掉、錢不知不覺漏掉。放一碗經常更換的清水。保險箱和床盡量不要放這裡。`;
    }
    return null;
  }
  if (star === 5) {
    return `The ${place.toLowerCase()} side is where plans stall and accidents show up. Keep it bright and empty, put a metal clock there, and do not sleep in that part of the room.`;
  }
  if (star === 2) {
    return `The ${place.toLowerCase()} side is tied to feeling unwell or run down. A metal bowl or six coins helps. Do not sleep with your head pointing that way.`;
  }
  if (star === 3) {
    return `The ${place.toLowerCase()} side is where arguments and rushed decisions start. Use a steady lamp, and move sharp corners and face-to-face desks out of it.`;
  }
  if (star === 7) {
    return `The ${place.toLowerCase()} side is where gossip, broken things, and money leaks show up. Keep a bowl of still water there and change it often. Do not put a safe or a bed on that side if you can help it.`;
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
  const front = sectorName(
    chart.palaces.find((palace) => palace.id === chart.facing.palace)?.direction ?? "",
    locale,
  );
  const back = sectorName(
    chart.palaces.find((palace) => palace.id === chart.sitting.palace)?.direction ?? "",
    locale,
  );
  const lines =
    locale === "zh-Hant"
      ? [
          `這棟建築落在第 ${chart.period} 個二十年。正門朝${front}，背面在${back}。`,
          chart.kind === "double-facing"
            ? "對生意和名聲有幫助的力量，都堆在正門這一側。外面會顯得熱鬧，裡面的人卻比較沒有被照顧到。屋後最好有實牆或高一點的依靠，不要背後空空的。"
            : chart.kind === "double-sitting"
              ? "對人有幫助的力量在屋後。團隊比較留得住，可是客人、訂單和名聲要靠正門外面有路、有人來。如果門前很靜，事情會悶在裡面。"
              : chart.kind === "wang-shan-wang-shui"
                ? "人在後面有依靠，機會在前面進來。這是比較順的格局。擴張可以，但來的路不要正對尖角。"
                : chart.kind === "shang-shan-xia-shui"
                  ? "外面越熱鬧，裡面的人越容易散。短期會有聲量，長期班底不穩。這時候先顧住留下來的人，比再加一個很亮的門面重要。"
                  : "整棟樓沒有一個統一的好格局。每一面各自不同，不要指望所有部門一起變好。",
        ]
      : [
          `The year puts this building in era ${chart.period}, one of the twenty-year chapters this system uses. The front faces ${front.toLowerCase()}. The back is ${back.toLowerCase()}.`,
          chart.kind === "double-facing"
            ? "The helpful pressure for reputation and incoming work is piled up at the front door. The outside can look busy while the people inside are thinly supported. Give the back of the building something solid behind it."
            : chart.kind === "double-sitting"
              ? "The helpful pressure sits with the people at the back, so a team can hold. Customers and reputation still need a lively way in at the front. A quiet door keeps the work private."
              : chart.kind === "wang-shan-wang-shui"
                ? "People are supported at the back, and opportunity arrives at the front. That is the easier pattern. Growth is reasonable if the road in is not aimed at a sharp corner."
                : chart.kind === "shang-shan-xia-shui"
                  ? "The louder the outside gets, the easier it is to lose the people who keep the place going. It can make a short splash and a thin staff. Hold the team before you add another bright front."
                  : "The building does not have one pattern. Each side tells its own story, so do not expect every room to improve together.",
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
