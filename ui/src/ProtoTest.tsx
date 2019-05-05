import * as React from "react";

import { GetTemplatesParams, Template } from "./proto/meme_pb";
import { getAPIClient } from "./util";
interface State {
  templates: Template[];
}
interface Props {}
class ProtoTest extends React.Component<Props, State> {
  state: State = {
    templates: []
  };
  componentDidMount = () => {
    const req = new GetTemplatesParams();
    getAPIClient().getTemplates(req, (err, reply) => {
      console.log({ err, reply });
      if (reply) {
        const list = reply.getTemplatesList();
        this.setState({ templates: list });
        // for (let x in list) {
        // this.SetSt
        // console.log(list[x].toObject());
        // }
      }
    });
  };
  render = () => {
    const { templates } = this.state;
    return (
      <div>
        {templates.map(t => (
          <div>
            <h1>{t.getName()}</h1>
            <p>{t.getUrl()}</p>
          </div>
        ))}
      </div>
    );
  };
}
export default ProtoTest;
