import React, { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { memeClient } from "../connect";
import type { Template, Meme } from "../gen/meme_pb";
import { TargetInput as ProtoTargetInput, ImageInput, TextInput } from "../gen/meme_pb";
import update from "immutability-helper";
import { b64 } from "./b64placeholder";
import TargetInput, { TargetForm } from "./TargetInput";
import Button from "./Button";
import MemeResult from "./MemeResult";

interface Props {
  template: Template;
  onCreate: (meme: Meme) => void;
  debug: boolean;
}

const getRandomColor = (): string => {
  const colors = [
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
  return colors[Math.floor(Math.random() * colors.length)];
};

const getRandom = (): TargetForm => {
  const image1 = new ImageInput({
    URL: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&w=1000&q=80",
    stretch: false,
  });

  const image2 = new ImageInput({
    URL: b64,
    stretch: false,
  });

  const text1 = new TextInput({
    Text: "cat",
    Color: getRandomColor(),
  });

  const items: TargetForm[] = [
    { image: image1, kind: "image" },
    { image: image2, kind: "image" },
    { text: text1, kind: "text" },
  ];
  return items[Math.floor(Math.random() * items.length)];
};

const CreateMeme: React.FC<Props> = ({ template, onCreate, debug }) => {
  const [targets, setTargets] = useState<TargetForm[]>([]);
  const [res, setRes] = useState<Meme>();

  const mutation = useMutation({
    mutationFn: (params: { templateName: string; targetInputs: ProtoTargetInput[]; debug: boolean }) =>
      memeClient.createMeme({
        TemplateName: params.templateName,
        TargetInputs: params.targetInputs,
        Debug: params.debug,
      }),
    onSuccess: (data) => {
      console.log("created", data.ID, data.URL);
      onCreate(data);
      setRes(data);
    },
    onError: (error) => {
      console.error("Failed to create meme:", error);
    },
  });

  useEffect(() => {
    const numTargets = template.Targets.length;
    const randomTargets: TargetForm[] = Array.from({ length: numTargets }, () =>
      getRandom()
    );
    setTargets(randomTargets);
  }, [template]);

  const makeMeme = () => {
    const targetInputs: ProtoTargetInput[] = targets.map((t) => {
      if (t.kind === "image" && t.image) {
        return new ProtoTargetInput({
          input: {
            case: "ImageInput",
            value: t.image,
          },
        });
      } else if (t.kind === "text" && t.text) {
        return new ProtoTargetInput({
          input: {
            case: "TextInput",
            value: t.text,
          },
        });
      }
      return new ProtoTargetInput();
    });

    mutation.mutate({
      templateName: template.Name,
      targetInputs: targetInputs,
      debug: debug,
    });
  };

  const handleTargetUpdate = (index: number, target: TargetForm) => {
    setTargets(
      update(targets, {
        [index]: { $set: target },
      })
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Input Form */}
      <div className="flex-1">
        <div className="space-y-6">
          {targets.map((target, index) => (
            <TargetInput
              key={index}
              target={target}
              index={index}
              onUpdate={(updatedTarget) => handleTargetUpdate(index, updatedTarget)}
            />
          ))}

          <Button
            size="lg"
            className="w-full"
            onClick={makeMeme}
            loading={mutation.isPending}
            icon="🎨"
          >
            Generate Meme
          </Button>
        </div>
      </div>

      {/* Result Area */}
      <div className="flex-1 lg:max-w-md">
        <div className="sticky top-8">
          <MemeResult meme={res} loading={mutation.isPending} debug={debug} />
        </div>
      </div>
    </div>
  );
};

export default CreateMeme;
