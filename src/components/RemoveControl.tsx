import { useEffect, useRef, useState } from "react"
import type { TargetedKeyboardEvent } from "preact"

import { useI18n } from "../i18n"

const ARM_DELAY_MS = 350

/** Quiet, touch-safe two-step removal control matching the receipt monospace grammar. */
export default function RemoveControl({
  product,
  onRemove,
  reveal = false,
}: {
  product: string
  onRemove: () => Promise<void>
  reveal?: boolean
}) {
  const { t } = useI18n()
  const [confirming, setConfirming] = useState(false)
  const [armed, setArmed] = useState(false)
  const [removing, setRemoving] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const removeBtnRef = useRef<HTMLButtonElement>(null)
  const cancelBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!confirming) {
      setArmed(false)
      return
    }
    cancelBtnRef.current?.focus()
    const timer = window.setTimeout(() => setArmed(true), ARM_DELAY_MS)
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setConfirming(false)
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener("pointerdown", onPointerDown)
    }
  }, [confirming])

  const cancel = () => {
    if (removing) return
    setConfirming(false)
    requestAnimationFrame(() => removeBtnRef.current?.focus())
  }

  const confirm = async () => {
    if (removing || !armed) return
    setRemoving(true)
    try {
      await onRemove()
    } catch {
      setRemoving(false)
      setConfirming(false)
    }
  }

  const onKeyDown = (e: TargetedKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape" && confirming) {
      e.stopPropagation()
      cancel()
    }
  }

  if (removing) {
    return (
      <span
        role="status"
        className="skeleton-pulse shrink-0 font-mono text-[9px] uppercase tracking-[0.16em] text-muted"
      >
        {t("receipt.removing")}
      </span>
    )
  }

  if (confirming) {
    return (
      <div
        ref={rootRef}
        onKeyDown={onKeyDown}
        className="flex shrink-0 items-center gap-2 font-mono text-[9px] uppercase tracking-[0.15em]"
      >
        {/* Delete sits to the left while Cancel stays under the original tap spot on the right. */}
        <button
          type="button"
          disabled={!armed}
          onClick={confirm}
          className="bg-signal px-1.5 py-0.5 text-white transition-[opacity,background-color,color] hover:bg-ink hover:text-paper disabled:opacity-45"
        >
          {t("receipt.confirmRemove")}
        </button>
        <button
          ref={cancelBtnRef}
          type="button"
          onClick={cancel}
          className="tap text-muted transition-colors hover:text-ink"
        >
          {t("scan.cancel")}
        </button>
      </div>
    )
  }

  return (
    <button
      ref={removeBtnRef}
      type="button"
      onClick={() => setConfirming(true)}
      aria-label={t("receipt.removeAria", { product })}
      className={`shrink-0 font-mono text-[9px] uppercase tracking-[0.16em] transition-[opacity,color] duration-150 hover:text-signal ${
        reveal
          ? "hidden [@media(hover:hover)]:inline-flex text-muted opacity-0 group-hover:opacity-45 hover:!opacity-100 focus-visible:opacity-100"
          : "tap text-muted/75"
      }`}
    >
      {t("receipt.remove")}
    </button>
  )
}
