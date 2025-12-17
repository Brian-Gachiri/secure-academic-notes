import fs from "fs";
import path from "path";
import { hashPassword } from "./crypto";
import type { Database, Role, UserRecord } from "./types";

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_PATH = path.join(DATA_DIR, "db.json");
export const UPLOADS_DIR = path.join(DATA_DIR, "uploads");

function ensureDirs() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

function seedUsers(): UserRecord[] {
  const seed = (name: string, email: string, role: Role, password: string) => {
    const { salt, hash } = hashPassword(password);
    return {
      id: email.toLowerCase(),
      name,
      email: email.toLowerCase(),
      role,
      passwordSalt: salt,
      passwordHash: hash,
    } satisfies UserRecord;
  };

  // Prototype credentials.
  // Replace with real user provisioning + password reset flows.
  return [
    seed("Lecturer", "lecturer@example.com", "LECTURER", "password"),
    seed("Student", "student@example.com", "STUDENT", "password"),
  ];
}

export function readDb(): Database {
  ensureDirs();

  if (!fs.existsSync(DB_PATH)) {
    const initial: Database = { users: seedUsers(), notes: [], accessLogs: [] };
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2), "utf8");
    return initial;
  }

  const raw = fs.readFileSync(DB_PATH, "utf8");
  return JSON.parse(raw) as Database;
}

export function writeDb(db: Database) {
  ensureDirs();
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}
