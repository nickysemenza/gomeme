import { useState, useEffect, useCallback } from "react";
import update from "immutability-helper";
import type { Template, TargetInput as TargetInputType } from "~/lib/schemas";
import { generateMeme, type MemeResult as MemeResultType } from "~/lib/meme-generator";
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

const SAMPLE_IMAGE =
  "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&w=1000&q=80";

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

      const res = await generateMeme(template.name, inputs, debug);
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [targets, template.name, debug]);

  const handleTargetUpdate = (index: number, target: TargetForm) => {
    setTargets(update(targets, { [index]: { $set: target } }));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1">
        <div className="space-y-6">
          {targets.map((target, index) => (
            <TargetInput
              key={index}
              target={target}
              index={index}
              onUpdate={(t) => handleTargetUpdate(index, t)}
            />
          ))}

          <Button
            size="lg"
            className="w-full"
            onClick={makeMeme}
            loading={loading}
          >
            Generate Meme
          </Button>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 lg:max-w-md">
        <div className="sticky top-8">
          <MemeResultView result={result} loading={loading} debug={debug} />
        </div>
      </div>
    </div>
  );
};

export default CreateMeme;
