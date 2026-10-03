import type { Locale } from "@/lib/i18n/dictionary";
import type { FlyingStarChart } from "@/lib/fengshui/flying-star";
import type { LifeGua } from "@/lib/fengshui/kua";
import { deepseekChat, parseJsonObject } from "./deepseek";

export type PlainReading = {
  building: string;
  people: string;
  outlook: string;
  whatToDo: string;
};

const STAR: Record<number, string> = {
  1: "work that moves, travel, and clever planning",
  2: "illness, tiredness, and things that slowly go wrong",
  3: "arguments, rushed decisions, and people talking past each other",
  4: "writing, study, and personal attraction",
  5: "accidents, stalled plans, and the heaviest kind of trouble in this system",
  6: "authority, a head office, and someone being clearly in charge",
  7: "gossip, leaks, broken equipment, and money that slips",
  8: "in a Period 8 building (2004–2023) this is the helpful prosperity star; outside that era it is only steady earth, not automatically lucky",
  9: "from 2024 this is the helpful star of reputation and the new era; before 2024 it is the star that is arriving, visible but not yet in charge",
};

function kindFact(chart: FlyingStarChart) {
  if (chart.kind === "double-facing") {
    return "Both helpful stars sit on the front of the building. The public side is bright. The people inside are not the part this chart takes care of, so the interior needs real support behind it.";
  }
  if (chart.kind === "double-sitting") {
    return "Both helpful stars sit at the back, with the people. The team can hold together. Customers and reputation need a lively approach at the front, or the work stays private and the market side goes quiet.";
  }
  if (chart.kind === "wang-shan-wang-shui") {
    return "The helpful people-star is at the back and the helpful money-star is at the front. That is the smoother pattern: a supported team, and opportunity arriving at the door.";
  }
  if (chart.kind === "shang-shan-xia-shui") {
    return "The helpful stars are in the wrong seats. Attention outside can grow while the people who keep the place running get thinner. It favors a short burst of noise more than a stable staff.";
  }
  return "There is no single pattern for the whole building. Each side has its own story, so results will not rise and fall together.";
}

export function chartFacts(chart: FlyingStarChart, gua: LifeGua | null) {
  const lines = chart.palaces.map((palace) => {
    const people = STAR[palace.mountain];
    const money = STAR[palace.water];
    return `${palace.direction}: people-star ${palace.mountain} (${people}); era-star ${palace.period}; visitors-and-money star ${palace.water} (${money}).`;
  });
  const personal = gua
    ? `The resident's personal number is ${gua.kua} (${gua.trigram}, ${gua.group} group, year counted as ${gua.yearUsed}). Best for a desk or the way in: ${gua.directions.shengQi}. Health: ${gua.directions.tianYi}. Relationships: ${gua.directions.yanNian}. A quiet corner that still suits them: ${gua.directions.fuWei}. Do not put the head of the bed or the stove toward ${gua.directions.jueMing}.`
    : "No birth date was given, so do not invent a personal direction.";
  return [
    `Period ${chart.period}, from the year the building was raised or occupied. Facing ${chart.facingDegree} degrees, which this chart treats as the ${chart.facing.palace} side of the building. The back of the building is ${chart.sitting.palace}.`,
    kindFact(chart),
    "Read every side below as given. Do not move a star to a different side. Do not invent a star that is not listed.",
    ...lines,
    personal,
  ].join("\n");
}

function clean(value: unknown) {
  return String(value ?? "")
    .replace(/\s+\n/g, "\n")
    .trim();
}

export function formatReading(reading: PlainReading, locale: Locale) {
  const heads =
    locale === "zh-Hant"
      ? ["建築本身", "裡面的人", "生意與名聲", "可以怎麼做"]
      : ["The building", "The people inside", "Money and reputation", "What to do"];
  return [reading.building, reading.people, reading.outlook, reading.whatToDo]
    .map((part, index) => `${heads[index]}\n\n${part}`)
    .join("\n\n");
}

