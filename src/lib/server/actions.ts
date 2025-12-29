"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { attemptLogin, requireRole, requireUser } from "./auth";
import { randomId, nowIso } from "./crypto";
import {
  downloadPdf,
  ensureSeedUsers,
  createShareLink,
  findValidShareLink,
  findNoteById,
  insertAccessLog,
  insertNote,
  listNotes,
  listShareLinksForNote,
  revokeShareLink,
  uploadPdf,
} from "./repo";
import type { Note } from "./types";

export async function loginAction(formData: FormData) {
  await ensureSeedUsers();

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

export async function createShareLinkAction(formData: FormData) {
  const user = await requireRole("LECTURER");

  const noteId = String(formData.get("noteId") ?? "");
  const expiryModeRaw = String(formData.get("expiryMode") ?? "").trim();
  const expiryMode = expiryModeRaw || "";

  const expiresInHoursRaw = String(formData.get("expiresInHours") ?? "");
  const expiresInHours = expiresInHoursRaw ? Number(expiresInHoursRaw) : NaN;
  const expiresInMonthsRaw = String(formData.get("expiresInMonths") ?? "");
  const expiresInMonths = expiresInMonthsRaw ? Number(expiresInMonthsRaw) : NaN;
  const expiresAtDateRaw = String(formData.get("expiresAtDate") ?? "").trim();
  const expiresAtDateTimeRaw = String(formData.get("expiresAtDateTime") ?? "").trim();

  if (!noteId) redirect(`/dashboard?error=${encodeURIComponent("Missing note id.")}`);

  let expiresAt: string | null = null;
  if (expiryMode === "hours") {
    if (!Number.isNaN(expiresInHours) && expiresInHours > 0) {
      expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString();
    }
  } else if (expiryMode === "months") {
    if (!Number.isNaN(expiresInMonths) && expiresInMonths > 0) {
      const date = new Date();
      date.setMonth(date.getMonth() + expiresInMonths);
      expiresAt = date.toISOString();
    }
  } else if (expiryMode === "datetime") {
    if (expiresAtDateTimeRaw) {
      const date = new Date(expiresAtDateTimeRaw);
      if (Number.isNaN(date.getTime())) {
        redirect(`/dashboard?error=${encodeURIComponent("Invalid expiry date/time.")}`);
      }
      expiresAt = date.toISOString();
    }
  } else {
    // Backwards compatibility for older form fields
    if (expiresAtDateRaw) {
      const date = new Date(`${expiresAtDateRaw}T23:59:59.999Z`);
      if (Number.isNaN(date.getTime())) {
        redirect(`/dashboard?error=${encodeURIComponent("Invalid expiry date.")}`);
      }
      expiresAt = date.toISOString();
    } else if (!Number.isNaN(expiresInMonths) && expiresInMonths > 0) {
      const date = new Date();
      date.setMonth(date.getMonth() + expiresInMonths);
      expiresAt = date.toISOString();
    }
  }

  const link = await createShareLink(noteId, user.id, expiresAt);
  revalidatePath("/dashboard");
  redirect(`/dashboard?share=${encodeURIComponent(link.token)}`);
}

export async function revokeShareLinkAction(formData: FormData) {
  await requireRole("LECTURER");
  const token = String(formData.get("token") ?? "");
  if (!token) redirect(`/dashboard?error=${encodeURIComponent("Missing token.")}`);
  await revokeShareLink(token);
  revalidatePath("/dashboard");
  redirect("/dashboard?revoked=1");
}

export async function listShareLinksForNoteAction(noteId: string) {
  await requireRole("LECTURER");
  return await listShareLinksForNote(noteId);
}

export async function getSharedPdfBase64Action(token: string) {
  const link = await findValidShareLink(token);
  if (!link) return { error: "Invalid or expired link" as const };

  const note = await findNoteById(link.noteId);
  if (!note) return { error: "Not found" as const };

  await insertAccessLog({
    userId: null,
    noteId: note.id,
    shareToken: token,
    timestamp: nowIso(),
  });

  const bytes = await downloadPdf(note.storagePath);
  return {
    ok: true as const,
    title: note.title,
    filename: note.filename,
    pdfBase64: Buffer.from(bytes).toString("base64"),
  };
}

export async function logoutAction() {
  const { logout } = await import("./auth");
  await logout();
  redirect("/login");
}

export async function listNotesAction() {
  await requireUser();
  return await listNotes();
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
  const storagePath = `${noteId}.pdf`;

  const bytes = new Uint8Array(await file.arrayBuffer());
  await uploadPdf(storagePath, bytes);

  const note: Note = {
    id: noteId,
    title,
    filename: storedFilename,
    storagePath,
    uploadedBy: user.id,
    createdAt: nowIso(),
  };

  await insertNote(note);

  revalidatePath("/dashboard");
  redirect("/dashboard?uploaded=1");
}

export async function logNoteAccessAction(noteId: string) {
  const user = await requireUser();
  await insertAccessLog({ userId: user.id, noteId, timestamp: nowIso() });

  return { ok: true };
}

export async function getNotePdfBase64Action(noteId: string) {
  const user = await requireUser();

  const note = await findNoteById(noteId);
  if (!note) return { error: "Not found" as const };

  // This logs every view attempt. You may want to debounce/deduplicate.
  await insertAccessLog({ userId: user.id, noteId, timestamp: nowIso() });

  const bytes = await downloadPdf(note.storagePath);
  return {
    ok: true as const,
    title: note.title,
    filename: note.filename,
    pdfBase64: Buffer.from(bytes).toString("base64"),
    viewedAt: nowIso(),
    user: { name: user.name, email: user.email },
  };
}
