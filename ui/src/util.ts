import { APIClient } from "./proto/meme_pb_service";

export const getAPIURL = () => "http://localhost:3333";
export const buildURL = (path: string) => getAPIURL() + "/" + path;

export const getAPIClient = () => {
  return new APIClient(getAPIURL());
};
