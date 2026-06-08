import { describe, it, expect } from "vitest";
import { fetchImageBytes } from "./meme-pipeline";

describe("fetchImageBytes data URL guards", () => {
  it("decodes a valid base64 data URL", async () => {
    const bytes = await fetchImageBytes("data:image/png;base64,AAAA");
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBe(3); // "AAAA" -> 3 bytes
  });

  it("rejects a data URL with no comma instead of calling atob(undefined)", async () => {
    await expect(fetchImageBytes("data:image/png;base64")).rejects.toThrow(/comma/);
  });

  it("rejects malformed base64 with a clear message", async () => {
    await expect(
      fetchImageBytes("data:image/png;base64,@@@not-base64@@@"),
    ).rejects.toThrow(/base64/i);
  });
});
