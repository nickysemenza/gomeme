import React, { useState, useEffect } from "react";

import {
  Template,
  CreateMemeParams,
  TargetInput,
  Meme,
} from "../proto/meme_pb";
import { getAPIClient } from "../util";

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
        value:
          "data:image/jpeg;base64,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",
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
        console.log("created", reply.getUuid(), reply.getUrl());
        onCreate(reply);
      }
    });
  };
  return (
    <div className="flex">
      <pre className="w-8">{JSON.stringify(targets, null, 2)}</pre>
      <button onClick={makeMeme}>
        <span role="img" aria-label="ok">
          👌
        </span>
      </button>
    </div>
  );
};
export default CreateMeme;
