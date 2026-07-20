/** Flat mask RGB → landmark slug (must match region-mask-v{version}.png). */
export const REGION_MASK_COLORS: Record<
  string,
  readonly [number, number, number]
> = {
  "hoan-kiem": [255, 0, 0],
  "one-pillar-pagoda": [0, 255, 0],
  "old-quarter": [0, 0, 255],
  "coffee-shop": [255, 255, 0],
  "street-food": [255, 0, 255],
  "bamboo-grove": [0, 255, 255],
  "traditional-bridge": [255, 128, 0],
};

const RGB_TO_SLUG = new Map<number, string>(
  Object.entries(REGION_MASK_COLORS).map(([slug, [r, g, b]]) => [
    (r << 16) | (g << 8) | b,
    slug,
  ]),
);

export type RegionMaskData = {
  width: number;
  height: number;
  data: Uint8ClampedArray;
};

export function regionMaskSrc(assetBasePath: string, version: number): string {
  return `${assetBasePath}/map/region-mask-v${version}.png`;
}

export function regionCutoutSrc(
  assetBasePath: string,
  slug: string,
): string {
  return `${assetBasePath}/map/regions/${slug}.webp`;
}

export async function loadRegionMask(src: string): Promise<RegionMaskData> {
  const img = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("canvas 2d unavailable");
  ctx.drawImage(img, 0, 0);
  const { data, width, height } = ctx.getImageData(
    0,
    0,
    canvas.width,
    canvas.height,
  );
  return { width, height, data };
}

export function slugAtNormalized(
  mask: RegionMaskData,
  nx: number,
  ny: number,
): string | null {
  if (nx < 0 || ny < 0 || nx > 1 || ny > 1) return null;
  const x = Math.min(mask.width - 1, Math.max(0, Math.floor(nx * mask.width)));
  const y = Math.min(
    mask.height - 1,
    Math.max(0, Math.floor(ny * mask.height)),
  );
  const i = (y * mask.width + x) * 4;
  if (mask.data[i + 3] < 128) return null;
  const key = (mask.data[i] << 16) | (mask.data[i + 1] << 8) | mask.data[i + 2];
  return RGB_TO_SLUG.get(key) ?? null;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`failed to load mask: ${src}`));
    img.src = src;
  });
}
