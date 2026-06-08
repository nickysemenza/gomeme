import { useState, useEffect, useCallback } from "react";
import update from "immutability-helper";
import type { Template, TargetInput as TargetInputType } from "~/lib/schemas";
import type { MemeResult as MemeResultType } from "~/lib/meme-generator";
import TargetInput, { type TargetForm } from "./TargetInput";
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

function getRandom(): TargetForm {
  const items: TargetForm[] = [
    {
      image: { kind: "image", url: SAMPLE_IMAGE, stretch: false },
      kind: "image",
    },
    {
      text: { kind: "text", text: "cat", color: getRandomColor() },
      kind: "text",
    },
  ];
  return items[Math.floor(Math.random() * items.length)];
}

const CreateMeme: React.FC<Props> = ({ template, debug }) => {
  const [targets, setTargets] = useState<TargetForm[]>([]);
  const [result, setResult] = useState<MemeResultType>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    setTargets(
      Array.from({ length: template.targets.length }, () => getRandom()),
    );
  }, [template]);

  const makeMeme = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      const inputs: TargetInputType[] = targets.map((t) => {
        if (t.kind === "image" && t.image) {
          return { kind: "image" as const, url: t.image.url, stretch: t.image.stretch };
        }
        if (t.kind === "text" && t.text) {
          return { kind: "text" as const, text: t.text.text, color: t.text.color };
        }
        throw new Error("Invalid target input");
      });

      // Lazy-load the generator (and the large magick-wasm wrapper) only when
      // the user actually generates, keeping it out of the first-paint chunk.
      const { generateMeme } = await import("~/lib/meme-generator");
      const res = await generateMeme(template.name, inputs);
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [targets, template.name]);

  const handleTargetUpdate = (index: number, target: TargetForm) => {
    setTargets(update(targets, { [index]: { $set: target } }));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-3">
      <div className="flex-1 space-y-2">
        {targets.map((target, index) => (
          <TargetInput
            key={index}
            target={target}
            index={index}
            onUpdate={(t) => handleTargetUpdate(index, t)}
          />
        ))}

        <Button className="w-full" onClick={makeMeme} loading={loading}>
          Generate Meme
        </Button>

        {error && (
          <div className="p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
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
