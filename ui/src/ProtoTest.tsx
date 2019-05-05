import * as React from "react";

import { GetTemplatesParams, Template } from "./proto/meme_pb";
import { getAPIClient, buildURL } from "./util";
import { Button, Image, Table } from "react-bootstrap";
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
        <Table>
          {templates.map(t => (
            <tr>
              <td>
                <Button>hi</Button>
              </td>
              <td>{t.getName()}</td>
              <td>
                <Image width="200px" src={buildURL(t.getUrl())} />
              </td>
            </tr>
          ))}
        </Table>
      </div>
    );
  };
}
export default ProtoTest;
