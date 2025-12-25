import crypto from "crypto";

export function hashPassword(password: string, salt?: string) {
  const actualSalt = salt ?? crypto.randomBytes(16).toString("hex");

  // Prototype only.
  // In production, use a well-reviewed password hashing library (e.g. argon2/bcrypt)
  // with proper tuning and account lockouts.
  const derivedKey = crypto
    .pbkdf2Sync(password, actualSalt, 150_000, 32, "sha256")
    .toString("hex");

  return { salt: actualSalt, hash: derivedKey };
}

export function timingSafeEqualHex(a: string, b: string) {
  const aBuf = Buffer.from(a, "hex");
  const bBuf = Buffer.from(b, "hex");

  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export function randomId(prefix: string) {
  return `${prefix}_${crypto.randomBytes(16).toString("hex")}`;
}

export function randomToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function nowIso() {
  return new Date().toISOString();
}
