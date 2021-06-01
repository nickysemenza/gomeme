import { APIClient } from "./proto/meme_pb_service";

export const getAPIURL = () =>
  window.location.port === "3000"
    ? "http://localhost:3333"
    : window.location.protocol + "//" + window.location.host;
export const buildURL = (path: string) => getAPIURL() + "/" + path;

export const getAPIClient = () => {
  return new APIClient(getAPIURL());
};
