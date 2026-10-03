export type Gender = "female" | "male";

export type DirectionName =
  | "North"
  | "Northeast"
  | "East"
  | "Southeast"
  | "South"
  | "Southwest"
  | "West"
  | "Northwest";

export type LifeGua = {
  yearUsed: number;
  kua: number;
  group: "East" | "West";
  trigram: string;
  directions: Record<
    | "shengQi"
    | "tianYi"
    | "yanNian"
    | "fuWei"
    | "huoHai"
    | "wuGui"
    | "liuSha"
    | "jueMing",
    DirectionName
  >;
};

const TRIGRAM: Record<number, string> = {
  1: "Kan",
  2: "Kun",
  3: "Zhen",
  4: "Xun",
  6: "Qian",
  7: "Dui",
  8: "Gen",
  9: "Li",
};

const DIRECTIONS: Record<number, LifeGua["directions"]> = {
  1: {
    shengQi: "Southeast",
    tianYi: "East",
    yanNian: "South",
    fuWei: "North",
    huoHai: "West",
    wuGui: "Northeast",
    liuSha: "Northwest",
    jueMing: "Southwest",
  },
  2: {
    shengQi: "Northeast",
    tianYi: "West",
    yanNian: "Northwest",
    fuWei: "Southwest",
    huoHai: "East",
    wuGui: "South",
    liuSha: "Southeast",
    jueMing: "North",
  },
  3: {
    shengQi: "South",
    tianYi: "North",
    yanNian: "Southeast",
    fuWei: "East",
    huoHai: "Southwest",
    wuGui: "Northwest",
    liuSha: "Northeast",
    jueMing: "West",
  },
  4: {
    shengQi: "North",
    tianYi: "South",
    yanNian: "East",
    fuWei: "Southeast",
    huoHai: "Northwest",
    wuGui: "Southwest",
    liuSha: "West",
    jueMing: "Northeast",
  },
  6: {
    shengQi: "West",
    tianYi: "Northeast",
    yanNian: "Southwest",
    fuWei: "Northwest",
    huoHai: "Southeast",
    wuGui: "East",
    liuSha: "North",
    jueMing: "South",
  },
  7: {
    shengQi: "Northwest",
    tianYi: "Southwest",
    yanNian: "Northeast",
    fuWei: "West",
    huoHai: "North",
    wuGui: "Southeast",
    liuSha: "South",
    jueMing: "East",
  },
  8: {
    shengQi: "Southwest",
    tianYi: "Northwest",
    yanNian: "West",
    fuWei: "Northeast",
    huoHai: "South",
    wuGui: "North",
    liuSha: "East",
    jueMing: "Southeast",
  },
  9: {
    shengQi: "East",
    tianYi: "Southeast",
    yanNian: "North",
    fuWei: "South",
    huoHai: "Northeast",
    wuGui: "West",
    liuSha: "Southwest",
    jueMing: "Northwest",
  },
};

function digitSum(value: number) {
  let n = Math.abs(value);
  while (n > 9) {
    n = String(n)
      .split("")
      .reduce((sum, digit) => sum + Number(digit), 0);
  }
  return n;
}

/** BaZi year turns at Li Chun, treated here as 4 February. */
export function baziYear(dob: Date): number {
  const month = dob.getUTCMonth() + 1;
  const day = dob.getUTCDate();
  const year = dob.getUTCFullYear();
  if (month < 2 || (month === 2 && day < 4)) return year - 1;
  return year;
}

export function lifeGua(dobIso: string, gender: Gender): LifeGua {
  const dob = new Date(`${dobIso}T00:00:00Z`);
  if (Number.isNaN(dob.getTime())) {
    throw new Error("Date of birth is not a valid date.");
  }

  const yearUsed = baziYear(dob);
  const root = digitSum(yearUsed % 100);
  let kua: number;

  if (gender === "male") {
    kua = yearUsed >= 2000 ? 9 - root : 10 - root;
    if (kua <= 0) kua = 9;
    if (kua === 5) kua = 2;
  } else {
    kua = root + (yearUsed >= 2000 ? 6 : 5);
    while (kua > 9) kua -= 9;
    if (kua === 0) kua = 9;
    if (kua === 5) kua = 8;
  }

  return {
    yearUsed,
    kua,
    group: kua === 1 || kua === 3 || kua === 4 || kua === 9 ? "East" : "West",
    trigram: TRIGRAM[kua],
    directions: DIRECTIONS[kua],
  };
}
