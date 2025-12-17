"use server";

import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { attemptLogin, requireRole, requireUser } from "./auth";
import { randomId, nowIso } from "./crypto";
import { readDb, UPLOADS_DIR, writeDb } from "./db";
import type { Note } from "./types";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect(`/login?error=${encodeURIComponent("Email and password are required.")}`);
  }

  const user = await attemptLogin(email, password);
  if (!user) {
    redirect(`/login?error=${encodeURIComponent("Invalid credentials.")}`);
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  const { logout } = await import("./auth");
  await logout();
  redirect("/login");
}

export async function listNotesAction() {
  await requireUser();
  const db = readDb();
  return db.notes.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function uploadNoteAction(formData: FormData) {
  const user = await requireRole("LECTURER");

  const title = String(formData.get("title") ?? "").trim();
  const file = formData.get("file");

  if (!title) redirect(`/dashboard?error=${encodeURIComponent("Title is required.")}`);
  if (!(file instanceof File)) redirect(`/dashboard?error=${encodeURIComponent("PDF file is required.")}`);
  if (file.type !== "application/pdf") {
    redirect(`/dashboard?error=${encodeURIComponent("Only PDF files are allowed.")}`);
  }

  const noteId = randomId("note");
  const storedFilename = `${noteId}.pdf`;
  const fullPath = path.join(UPLOADS_DIR, storedFilename);

  const buf = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(fullPath, buf);

  const db = readDb();
  const note: Note = {
    id: noteId,
    title,
    filename: storedFilename,
    uploadedBy: user.id,
    createdAt: nowIso(),
  };

  db.notes.push(note);
  writeDb(db);

  revalidatePath("/dashboard");
  redirect("/dashboard?uploaded=1");
}

export async function logNoteAccessAction(noteId: string) {
  const user = await requireUser();
  const db = readDb();

  db.accessLogs.push({ userId: user.id, noteId, timestamp: nowIso() });
  writeDb(db);

  return { ok: true };
}

export async function getNotePdfBase64Action(noteId: string) {
  const user = await requireUser();

  const db = readDb();
  const note = db.notes.find((n) => n.id === noteId);
  if (!note) return { error: "Not found" as const };

  // This logs every view attempt. You may want to debounce/deduplicate.
  db.accessLogs.push({ userId: user.id, noteId, timestamp: nowIso() });
  writeDb(db);

  const fullPath = path.join(UPLOADS_DIR, note.filename);
  if (!fs.existsSync(fullPath)) return { error: "File missing" as const };

  const bytes = fs.readFileSync(fullPath);
  return {
    ok: true as const,
    title: note.title,
    filename: note.filename,
    pdfBase64: bytes.toString("base64"),
    viewedAt: nowIso(),
    user: { name: user.name, email: user.email },
  };
}
