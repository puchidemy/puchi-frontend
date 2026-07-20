"use client";

import { useLayoutEffect, useState, type RefObject } from "react";

/**
 * Largest square (px) that fits inside a container.
 * Avoids CSS aspect-ratio + h-full bugs that stretch the board on narrow viewports
 * and desync % hotspot coords from object-contain image content.
 */
export function useSquareBoardSize(
  containerRef: RefObject<HTMLElement | null>,
): number {
  const [size, setSize] = useState(0);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const { width, height } = el.getBoundingClientRect();
      const next = Math.max(0, Math.floor(Math.min(width, height)));
      setSize((prev) => (prev === next ? prev : next));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [containerRef]);

  return size;
}
