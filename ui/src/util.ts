export const getAPIURL = () =>
  window.location.port.includes("300")
    ? "http://localhost:3333"
    : window.location.protocol + "//" + window.location.host;

export const buildURL = (path: string) => getAPIURL() + "/" + path;
