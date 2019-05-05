import { APIClient } from "./proto/meme_pb_service";

export const getAPIClient = () => {
  return new APIClient("http://localhost:3333");
};
