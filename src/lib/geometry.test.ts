import { describe, it, expect } from "vitest";
import {
  POLY_TO_DELTA,
  RENDER_ORDER,
  DELTA_ORDER,
  getTargetPolygon,
  polygonToDeltas,
  zeroDeltas,
  buildBaseDistort,
  applyDeltas,
  distortPayloadToArgs,
  hasNonZeroDistortion,
  clampTopLeft,
  clampSize,
} from "./geometry";
import type { Deltas, Point } from "./schemas";

describe("corner orderings", () => {
  it("POLY_TO_DELTA is derived to [0, 2, 3, 1]", () => {
    expect([...POLY_TO_DELTA]).toEqual([0, 2, 3, 1]);
  });

  it("render and delta orders are permutations of the same four corners", () => {
    expect([...RENDER_ORDER].sort()).toEqual([...DELTA_ORDER].sort());
  });
});

describe("polygon <-> deltas round trip", () => {
  const topLeft: Point = { x: 19, y: 42 };
  const size: Point = { x: 709, y: 505 };
  const deltas: Deltas = [
    { x: 195, y: 0 },
    { x: 0, y: -98 },
    { x: 0, y: 46 },
    { x: -173, y: 0 },
  ];

  it("getTargetPolygon ∘ polygonToDeltas is the identity", () => {
    const poly = getTargetPolygon(topLeft, size, deltas);
    expect(polygonToDeltas(poly, topLeft, size)).toEqual(deltas);
  });

  it("zero deltas yield the axis-aligned box in render order", () => {
    expect(getTargetPolygon(topLeft, size, zeroDeltas())).toEqual([
      { x: 19, y: 42 }, // TL
      { x: 728, y: 42 }, // TR
      { x: 728, y: 547 }, // BR
      { x: 19, y: 547 }, // BL
    ]);
  });
});

describe("distort payload", () => {
  const size: Point = { x: 100, y: 50 };

  it("identity payload has no distortion", () => {
    expect(hasNonZeroDistortion(buildBaseDistort(size))).toBe(false);
  });

  it("applies deltas to destination points only and flattens to IM args", () => {
    const payload = buildBaseDistort(size);
    const deltas: Deltas = [
      { x: 10, y: 0 },
      { x: 0, y: 5 },
      { x: -3, y: 0 },
      { x: 0, y: -7 },
    ];
    applyDeltas(payload, deltas);
    expect(hasNonZeroDistortion(payload)).toBe(true);
    // [srcX,srcY,dstX,dstY] per control point, order TL,BL,TR,BR.
    expect(distortPayloadToArgs(payload)).toEqual([
      0, 0, 10, 0,
      0, 50, 0, 55,
      100, 0, 97, 0,
      100, 50, 100, 43,
    ]);
  });
});

describe("drag clamps", () => {
  const bounds: Point = { x: 800, y: 600 };

  it("keeps a target inside the template bounds when moving", () => {
    expect(clampTopLeft({ x: -10, y: 999 }, { x: 200, y: 100 }, bounds)).toEqual({
      x: 0,
      y: 500,
    });
  });

  it("enforces a minimum size and the space available", () => {
    expect(clampSize({ x: 5, y: 5 }, { x: 0, y: 0 }, bounds)).toEqual({
      x: 20,
      y: 20,
    });
    expect(clampSize({ x: 9999, y: 9999 }, { x: 100, y: 100 }, bounds)).toEqual({
      x: 700,
      y: 500,
    });
  });
});
