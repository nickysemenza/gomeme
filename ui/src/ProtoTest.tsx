import * as React from "react";

import { APIClient } from "./proto/meme_pb_service";
import { Ping } from "./proto/meme_pb";
class ProtoTest extends React.Component {
  componentWillMount = () => {
    const client = new APIClient("http://localhost:3333");
    const req = new Ping();
    req.setMessage("hellooo");
    client.getPing(req, (err, reply) => {
      console.log({ err, reply });
      if (reply) {
        console.log(reply.getMessage());
      }
    });
  };
  render = () => <h1>hi</h1>;
}
export default ProtoTest;
