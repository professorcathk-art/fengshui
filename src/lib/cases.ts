import { flyingStar, type FlyingStarChart } from "@/lib/fengshui/flying-star";
import { periodFromYear } from "@/lib/fengshui/period";
import { palaceName, type Locale } from "@/lib/i18n/dictionary";

export type CaseStudy = {
  slug: string;
  name: string;
  nameZh: string;
  place: string;
  placeZh: string;
  year: number;
  facing: number;
  formEn: string;
  formZh: string;
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "pentagon",
    name: "The Pentagon",
    nameZh: "五角大廈",
    place: "Arlington, Virginia",
    placeZh: "維吉尼亞州阿靈頓",
    year: 1943,
    facing: 175,
    formEn:
      "A five-sided ring around a court. Corners can cast glancing arrows, and the highways carry fast sha along the outer faces. The court can gather qi if the approach is not aimed at a point.",
    formZh:
      "五邊環廊包圍中庭。尖角會掃出尖角煞，外圍公路帶著路煞。若來路不沖尖角，中庭仍有聚氣的機會。",
  },
  {
    slug: "apple",
    name: "Apple Park",
    nameZh: "蘋果園區",
    place: "1 Apple Park Way, Cupertino",
    placeZh: "庫比蒂諾 Apple Park",
    year: 2017,
    facing: 172,
    formEn:
      "Apple Park opened to employees in April 2017. The ring has almost no external corners, which is a calm Form School shape, while the surrounding roads still move qi quickly around the circle.",
    formZh:
      "Apple Park 於 2017 年 4 月開始進駐。圓環幾乎沒有外角，巒頭上形狀安靜，但外圍道路仍讓氣沿著圓形快速流動。",
  },
  {
    slug: "openai",
    name: "OpenAI",
    nameZh: "OpenAI",
    place: "San Francisco headquarters",
    placeZh: "舊金山總部",
    year: 2024,
    facing: 95,
    formEn:
      "The chart uses 2024, when the company’s San Francisco headquarters expansion was public, as the occupation year. It is a dense city block: streets on several sides act like moving water, useful for reputation and restless for focus.",
    formZh:
      "此盤以 2024 年作為入伙年份，對應公司公開擴張舊金山總部的時期，不是大樓完工實測。城市街塊四面有路，像動水，利名聲，也使心神難定。",
  },
  {
    slug: "claude",
    name: "Anthropic",
    nameZh: "Anthropic（Claude）",
    place: "San Francisco office",
    placeZh: "舊金山辦公室",
    year: 2023,
    facing: 210,
    formEn:
      "Anthropic’s San Francisco office is read here as a 2023 occupation, Period 8. Neighboring towers are external corners. The useful pattern is a protected desk wall, not a glass wall aimed at another building’s edge.",
    formZh:
      "這裡把 Anthropic 的舊金山辦公室按 2023 年入伙、八運來讀。鄰近高樓是外來尖角。有用的格局是書桌靠實牆，而不是玻璃正對另一棟樓的棱角。",
  },
  {
    slug: "nvidia",
    name: "NVIDIA Endeavor",
    nameZh: "NVIDIA Endeavor",
    place: "Santa Clara campus",
    placeZh: "聖塔克拉拉園區",
    year: 2017,
    facing: 30,
    formEn:
      "Endeavor opened in 2017. The roof is a triangle and the plan is full of sharp corners. In Form School those points are cutting sha: brilliant, visible, and in need of distance or water so the edge does not point at a desk.",
    formZh:
      "Endeavor 於 2017 年啟用。屋頂是三角形，平面充滿尖角。巒頭上這是尖角煞：醒目、銳利，也需要距離或水，避免棱角直指工位。",
  },
  {
    slug: "gopro",
    name: "GoPro",
    nameZh: "GoPro",
    place: "San Mateo headquarters",
    placeZh: "聖馬特奧總部",
    year: 2015,
    facing: 270,
    formEn:
      "GoPro has long worked from San Mateo. This reading uses 2015 so the period is Period 8. A published single completion date for the headquarters building is not what this chart claims to know.",
    formZh:
      "GoPro 長期以聖馬特奧為總部。此盤用 2015 年以便落入八運。它並不聲稱知道那棟總部大樓的單一完工日期。",
  },
  {
    slug: "wework",
    name: "WeWork",
    nameZh: "WeWork",
    place: "New York workspace campus",
    placeZh: "紐約共享辦公園區",
    year: 2018,
    facing: 10,
    formEn:
      "The 2018 New York-era floors are a repeat of glass rooms and doors facing doors around a busy core. Form School reads that as qi that never settles. The note below is about that pattern, not a share price.",
    formZh:
      "2018 年前後的紐約樓層，是玻璃房與門沖門圍著繁忙的核心。巒頭上這是氣難以停駐的格局。下面的說明只談這個格局，不談股價。",
  },
  {
    slug: "tesla",
    name: "Tesla Giga Texas",
    nameZh: "特斯拉德州超級工廠",
    place: "Austin, Texas",
    placeZh: "德州奧斯汀",
    year: 2022,
    facing: 160,
    formEn:
      "Vehicle production at Giga Texas was underway in 2022, so this chart uses Period 8. The form is vast sheds and fast roads: qi is industrial and moving, strong for output, harsh for rest.",
    formZh:
      "德州超級工廠於 2022 年已在生產車輛，故此盤用八運。形是巨大廠房與快速道路：氣屬於工業、流動，利產出，不利休息。",
  },
];

