/** Sharing a design from a static host.
 *
 *  There is no server to store anything, so a design travels in the URL. It
 *  goes in the **hash**, not a query or a path segment, for three reasons: the
 *  hash is never sent to the server, so a visitor's design never reaches
 *  GitHub's access logs or a `Referer` header; it has no server-side length
 *  limit; and it does not fragment the CDN cache for `/studio`.
 *
 *  Curated designs use `/studio/c/:catalogId` instead — short, crawlable, and
 *  cacheable. This path is for designs a visitor has altered.
 *
 *  These links are permanent and nothing can migrate them server-side, so the
 *  encoding carries `specVersion` and the decoder refuses politely rather than
 *  guessing when it does not recognise one. Never repurpose a field's meaning:
 *  bump the version and add a migration. */

import { FacadeSpecSchema, SPEC_VERSION, type FacadeSpec } from "./schema";
import { canonical } from "./framing";

/** Above this, a link stops being something you can paste into a message. */
const MAX_CODE = 8000;

const toBase64Url = (bytes: Uint8Array): string => {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const fromBase64Url = (s: string): Uint8Array => {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
  return out;
};

async function deflate(bytes: Uint8Array): Promise<Uint8Array | null> {
  if (typeof CompressionStream === "undefined") return null;
  const cs = new CompressionStream("deflate-raw");
  const buf = await new Response(new Blob([bytes as BlobPart]).stream().pipeThrough(cs)).arrayBuffer();
  return new Uint8Array(buf);
}

async function inflate(bytes: Uint8Array): Promise<Uint8Array | null> {
  if (typeof DecompressionStream === "undefined") return null;
  const ds = new DecompressionStream("deflate-raw");
  const buf = await new Response(new Blob([bytes as BlobPart]).stream().pipeThrough(ds)).arrayBuffer();
  return new Uint8Array(buf);
}

export type EncodeResult =
  | { ok: true; code: string }
  | { ok: false; reason: "too-large"; size: number };

/** `v1.` for deflated, `v1u.` for uncompressed — so a browser without
 *  CompressionStream still produces a link the rest can read. */
export async function encodeSpec(spec: FacadeSpec): Promise<EncodeResult> {
  const json = canonical(spec);
  const bytes = new TextEncoder().encode(json);
  const packed = await deflate(bytes);
  const code = packed
    ? "v" + SPEC_VERSION + "." + toBase64Url(packed)
    : "v" + SPEC_VERSION + "u." + toBase64Url(bytes);
  if (code.length > MAX_CODE) return { ok: false, reason: "too-large", size: code.length };
  return { ok: true, code };
}

export type DecodeResult =
  | { ok: true; spec: FacadeSpec }
  | { ok: false; reason: "malformed" | "unsupported-version" | "invalid"; detail?: string };

export async function decodeSpec(code: string): Promise<DecodeResult> {
  const m = /^v(\d+)(u?)\.(.+)$/.exec(code.trim());
  if (!m) return { ok: false, reason: "malformed" };

  const version = Number(m[1]);
  if (version !== SPEC_VERSION) {
    // A design made by a different build of the studio. Saying so is more use
    // than silently rendering something that is not what was shared.
    return { ok: false, reason: "unsupported-version", detail: "spec version " + version };
  }

  let bytes: Uint8Array;
  try {
    bytes = fromBase64Url(m[3]);
    if (!m[2]) {
      const raw = await inflate(bytes);
      if (!raw) return { ok: false, reason: "malformed", detail: "this browser cannot decompress the link" };
      bytes = raw;
    }
  } catch {
    return { ok: false, reason: "malformed" };
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return { ok: false, reason: "malformed" };
  }

  const parsed = FacadeSpecSchema.safeParse(parsedJson);
  if (!parsed.success) {
    return {
      ok: false,
      reason: "invalid",
      detail: parsed.error.issues.slice(0, 2).map((i) => i.path.join(".") + " " + i.message).join("; "),
    };
  }
  return { ok: true, spec: parsed.data };
}

export const HASH_PREFIX = "#d=";

export const specHash = (code: string) => HASH_PREFIX + code;

export function readSpecHash(hash: string): string | null {
  return hash.startsWith(HASH_PREFIX) ? hash.slice(HASH_PREFIX.length) : null;
}
