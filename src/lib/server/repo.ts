import type { Note, Role, ShareLink, UserRecord } from "./types";
import { getSupabaseAdmin, getNotesBucketName } from "./supabase";
import { hashPassword, nowIso, randomToken } from "./crypto";

type NoteRow = {
  id: string;
  title: string;
  filename: string;
  storagePath: string;
  uploadedBy: string;
  createdAt: string;
};

export async function ensureSeedUsers() {
  const supabase = getSupabaseAdmin();

  const { count, error: countErr } = await supabase
    .from("users")
    .select("id", { count: "exact", head: true });

  if (countErr) throw countErr;
  if ((count ?? 0) > 0) return;

  const mk = (name: string, email: string, role: Role, password: string): UserRecord => {
    const { salt, hash } = hashPassword(password);
    return {
      id: email.toLowerCase(),
      name,
      email: email.toLowerCase(),
      role,
      passwordHash: hash,
      passwordSalt: salt,
    };
  };

  const seed = [mk("Lecturer", "lecturer@example.com", "LECTURER", "password")];

  const { error } = await supabase.from("users").insert(seed);
  if (error) throw error;
}

export async function createShareLink(noteId: string, createdBy: string, expiresAt: string | null) {
  const supabase = getSupabaseAdmin();

  const token = randomToken();
  const row: ShareLink = {
    token,
    noteId,
    createdBy,
    createdAt: nowIso(),
    expiresAt,
    revokedAt: null,
  };

  const { error } = await supabase.from("share_links").insert(row);
  if (error) throw error;

  return row;
}

export async function revokeShareLink(token: string) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("share_links")
    .update({ revokedAt: nowIso() })
    .eq("token", token);
  if (error) throw error;
}

export async function listShareLinksForNote(noteId: string): Promise<ShareLink[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("share_links")
    .select("token,noteId,createdBy,createdAt,expiresAt,revokedAt")
    .eq("noteId", noteId)
    .order("createdAt", { ascending: false });
  if (error) throw error;

  return (data ?? []) as ShareLink[];
}

export async function findValidShareLink(token: string): Promise<ShareLink | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("share_links")
    .select("token,noteId,createdBy,createdAt,expiresAt,revokedAt")
    .eq("token", token)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const link = data as ShareLink;
  if (link.revokedAt) return null;
  if (link.expiresAt && new Date(link.expiresAt).getTime() <= Date.now()) return null;
  return link;
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("users")
    .select("id,name,email,role,passwordHash,passwordSalt")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role as Role,
    passwordHash: data.passwordHash,
    passwordSalt: data.passwordSalt,
  };
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("users")
    .select("id,name,email,role,passwordHash,passwordSalt")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role as Role,
    passwordHash: data.passwordHash,
    passwordSalt: data.passwordSalt,
  };
}

export async function listNotes(): Promise<Note[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("notes")
    .select("id,title,filename,storagePath,uploadedBy,createdAt")
    .order("createdAt", { ascending: false });

  if (error) throw error;

  return ((data ?? []) as NoteRow[]).map((n) => ({
    id: n.id,
    title: n.title,
    filename: n.filename,
    storagePath: n.storagePath,
    uploadedBy: n.uploadedBy,
    createdAt: n.createdAt,
  }));
}

export async function insertNote(note: Note): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("notes").insert(note);
  if (error) throw error;
}

export async function findNoteById(id: string): Promise<Note | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("notes")
    .select("id,title,filename,storagePath,uploadedBy,createdAt")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    title: data.title,
    filename: data.filename,
    storagePath: data.storagePath,
    uploadedBy: data.uploadedBy,
    createdAt: data.createdAt,
  };
}

export async function insertAccessLog(params: {
  userId: string | null;
  noteId: string;
  shareToken?: string | null;
  timestamp: string;
}): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("access_logs").insert(params);
  if (error) throw error;
}

export async function uploadPdf(storagePath: string, bytes: Uint8Array): Promise<void> {
  const supabase = getSupabaseAdmin();
  const bucket = getNotesBucketName();

  const { error } = await supabase.storage.from(bucket).upload(storagePath, bytes, {
    contentType: "application/pdf",
    upsert: false,
  });

  if (error) throw error;
}

export async function downloadPdf(storagePath: string): Promise<Uint8Array> {
  const supabase = getSupabaseAdmin();
  const bucket = getNotesBucketName();

  const { data, error } = await supabase.storage.from(bucket).download(storagePath);
  if (error) throw error;

  const ab = await data.arrayBuffer();
  return new Uint8Array(ab);
}
