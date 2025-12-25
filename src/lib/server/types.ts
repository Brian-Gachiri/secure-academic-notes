export type Role = "LECTURER" | "STUDENT";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type UserRecord = User & {
  passwordHash: string;
  passwordSalt: string;
};

export type Note = {
  id: string;
  title: string;
  filename: string;
  storagePath: string;
  uploadedBy: string;
  createdAt: string;
};

export type AccessLog = {
  userId: string | null;
  noteId: string;
  shareToken?: string | null;
  timestamp: string;
};

export type ShareLink = {
  token: string;
  noteId: string;
  createdBy: string;
  createdAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
};

export type Database = {
  users: UserRecord[];
  notes: Note[];
  accessLogs: AccessLog[];
};
