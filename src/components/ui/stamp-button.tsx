"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, Loader2 } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/** Visual state for async CTAs (save, submit, confirm…). */
export type StampButtonStatus = "idle" | "loading" | "success";

/** @deprecated Prefer StampButtonStatus — kept for existing call sites. */
export type SaveActionStatus = "idle" | "saving" | "saved";

function normalizeStatus(
  status: StampButtonStatus | SaveActionStatus | undefined,
): StampButtonStatus {
  if (status === "saving") return "loading";
  if (status === "saved") return "success";
  return status ?? "idle";
}

const stampButtonVariants = cva(
  [
    "group/stamp relative isolate inline-flex origin-bottom items-center justify-center overflow-hidden",
    "rounded-2xl border-[3px] border-b-[6px]",
    "font-din font-extrabold uppercase tracking-wide text-white",
    "outline-none transition-[border-width,background-color,border-color] duration-150",
    "focus-visible:ring-2 focus-visible:ring-offset-2",
    "disabled:cursor-default",
  ].join(" "),
  {
    variants: {
      variant: {
        secondary:
          "border-sky-700 bg-secondary hover:bg-sky-400 focus-visible:ring-secondary",
        primary:
          "border-primary-depth bg-primary hover:bg-primary/90 focus-visible:ring-primary",
        danger:
          "border-destructive-depth bg-destructive hover:bg-destructive/90 focus-visible:ring-destructive",
        golden:
          "border-amber-500 bg-amber-300 text-amber-900 hover:bg-amber-300/90 focus-visible:ring-amber-400",
      },
      size: {
        default: "h-12 min-w-38 px-6 text-base",
        sm: "h-9 min-w-28 rounded-xl px-4 text-sm border-b-4",
        lg: "h-14 min-w-44 px-8 text-lg",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "default",
    },
  },
);

export type StampButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> &
  VariantProps<typeof stampButtonVariants> & {
    /** Async flow: idle → loading → success. Omit for a plain stamp CTA. */
    status?: StampButtonStatus | SaveActionStatus;
    /** Idle / default label (or pass children instead). */
    idleLabel?: string;
    loadingLabel?: string;
    successLabel?: string;
    /** Aliases used by save forms. */
    savingLabel?: string;
    savedLabel?: string;
    children?: React.ReactNode;
    /** When true, success state also locks the button (default). */
    lockOnSuccess?: boolean;
  };

/**
 * Shared clay-stamp CTA — cartoon squash on hover/tap.
 * Use with `status` for save/submit flows, or `children` for simple actions.
 */
export const StampButton = React.forwardRef<HTMLButtonElement, StampButtonProps>(
  (
    {
      status: statusProp,
      idleLabel,
      loadingLabel,
      successLabel,
      savingLabel,
      savedLabel,
      children,
      variant = "secondary",
      size = "default",
      className,
      disabled,
      type = "button",
      lockOnSuccess = true,
      ...props
    },
    ref,
  ) => {
    const reduceMotion = useReducedMotion();
    const status = normalizeStatus(statusProp);
    const busy = status === "loading" || (lockOnSuccess && status === "success");
    const locked = !!disabled || busy;
    const canPlay = !locked && !reduceMotion && status === "idle";

    const idleText = idleLabel ?? (typeof children === "string" ? children : null);
    const loadingText = loadingLabel ?? savingLabel ?? "…";
    const successText = successLabel ?? savedLabel ?? "Done!";

    const successTone =
      status === "success"
        ? "border-emerald-700 bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.2)] hover:bg-emerald-500"
        : status === "loading"
          ? "border-sky-700 bg-sky-400 hover:bg-sky-400"
          : null;

    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={locked}
        initial={false}
        whileHover={
          canPlay
            ? { y: 4, scaleX: 1.05, scaleY: 0.9, rotate: -1.2 }
            : undefined
        }
        whileTap={
          canPlay
            ? { y: 7, scaleX: 1.1, scaleY: 0.82, rotate: 1.5 }
            : undefined
        }
        transition={
          reduceMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 620, damping: 18, mass: 0.55 }
        }
        className={cn(
          stampButtonVariants({ variant, size }),
          canPlay && "hover:border-b-[3px] active:border-b-2",
          successTone,
          className,
        )}
        style={{ transformOrigin: "50% 100%" }}
        {...props}
      >
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute -bottom-1.5 left-1/2 h-2 w-3/5 -translate-x-1/2 rounded-full bg-black/25 blur-[2px]",
            "transition-all duration-150",
            canPlay &&
              "group-hover/stamp:w-4/5 group-hover/stamp:opacity-70 group-active/stamp:w-full group-active/stamp:opacity-90",
            locked && "opacity-20",
          )}
        />

        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-2 top-1 h-2 rounded-full bg-white/25",
            "transition-transform duration-150",
            canPlay &&
              "group-hover/stamp:translate-y-0.5 group-active/stamp:translate-y-1",
          )}
        />

        <AnimatePresence>
          {status === "success" && !reduceMotion && (
            <>
              {[...Array(6)].map((_, i) => (
                <motion.span
                  key={i}
                  aria-hidden
                  className="pointer-events-none absolute size-1.5 rounded-full bg-white"
                  initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                  animate={{
                    opacity: 0,
                    x: Math.cos((i / 6) * Math.PI * 2) * 28,
                    y: Math.sin((i / 6) * Math.PI * 2) * 22,
                    scale: 0,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.55, ease: "easeOut" }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {statusProp !== undefined ? (
          <AnimatePresence mode="wait" initial={false}>
            {status === "idle" && (
              <motion.span
                key="idle"
                initial={reduceMotion ? false : { y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={reduceMotion ? undefined : { y: 8, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  "relative inline-block",
                  canPlay &&
                    "transition-transform duration-150 group-hover/stamp:scale-x-105 group-hover/stamp:scale-y-95",
                )}
              >
                {idleText ?? children}
              </motion.span>
            )}

            {status === "loading" && (
              <motion.span
                key="loading"
                initial={reduceMotion ? false : { y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={reduceMotion ? undefined : { y: 8, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="relative inline-flex items-center gap-2"
              >
                <Loader2 className="size-4 animate-spin" strokeWidth={3} />
                {loadingText}
              </motion.span>
            )}

            {status === "success" && (
              <motion.span
                key="success"
                initial={reduceMotion ? false : { scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={reduceMotion ? undefined : { scale: 0.8, opacity: 0 }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 520, damping: 16 }
                }
                className="relative inline-flex items-center gap-1.5"
              >
                <motion.span
                  initial={reduceMotion ? false : { rotate: -40, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : {
                          type: "spring",
                          stiffness: 600,
                          damping: 14,
                          delay: 0.05,
                        }
                  }
                >
                  <Check className="size-5" strokeWidth={3.5} />
                </motion.span>
                {successText}
              </motion.span>
            )}
          </AnimatePresence>
        ) : (
          <span
            className={cn(
              "relative inline-flex items-center gap-2",
              canPlay &&
                "transition-transform duration-150 group-hover/stamp:scale-x-105 group-hover/stamp:scale-y-95",
            )}
          >
            {children}
          </span>
        )}
      </motion.button>
    );
  },
);
StampButton.displayName = "StampButton";

/** @deprecated Use `StampButton` — alias for older imports. */
export const SaveActionButton = StampButton;
