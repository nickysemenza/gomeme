import * as yaml from "js-yaml";
import { z } from "zod";
import {
  PointSchema,
  SizeSchema,
  DeltasSchema,
  type Template,
  type Target,
} from "./schemas";

/**
 * The on-the-wire YAML shape is snake_case (historical, human-friendly); the
 * canonical in-app model ({@link Template}) is camelCase. This module is the one
 * place that bridges the two, validated end-to-end with Zod `safeParse` so
 * malformed pasted YAML can never reach app state as `NaN` geometry.
 */
const YamlTargetSchema = z.object({
  friendly_name: z.string(),
  top_left: PointSchema,
  size: SizeSchema,
  deltas: DeltasSchema.optional(),
});

const YamlTemplateBodySchema = z.object({
  size: SizeSchema,
  targets: z.array(YamlTargetSchema).min(1),
  file: z.string(),
});

type YamlTemplateBody = z.infer<typeof YamlTemplateBodySchema>;

/** A map of template name -> body (the shape after unwrapping `templates:`). */
const YamlMapSchema = z.record(z.string(), YamlTemplateBodySchema);

function bodyToTemplate(name: string, body: YamlTemplateBody): Template {
  return {
    name,
    size: body.size,
    file: body.file,
    targets: body.targets.map(
      (t): Target => ({
        friendlyName: t.friendly_name,
        topLeft: t.top_left,
        size: t.size,
        ...(t.deltas && { deltas: t.deltas }),
      }),
    ),
  };
}

function templateToBody(template: Template): YamlTemplateBody {
  return {
    size: template.size,
    file: template.file,
    targets: template.targets.map((t) => ({
      friendly_name: t.friendlyName,
      top_left: t.topLeft,
      size: t.size,
      ...(t.deltas && t.deltas.length > 0 && { deltas: t.deltas }),
    })),
  };
}

export interface ParseResult {
  templates: Record<string, Template>;
  /** Human-readable errors; empty on success. */
  errors: string[];
}

/** Parses (and validates) one or more templates from YAML text. */
export function parseTemplatesYaml(text: string): ParseResult {
  let raw: unknown;
  try {
    raw = yaml.load(text);
  } catch (e) {
    return { templates: {}, errors: [`Invalid YAML: ${(e as Error).message}`] };
  }
  if (!raw || typeof raw !== "object") {
    return { templates: {}, errors: ["YAML did not contain any templates"] };
  }
  // Support both a top-level `templates:` wrapper and a bare name->body map.
  const wrapper = (raw as { templates?: unknown }).templates;
  const container =
    wrapper && typeof wrapper === "object" ? wrapper : raw;
  const result = YamlMapSchema.safeParse(container);
  if (!result.success) {
    return {
      templates: {},
      errors: result.error.issues.map(
        (i) => `${i.path.join(".") || "(root)"}: ${i.message}`,
      ),
    };
  }
  const templates: Record<string, Template> = {};
  for (const [name, body] of Object.entries(result.data)) {
    templates[name] = bodyToTemplate(name, body);
  }
  return { templates, errors: [] };
}

/** Serializes templates to snake_case YAML under a top-level `templates:` key. */
export function serializeTemplates(templates: Template[]): string {
  const doc = {
    templates: Object.fromEntries(
      templates.map((t) => [t.name, templateToBody(t)]),
    ),
  };
  return yaml.dump(doc, {
    indent: 2,
    lineWidth: -1,
    quotingType: '"',
    forceQuotes: false,
  });
}

/** Serializes a single template to snake_case YAML. */
export function serializeTemplate(template: Template): string {
  return serializeTemplates([template]);
}
