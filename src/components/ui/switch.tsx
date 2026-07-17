"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { motion, useReducedMotion } from "motion/react";
import { Check, X } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Arcade-block switch — rounded-square housing, raised clay knob,
 * cartoon ✓/✕ with a spring slide (Duolingo-adjacent, not a plain pill).
 */
const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, checked, defaultChecked, onCheckedChange, ...props }, ref) => {
  const reduceMotion = useReducedMotion();
  const isControlled = checked !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState(!!defaultChecked);
  const on = isControlled ? !!checked : uncontrolled;

  return (
    <SwitchPrimitives.Root
      ref={ref}
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={(next) => {
        if (!isControlled) setUncontrolled(next);
        onCheckedChange?.(next);
      }}
      className={cn(
        "peer group/switch relative inline-flex h-7 w-[48px] shrink-0 cursor-pointer items-center",
        "rounded-xl border-2 border-b-4 px-0.5",
        "transition-[border-width,transform,background-color,border-color] duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "active:translate-y-px active:border-b-2",
        // Off: chalky gray “cage”
        "data-[state=unchecked]:border-neutral-400 data-[state=unchecked]:bg-neutral-200",
        "dark:data-[state=unchecked]:border-neutral-600 dark:data-[state=unchecked]:bg-neutral-800",
        // On: punchy green plate
        "data-[state=checked]:border-primary-depth data-[state=checked]:bg-primary",
        className,
      )}
      {...props}
    >
      {/* Soft inner well */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-1 inset-y-0.5 rounded-lg bg-black/5 dark:bg-black/20"
      />

      <SwitchPrimitives.Thumb asChild>
        <motion.span
          aria-hidden
          initial={false}
          animate={{
            x: on ? 20 : 0,
            rotate: on ? 0 : -8,
            scale: on ? 1 : 0.96,
          }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 520, damping: 22, mass: 0.7 }
          }
          className={cn(
            "relative z-10 flex size-5 items-center justify-center rounded-lg",
            "border-2 border-b-[3px] bg-white",
            "shadow-[0_1px_0_rgba(0,0,0,0.08)]",
            on
              ? "border-primary-depth text-primary"
              : "border-neutral-400 text-neutral-500 dark:border-neutral-500 dark:text-neutral-400",
          )}
        >
          <motion.span
            key={on ? "on" : "off"}
            initial={reduceMotion ? false : { scale: 0.4, opacity: 0, y: 2 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 600, damping: 16 }
            }
            className="flex"
          >
            {on ? (
              <Check className="size-3 stroke-[3.5]" />
            ) : (
              <X className="size-2.5 stroke-[3.5]" />
            )}
          </motion.span>
        </motion.span>
      </SwitchPrimitives.Thumb>
    </SwitchPrimitives.Root>
  );
});
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
