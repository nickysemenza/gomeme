import React, { useState, useEffect } from "react";

import { Template, CreateMemeParams, TargetInput } from "../proto/meme_pb";
import { getAPIClient } from "../util";
import { Button } from "react-bootstrap";

interface TemplateTargeForm {
  url: string;
}

interface Props {
  template: Template;
}
const CreateMeme: React.SFC<Props> = ({ template }) => {
  const [targets, setTargets] = useState<TemplateTargeForm[]>([]);

  useEffect(() => {
    const fetchDetails = () => {
      let t = template.getTargetsList();
      let targets: TemplateTargeForm[] = new Array(t.length).fill({
        url:
          "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&w=1000&q=80"
      });
      console.log({ targets });
      setTargets(targets);
    };
    fetchDetails();
  }, [template]);

  const makeMeme = () => {
    const req = new CreateMemeParams();
    req.setTemplatename(template.getName());
    req.setTargetinputsList(
      targets.map(t => {
        let input = new TargetInput();
        input.setUrl(t.url);
        return input;
      })
    );

    getAPIClient().createMeme(req, (err, reply) => {
      console.log(JSON.stringify({ err, reply }));
      if (reply) {
        console.log("created", reply.getUuid());
      }
    });
  };
  return (
    <div>
      <pre>{JSON.stringify(targets, null, 2)}</pre>
      <Button onClick={makeMeme}>
        <span role="img" aria-label="ok">
          👌
        </span>
      </Button>
    </div>
  );
};
export default CreateMeme;
