import { createConnectTransport } from "@connectrpc/connect-web";
import { createPromiseClient } from "@connectrpc/connect";
import { MemeService } from "./gen/meme_connect";

// Create the transport - uses Connect protocol over HTTP
export const transport = createConnectTransport({
  baseUrl: process.env.REACT_APP_API_URL || "http://localhost:3333",
});

// Create a typed client for direct usage
export const memeClient = createPromiseClient(MemeService, transport);
