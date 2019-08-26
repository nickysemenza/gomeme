import React, { useState, useEffect } from "react";

import { GetTemplatesParams, Template } from "./proto/meme_pb";
import { getAPIClient, buildURL } from "./util";
import { Image, Table } from "react-bootstrap";
import CreateMeme from "./components/CreateMeme";

interface Props {}
const ProtoTest: React.SFC<Props> = () => {
  const [templates, setTemplates] = useState<Template[]>([]);

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
export default ProtoTest;
