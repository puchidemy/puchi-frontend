"use server";

import { backendFetch } from "@/lib/backend";
import { getErrorI18nKey } from "@/lib/errors";
import type { ActionResult } from "@/types/api";

export interface WeeklyXPItem {
  weekLabel: string;
  xp: number;
}

type RawRecord = Record<string, unknown>;

function unwrapItems(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object") {
    const items = (raw as RawRecord).items;
    if (Array.isArray(items)) return items;
  }
  return [];
}

function num(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function normalizeWeeklyXp(raw: unknown): WeeklyXPItem {
  const r = (raw ?? {}) as RawRecord;
  return {
    weekLabel:
      typeof r.weekLabel === "string"
        ? r.weekLabel
        : typeof r.week_label === "string"
          ? r.week_label
          : "",
    xp: num(r.xp),
  };
}

/** GET /v1/profile/stats/weekly-xp — BE returns `{ items: [...] }`. */
export async function getWeeklyXP(): Promise<ActionResult<WeeklyXPItem[]>> {
  try {
    const data = await backendFetch<unknown>("/v1/profile/stats/weekly-xp");
    return { success: true, data: unwrapItems(data).map(normalizeWeeklyXp) };
  } catch (err) {
    return { success: false, error: getErrorI18nKey(err) };
  }
}
