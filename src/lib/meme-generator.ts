import {
  ImageMagick,
  initializeImageMagick,
  MagickColors,
  MagickFormat,
  Gravity,
  CompositeOperator,
  DistortMethod,
  VirtualPixelMethod,
  Point as MagickPoint,
  type IMagickImage,
} from "@imagemagick/magick-wasm";
import type { Point, Deltas, TargetInput } from "./schemas";
import { templates } from "./templates";

let initialized = false;

export async function initMagick(): Promise<void> {
  if (initialized) return;
  const wasmUrl = new URL(
    "@imagemagick/magick-wasm/magick.wasm",
    import.meta.url,
  );
  const response = await fetch(wasmUrl);
  const wasmBytes = new Uint8Array(await response.arrayBuffer());
  await initializeImageMagick(wasmBytes);
  initialized = true;
}

export interface OpLogEntry {
  step: number;
  op: "shrink" | "distort" | "composite" | "text" | "rectangle";
  duration: string;
  args: string[];
}

export interface MemeResult {
  imageUrl: string;
  opLog: OpLogEntry[];
}

async function fetchImageBytes(url: string): Promise<Uint8Array> {
  if (url.startsWith("data:")) {
    const base64 = url.split(",")[1];
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
  const response = await fetch(url);
  return new Uint8Array(await response.arrayBuffer());
}

function imageToDataUrl(image: IMagickImage): string {
  let dataUrl = "";
  image.write(MagickFormat.Png, (data) => {
    const base64 = btoa(
      Array.from(data, (b) => String.fromCharCode(b)).join(""),
    );
    dataUrl = `data:image/png;base64,${base64}`;
  });
  return dataUrl;
}

function imageToBytes(image: IMagickImage): Uint8Array {
  let result = new Uint8Array(0);
  image.write(MagickFormat.Png, (data) => {
    result = new Uint8Array(data);
  });
  return result;
}

/**
 * Renders text onto a transparent PNG using the Canvas API.
 * Auto-scales font size to fit the target dimensions, centered.
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

  // Auto-size: start large and shrink until it fits
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

  // Convert canvas to PNG bytes
  const dataUrl = canvas.toDataURL("image/png");
  const base64 = dataUrl.split(",")[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

interface ControlPointDelta {
  p1: Point;
  p2: Point;
}

interface DistortPayload {
  controlPoints: [
    ControlPointDelta,
    ControlPointDelta,
    ControlPointDelta,
    ControlPointDelta,
  ];
}

function buildBaseDistort(size: Point): DistortPayload {
  return {
    controlPoints: [
      { p1: { x: 0, y: 0 }, p2: { x: 0, y: 0 } },
      { p1: { x: 0, y: size.y }, p2: { x: 0, y: size.y } },
      { p1: { x: size.x, y: 0 }, p2: { x: size.x, y: 0 } },
      { p1: { x: size.x, y: size.y }, p2: { x: size.x, y: size.y } },
    ],
  };
}

function applyDeltas(payload: DistortPayload, deltas: Deltas): void {
  for (let i = 0; i < 4; i++) {
    payload.controlPoints[i].p2.x += deltas[i].x;
    payload.controlPoints[i].p2.y += deltas[i].y;
  }
}

function distortPayloadToArgs(payload: DistortPayload): number[] {
  const args: number[] = [];
  for (const cp of payload.controlPoints) {
    args.push(cp.p1.x, cp.p1.y, cp.p2.x, cp.p2.y);
  }
  return args;
}

function hasNonZeroDistortion(payload: DistortPayload): boolean {
  return payload.controlPoints.some(
    (cp) => cp.p1.x !== cp.p2.x || cp.p1.y !== cp.p2.y,
  );
}

export async function generateMeme(
  templateName: string,
  inputs: TargetInput[],
  _debug = false,
): Promise<MemeResult> {
  await initMagick();

  const template = templates[templateName];
  if (!template) throw new Error(`Template "${templateName}" not found`);
  if (inputs.length !== template.targets.length) {
    throw new Error(
      `Expected ${template.targets.length} inputs, got ${inputs.length}`,
    );
  }

  const opLog: OpLogEntry[] = [];
  let step = 0;

  // Load the template image
  const templateBytes = await fetchImageBytes(template.file);
  let resultBytes = templateBytes;

  for (let i = 0; i < template.targets.length; i++) {
    const target = template.targets[i];
    const input = inputs[i];

    let inputBytes: Uint8Array;

    if (input.kind === "text") {
      // Render text using Canvas API (magick-wasm has no fonts bundled)
      const t0 = performance.now();
      const color = input.color || "orange";
      inputBytes = renderTextToBytes(
        input.text,
        color,
        target.size.x,
        target.size.y,
      );
      const dur = `${(performance.now() - t0).toFixed(0)}ms`;
      opLog.push({
        step: step++,
        op: "text",
        duration: dur,
        args: [
          `text="${input.text}"`,
          `color=${color}`,
          `size=${target.size.x}x${target.size.y}`,
        ],
      });
    } else {
      // Load input image
      const rawBytes = await fetchImageBytes(input.url);

      // Shrink to target size
      const t0 = performance.now();
      inputBytes = ImageMagick.read(rawBytes, (img) => {
        const args = [
          `resize=${target.size.x}x${target.size.y}`,
          `stretch=${input.stretch}`,
        ];
        if (input.stretch) {
          img.resize(target.size.x, target.size.y);
        } else {
          // Resize preserving aspect ratio, then pad to exact size
          img.resize(target.size.x, target.size.y);
          img.backgroundColor = MagickColors.Transparent;
          img.extent(target.size.x, target.size.y, Gravity.Center);
        }
        const bytes = imageToBytes(img);
        const dur = `${(performance.now() - t0).toFixed(0)}ms`;
        opLog.push({ step: step++, op: "shrink", duration: dur, args });
        return bytes;
      });
    }

    // Distort (perspective transform)
    const distPayload = buildBaseDistort(target.size);
    if (target.deltas) {
      applyDeltas(distPayload, target.deltas);
    }

    if (target.deltas && hasNonZeroDistortion(distPayload)) {
      const t0 = performance.now();
      const distortArgs = distortPayloadToArgs(distPayload);
      inputBytes = ImageMagick.read(inputBytes, (img) => {
        img.virtualPixelMethod = VirtualPixelMethod.Transparent;
        img.distort(DistortMethod.Perspective, distortArgs);
        const bytes = imageToBytes(img);
        const dur = `${(performance.now() - t0).toFixed(0)}ms`;
        opLog.push({
          step: step++,
          op: "distort",
          duration: dur,
          args: distortArgs.map(String),
        });
        return bytes;
      });
    }

    // Composite onto result
    const t0 = performance.now();
    resultBytes = ImageMagick.read(resultBytes, (bg) => {
      return ImageMagick.read(inputBytes, (fg) => {
        const point = new MagickPoint(target.topLeft.x, target.topLeft.y);
        bg.composite(fg, CompositeOperator.Over, point);
        const bytes = imageToBytes(bg);
        const dur = `${(performance.now() - t0).toFixed(0)}ms`;
        opLog.push({
          step: step++,
          op: "composite",
          duration: dur,
          args: [`+${target.topLeft.x}+${target.topLeft.y}`],
        });
        return bytes;
      });
    });
  }

  // Convert final result to data URL
  const imageUrl = ImageMagick.read(resultBytes, (img) => imageToDataUrl(img));

  return { imageUrl, opLog };
}
