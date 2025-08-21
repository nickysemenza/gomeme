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
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Input Form */}
      <div className="flex-1">
        <div className="space-y-6">
          {targets.map((t, x) => (
            <div key={x} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                  {x + 1}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Input {x + 1}
                </h3>
                <div className="ml-auto">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    t.kind === 'image' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {t.kind === 'image' ? '🖼️ Image' : '📝 Text'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.kind === 'image' ? 'Image URL or Base64' : 'Text Content'}
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder={t.kind === 'image' ? 'https://... or data:image/...' : 'Enter text here...'}
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
                  />
                </div>

                {/* Content Preview/Editor */}
                <div>
                  {t.text && (
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Text Color
                      </label>
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-lg border-2 border-gray-200 overflow-hidden">
                          <div 
                            className="w-full h-full"
                            style={{ backgroundColor: t.text.getColor() }}
                          />
                        </div>
                        <div className="flex-1">
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
                        </div>
                      </div>
                      {t.text.getText() && (
                        <div className="mt-3 p-3 bg-white rounded-lg border">
                          <p className="text-sm text-gray-600 mb-1">Preview:</p>
                          <span 
                            className="font-bold text-lg"
                            style={{ color: t.text.getColor() }}
                          >
                            {t.text.getText()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {t.image && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image Preview
                      </label>
                      <div className="w-full max-w-xs mx-auto bg-white rounded-lg border p-2">
                        <img 
                          src={t.image.getUrl()} 
                          alt="Input preview" 
                          className="w-full h-40 object-contain rounded"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          <button
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
            onClick={makeMeme}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating Meme...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <span>🎨</span>
                <span>Generate Meme</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Result Area */}
      <div className="flex-1 lg:max-w-md">
        <div className="sticky top-8">
          {/* Generated Meme */}
          {res && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">🎭</span>
                Generated Meme
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <img
                  src={res.getUrl()}
                  alt="Generated meme"
                  className="w-full max-w-sm mx-auto rounded-lg shadow-sm"
                />
              </div>
            </div>
          )}

          {/* Debug Information */}
          {res && debug && res.getOplogList().length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">🔧</span>
                Processing Steps
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {res.getOplogList().map((o, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <img
                          src={o.getFile()}
                          className="w-16 h-16 object-cover rounded-lg"
                          alt={getOpName(o.getOp())}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Step {o.getStep()}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {getOpName(o.getOp())}
                          </span>
                          <span className="text-xs text-gray-500">
                            {o.getDuration()}
                          </span>
                        </div>
                        {o.getArgsList().length > 0 && (
                          <p className="text-xs text-gray-600 font-mono bg-white px-2 py-1 rounded">
                            {o.getArgsList().join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && !res && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Creating Your Meme</h3>
              <p className="text-gray-600">This may take a few seconds...</p>
            </div>
          )}

          {/* Empty State */}
          {!res && !loading && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Create</h3>
              <p className="text-gray-600">Fill in the inputs above and click "Generate Meme"</p>
            </div>
          )}
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
