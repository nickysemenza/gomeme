import type { Template, TargetInput } from "./schemas";
import {
  buildBaseDistort,
  applyDeltas,
  distortPayloadToArgs,
  hasNonZeroDistortion,
} from "./geometry";
import type {
  RenderRequest,
  RenderLayer,
  RenderOp,
  RenderOutput,
  OpLogEntry,
} from "./meme-pipeline";
import type { WorkerRequest, WorkerResponse } from "./meme.worker";

export type { OpLogEntry } from "./meme-pipeline";

export interface MemeResult {
  imageUrl: string;
  opLog: OpLogEntry[];
}

/**
 * Renders text onto a transparent PNG using the Canvas API (main thread only —
 * the WASM build ships no fonts). Auto-scales font size to fit, centered.
 */
function renderTextToBytes(
  text: string,
  color: string,
  width: number,
  height: number,
): Uint8Array {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  const fontFamily = "Impact, Arial Black, sans-serif";
  let fontSize = Math.min(width, height);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  do {
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    const metrics = ctx.measureText(text);
    if (metrics.width <= width * 0.9 && fontSize <= height * 0.9) break;
    fontSize -= 2;
  } while (fontSize > 10);

  ctx.fillStyle = color;
  ctx.fillText(text, width / 2, height / 2, width * 0.95);

  const dataUrl = canvas.toDataURL("image/png");
  const base64 = dataUrl.split(",")[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/** Chunked base64 so large images don't blow the call stack. */
function bytesToDataUrl(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return `data:image/png;base64,${btoa(binary)}`;
}

/** Translates a template + user inputs into a declarative render request. */
export function buildRenderRequest(
  template: Template,
  inputs: TargetInput[],
): RenderRequest {
  const layers: RenderLayer[] = template.targets.map((target, i) => {
    const input = inputs[i];
    const ops: RenderOp[] = [];
    let source: RenderLayer["source"];

    if (input.kind === "text") {
      // Text is rasterized at exactly the target size, so no resize op.
      source = {
        kind: "bytes",
        bytes: renderTextToBytes(
          input.text,
          input.color || "orange",
          target.size.x,
          target.size.y,
        ),
      };
    } else {
      source = { kind: "url", url: input.url };
      ops.push({ op: "resize", size: target.size, stretch: input.stretch });
    }

    if (target.deltas) {
      const payload = buildBaseDistort(target.size);
      applyDeltas(payload, target.deltas);
      if (hasNonZeroDistortion(payload)) {
        ops.push({ op: "distort", args: distortPayloadToArgs(payload) });
      }
    }

    ops.push({ op: "composite", at: target.topLeft });
    return { label: target.friendlyName, source, ops };
  });

  return { templateUrl: template.file, layers };
}

// --- Worker dispatch -------------------------------------------------------

let worker: Worker | null = null;
let nextId = 0;
const pending = new Map<
  number,
  { resolve: (o: RenderOutput) => void; reject: (e: Error) => void }
>();

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL("./meme.worker.ts", import.meta.url), {
      type: "module",
    });
    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const entry = pending.get(e.data.id);
      if (!entry) return;
      pending.delete(e.data.id);
      if (e.data.ok) entry.resolve(e.data.output);
      else entry.reject(new Error(e.data.error));
    };
    worker.onerror = (e) => {
      // Fail all in-flight requests if the worker itself crashes.
      for (const { reject } of pending.values()) {
        reject(new Error(e.message || "Render worker error"));
      }
      pending.clear();
    };
  }
  return worker;
}

function renderViaWorker(request: RenderRequest): Promise<RenderOutput> {
  return new Promise((resolve, reject) => {
    const id = nextId++;
    pending.set(id, { resolve, reject });
    const message: WorkerRequest = { id, request };
    // Transfer any pre-rendered text byte buffers to the worker.
    const transfer = request.layers
      .map((l) => (l.source.kind === "bytes" ? l.source.bytes.buffer : null))
      .filter((b): b is ArrayBuffer => b !== null);
    getWorker().postMessage(message, transfer);
  });
}

/**
 * Renders a meme by compositing user inputs onto a template's targets. Heavy
 * WASM work runs in a Web Worker; if Workers are unavailable (e.g. tests) it
 * falls back to rendering on the calling thread.
 */
export async function generateMeme(
  template: Template,
  inputs: TargetInput[],
): Promise<MemeResult> {
  if (inputs.length !== template.targets.length) {
    throw new Error(
      `Expected ${template.targets.length} inputs, got ${inputs.length}`,
    );
  }

  const request = buildRenderRequest(template, inputs);

  let output: RenderOutput;
  if (typeof Worker !== "undefined") {
    output = await renderViaWorker(request);
  } else {
    const { renderMeme } = await import("./meme-pipeline");
    output = await renderMeme(request);
  }

  return { imageUrl: bytesToDataUrl(output.bytes), opLog: output.opLog };
}
