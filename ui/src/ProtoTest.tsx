import * as React from "react";

import { GetTemplatesParams, Template } from "./proto/meme_pb";
import { getAPIClient, buildURL } from "./util";
import { Image, Table } from "react-bootstrap";
import CreateMeme from "./components/CreateMeme";
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
      }
    });
  };

  render = () => {
    const { templates } = this.state;
    return (
      <div>
        <Table>
          <tbody>
            {templates.map(t => (
              <tr key={t.getName()}>
                <td />
                <td>{t.getName()}</td>
                <td>
                  <Image width="200px" src={buildURL(t.getUrl())} />
                </td>
                <td>
                  <CreateMeme template={t} />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    );
  };
}
export default ProtoTest;
