import { useState, useEffect, useCallback } from "react";
import update from "immutability-helper";
import type { Template, TargetInput } from "~/lib/schemas";
import type { MemeResult as MemeResultType } from "~/lib/meme-generator";
import TargetInputView from "./TargetInput";
import Button from "./Button";
import MemeResultView from "./MemeResult";

interface Props {
  template: Template;
  debug: boolean;
}

const RANDOM_COLORS = [
  "#9859e0",
  "#14cca4",
  "#4188cc",
  "#9af77e",
  "#ba030f",
  "#74b6cc",
  "#f9b3f4",
  "#e133f4",
  "#f22e7f",
];

// Local asset so the home page doesn't hit a third-party CDN on first paint.
const SAMPLE_IMAGE = "/templates/bernie.png";

function getRandomColor(): string {
  return RANDOM_COLORS[Math.floor(Math.random() * RANDOM_COLORS.length)];
}

function getRandom(): TargetInput {
  const items: TargetInput[] = [
    { kind: "image", url: SAMPLE_IMAGE, stretch: false },
    { kind: "text", text: "cat", color: getRandomColor() },
  ];
  return items[Math.floor(Math.random() * items.length)];
}

const CreateMeme: React.FC<Props> = ({ template, debug }) => {
  const [targets, setTargets] = useState<TargetInput[]>([]);
  const [result, setResult] = useState<MemeResultType>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  // Seed inputs when the template changes. Keyed on stable primitives (name +
  // count) rather than the object so an unrelated parent re-render can't wipe
  // user-entered inputs.
  useEffect(() => {
    setTargets(
      Array.from({ length: template.targets.length }, () => getRandom()),
    );
  }, [template.name, template.targets.length]);

  const makeMeme = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      // Lazy-load the generator (and the large magick-wasm wrapper) only when
      // the user actually generates, keeping it out of the first-paint chunk.
      const { generateMeme } = await import("~/lib/meme-generator");
      const res = await generateMeme(template, targets);
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [targets, template]);

  const handleTargetUpdate = useCallback((index: number, target: TargetInput) => {
    setTargets((prev) => update(prev, { [index]: { $set: target } }));
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-3">
      <div className="flex-1 space-y-2">
        {targets.map((target, index) => (
          <TargetInputView
            key={index}
            target={target}
            index={index}
            label={template.targets[index]?.friendlyName ?? `Target ${index + 1}`}
            onUpdate={(t) => handleTargetUpdate(index, t)}
          />
        ))}

        <Button className="w-full" onClick={makeMeme} loading={loading}>
          Generate Meme
        </Button>

        {error && (
          <div
            role="alert"
            className="p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs"
          >
            {error}
          </div>
        )}
      </div>

      <div className="flex-1 lg:max-w-sm">
        <MemeResultView result={result} loading={loading} debug={debug} />
      </div>
    </div>
  );
};

export default CreateMeme;
