import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "an_session";
const MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

function getSecret() {
  // Prototype only.
  // In production, use a strong secret from env + rotation.
  return process.env.SESSION_SECRET ?? "dev-secret-change-me";
}

type SessionPayload = {
  userId: string;
  iat: number;
};

function base64urlEncode(buf: Buffer) {
  return buf
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function base64urlDecode(input: string) {
  const padLength = (4 - (input.length % 4)) % 4;
  const padded = input.replaceAll("-", "+").replaceAll("_", "/") + "=".repeat(padLength);
  return Buffer.from(padded, "base64");
}

function sign(data: string) {
  return base64urlEncode(crypto.createHmac("sha256", getSecret()).update(data).digest());
}

export async function setSessionCookie(userId: string) {
  const payload: SessionPayload = { userId, iat: Math.floor(Date.now() / 1000) };
  const body = base64urlEncode(Buffer.from(JSON.stringify(payload), "utf8"));
  const sig = sign(body);

  const cookieStore = await cookies();

  cookieStore.set({
    name: COOKIE_NAME,
    value: `${body}.${sig}`,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();

  cookieStore.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return null;

  const [body, sig] = raw.split(".");
  if (!body || !sig) return null;

  const expected = sign(body);
  if (expected.length !== sig.length) return null;

  // Timing-safe compare for prototype.
  const a = Buffer.from(expected);
  const b = Buffer.from(sig);
  if (a.length !== b.length) return null;
  if (!crypto.timingSafeEqual(a, b)) return null;

  try {
    const decoded = JSON.parse(base64urlDecode(body).toString("utf8")) as SessionPayload;
    if (!decoded.userId) return null;

    const now = Math.floor(Date.now() / 1000);
    if (now - decoded.iat > MAX_AGE_SECONDS) return null;

    return decoded.userId;
  } catch {
    return null;
  }
}
