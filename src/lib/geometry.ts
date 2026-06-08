import type { Point, Deltas } from "./schemas";

/**
 * The four corners of a target, and the two orderings that the rest of the app
 * relies on. These were previously duplicated as a magic `POLY_TO_DELTA` array
 * in the editor and an implicit control-point order in the generator; a reorder
 * in one place silently corrupted every skewed template. They now live here,
 * once, and the mapping between them is derived rather than hand-written.
 */
export type Corner = "TL" | "TR" | "BR" | "BL";

/** Order the editor draws a target polygon in (clockwise from top-left). */
export const RENDER_ORDER: readonly Corner[] = ["TL", "TR", "BR", "BL"] as const;

/**
 * Order the generator's `deltas` tuple is stored in, matching ImageMagick's
 * perspective control-point order used in {@link buildBaseDistort}.
 */
export const DELTA_ORDER: readonly Corner[] = ["TL", "BL", "TR", "BR"] as const;

/**
 * Maps a polygon vertex index (RENDER_ORDER) to its slot in the deltas tuple
 * (DELTA_ORDER). Derived from the two orderings above so the two can never
 * silently disagree. Equals [0, 2, 3, 1].
 */
export const POLY_TO_DELTA: readonly number[] = RENDER_ORDER.map((corner) =>
  DELTA_ORDER.indexOf(corner),
);

const ZERO: Point = { x: 0, y: 0 };

/** Returns the four zero-deltas tuple (fresh copies). */
export function zeroDeltas(): Deltas {
  return [{ ...ZERO }, { ...ZERO }, { ...ZERO }, { ...ZERO }];
}

/**
 * Computes the absolute polygon points (in RENDER_ORDER) for a target given its
 * top-left, size, and optional per-corner deltas. `deltas` are indexed in
 * DELTA_ORDER.
 */
export function getTargetPolygon(
  topLeft: Point,
  size: Point,
  deltas?: Deltas,
): Point[] {
  // Base corner positions before deltas, keyed by corner name.
  const base: Record<Corner, Point> = {
    TL: { x: topLeft.x, y: topLeft.y },
    TR: { x: topLeft.x + size.x, y: topLeft.y },
    BR: { x: topLeft.x + size.x, y: topLeft.y + size.y },
    BL: { x: topLeft.x, y: topLeft.y + size.y },
  };
  return RENDER_ORDER.map((corner, polyIdx) => {
    const d = deltas ? deltas[POLY_TO_DELTA[polyIdx]] : ZERO;
    return { x: base[corner].x + d.x, y: base[corner].y + d.y };
  });
}

/**
 * Inverse of {@link getTargetPolygon}: given the rendered polygon points (in
 * RENDER_ORDER) plus the target's top-left and size, recover the deltas tuple
 * (in DELTA_ORDER). `getTargetPolygon` ∘ `polygonToDeltas` is the identity.
 */
export function polygonToDeltas(
  polygon: Point[],
  topLeft: Point,
  size: Point,
): Deltas {
  const base: Record<Corner, Point> = {
    TL: { x: topLeft.x, y: topLeft.y },
    TR: { x: topLeft.x + size.x, y: topLeft.y },
    BR: { x: topLeft.x + size.x, y: topLeft.y + size.y },
    BL: { x: topLeft.x, y: topLeft.y + size.y },
  };
  const out = zeroDeltas();
  RENDER_ORDER.forEach((corner, polyIdx) => {
    const p = polygon[polyIdx];
    out[POLY_TO_DELTA[polyIdx]] = {
      x: p.x - base[corner].x,
      y: p.y - base[corner].y,
    };
  });
  return out;
}

export interface ControlPointDelta {
  p1: Point;
  p2: Point;
}

export interface DistortPayload {
  controlPoints: [
    ControlPointDelta,
    ControlPointDelta,
    ControlPointDelta,
    ControlPointDelta,
  ];
}

/** Builds the identity perspective payload (source = destination) for a box. */
export function buildBaseDistort(size: Point): DistortPayload {
  return {
    controlPoints: [
      { p1: { x: 0, y: 0 }, p2: { x: 0, y: 0 } }, // TL
      { p1: { x: 0, y: size.y }, p2: { x: 0, y: size.y } }, // BL
      { p1: { x: size.x, y: 0 }, p2: { x: size.x, y: 0 } }, // TR
      { p1: { x: size.x, y: size.y }, p2: { x: size.x, y: size.y } }, // BR
    ],
  };
}

/** Applies per-corner destination deltas (DELTA_ORDER) to a distort payload. */
export function applyDeltas(payload: DistortPayload, deltas: Deltas): void {
  for (let i = 0; i < 4; i++) {
    payload.controlPoints[i].p2.x += deltas[i].x;
    payload.controlPoints[i].p2.y += deltas[i].y;
  }
}

/** Flattens a distort payload into ImageMagick's flat `[srcX,srcY,dstX,dstY,...]` args. */
export function distortPayloadToArgs(payload: DistortPayload): number[] {
  const args: number[] = [];
  for (const cp of payload.controlPoints) {
    args.push(cp.p1.x, cp.p1.y, cp.p2.x, cp.p2.y);
  }
  return args;
}

/** True if any control point's destination differs from its source. */
export function hasNonZeroDistortion(payload: DistortPayload): boolean {
  return payload.controlPoints.some(
    (cp) => cp.p1.x !== cp.p2.x || cp.p1.y !== cp.p2.y,
  );
}

/** Clamps a top-left so the target stays within the template bounds. */
export function clampTopLeft(
  topLeft: Point,
  size: Point,
  bounds: Point,
): Point {
  return {
    x: Math.max(0, Math.min(bounds.x - size.x, topLeft.x)),
    y: Math.max(0, Math.min(bounds.y - size.y, topLeft.y)),
  };
}

/** Clamps a size to a minimum and to the space available from `topLeft`. */
export function clampSize(
  size: Point,
  topLeft: Point,
  bounds: Point,
  min = 20,
): Point {
  return {
    x: Math.min(Math.max(min, size.x), bounds.x - topLeft.x),
    y: Math.min(Math.max(min, size.y), bounds.y - topLeft.y),
  };
}
