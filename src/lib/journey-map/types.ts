import type { LearnSkill } from "@/lib/learn-api";

export type LandmarkBaseStatus = "unlocked" | "locked" | "coming_soon";
export type RuntimeLandmarkStatus =
  | "unlocked"
  | "locked"
  | "coming_soon"
  | "completed";

export type JourneyViewport = { x: number; y: number; zoom: number };

export type JourneyLandmark = {
  slug: string;
  skillId?: string;
  baseStatus: LandmarkBaseStatus;
  /** Center of region on the board (0–1). */
  hotspot: { x: number; y: number };
  /** Hit box size as fraction of board (0–1). */
  hitW: number;
  hitH: number;
  /** @deprecated kept optional for older callers */
  visualSize?: number;
  hitArea?: number;
  assets: {
    hero?: string;
    pin?: string;
    states?: Partial<
      Record<"idle" | "glow" | "locked" | "completed", string>
    >;
  };
};

export type JourneyMapConfig = {
  unitId: string;
  version: number;
  mapDimensions: { width: number; height: number };
  defaultViewport: JourneyViewport;
  assetBasePath: string;
  landmarks: JourneyLandmark[];
};

export type DerivedLandmarkView = {
  slug: string;
  baseStatus: LandmarkBaseStatus;
  status: RuntimeLandmarkStatus;
  isCurrent: boolean;
  hotspot: JourneyLandmark["hotspot"];
  hitW: number;
  hitH: number;
  assets: JourneyLandmark["assets"];
  skillId?: string;
  lessons: LearnSkill["lessons"];
  completedCount: number;
  totalCount: number;
};
