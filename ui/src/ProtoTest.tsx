import React, { useState, useEffect } from "react";

import { GetTemplatesParams, Template } from "./proto/meme_pb";
import { getAPIClient, buildURL } from "./util";
import CreateMeme from "./components/CreateMeme";
import ReactJson from "react-json-view";

const ProtoTest: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);

  const [debug, setDebug] = useState(false);

  useEffect(() => {
    const fetchMemes = () => {
      const req = new GetTemplatesParams();
      getAPIClient().getTemplates(req, (err, reply) => {
        console.log({ err, reply });
        if (reply) {
          const list = reply.getTemplatesList();
          setTemplates(list);
        }
      });
    };
    fetchMemes();
  }, []);

  return (
    <div>
      <div className="flex flex-col">
        <div className="w-1/2">
          <h1 className="font-bold text-lg text-gray-600">gomeme</h1>
          <p>
            gomeme is a meme generator, power by ImageMagick. It holds a list of
            templates, with a schema specifying how to shove images into the
            memes.
          </p>
          <div>
            Inputs can be one of
            <ul className="list-disc pl-8">
              <li>image URL (jpg, png)</li>
              <li>base64 image data</li>
              <li>text</li>
            </ul>
          </div>
        </div>
        <div>
          <button
            className="bg-red-300 hover:bg-red-700 text-white font-bold py-1 px-1 rounded-sm "
            onClick={() => {
              setDebug(!debug);
            }}
          >
            {debug ? "disable" : "enable"} debug
          </button>
        </div>
      </div>
      <table className="table-fixed border border-collapse border-slate-800 w-full">
        <thead>
          <tr>
            <th className="w-1/6 border border-slate-600">name</th>
            <th className="w-1/2 border border-slate-600">input</th>
            {debug && <th className="w-1/4 border border-slate-600">debug</th>}
          </tr>
        </thead>
        <tbody>
          {templates.map((t) => (
            <tr key={t.getName()}>
              <td className="border border-slate-600">
                <p className="text-xl text-center">{t.getName()}</p>
                <img
                  className="w-50"
                  // style={{ width: "200px" }}
                  src={buildURL(t.getUrl())}
                  alt="generated"
                />
              </td>
              <td className="border border-slate-600">
                <CreateMeme
                  template={t}
                  onCreate={(meme) => {}}
                  debug={debug}
                />
              </td>

              {debug && (
                <td className="p-2 border border-slate-600">
                  <ReactJson src={t.toObject(false)} theme="monokai" />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default ProtoTest;
