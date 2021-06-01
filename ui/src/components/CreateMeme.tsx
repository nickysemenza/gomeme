import React, { useState, useEffect } from "react";

import {
  Template,
  CreateMemeParams,
  TargetInput,
  Meme,
} from "../proto/meme_pb";
import { getAPIClient } from "../util";
import update from "immutability-helper";
import { b64 } from "./b64placeholder";
interface TargetForm {
  value: string;
  kind: "url" | "b64";
}

interface Props {
  template: Template;
  onCreate: (meme: Meme) => void;
}
const CreateMeme: React.FC<Props> = ({ template, onCreate }) => {
  const [targets, setTargets] = useState<TargetForm[]>([]);
  const [res, setRes] = useState<Meme>();
  useEffect(() => {
    const fetchDetails = () => {
      let t = template.getTargetsList();
      let targets: TargetForm[] = new Array(t.length).fill({
        value:
          "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&w=1000&q=80",
        kind: "url",
      });

      targets[0] = {
        kind: "b64",
        value: b64,
      };
      console.log({ targets });
      setTargets(targets);
    };
    fetchDetails();
  }, [template]);

  const makeMeme = () => {
    const req = new CreateMemeParams();
    req.setTemplatename(template.getName());
    req.setTargetinputsList(
      targets.map((t) => {
        let input = new TargetInput();
        input.setKind(
          t.kind === "url" ? TargetInput.Kind.URL : TargetInput.Kind.B64
        );
        input.setValue(t.value);

        return input;
      })
    );

    getAPIClient().createMeme(req, (err, reply) => {
      console.log(JSON.stringify({ err, reply }));
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
          <div>
            <h2 className="font-bold">target {x + 1}</h2>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={t.value}
              onChange={(v) => {
                setTargets(
                  update(targets, {
                    [x]: {
                      value: { $set: v.target.value },
                      kind: {
                        $set: v.target.value.startsWith("http") ? "url" : "b64",
                      },
                    },
                  })
                );
              }}
            ></input>
            <img src={t.value} alt="" />
            {/* {t.kind === "b64" && <img src={t.value} />} */}
          </div>
        ))}
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-40 h-20"
          onClick={makeMeme}
        >
          make meme 👌
        </button>
      </div>
      <div>
        {res && <img src={res.getUrl()} alt="generated" className="w-200" />}
      </div>
    </div>
  );
};
export default CreateMeme;
