import { describe, it, expect } from "vitest";
import {
  serializeTemplate,
  parseTemplatesYaml,
  extractTemplateNames,
} from "./yaml-codec";
import { templates } from "./templates";

describe("yaml codec round trip", () => {
  it("serialize -> parse recovers a template with deltas (office1)", () => {
    const yaml = serializeTemplate(templates.office1);
    const { templates: parsed, errors } = parseTemplatesYaml(yaml);
    expect(errors).toEqual([]);
    expect(parsed.office1).toEqual(templates.office1);
  });

  it("serialize -> parse recovers a template without deltas (drake1)", () => {
    const yaml = serializeTemplate(templates.drake1);
    const { templates: parsed, errors } = parseTemplatesYaml(yaml);
    expect(errors).toEqual([]);
    expect(parsed.drake1).toEqual(templates.drake1);
  });
});

describe("yaml parse", () => {
  it("supports a bare name->body map (no templates: wrapper)", () => {
    const yaml = `drake1:
  size: { x: 425, y: 365 }
  file: /templates/drake1.jpeg
  targets:
    - friendly_name: panel 1
      top_left: { x: 217, y: 0 }
      size: { x: 210, y: 170 }`;
    const { templates: parsed, errors } = parseTemplatesYaml(yaml);
    expect(errors).toEqual([]);
    expect(parsed.drake1.targets[0].friendlyName).toBe("panel 1");
  });

  it("rejects malformed geometry with errors and yields no templates", () => {
    const yaml = `bad:
  size: { x: not-a-number, y: 10 }
  file: x.png
  targets:
    - friendly_name: t
      top_left: { x: 0, y: 0 }
      size: { x: 100, y: 100 }`;
    const { templates: parsed, errors } = parseTemplatesYaml(yaml);
    expect(Object.keys(parsed)).toHaveLength(0);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("rejects a target with zero/negative size", () => {
    const yaml = `bad:
  size: { x: 100, y: 100 }
  file: x.png
  targets:
    - friendly_name: t
      top_left: { x: 0, y: 0 }
      size: { x: 0, y: 100 }`;
    const { errors } = parseTemplatesYaml(yaml);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("returns an error (not a throw) for invalid YAML syntax", () => {
    const { templates: parsed, errors } = parseTemplatesYaml(":\n  - [unbalanced");
    expect(Object.keys(parsed)).toHaveLength(0);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("extractTemplateNames lists template names", () => {
    expect(extractTemplateNames(serializeTemplate(templates.bernie))).toEqual([
      "bernie",
    ]);
  });
});
