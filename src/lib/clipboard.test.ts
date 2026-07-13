import { describe, it, expect } from "vitest";
import { imageFileFromClipboard, readFileAsDataUrl } from "./clipboard";

// The vitest environment here is "node" (see vitest.config.ts) and neither
// jsdom nor happy-dom is an installed dependency (they're only optional
// peers of vitest per pnpm-lock.yaml). Node itself does not implement
// DataTransfer/ClipboardEvent, so rather than constructing real DOM objects
// we build minimal mocks shaped like the bits of the Clipboard API that
// imageFileFromClipboard actually reads: `clipboardData.items`, where each
// item exposes `kind`, `type`, and `getAsFile()`.
function makeClipboardEvent(
  items: Array<{ kind: string; type: string; file: File | null }> | undefined,
): ClipboardEvent {
  if (items === undefined) {
    return { clipboardData: null } as unknown as ClipboardEvent;
  }
  return {
    clipboardData: {
      items: items.map((item) => ({
        kind: item.kind,
        type: item.type,
        getAsFile: () => item.file,
      })),
    },
  } as unknown as ClipboardEvent;
}

describe("imageFileFromClipboard", () => {
  it("returns the image File when clipboard data contains one", () => {
    const file = new File(["fake-image-bytes"], "pasted.png", {
      type: "image/png",
    });
    const event = makeClipboardEvent([
      { kind: "file", type: "image/png", file },
    ]);

    expect(imageFileFromClipboard(event)).toBe(file);
  });

  it("returns null for text-only clipboard data", () => {
    const event = makeClipboardEvent([
      { kind: "string", type: "text/plain", file: null },
    ]);

    expect(imageFileFromClipboard(event)).toBeNull();
  });

  it("returns null when clipboardData is missing", () => {
    const event = makeClipboardEvent(undefined);

    expect(imageFileFromClipboard(event)).toBeNull();
  });

  it("skips non-image file items and returns a later image item", () => {
    const textFile = new File(["hello"], "notes.txt", { type: "text/plain" });
    const imageFile = new File(["fake-image-bytes"], "pasted.jpg", {
      type: "image/jpeg",
    });
    const event = makeClipboardEvent([
      { kind: "file", type: "text/plain", file: textFile },
      { kind: "file", type: "image/jpeg", file: imageFile },
    ]);

    expect(imageFileFromClipboard(event)).toBe(imageFile);
  });
});

describe("readFileAsDataUrl", () => {
  // Skipped: this exercises FileReader, which is a DOM API not present in
  // the "node" vitest environment configured in vitest.config.ts. Neither
  // jsdom nor happy-dom is an installed devDependency (pnpm-lock.yaml only
  // lists them as vitest's *optional* peer dependencies, and neither
  // package is present in node_modules), so switching this file to a
  // DOM-backed test environment is not available here. Add jsdom as a
  // devDependency to enable the test below.
  it.skip("resolves to a data: URL for a small File", async () => {
    const file = new File(["hello"], "hello.txt", { type: "text/plain" });
    const result = await readFileAsDataUrl(file);
    expect(result).toMatch(/^data:text\/plain;base64,/);
  });
});
