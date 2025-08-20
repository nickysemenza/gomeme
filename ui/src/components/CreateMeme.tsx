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
    <div className="space-y-6">
      {/* Input Controls */}
      <div className="space-y-4">
        {targets.map((t, x) => (
          <div key={x} className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Input {x + 1}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                t.kind === 'text' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {t.kind === 'text' ? '✏️ Text' : '🖼️ Image'}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="relative">
                <input
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white"
                  placeholder={t.kind === 'text' ? 'Enter your text...' : 'Enter image URL or paste base64 data...'}
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
              
              <div className="flex flex-wrap gap-4 items-start">
                {t.text && (
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                    <label className="block text-xs font-medium text-gray-600 mb-2">Text Color</label>
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
                    <div className="mt-2 text-xs text-gray-500 font-mono text-center">
                      {t.text.getColor()}
                    </div>
                  </div>
                )}
                {t.image && (
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                    <label className="block text-xs font-medium text-gray-600 mb-2">Preview</label>
                    <img 
                      src={t.image.getUrl()} 
                      alt="Preview" 
                      className="h-32 w-32 object-cover rounded-lg border border-gray-200" 
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Generate Button */}
      <div className="flex justify-center pt-4">
        <button
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center space-x-2"
          onClick={makeMeme}
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Creating Magic...</span>
            </>
          ) : (
            <>
              <span>🎭</span>
              <span>Generate Meme</span>
            </>
          )}
        </button>
      </div>
      
      {/* Result Display */}
      {(res || loading) && (
        <div className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
            <h3 className="text-white font-bold text-lg">✨ Your Generated Meme</h3>
          </div>
          
          <div className="p-6">
            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-lg font-semibold text-gray-600">Creating your meme...</p>
                <p className="text-sm text-gray-500">This may take a few moments</p>
              </div>
            )}
            
            {res && (
              <div className="text-center">
                <img
                  src={res.getUrl()}
                  alt="Generated meme"
                  className="max-w-full h-auto rounded-lg shadow-md mx-auto mb-4"
                  style={{ maxHeight: '400px' }}
                />
                <p className="text-sm text-gray-500">
                  🎉 Meme created successfully! Right-click to save.
                </p>
              </div>
            )}
          </div>
          
          {/* Debug Information */}
          {res && debug && res.getOplogList().length > 0 && (
            <div className="border-t border-gray-200 bg-gray-50 p-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">🔍 Debug Operations:</h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {res.getOplogList().map((o, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-start space-x-4">
                      <img
                        src={o.getFile()}
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                        alt={getOpName(o.getOp())}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                            {getOpName(o.getOp())}
                          </span>
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                            Step {o.getStep()}
                          </span>
                          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-mono">
                            {o.getDuration()}
                          </span>
                        </div>
                        {o.getArgsList().length > 0 && (
                          <p className="text-xs text-gray-600 break-words">
                            <span className="font-medium">Args:</span> {o.getArgsList().join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
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
