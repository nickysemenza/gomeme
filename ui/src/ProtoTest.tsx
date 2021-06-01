import React, { useState, useEffect } from "react";

import { GetTemplatesParams, Template } from "./proto/meme_pb";
import { getAPIClient, buildURL } from "./util";
import CreateMeme from "./components/CreateMeme";

interface Props {}
const ProtoTest: React.SFC<Props> = () => {
  const [templates, setTemplates] = useState<Template[]>([]);

  const [resURL, setResURL] = useState("");

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
      <div>
        {" "}
        {resURL && <img src={resURL} alt="generated" className="w-80" />}
      </div>
      <table className="table-fixed border border-collapse border-green-800">
        <thead>
          <tr>
            <th className="w-1/4 border border-green-60">name</th>
            <th className="w-1/4 border border-green-60">template</th>
            <th className="w-1/2 border border-green-60">input</th>
          </tr>
        </thead>
        <tbody>
          {templates.map((t) => (
            <tr key={t.getName()}>
              <td className="border border-green-60">{t.getName()}</td>
              <td className="border border-green-60">
                <img
                  className="w-100"
                  style={{ width: "200px" }}
                  src={buildURL(t.getUrl())}
                  alt="generated"
                />
              </td>
              <td className="w-80 border border-green-60">
                <CreateMeme
                  template={t}
                  onCreate={(meme) => {
                    setResURL(meme.getUrl());
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default ProtoTest;
