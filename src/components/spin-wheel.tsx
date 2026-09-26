import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

const COLORS = [
  "#22c55e",
  "#16a34a",
  "#fbbf24",
  "#f59e0b",
  "#a855f7",
  "#ec4899",
  "#3b82f6",
  "#14b8a6",
];

type Props = {
  prizes: number[];
  spinning: boolean;
  resultPoints: number | null;
  onSpin: () => void;
  disabled?: boolean;
  usedToday?: boolean;
};

export function SpinWheel({ prizes, spinning, resultPoints, onSpin, disabled, usedToday }: Props) {
  const segments = useMemo(() => {
    const list = prizes.length ? prizes : [0, 10, 20, 30, 50, 80, 100, 150];
    return list;
  }, [prizes]);

  const n = segments.length;
  const [rotation, setRotation] = useState(0);

  // When result comes in, animate to that segment
  const displayRotation = useMemo(() => {
    if (resultPoints === null || spinning) return rotation;
    const idx = segments.indexOf(resultPoints);
    const i = idx >= 0 ? idx : 0;
    const seg = 360 / n;
    // pointer at top; center of segment i
    const target = 360 * 5 + (360 - (i * seg + seg / 2));
    return target;
  }, [resultPoints, spinning, segments, n, rotation]);

  function handleSpin() {
    if (disabled || spinning || usedToday) return;
    setRotation((r) => r + 360 * 4);
    onSpin();
  }

  const gradient = segments
    .map((_, i) => {
      const start = (i / n) * 360;
      const end = ((i + 1) / n) * 360;
      const c = COLORS[i % COLORS.length];
      return `${c} ${start}deg ${end}deg`;
    })
    .join(", ");

  return (
    <div className="flex flex-col items-center">
      <div className="relative mx-auto size-56">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 z-10 -translate-x-1/2 -translate-y-1">
          <div className="h-0 w-0 border-x-[10px] border-t-[18px] border-x-transparent border-t-primary drop-shadow" />
        </div>
        <div
          className={cn(
            "size-full rounded-full border-4 border-primary/50 shadow-[0_0_30px_rgba(34,197,94,0.35)] transition-transform",
            spinning ? "duration-[3000ms] ease-out" : "duration-[3500ms] ease-out",
          )}
          style={{
            background: `conic-gradient(${gradient})`,
            transform: `rotate(${spinning ? rotation + 360 * 6 : displayRotation}deg)`,
          }}
        >
          {segments.map((pts, i) => {
            const angle = ((i + 0.5) / n) * 360;
            return (
              <span
                key={`${pts}-${i}`}
                className="absolute top-1/2 left-1/2 origin-center text-[10px] font-bold text-white drop-shadow"
                style={{
                  transform: `rotate(${angle}deg) translateY(-5.5rem) rotate(-${angle}deg)`,
                }}
              >
                {pts === 0 ? "Again" : pts}
              </span>
            );
          })}
        </div>
        <button
          type="button"
          disabled={disabled || spinning || usedToday}
          onClick={handleSpin}
          className="absolute top-1/2 left-1/2 z-20 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-bg text-xs font-black text-primary ring-4 ring-primary disabled:opacity-50"
        >
          {spinning ? "…" : usedToday ? "OK" : "SPIN"}
        </button>
      </div>
      {resultPoints !== null && !spinning ? (
        <p className="mt-3 text-center text-sm font-semibold text-primary">
          {resultPoints === 0 ? "Try again! 🎡" : `+${resultPoints} coins 🪙`}
        </p>
      ) : null}
    </div>
  );
}
