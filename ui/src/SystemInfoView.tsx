import React, { useState, useEffect } from "react";

import { InfoParams, SystemInfo } from "./proto/meme_pb";
import { getAPIClient } from "./util";
import ReactJson from "react-json-view";

const SystemInfoView: React.FC = () => {
  const [info, setInfo] = useState<SystemInfo>();

  useEffect(() => {
    // const fetchInfo = () => {
    getAPIClient().getInfo(new InfoParams(), (err, reply) => {
      console.log({ err, reply });
      setInfo(reply || undefined);
    });
    // };
    // fetchInfo();
  }, []);

  return (
    <div>
      {info && <ReactJson src={info.toObject(false)} theme="monokai" />}
    </div>
  );
};
export default SystemInfoView;
