import { redirect } from "next/navigation";
import { hashPassword, timingSafeEqualHex } from "./crypto";
import { clearSessionCookie, getSessionUserId, setSessionCookie } from "./session";
import { findUserByEmail, findUserById } from "./repo";
import type { Role, User } from "./types";

export async function getCurrentUser(): Promise<User | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const user = await findUserById(userId);
  if (!user) return null;

  const { passwordHash: _ph, passwordSalt: _ps, ...safe } = user;
  void _ph;
  void _ps;
  return safe;
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(role: Role): Promise<User> {
  const user = await requireUser();
  if (user.role !== role) redirect("/dashboard");
  return user;
}

export async function attemptLogin(email: string, password: string): Promise<User | null> {
  const user = await findUserByEmail(email);
  if (!user) return null;

  const { hash } = hashPassword(password, user.passwordSalt);
  if (!timingSafeEqualHex(hash, user.passwordHash)) return null;

  await setSessionCookie(user.id);

  const { passwordHash: _ph, passwordSalt: _ps, ...safe } = user;
  void _ph;
  void _ps;
  return safe;
}

export async function logout() {
  await clearSessionCookie();
}