export async function narrateChart(input: {
  locale: Locale;
  audience: "case" | "home";
  subject: string;
  place?: string;
  year: number;
  notes?: string;
  chart: FlyingStarChart;
  gua?: LifeGua | null;
}): Promise<PlainReading> {
  const zh = input.locale === "zh-Hant";
  const system = zh
    ? `你是一位會把風水講成白話的作者。用香港、台灣日常書面語，繁體中文，像在跟屋主或公司行政說明一棟樓。
不要翻譯腔，不要「值得注意的是」「此盤」「向星」「山星」「煞氣」「當令」這類不解釋的行話。
不要寫任何星的數字，也不要寫「向星」「山星」「運星」「八運」「五黃」「煞」「巒頭」「當令」。
直接說大樓的哪一側、那裡的人會遇到什麼、錢和名聲怎麼走、可以怎麼調整。
四個欄位各寫兩段，每段三到五句，具體，可以想像。
不要寫營收、股價或任何你不知道的數字。不要說這是實地羅盤測量。
這不是投資建議。最後在 whatToDo 裡用一句話說清楚。
只輸出 JSON：{"building","people","outlook","whatToDo"}，鍵名用英文。`
    : `You write feng shui for an adult who has never studied it. Native English, the way a good magazine would explain a building: concrete, calm, and specific. Contractions are fine.
Never use the word "star". Name the side of the building and say what happens to the people, the money, and the reputation there.
Each of the four fields is two paragraphs, three to five sentences each.
Do not invent revenue, headcount, or a share price. Do not claim anyone stood at the door with a compass.
This is not investment advice. Say that once, inside whatToDo.
Return JSON only: {"building","people","outlook","whatToDo"}.`;

  const job =
    input.audience === "case"
      ? zh
        ? `這是一間公司總部的示範解讀，不是上門勘測。主題：${input.subject}。地點：${input.place ?? "未提供"}。用來定運的年份：${input.year}。建築備註：${input.notes ?? "沒有額外備註。"} 請依下面的計算結果寫，不要改方位。`
        : `This is a demonstration reading of a company headquarters, not a site visit. Subject: ${input.subject}. Place: ${input.place ?? "not given"}. Year used to set the era: ${input.year}. Building notes: ${input.notes ?? "No extra notes."} Follow the calculation below. Do not move anything to a different side.`
      : zh
        ? `這是屋主自己的空間。主題：${input.subject}。地址：${input.place ?? "沒有地址"}。建成年份：${input.year}。先前看到的形：${input.notes ?? "沒有。"} 請依計算結果寫給這個人看，告訴他床、桌、門可以怎麼放。`
        : `This is someone's own space. Subject: ${input.subject}. Address: ${input.place ?? "no address"}. Year built: ${input.year}. What the earlier look at the form already noticed: ${input.notes ?? "Nothing further."} Write to that person. Say where a bed, a desk, and the way in should and should not go.`;

  const facts = chartFacts(input.chart, input.gua ?? null);
  let reading = await once(system, `${job}\n\n${facts}`);
  const text = Object.values(reading).join("\n");
  const simplified = input.locale === "zh-Hant" && /[门这气东车马国说个为会边]/.test(text);
  const codes =
    /\bstars?\b|sha qi|wang shan|trigram/i.test(text) ||
    /向星|山星|運星|五黃|八運|巒頭|當令|煞|星/.test(text);
  if (simplified || codes) {
    const fix = input.locale === "zh-Hant"
      ? "上一稿還有術語、簡體字或星的數字。請用繁體中文重寫，完全不要數字代號，只講哪一側會發生什麼事。"
      : "The previous draft still said \"star\" or used jargon. Rewrite it in plain English. Do not use the word star at all.";
    reading = await once(system, `${fix}\n\n${job}\n\n${facts}`);
  }
  return reading;
}

async function once(system: string, userText: string): Promise<PlainReading> {
  let last = "The reading came back incomplete.";
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const content = await deepseekChat({
      system,
      userText:
        attempt === 0
          ? userText
          : `${userText}\n\nReturn one JSON object only. Escape quotes inside the text. Do not add trailing commas.`,
      maxTokens: 2200,
    });
    try {
      const parsed = parseJsonObject(content) as Partial<PlainReading>;
      const reading = {
        building: clean(parsed.building),
        people: clean(parsed.people),
        outlook: clean(parsed.outlook),
        whatToDo: clean(parsed.whatToDo),
      };
      if (reading.building && reading.people && reading.outlook && reading.whatToDo) return reading;
    } catch (error) {
      last = error instanceof Error ? error.message : last;
    }
  }
  throw new Error(last);
}
