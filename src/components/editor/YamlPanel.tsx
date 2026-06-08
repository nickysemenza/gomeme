import { useState } from "react";
import type { Template } from "~/lib/schemas";
import {
  parseTemplatesYaml,
  serializeTemplate,
  serializeTemplates,
} from "~/lib/yaml-codec";
import { templates } from "~/lib/templates";
import { saveTemplate } from "~/lib/registry";
import Button from "../Button";
import type { DraftTemplate } from "~/hooks/useTemplateEditor";

interface Props {
  current: DraftTemplate;
  hasTargets: boolean;
  onLoadTemplate: (template: Template) => void;
}

const YamlPanel: React.FC<Props> = ({ current, hasTargets, onLoadTemplate }) => {
  const [yamlInput, setYamlInput] = useState("");
  const [parsed, setParsed] = useState<Record<string, Template>>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [exportText, setExportText] = useState("");
  const [copied, setCopied] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ ok: boolean; text: string }>();

  const handleParse = () => {
    const result = parseTemplatesYaml(yamlInput);
    setParsed(result.templates);
    setErrors(result.errors);
  };

  const loadSample = () => {
    const sample = serializeTemplates([templates.office1, templates.drake1]);
    setYamlInput(sample);
    const result = parseTemplatesYaml(sample);
    setParsed(result.templates);
    setErrors(result.errors);
  };

  const handleExport = () => {
    if (!hasTargets) return;
    setExportText(serializeTemplate(current as Template));
  };

  const copyExport = async () => {
    try {
      await navigator.clipboard?.writeText(exportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const saveToLibrary = () => {
    try {
      saveTemplate(current as Template);
      setSaveMessage({ ok: true, text: `Saved "${current.name}" to your library` });
    } catch (e) {
      setSaveMessage({
        ok: false,
        text: e instanceof Error ? e.message : "Could not save template",
      });
    }
  };

  const names = Object.keys(parsed);

  return (
    <div className="space-y-6">
      <div className="surface p-6">
        <h3 className="chip mb-4 text-slate">import template</h3>
        <div className="space-y-4">
          <Button onClick={loadSample} size="sm" variant="secondary">
            Load Sample YAML
          </Button>
          <label htmlFor="yaml-import" className="sr-only">
            Template YAML
          </label>
          <textarea
            id="yaml-import"
            className="field h-32 w-full resize-none px-3 py-2 font-mono text-sm"
            placeholder="Paste YAML here..."
            value={yamlInput}
            onChange={(e) => setYamlInput(e.target.value)}
          />
          <Button onClick={handleParse} disabled={!yamlInput.trim()} size="sm" variant="secondary">
            Parse Templates
          </Button>

          {errors.length > 0 && (
            <ul role="alert" className="space-y-1 font-mono text-xs text-red-700">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          )}

          {names.length > 0 && (
            <div className="grid grid-cols-1 gap-2">
              {names.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => onLoadTemplate(parsed[name])}
                  className="rounded-lg border border-line bg-paper px-3 py-2 text-left text-sm font-medium text-ink transition-colors hover:border-coral-400 hover:bg-coral-500/[0.06]"
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="surface p-6">
        <h3 className="chip mb-4 text-slate">export</h3>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleExport} disabled={!hasTargets}>
              Generate YAML
            </Button>
            <Button onClick={saveToLibrary} disabled={!hasTargets} variant="secondary">
              Save to Library
            </Button>
          </div>
          {saveMessage && (
            <p
              role="status"
              className={`text-xs ${saveMessage.ok ? "text-coral-700" : "text-red-700"}`}
            >
              {saveMessage.text}
            </p>
          )}
          {exportText && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="chip text-slate">yaml output</span>
                <Button onClick={copyExport} size="sm" variant="secondary">
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
              <label htmlFor="yaml-export" className="sr-only">
                Exported YAML
              </label>
              <textarea
                id="yaml-export"
                className="field h-40 w-full resize-none px-3 py-2 font-mono text-xs"
                value={exportText}
                readOnly
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default YamlPanel;
