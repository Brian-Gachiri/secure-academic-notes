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
  uploadedBy: string;
  createdAt: string;
};

export type AccessLog = {
  userId: string;
  noteId: string;
  timestamp: string;
};

export type Database = {
  users: UserRecord[];
  notes: Note[];
  accessLogs: AccessLog[];
};
