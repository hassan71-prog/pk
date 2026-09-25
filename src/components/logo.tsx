import { cn } from "@/lib/utils";

export function Logo({ className, markOnly = false }: { className?: string; markOnly?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <img
        src="/icon-192.png"
        alt=""
        className="size-8 rounded-md object-cover ring-1 ring-[color-mix(in_oklab,#d4a017_40%,transparent)]"
        width={32}
        height={32}
      />
      {!markOnly ? (
        <span className="font-display text-[15px] font-semibold tracking-tight">
          Earn<span className="text-primary">.pk</span>
        </span>
      ) : null}
    </div>
  );
}
