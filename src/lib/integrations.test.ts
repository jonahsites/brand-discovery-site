import { describe, expect, it } from "vitest";
import {
  instagramMediaToPost,
  tiktokVideoToPost,
  signState,
  verifyState,
  randomNonce,
  type StatePayload,
} from "./integrations";

const SECRET = "test-signing-secret-do-not-use-in-prod-0123456789";

describe("OAuth state HMAC", () => {
  const base: StatePayload = { brand: "form-and-void", provider: "instagram", ts: Date.now(), nonce: randomNonce() };

  it("round-trips a valid payload", async () => {
    const token = await signState(SECRET, base);
    expect(token.split(".")).toHaveLength(2);
    const decoded = await verifyState(SECRET, token);
    expect(decoded).not.toBeNull();
    expect(decoded!.brand).toBe(base.brand);
    expect(decoded!.provider).toBe("instagram");
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await signState(SECRET, base);
    const bad = await verifyState("other-secret", token);
    expect(bad).toBeNull();
  });

  it("rejects a tampered body", async () => {
    const token = await signState(SECRET, base);
    const [body, mac] = token.split(".");
    const flipped = body.slice(0, -1) + (body.at(-1) === "A" ? "B" : "A");
    const bad = await verifyState(SECRET, `${flipped}.${mac}`);
    expect(bad).toBeNull();
  });

  it("rejects a token past its max age", async () => {
    const stale: StatePayload = { ...base, ts: Date.now() - 20 * 60 * 1000 };
    const token = await signState(SECRET, stale);
    const bad = await verifyState(SECRET, token, 10 * 60 * 1000);
    expect(bad).toBeNull();
  });

  it("rejects malformed tokens", async () => {
    expect(await verifyState(SECRET, "")).toBeNull();
    expect(await verifyState(SECRET, "junk")).toBeNull();
    expect(await verifyState(SECRET, "a.b.c")).toBeNull();
  });
});

describe("instagramMediaToPost", () => {
  it("maps an IMAGE post: media_url → image, no video_url", () => {
    const row = instagramMediaToPost({
      id: "17841000000000001",
      caption: "Salt run 04",
      media_url: "https://cdn.ig/img.jpg",
      permalink: "https://instagram.com/p/abc",
      timestamp: "2026-08-15T10:00:00Z",
      media_type: "IMAGE",
    }, "form-and-void");
    expect(row).toMatchObject({
      brand_slug: "form-and-void",
      source: "instagram",
      external_id: "17841000000000001",
      external_url: "https://instagram.com/p/abc",
      image: "https://cdn.ig/img.jpg",
      video_url: null,
      caption: "Salt run 04",
      created_at: "2026-08-15T10:00:00Z",
      likes: 0,
    });
    expect(row.products).toEqual([]);
  });

  it("maps a VIDEO post: thumbnail_url → image, media_url → video_url", () => {
    const row = instagramMediaToPost({
      id: "v-1",
      media_url: "https://cdn.ig/movie.mp4",
      thumbnail_url: "https://cdn.ig/still.jpg",
      permalink: "https://instagram.com/reel/xyz",
      timestamp: "2026-09-01T00:00:00Z",
      media_type: "VIDEO",
    }, "onda-studio");
    expect(row.image).toBe("https://cdn.ig/still.jpg");
    expect(row.video_url).toBe("https://cdn.ig/movie.mp4");
    expect(row.external_url).toBe("https://instagram.com/reel/xyz");
  });

  it("falls back to now() when timestamp is missing", () => {
    const row = instagramMediaToPost({ id: "1" }, "b");
    expect(new Date(row.created_at).toString()).not.toBe("Invalid Date");
  });

  it("preserves an empty caption as empty string, not undefined", () => {
    const row = instagramMediaToPost({ id: "1" }, "b");
    expect(row.caption).toBe("");
  });
});

describe("tiktokVideoToPost", () => {
  it("maps a video with cover, share_url, embed_link", () => {
    const row = tiktokVideoToPost({
      id: "7350000000000000000",
      cover_image_url: "https://cdn.tt/cover.jpg",
      video_description: "the sailmaker's roll",
      create_time: 1_759_000_000,
      share_url: "https://www.tiktok.com/@fv/video/7350000000000000000",
      embed_link: "https://www.tiktok.com/embed/v2/7350000000000000000",
      duration: 42,
    }, "form-and-void");
    expect(row).toMatchObject({
      brand_slug: "form-and-void",
      source: "tiktok",
      external_id: "7350000000000000000",
      external_url: "https://www.tiktok.com/@fv/video/7350000000000000000",
      image: "https://cdn.tt/cover.jpg",
      video_url: "https://www.tiktok.com/embed/v2/7350000000000000000",
      caption: "the sailmaker's roll",
    });
    // create_time (unix seconds) → ISO
    expect(row.created_at).toBe(new Date(1_759_000_000 * 1000).toISOString());
  });

  it("handles missing create_time by falling back to now()", () => {
    const row = tiktokVideoToPost({ id: "x" }, "b");
    expect(new Date(row.created_at).toString()).not.toBe("Invalid Date");
    expect(row.external_url).toBeNull();
  });

  it("coerces numeric ids to strings", () => {
    // Some SDKs hand back int64 as a number; the DB column is text.
    const row = tiktokVideoToPost({ id: 123 as unknown as string }, "b");
    expect(row.external_id).toBe("123");
    expect(typeof row.external_id).toBe("string");
  });
});
