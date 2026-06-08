import { TemplateSchema, type Template } from "./schemas";
import { templates as builtins } from "./templates";

/**
 * The one place the app reads/writes templates. Built-in templates ship in the
 * bundle; user-authored ones (saved from the editor) live in localStorage. This
 * closes the authoring -> creation loop: the editor saves here and the home
 * page lists from here, so an authored template is immediately usable.
 */
const STORAGE_KEY = "gomeme.userTemplates";

function loadUserTemplates(): Record<string, Template> {
  if (typeof localStorage === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    const out: Record<string, Template> = {};
    for (const [name, body] of Object.entries(parsed)) {
      // Validate on read — never trust persisted data.
      const result = TemplateSchema.safeParse(body);
      if (result.success) out[name] = result.data;
    }
    return out;
  } catch {
    return {};
  }
}

/** All available templates: built-ins overlaid with saved user templates. */
export function listTemplates(): Record<string, Template> {
  return { ...builtins, ...loadUserTemplates() };
}

/** True if a name belongs to a built-in (read-only) template. */
export function isBuiltin(name: string): boolean {
  return name in builtins;
}

/** Validates and persists a user template. Throws if it fails the schema. */
export function saveTemplate(template: Template): void {
  const result = TemplateSchema.safeParse(template);
  if (!result.success) {
    throw new Error(
      result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
    );
  }
  if (typeof localStorage === "undefined") return;
  const user = loadUserTemplates();
  user[result.data.name] = result.data;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}
