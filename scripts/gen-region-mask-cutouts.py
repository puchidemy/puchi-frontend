"""Generate region-mask + per-region cutouts from island-base-v4 via seed flood-fill."""

from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "public/images/learn/journey/unit-1/v1/map/island-base-v6.png"
OUT_MAP = ROOT / "public/images/learn/journey/unit-1/v1/map"
OUT_REGIONS = OUT_MAP / "regions"

REGIONS = [
    ("hoan-kiem", 0.43, 0.13, (255, 0, 0)),
    ("one-pillar-pagoda", 0.41, 0.27, (0, 255, 0)),
    ("old-quarter", 0.49, 0.39, (0, 0, 255)),
    ("coffee-shop", 0.57, 0.51, (255, 255, 0)),
    ("street-food", 0.58, 0.63, (255, 0, 255)),
    ("bamboo-grove", 0.48, 0.75, (0, 255, 255)),
    ("traditional-bridge", 0.41, 0.86, (255, 128, 0)),
]

COLOR_DIST = 42
MIN_ALPHA = 20
MIN_LUMA = 18


def dist(a: tuple[int, int, int], b: tuple[int, int, int]) -> float:
    return ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2) ** 0.5


def luma(rgb: tuple[int, int, int]) -> float:
    return 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]


def is_land(px: tuple[int, int, int, int]) -> bool:
    r, g, b, a = px
    if a < MIN_ALPHA:
        return False
    if luma((r, g, b)) < MIN_LUMA:
        return False
    return True


def y_bounds(index: int, h: int) -> tuple[int, int]:
    """Soft vertical bands between neighboring hotspot centers."""
    ys = [r[2] for r in REGIONS]
    y = ys[index]
    prev_mid = 0.0 if index == 0 else (ys[index - 1] + y) / 2
    next_mid = 1.0 if index == len(ys) - 1 else (y + ys[index + 1]) / 2
    # expand a bit so seams aren't empty
    pad = 0.035
    y0 = max(0, int((prev_mid - pad) * h))
    y1 = min(h - 1, int((next_mid + pad) * h))
    return y0, y1


def find_seed(pixels, w: int, h: int, sx: int, sy: int) -> tuple[int, int, tuple[int, int, int]]:
    if is_land(pixels[sx, sy]):
        return sx, sy, pixels[sx, sy][:3]
    for r in range(1, 50):
        for dy in range(-r, r + 1):
            for dx in range(-r, r + 1):
                nx, ny = sx + dx, sy + dy
                if 0 <= nx < w and 0 <= ny < h and is_land(pixels[nx, ny]):
                    return nx, ny, pixels[nx, ny][:3]
    raise RuntimeError(f"no land near seed {(sx, sy)}")


def flood(
    pixels,
    w: int,
    h: int,
    sx: int,
    sy: int,
    claimed: list[int],
    region_id: int,
    y0: int,
    y1: int,
) -> int:
    sx, sy, target = find_seed(pixels, w, h, sx, sy)
    if not (y0 <= sy <= y1):
        # clamp seed into band
        sy = min(max(sy, y0), y1)
        sx, sy, target = find_seed(pixels, w, h, sx, sy)

    q: deque[tuple[int, int]] = deque()
    idx0 = sy * w + sx
    if claimed[idx0] != 0:
        # walk within band for unclaimed land near color
        found = False
        for r in range(0, 60):
            for dy in range(-r, r + 1):
                for dx in range(-r, r + 1):
                    nx, ny = sx + dx, sy + dy
                    if not (0 <= nx < w and y0 <= ny <= y1):
                        continue
                    i = ny * w + nx
                    if claimed[i] != 0:
                        continue
                    px = pixels[nx, ny]
                    if not is_land(px):
                        continue
                    if dist(px[:3], target) > COLOR_DIST:
                        continue
                    sx, sy, target = nx, ny, px[:3]
                    idx0 = i
                    found = True
                    break
                if found:
                    break
            if found:
                break
        if not found:
            raise RuntimeError(f"seed claimed and no alternate for region {region_id}")

    claimed[idx0] = region_id
    q.append((sx, sy))
    count = 1

    while q:
        x, y = q.popleft()
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if nx < 0 or nx >= w or ny < y0 or ny > y1:
                continue
            i = ny * w + nx
            if claimed[i] != 0:
                continue
            px = pixels[nx, ny]
            if not is_land(px):
                continue
            if dist(px[:3], target) > COLOR_DIST:
                continue
            claimed[i] = region_id
            count += 1
            q.append((nx, ny))
    return count


