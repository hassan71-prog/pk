import { cn } from "@/lib/utils";

export function Logo({ className, markOnly = false }: { className?: string; markOnly?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="grid size-8 place-items-center rounded-xl bg-primary/20 text-sm font-black text-primary shadow-[0_0_12px_rgba(34,197,94,0.35)] ring-1 ring-primary/40">
        E
      </span>
      {!markOnly ? (
        <span className="font-display text-[15px] font-bold tracking-tight">
          Earn<span className="text-primary">.pk</span>
        </span>
      ) : null}
    </div>
  );
}
