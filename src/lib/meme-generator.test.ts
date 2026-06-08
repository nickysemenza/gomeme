import { describe, it, expect } from "vitest";
import { buildRenderRequest } from "./meme-generator";
import { templates } from "./templates";
import type { TargetInput } from "./schemas";

describe("buildRenderRequest", () => {
  it("image targets become resize + composite ops (no distort without deltas)", () => {
    const inputs: TargetInput[] = [
      { kind: "image", url: "a.png", stretch: false },
      { kind: "image", url: "b.png", stretch: true },
    ];
    const req = buildRenderRequest(templates.drake1, inputs);

    expect(req.templateUrl).toBe("/templates/drake1.jpeg");
    expect(req.layers).toHaveLength(2);
    expect(req.layers[0].ops.map((o) => o.op)).toEqual(["resize", "composite"]);

    const resize = req.layers[1].ops.find((o) => o.op === "resize");
    expect(resize).toMatchObject({ op: "resize", stretch: true });

    const composite = req.layers[0].ops.find((o) => o.op === "composite");
    expect(composite).toMatchObject({
      op: "composite",
      at: templates.drake1.targets[0].topLeft,
    });
  });

  it("adds a distort op for targets with non-zero deltas (office1)", () => {
    const inputs: TargetInput[] = [
      { kind: "image", url: "a.png", stretch: false },
      { kind: "image", url: "b.png", stretch: false },
    ];
    const req = buildRenderRequest(templates.office1, inputs);
    expect(req.layers[0].ops.map((o) => o.op)).toEqual([
      "resize",
      "distort",
      "composite",
    ]);
  });

  it("references each input image by URL for worker-side fetching", () => {
    const inputs: TargetInput[] = [
      { kind: "image", url: "https://example.com/x.png", stretch: false },
      { kind: "image", url: "b.png", stretch: false },
    ];
    const req = buildRenderRequest(templates.drake1, inputs);
    expect(req.layers[0].source).toEqual({
      kind: "url",
      url: "https://example.com/x.png",
    });
  });
});
