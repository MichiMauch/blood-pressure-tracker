const COOKIE_NAME = "bp-auth";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const encoder = new TextEncoder();

async function getKey(): Promise<CryptoKey> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET env var is required");
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function signToken(payload: string): Promise<string> {
  const key = await getKey();
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return `${btoa(payload)}.${bufToHex(sig)}`;
}

export async function verifyToken(token: string): Promise<string | null> {
  const dotIndex = token.indexOf(".");
  if (dotIndex === -1) return null;

  const payloadB64 = token.slice(0, dotIndex);

  let payload: string;
  try {
    payload = atob(payloadB64);
  } catch {
    return null;
  }

  const provided = token.slice(dotIndex + 1);
  if (provided.length === 0) return null;

  const key = await getKey();
  const isValid = await crypto.subtle.verify(
    "HMAC",
    key,
    hexToBytes(provided) as Uint8Array<ArrayBuffer>,
    encoder.encode(payload)
  );

  return isValid ? payload : null;
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export async function checkCredentials(
  username: string,
  password: string
): Promise<boolean> {
  const envUser = process.env.AUTH_USERNAME;
  const envPass = process.env.AUTH_PASSWORD;
  if (!envUser || !envPass) return false;

  // Constant-time comparison via HMAC: if HMAC(key, a) === HMAC(key, b) then a === b
  const key = await getKey();
  const [sigU, sigEU] = await Promise.all([
    crypto.subtle.sign("HMAC", key, encoder.encode(username)),
    crypto.subtle.sign("HMAC", key, encoder.encode(envUser)),
  ]);
  const [sigP, sigEP] = await Promise.all([
    crypto.subtle.sign("HMAC", key, encoder.encode(password)),
    crypto.subtle.sign("HMAC", key, encoder.encode(envPass)),
  ]);

  const userMatch = bufToHex(sigU) === bufToHex(sigEU);
  const passMatch = bufToHex(sigP) === bufToHex(sigEP);
  return userMatch && passMatch;
}

export { COOKIE_NAME, MAX_AGE };
