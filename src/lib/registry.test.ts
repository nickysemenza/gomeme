import { describe, it, expect } from "vitest";
import { listTemplates, isBuiltin, saveTemplate } from "./registry";
import type { Template } from "./schemas";

describe("template registry", () => {
  it("lists the built-in templates", () => {
    expect(Object.keys(listTemplates())).toEqual(
      expect.arrayContaining(["office1", "drake1", "bernie", "trade_deal"]),
    );
  });

  it("identifies built-in names", () => {
    expect(isBuiltin("office1")).toBe(true);
    expect(isBuiltin("not-a-template")).toBe(false);
  });

  it("rejects an invalid template on save", () => {
    const bad = {
      name: "bad",
      size: { x: 0, y: 100 }, // zero width is invalid
      file: "x.png",
      targets: [],
    } as unknown as Template;
    expect(() => saveTemplate(bad)).toThrow();
  });
});
