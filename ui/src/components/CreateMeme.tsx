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
  kind: TargetInput.KindMap[keyof TargetInput.KindMap];
}

interface Props {
  template: Template;
  onCreate: (meme: Meme) => void;
  debug: boolean;
}
const CreateMeme: React.FC<Props> = ({ template, onCreate, debug }) => {
  const [targets, setTargets] = useState<TargetForm[]>([]);
  const [res, setRes] = useState<Meme>();
  useEffect(() => {
    const fetchDetails = () => {
      let t = template.getTargetsList();
      let targets: TargetForm[] = new Array(t.length).fill({
        value:
          "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&w=1000&q=80",
        kind: TargetInput.Kind.URL,
      });

      targets[0] = {
        kind: TargetInput.Kind.B64,
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
        input.setKind(t.kind);
        input.setValue(t.value);

        return input;
      })
    );
    req.setDebug(debug);

    console.log({ req });
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
          <div key={x} className="w-64">
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
                        $set: v.target.value.startsWith("http")
                          ? TargetInput.Kind.URL
                          : v.target.value.startsWith("data:")
                          ? TargetInput.Kind.B64
                          : TargetInput.Kind.TEXT,
                      },
                    },
                  })
                );
              }}
            ></input>
            {t.kind !== TargetInput.Kind.TEXT && <img src={t.value} alt="" />}
            {/* {t.kind === "b64" && <img src={t.value} />} */}
          </div>
        ))}
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-1 rounded "
          onClick={makeMeme}
        >
          make meme 👌
        </button>
      </div>
      <div>
        {res && <img src={res.getUrl()} alt="generated" className="w-72" />}
      </div>
    </div>
  );
};
export default CreateMeme;
