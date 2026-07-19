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
  hotspot: { x: number; y: number };
  visualSize: number;
  hitArea: number;
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
  assetBasePath: string; // e.g. /images/learn/journey/unit-1/v1
  landmarks: JourneyLandmark[];
};

export type DerivedLandmarkView = {
  slug: string;
  baseStatus: LandmarkBaseStatus;
  status: RuntimeLandmarkStatus;
  isCurrent: boolean;
  hotspot: JourneyLandmark["hotspot"];
  visualSize: number;
  hitArea: number;
  assets: JourneyLandmark["assets"];
  skillId?: string;
  lessons: LearnSkill["lessons"];
  completedCount: number;
  totalCount: number;
};
