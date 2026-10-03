export type Locale = "en" | "zh-Hant";

export type PalaceKey = "N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW" | "C";

const copy = {
  en: {
    brand: "GeoMancy",
    navCases: "Case studies",
    navAudit: "Audit",
    navReports: "Reports",
    signIn: "Sign in",
    heroKicker: "Form School · Compass School",
    heroTitle: "Audit the energy of a room before you place the bed.",
    heroBody:
      "GeoMancy reads a floor plan, a photograph, or a satellite view, then calculates the Xuan Kong Flying Star chart from the compass degree and the year the building was raised.",
    heroCta: "Audit your space",
    heroSecondary: "See the case studies",
    pentagonKicker: "Case study",
    pentagonTitle: "The hidden lines of the Pentagon, drawn as a demonstration.",
    pentagonP1:
      "The public plan is a five-sided ring of corridors around an open court. In Form School that footprint does not offer one calm face. Each corner can throw a glancing arrow at the wall beside it, and the highways around the site carry fast sha along the outer edges.",
    pentagonP2:
      "The court in the middle is the building’s chance to gather qi, provided the main approach is not aimed at a corner. The chart is illustrative: Period 4, because the building was completed in 1943, on a notional facing of 175°. It is not a measured survey and it is not a financial forecast.",
    steps: [
      ["01", "Upload", "A plan, a room, or an address. A floor plan also asks for the street address."],
      ["02", "Calibrate", "Turn the facing degree and watch the plan rotate against a fixed north."],
      ["03", "Read", "Form School is free. The Flying Star grid unlocks for testing until Stripe is connected."],
    ],
    priceTitle: "One reading. $19.90 when Stripe is on.",
    priceBody:
      "Until the Stripe secret key is set, Unlock opens the full chart so you can test it. After Stripe is connected, the same button charges $19.90.",
    priceCta: "Begin an audit",
    casesKicker: "Campuses",
    casesTitle: "Illustrative readings of public headquarters.",
    casesBody:
      "Each chart uses a published year and a notional facing. The business note is a feng shui reading of that chart, not a forecast of revenue and not investment advice.",
    loginTitle: "Sign in",
    loginBody: "Signed-in audits are kept in your report history. You can still run a reading without an account.",
    historyTitle: "Your audits",
    historyEmpty: "No saved audits yet.",
    runOne: "Run one while signed in.",
    disclaimer:
      "Demonstration only. Facings are not door surveys. Nothing on this page is financial, legal, or investment advice.",
  },
  "zh-Hant": {
    brand: "GeoMancy",
    navCases: "案例",
    navAudit: "審計",
    navReports: "報告",
    signIn: "登入",
    heroKicker: "巒頭 · 理氣",
    heroTitle: "先看空間的氣，再決定床與桌放在哪裡。",
    heroBody:
      "GeoMancy 讀平面圖、房間照片或衛星圖，再用坐向度數與建成年份計算玄空飛星盤。",
    heroCta: "審計你的空間",
    heroSecondary: "看案例",
    pentagonKicker: "案例",
    pentagonTitle: "五角大廈的氣場示意，不是實地羅盤。",
    pentagonP1:
      "公開平面是五邊環廊，包圍一個中庭。巒頭上，這種平面沒有一面完全平靜的向。每個角都可以把煞氣掃向鄰牆，外圍公路則帶著快速的路煞。",
    pentagonP2:
      "中庭是聚氣的機會，前提是來路不要正沖尖角。此盤用 1943 年完工，屬四運，示意坐向 175°。這不是實測，也不是業績預測。",
    steps: [
      ["01", "上傳", "平面圖、房間或地址。平面圖會一併詢問街道地址。"],
      ["02", "校準", "轉動方位，平面圖會對著固定的北方旋轉。"],
      ["03", "解讀", "巒頭免費。在接上 Stripe 之前，解鎖會直接打開飛星盤，方便測試。"],
    ],
    priceTitle: "一份報告。接上 Stripe 後為 19.90 美元。",
    priceBody:
      "尚未設定 Stripe 密鑰時，按下解鎖會直接打開完整飛星盤。接上之後，同一個按鈕才會收款。",
    priceCta: "開始審計",
    casesKicker: "園區",
    casesTitle: "公開總部的示意盤。",
    casesBody:
      "每張盤用已公開的年份，加上一個示意坐向。業績段落是對該盤的風水解讀，不是營收預測，也不是投資建議。",
    loginTitle: "登入",
    loginBody: "登入後的審計會留在報告紀錄。不登入也可以做一次解讀。",
    historyTitle: "你的審計",
    historyEmpty: "還沒有已儲存的審計。",
    runOne: "登入後再做一次。",
    disclaimer: "僅供示範。坐向不是大門實測。本頁不是財務、法律或投資建議。",
  },
} as const;

export type Copy = (typeof copy)["en"];

export function messages(locale: Locale): Copy {
  return copy[locale] as Copy;
}

export const palaceName: Record<Locale, Record<PalaceKey, string>> = {
  en: {
    N: "North",
    NE: "Northeast",
    E: "East",
    SE: "Southeast",
    S: "South",
    SW: "Southwest",
    W: "West",
    NW: "Northwest",
    C: "Center",
  },
  "zh-Hant": {
    N: "北",
    NE: "東北",
    E: "東",
    SE: "東南",
    S: "南",
    SW: "西南",
    W: "西",
    NW: "西北",
    C: "中宮",
  },
};

export const kindLabel: Record<Locale, Record<string, string>> = {
  en: {
    "wang-shan-wang-shui": "Wang Shan Wang Shui — mountain and water both timely",
    "shang-shan-xia-shui": "Shang Shan Xia Shui — the timely stars are reversed",
    "double-facing": "Double Facing — both timely stars gather at the facing",
    "double-sitting": "Double Sitting — both timely stars gather at the sitting",
    mixed: "Mixed chart — read each palace on its own stars",
  },
  "zh-Hant": {
    "wang-shan-wang-shui": "旺山旺水 — 山星與向星都得令",
    "shang-shan-xia-shui": "上山下水 — 當令之星位置顛倒",
    "double-facing": "雙星到向 — 兩顆當令星聚在向首",
    "double-sitting": "雙星到坐 — 兩顆當令星聚在坐山",
    mixed: "雜局 — 逐宮看星，沒有單一格局",
  },
};
