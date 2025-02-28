import React, { useState, useEffect } from "react";

import {
  Template,
  CreateMemeParams,
  TargetInput,
  Meme,
  ImageInput,
  TextInput,
  OperationMap,
  Operation,
} from "../proto/meme_pb";
import { getAPIClient } from "../util";
import update from "immutability-helper";
import { b64 } from "./b64placeholder";
import { HexColorPicker } from "react-colorful";

interface TargetForm {
  image?: ImageInput;
  text?: TextInput;
  kind: "image" | "text";
}
// type TargetForm = ImageInput | TextInput;

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
        let input = new TargetInput();
        // input.set
        // input.setKind(t.kind);
        // input.setValue(t.value);

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
  return (
    <div className="flex">
      {/* <pre className="w-8">{JSON.stringify(targets, null, 2)}</pre> */}
      <div className="flex flex-col">
        {targets.map((t, x) => (
          <div key={x} className="w-full">
            <h2 className="font-bold">target {x + 1}</h2>
            <div className="flex flex-col p-1 m-1">
              <div className="w-1/2">
                <input
                  className="shadow-sm appearance-none border rounded-sm py-2 px-3 text-gray-700 leading-tight focus:outline-hidden focus:shadow-outline mb-2"
                  value={t.text?.getText() || t.image?.getUrl() || ""}
                  onChange={(v) => {
                    setTargets(
                      update(targets, {
                        [x]: {
                          $apply: (curr) => {
                            let image =
                              v.target.value.startsWith("http") ||
                              v.target.value.startsWith("data:image");
                            if (image) {
                              let i = curr.image || new ImageInput();
                              i.setUrl(v.target.value);
                              return { image: i, kind: "image" };
                            } else {
                              let i = curr.text || new TextInput();
                              if (i.getColor() === "") i.setColor("#9859e0");
                              i.setText(v.target.value);
                              return { text: i, kind: "text" };
                            }
                          },
                        },
                      })
                    );
                  }}
                ></input>
              </div>
              <div>
                {t.text && (
                  <HexColorPicker
                    color={t.text.getColor()}
                    onChange={(v) => {
                      setTargets(
                        update(targets, {
                          [x]: {
                            $apply: (curr) => {
                              if (curr.text) curr.text.setColor(v);
                              return curr;
                            },
                          },
                        })
                      );
                    }}
                  />
                )}
                {t.image && (
                  <img src={t.image.getUrl()} alt="" className="h-40" />
                )}
              </div>
            </div>
            {/* {t.kind === "b64" && <img src={t.value} />} */}
          </div>
        ))}
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-1 rounded-sm"
          onClick={makeMeme}
        >
          make meme 👌
        </button>
      </div>
      <div>
        {loading && <div className="text-xl text-bold">loading...</div>}
        {res && (
          <img
            src={res.getUrl()}
            alt="generated"
            className="w-72 object-contain"
          />
        )}
        <div>
          {res &&
            debug &&
            res.getOplogList().map((o) => (
              <div className="border border-orange-600 flex">
                <img
                  src={o.getFile()}
                  className="w-24 object-contain"
                  alt={getOpName(o.getOp())}
                />
                <div className="flex flex-col">
                  <div className="flex flex-row">
                    <div className="text-green-700 pr-1">
                      {getOpName(o.getOp())} - step {o.getStep()}
                    </div>
                    <div className="text-blue-700 ">{o.getDuration()}</div>
                  </div>
                  <div className="text-orange-700 text-xs ">
                    {o.getArgsList().join(", ")}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
const getOpName = (op: OperationMap[keyof OperationMap]) => {
  switch (op) {
    case Operation.SHRINK:
      return "shrink";
    case Operation.COMPOSITE:
      return "composite";
    case Operation.DISTORT:
      return "distort";
    case Operation.RECT:
      return "rectangle (debug)";
    case Operation.TEXT:
      return "text";
    default:
      assertUnreachable(op);
  }
};

function assertUnreachable(x: never): never {
  throw new Error("Didn't expect to get here");
}
export default CreateMeme;
