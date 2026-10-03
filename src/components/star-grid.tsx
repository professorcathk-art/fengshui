import { kindLabel, palaceName, type Locale } from "@/lib/i18n/dictionary";
import { cn } from "@/lib/utils";
import {
  STAR_NAMES,
  type FlyingStarChart,
  type PalaceId,
} from "@/lib/fengshui/flying-star";

const ROWS: PalaceId[][] = [
  ["NW", "N", "NE"],
  ["W", "C", "E"],
  ["SW", "S", "SE"],
];

export function StarGrid({
  chart,
  locale = "en",
}: {
  chart: FlyingStarChart;
  locale?: Locale;
}) {
  const byId = new Map(chart.palaces.map((palace) => [palace.id, palace]));
  const names = palaceName[locale];
  const kind = kindLabel[locale][chart.kind] ?? chart.kind;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.18em] text-gold uppercase">
            {locale === "zh-Hant" ? "玄空" : "Xuan Kong"}
          </p>
          <h3 className="font-display text-3xl text-foreground">
            {locale === "zh-Hant"
              ? `${chart.period} 運 · 向 ${chart.facing.pinyin} ${chart.facing.character}`
              : `Period ${chart.period} · ${chart.facing.pinyin} ${chart.facing.character} facing`}
          </h3>
        </div>
        <p className="max-w-sm text-sm text-muted-foreground">{kind}</p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {ROWS.flat().map((id) => {
          const palace = byId.get(id);
          if (!palace) return null;
          return (
            <div
              key={id}
              className={cn(
                "rounded-xl border border-border bg-card/80 p-3",
                id === "C" && "border-gold/50",
              )}
            >
              <p className="text-[11px] tracking-wide text-muted-foreground uppercase">
                {names[id]}
              </p>
              <p className="mt-2 font-display text-2xl leading-none">
                {palace.mountain}
                <span className="mx-1 text-gold/80">·</span>
                {palace.period}
                <span className="mx-1 text-gold/80">·</span>
                {palace.water}
              </p>
              <p className="mt-2 text-[11px] text-muted-foreground">
                {STAR_NAMES[palace.mountain].name} / {STAR_NAMES[palace.water].name}
              </p>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        {locale === "zh-Hant"
          ? "上面的文章才是給人讀的。這張九宮格是計算底稿：每一格三個數字，依序是人、時代、錢和訪客。北在上方。看不懂數字也不影響上面的說明。"
          : "The essay is the part to read. This grid is the worksheet behind it: three numbers in each square, for the people, the era, then money and visitors. North is at the top. You can follow the writing without the numbers."}
      </p>
    </div>
  );
}