def main() -> None:
    img = Image.open(SRC).convert("RGBA")
    w, h = img.size
    pixels = img.load()
    claimed = [0] * (w * h)

    print("source", SRC, w, h)
    seed_colors: list[tuple[int, int, int]] = []
    for i, (slug, fx, fy, _) in enumerate(REGIONS):
        rid = i + 1
        sx, sy = int(fx * w), int(fy * h)
        y0, y1 = y_bounds(i, h)
        _, _, sc = find_seed(pixels, w, h, sx, sy)
        seed_colors.append(sc)
        n = flood(pixels, w, h, sx, sy, claimed, rid, y0, y1)
        print(f"  {rid} {slug}: seed=({sx},{sy}) y=[{y0},{y1}] color={sc} pixels={n}")

    # Fill unclaimed land inside each band by nearest seed color
    leftover = 0
    for i, (slug, fx, fy, _) in enumerate(REGIONS):
        rid = i + 1
        y0, y1 = y_bounds(i, h)
        ref = seed_colors[i]
        for y in range(y0, y1 + 1):
            for x in range(w):
                idx = y * w + x
                if claimed[idx] != 0:
                    continue
                px = pixels[x, y]
                if not is_land(px):
                    continue
                if dist(px[:3], ref) <= COLOR_DIST + 12:
                    claimed[idx] = rid
                    leftover += 1
    print("leftover filled", leftover)

    # Second pass: any remaining mainland land → nearest region by y+color
    more = 0
    for y in range(h):
        for x in range(w):
            idx = y * w + x
            if claimed[idx] != 0:
                continue
            px = pixels[x, y]
            if not is_land(px):
                continue
            best = 0
            best_d = 1e9
            for i, (_, _, fy, _) in enumerate(REGIONS):
                d = dist(px[:3], seed_colors[i]) + abs(y / h - fy) * 55
                if d < best_d:
                    best_d = d
                    best = i + 1
            if best_d < COLOR_DIST + 35:
                claimed[idx] = best
                more += 1
    print("nearest filled", more)

    # Drop islands / speckles: keep largest connected component per region
    for rid in range(1, len(REGIONS) + 1):
        seen = [False] * (w * h)
        best: list[int] = []
        for y in range(h):
            for x in range(w):
                start = y * w + x
                if claimed[start] != rid or seen[start]:
                    continue
                q: deque[int] = deque([start])
                seen[start] = True
                cells = [start]
                while q:
                    i = q.popleft()
                    cx, cy = i % w, i // w
                    for nx, ny in (
                        (cx - 1, cy),
                        (cx + 1, cy),
                        (cx, cy - 1),
                        (cx, cy + 1),
                    ):
                        if nx < 0 or ny < 0 or nx >= w or ny >= h:
                            continue
                        j = ny * w + nx
                        if seen[j] or claimed[j] != rid:
                            continue
                        seen[j] = True
                        q.append(j)
                        cells.append(j)
                if len(cells) > len(best):
                    best = cells
        keep = set(best)
        dropped = 0
        for y in range(h):
            for x in range(w):
                i = y * w + x
                if claimed[i] == rid and i not in keep:
                    claimed[i] = 0
                    dropped += 1
        print(f"  region {rid}: keep={len(best)} drop={dropped}")

    # Expand each cutout into nearby land so 3D side walls / rims are included.
    # Hit-mask stays undilated (precise hover); cutouts are visual-only.
    CUTOUT_DILATE = 8

    def dilate_region(rid: int) -> list[bool]:
        include = [claimed[i] == rid for i in range(w * h)]
        for _ in range(CUTOUT_DILATE):
            add: list[int] = []
            for i, on in enumerate(include):
                if not on:
                    continue
                x, y = i % w, i // w
                for nx, ny in (
                    (x - 1, y),
                    (x + 1, y),
                    (x, y - 1),
                    (x, y + 1),
                ):
                    if nx < 0 or ny < 0 or nx >= w or ny >= h:
                        continue
                    j = ny * w + nx
                    if include[j]:
                        continue
                    if not is_land(pixels[nx, ny]):
                        continue
                    # Prefer unclaimed / darker rim; avoid eating bright neighbor tops.
                    other = claimed[j]
                    if other != 0 and other != rid:
                        pr = pixels[nx, ny][:3]
                        # only claim darker edge pixels from neighbors
                        if luma(pr) > luma(seed_colors[rid - 1]) * 0.93:
                            continue
                    add.append(j)
            for j in add:
                include[j] = True
        return include

    OUT_REGIONS.mkdir(parents=True, exist_ok=True)
    mask = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    mp = mask.load()

    for rid, (slug, _, _, rgb) in enumerate(REGIONS, start=1):
        # Hit mask = exact claim (no dilate)
        for y in range(h):
            row = y * w
            for x in range(w):
                if claimed[row + x] == rid:
                    mp[x, y] = (*rgb, 255)

        cut_mask = dilate_region(rid)
        cut = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        cp = cut.load()
        count = 0
        for i, on in enumerate(cut_mask):
            if not on:
                continue
            x, y = i % w, i // w
            px = pixels[x, y]
            r, g, b, a = px
            # Skip baked contact-shadow under the island (dark, low chroma).
            if luma((r, g, b)) < 70 and max(r, g, b) - min(r, g, b) < 28:
                continue
            cp[x, y] = px
            count += 1
        cut.save(OUT_REGIONS / f"{slug}.webp", "WEBP", quality=92, method=6)
        print(f"cutout {slug}: {count} (dilate={CUTOUT_DILATE})")

    mask_path = OUT_MAP / "region-mask-v6.png"
    mask.save(mask_path)
    # Centroids for lock markers (normalized 0–1)
    print("centroids:")
    for rid, (slug, _, _, rgb) in enumerate(REGIONS, start=1):
        sx = sy = n = 0
        for y in range(h):
            for x in range(w):
                if claimed[y * w + x] != rid:
                    continue
                sx += x
                sy += y
                n += 1
        if n:
            print(f"  {slug}: x={sx/n/w:.4f}, y={sy/n/h:.4f}, n={n}")
    print("mask", mask_path)


if __name__ == "__main__":
    main()
