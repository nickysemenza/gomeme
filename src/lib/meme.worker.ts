/// <reference lib="webworker" />
import { renderMeme, type RenderRequest, type RenderOutput } from "./meme-pipeline";

export interface WorkerRequest {
  id: number;
  request: RenderRequest;
}

export type WorkerResponse =
  | { id: number; ok: true; output: RenderOutput }
  | { id: number; ok: false; error: string };

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  const { id, request } = e.data;
  try {
    const output = await renderMeme(request);
    const response: WorkerResponse = { id, ok: true, output };
    // Transfer the rendered PNG buffer back to avoid a copy.
    (self as DedicatedWorkerGlobalScope).postMessage(response, [
      output.bytes.buffer,
    ]);
  } catch (err) {
    const response: WorkerResponse = {
      id,
      ok: false,
      error: err instanceof Error ? err.message : "Render failed",
    };
    (self as DedicatedWorkerGlobalScope).postMessage(response);
  }
};