export function findCase(slug: string) {
  return caseStudies.find((item) => item.slug === slug);
}

export function caseChart(item: CaseStudy) {
  return flyingStar({ period: periodFromYear(item.year), facingDegree: item.facing });
}

export function businessOutlook(chart: FlyingStarChart, locale: Locale) {
  const facing = chart.palaces.find((palace) => palace.id === chart.facing.palace);
  const names = palaceName[locale];
  const facingName = facing ? names[facing.id] : "";
  const hostile = facing ? [facing.mountain, facing.water].filter((star) => [2, 3, 5, 7].includes(star)) : [];

  if (locale === "zh-Hant") {
    const pattern =
      chart.kind === "double-facing"
        ? "雙星到向：名聲與來財的力量集中在正門一側，後方的人需要實山托住，否則前線很亮、內部易空。"
        : chart.kind === "double-sitting"
          ? "雙星到坐：人才與內部凝聚力較穩，對外的業績要靠向首有動水或活躍來路，否則容易悶在裡面。"
          : chart.kind === "wang-shan-wang-shui"
            ? "旺山旺水：人在後、財在前，是較順的營業格局。擴張可以走，但不要讓來路沖尖角。"
            : chart.kind === "shang-shan-xia-shui"
              ? "上山下水：當令的力量反了。外面越熱鬧，裡面越容易失人。這種盤利短期聲勢，不利長期班底。"
              : "雜局：沒有單一的旺局。業績會隨宮位起伏，要逐個部門看，而不是指望整棟樓一起發。";
    const pressure =
      hostile.length > 0
        ? `${facingName}是向首，上面見到 ${hostile.join("、")}，主對外的成本、口舌或阻滯會先出現在門面與客戶來路上。`
        : `${facingName}是向首，山星 ${facing?.mountain}、向星 ${facing?.water}，門面沒有二、三、五、七這些明顯的壓力星。`;
    return `${pattern}${pressure}這是風水盤的讀法，不是營收數字，也不是投資建議。`;
  }

  const pattern =
    chart.kind === "double-facing"
      ? "Double facing puts reputation and incoming business at the front door. The people inside need a solid support behind them, or the public face is bright and the interior goes thin."
      : chart.kind === "double-sitting"
        ? "Double sitting holds the team. Revenue wants movement at the facing — a lively approach — or the work stays inward and the market side goes quiet."
        : chart.kind === "wang-shan-wang-shui"
          ? "Wang Shan Wang Shui is the smoother trading pattern: people behind, opportunity in front. Growth can proceed if the approach is not aimed at a corner."
          : chart.kind === "shang-shan-xia-shui"
            ? "Shang Shan Xia Shui reverses the timely stars. The louder the outside, the easier it is to lose the people who hold the place. It favors a short burst of attention more than a stable bench."
            : "A mixed chart has no single prosperous structure. Results rise and fall by department, rather than the whole building moving together.";
  const pressure =
    hostile.length > 0
      ? ` The facing sector is ${facingName}, carrying star ${hostile.join(" and ")}. Cost, argument, or delay shows up first on the public approach.`
      : ` The facing sector is ${facingName}, mountain ${facing?.mountain} and water ${facing?.water}, without the sharper pressure stars 2, 3, 5, or 7 on the door.`;
  return `${pattern}${pressure} This is a reading of the chart, not a revenue figure and not investment advice.`;
}
