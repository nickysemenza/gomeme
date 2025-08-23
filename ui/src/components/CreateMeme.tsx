import React, { useState, useEffect } from "react";

import {
  Template,
  CreateMemeParams,
  TargetInput as ProtoTargetInput,
  Meme,
  ImageInput,
  TextInput,
} from "../proto/meme_pb";
import { getAPIClient } from "../util";
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
  let image1 = new ImageInput();
  image1.setUrl(
    "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&w=1000&q=80"
  );
  let image2 = new ImageInput();
  image2.setUrl(b64);
  let text1 = new TextInput();
  text1.setText("cat");
  text1.setColor(getRandomColor());

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
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchDetails = () => {
      let t = template.getTargetsList();
      let targets: TargetForm[] = Array.from({ length: t.length }, () =>
        getRandom()
      );
      setTargets(targets);
    };
    fetchDetails();
  }, [template]);

  const makeMeme = () => {
    setLoading(true);
    const req = new CreateMemeParams();
    req.setTemplatename(template.getName());
    req.setTargetinputsList(
      targets.map((t) => {
        let input = new ProtoTargetInput();
        input.setImageinput(t.image);
        input.setTextinput(t.text);
        return input;
      })
    );
    req.setDebug(debug);

    console.log({ req });
    getAPIClient().createMeme(req, (err, reply) => {
      console.log(JSON.stringify({ err, reply }));
      setLoading(false);
      if (reply) {
        console.log("created", reply.getId(), reply.getUrl());
        onCreate(reply);
        setRes(reply);
      }
    });
  };

  const handleTargetUpdate = (index: number, target: TargetForm) => {
    setTargets(update(targets, {
      [index]: { $set: target }
    }));
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
            loading={loading}
            icon="🎨"
          >
            Generate Meme
          </Button>
        </div>
      </div>

      {/* Result Area */}
      <div className="flex-1 lg:max-w-md">
        <div className="sticky top-8">
          <MemeResult 
            meme={res} 
            loading={loading} 
            debug={debug} 
          />
        </div>
      </div>
    </div>
  );
};

export default CreateMeme;
