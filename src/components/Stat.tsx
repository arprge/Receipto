import { useI18n } from "../i18n"

/** One cell of the stat band; shows a skeleton bar until the register is ready. */
export default function Stat({
  label,
  value,
  accent,
  pending = false,
}: {
  label: string
  value: string
  accent?: "ok" | "warn" | "signal"
  pending?: boolean
}) {
  const { t } = useI18n()
  const pip =
    accent === "ok"
      ? "bg-ok"
      : accent === "warn"
        ? "bg-warn"
        : accent === "signal"
          ? "bg-signal"
          : null
  return (
    <div className="bg-receipt px-5 py-6">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
        {pip && <span className={`h-1.5 w-1.5 shrink-0 ${pip}`} aria-hidden />}
        <span>{label}</span>
      </div>
      <div className="font-display font-extrabold text-3xl leading-none mt-3 tracking-tight text-ink">
        {pending ? (
          <span
            aria-label={t("stats.loading")}
            className="skeleton-pulse skeleton-bar inline-block h-[0.8em] w-12 align-middle"
          />
        ) : (
          value
        )}
      </div>
    </div>
  )
}
