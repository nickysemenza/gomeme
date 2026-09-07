import { afterEach, describe, it, expect, vi } from "vitest";
import { buildRenderRequest } from "./meme-generator";
import { templates } from "./templates";
import type { TargetInput } from "./schemas";

describe("text captions", () => {
  afterEach(() => vi.unstubAllGlobals());

  function renderCaption(text: string) {
    const context = {
      font: "",
      textAlign: "",
      textBaseline: "",
      fillStyle: "",
      measureText(value: string) {
        return { width: value.length * Number.parseFloat(this.font.slice(5)) * 0.5 };
      },
      fillText: vi.fn(),
    };
    vi.stubGlobal("document", {
      createElement: () => ({
        getContext: () => context,
        toDataURL: () => "data:image/png;base64,AA==",
      }),
    });
    buildRenderRequest(templates.bernie, [{ kind: "text", text, color: "cyan" }]);
    return context;
  }

  it("wraps the Starbucks caption instead of shrinking it onto one line", () => {
    const text = "once again i will be making a pilgrimage to starbucks shortly if anyone wants to come";
    const context = renderCaption(text);
    const calls = context.fillText.mock.calls;
    const fontSize = Number.parseFloat(context.font.slice(5));
    expect(calls.length).toBeGreaterThan(1);
    expect(calls.map(([line]) => line).join(" ")).toBe(text);
    expect(fontSize).toBeGreaterThan(30);
    expect(calls.length * fontSize * 1.2).toBeLessThanOrEqual(162);
    for (const [line, horizontal, vertical] of calls) {
      expect(context.measureText(line).width).toBeLessThanOrEqual(720);
      expect(horizontal).toBe(400);
      expect(vertical).toBeGreaterThan(0);
      expect(vertical).toBeLessThan(180);
    }
  });

  it("preserves explicit line breaks and blank lines", () => {
    const context = renderCaption("first\n\nlast");
    expect(context.fillText.mock.calls.map(([line]) => line)).toEqual(["first", "", "last"]);
  });

  it("keeps a short caption on one line", () => {
    expect(renderCaption("hello").fillText.mock.calls).toHaveLength(1);
  });

  it("splits oversized words without losing characters", () => {
    const text = "a".repeat(200);
    const context = renderCaption(text);
    expect(context.fillText.mock.calls.length).toBeGreaterThan(1);
    expect(context.fillText.mock.calls.map(([line]) => line).join("")).toBe(text);
    for (const [line] of context.fillText.mock.calls) {
      expect(context.measureText(line).width).toBeLessThanOrEqual(720);
    }
  });

  it("handles empty text", () => {
    const context = renderCaption("");
    expect(context.fillText.mock.calls.map(([line]) => line)).toEqual([""]);
  });
});

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
