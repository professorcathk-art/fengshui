import { cn } from "@/lib/utils";
import {
  CHART_KIND_LABEL,
  STAR_NAMES,
  type FlyingStarChart,
  type PalaceId,
} from "@/lib/fengshui/flying-star";

const ROWS: PalaceId[][] = [
  ["NW", "N", "NE"],
  ["W", "C", "E"],
  ["SW", "S", "SE"],
];

export function StarGrid({ chart }: { chart: FlyingStarChart }) {
  const byId = new Map(chart.palaces.map((palace) => [palace.id, palace]));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.18em] text-gold uppercase">Xuan Kong</p>
          <h3 className="font-display text-3xl text-foreground">
            Period {chart.period} · {chart.facing.pinyin} {chart.facing.character} facing
          </h3>
        </div>
        <p className="max-w-sm text-sm text-muted-foreground">{CHART_KIND_LABEL[chart.kind]}</p>
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
                {palace.direction}
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
        Each palace reads mountain star, period star, water star. North is at the top.
        Sitting {chart.sitting.pinyin} {chart.sitting.character}. Mountain stars fly{" "}
        {chart.mountainFliesForward ? "forward" : "backward"}; water stars fly{" "}
        {chart.waterFliesForward ? "forward" : "backward"}.
      </p>
    </div>
  );
}
