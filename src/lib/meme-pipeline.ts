import {
  ImageMagick,
  initializeImageMagick,
  MagickColors,
  MagickFormat,
  Gravity,
  MagickGeometry,
  CompositeOperator,
  DistortMethod,
  VirtualPixelMethod,
  Point as MagickPoint,
} from "@imagemagick/magick-wasm";
import type { Point } from "./schemas";

/**
 * The WASM-side render pipeline. This module is DOM-free so it can run inside a
 * Web Worker. The meme render is expressed as a small declarative op list per
 * layer (resize / distort / composite); the executor folds those ops over a
 * single live image, decoding the template once and each input once and
 * encoding only at the very end. Text is rasterized on the main thread (canvas)
 * and arrives here as `bytes`, so this module needs no fonts.
 */

export type RenderOp =
  | { op: "resize"; size: Point; stretch: boolean }
  | { op: "distort"; args: number[] }
  | { op: "composite"; at: Point };

export type LayerSource =
  | { kind: "url"; url: string }
  | { kind: "bytes"; bytes: Uint8Array };

export interface RenderLayer {
  label: string;
  source: LayerSource;
  ops: RenderOp[];
}

export interface RenderRequest {
  templateUrl: string;
  layers: RenderLayer[];
}

export interface OpLogEntry {
  step: number;
  op: RenderOp["op"] | "load";
  duration: string;
  args: string[];
}

export interface RenderOutput {
  bytes: Uint8Array;
  opLog: OpLogEntry[];
}

let initPromise: Promise<void> | null = null;

export function initMagick(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      const wasmUrl = new URL(
        "@imagemagick/magick-wasm/magick.wasm",
        import.meta.url,
      );
      const response = await fetch(wasmUrl);
      const wasmBytes = new Uint8Array(await response.arrayBuffer());
      await initializeImageMagick(wasmBytes);
    })();
  }
  return initPromise;
}

// Guardrails for fetching/decoding arbitrary user-supplied images before they
// reach the WASM decoder, which otherwise surfaces opaque low-level errors.
const MAX_IMAGE_BYTES = 25 * 1024 * 1024; // 25 MB
const FETCH_TIMEOUT_MS = 15_000;
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];

function decodeBase64(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Per-worker cache of fetched bytes keyed by URL, so repeated generates of the
// same template (and reused source images) skip the network and decode.
const fetchCache = new Map<string, Uint8Array>();

export async function fetchImageBytes(url: string): Promise<Uint8Array> {
  if (url.startsWith("data:")) {
    const comma = url.indexOf(",");
    if (comma === -1) throw new Error("Malformed data URL: missing comma");
    try {
      const bytes = decodeBase64(url.slice(comma + 1));
      if (bytes.length > MAX_IMAGE_BYTES) throw new Error("Image exceeds 25 MB limit");
      return bytes;
    } catch (e) {
      if (e instanceof Error && e.message.includes("25 MB")) throw e;
      throw new Error("Malformed data URL: could not decode base64");
    }
  }

  const cached = fetchCache.get(url);
  if (cached) return cached;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    const contentType = (response.headers.get("content-type") || "")
      .split(";")[0]
      .trim()
      .toLowerCase();
    if (contentType && !ALLOWED_IMAGE_TYPES.includes(contentType)) {
      throw new Error(`Unsupported image type: ${contentType}`);
    }
    const buffer = await response.arrayBuffer();
    if (buffer.byteLength > MAX_IMAGE_BYTES) throw new Error("Image exceeds 25 MB limit");
    const bytes = new Uint8Array(buffer);
    fetchCache.set(url, bytes);
    return bytes;
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      throw new Error("Image fetch timed out");
    }
    throw e;
  } finally {
    clearTimeout(timeout);
  }
}

function now(): number {
  // performance is available on both window and worker global scopes.
  return performance.now();
}

/**
 * Executes a render request: decode the template once, fold each layer's ops
 * over its decoded source image, composite onto the live template, encode once.
 */
export async function renderMeme(request: RenderRequest): Promise<RenderOutput> {
  await initMagick();

  const opLog: OpLogEntry[] = [];
  let step = 0;

  // Resolve every layer's source bytes up front (network is independent per layer).
  const sources = await Promise.all(
    request.layers.map(async (layer) => {
      if (layer.source.kind === "bytes") return layer.source.bytes;
      const t0 = now();
      const bytes = await fetchImageBytes(layer.source.url);
      opLog.push({
        step: step++,
        op: "load",
        duration: `${(now() - t0).toFixed(0)}ms`,
        args: [layer.label, layer.source.url],
      });
      return bytes;
    }),
  );

  const templateBytes = await fetchImageBytes(request.templateUrl);

  let output = new Uint8Array(0);
  ImageMagick.read(templateBytes, (bg) => {
    request.layers.forEach((layer, i) => {
      ImageMagick.read(sources[i], (fg) => {
        for (const op of layer.ops) {
          const t0 = now();
          if (op.op === "resize") {
            if (op.stretch) {
              const geometry = new MagickGeometry(op.size.x, op.size.y);
              geometry.ignoreAspectRatio = true;
              fg.resize(geometry);
            } else {
              fg.resize(op.size.x, op.size.y);
              fg.backgroundColor = MagickColors.Transparent;
              fg.extent(op.size.x, op.size.y, Gravity.Center);
            }
            opLog.push({
              step: step++,
              op: "resize",
              duration: `${(now() - t0).toFixed(0)}ms`,
              args: [layer.label, `${op.size.x}x${op.size.y}`, `stretch=${op.stretch}`],
            });
          } else if (op.op === "distort") {
            fg.virtualPixelMethod = VirtualPixelMethod.Transparent;
            fg.distort(DistortMethod.Perspective, op.args);
            opLog.push({
              step: step++,
              op: "distort",
              duration: `${(now() - t0).toFixed(0)}ms`,
              args: [layer.label, ...op.args.map(String)],
            });
          } else if (op.op === "composite") {
            bg.composite(fg, CompositeOperator.Over, new MagickPoint(op.at.x, op.at.y));
            opLog.push({
              step: step++,
              op: "composite",
              duration: `${(now() - t0).toFixed(0)}ms`,
              args: [layer.label, `+${op.at.x}+${op.at.y}`],
            });
          }
        }
      });
    });

    bg.write(MagickFormat.Png, (data) => {
      output = new Uint8Array(data);
    });
  });

  return { bytes: output, opLog };
}
