import { cn } from "@/lib/utils";

export function Logo({ className, markOnly = false }: { className?: string; markOnly?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="grid size-8 place-items-center rounded-md bg-primary text-primary-fg">
        <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden>
          <path
            d="M5 12.5 10 17l9-11"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {!markOnly ? (
        <span className="font-display text-[15px] font-semibold tracking-tight">
          TaskEarn <span className="text-primary">PK</span>
        </span>
      ) : null}
    </div>
  );
}
