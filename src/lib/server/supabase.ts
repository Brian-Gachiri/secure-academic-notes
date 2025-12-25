import { createClient } from "@supabase/supabase-js";

function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export function getSupabaseAdmin() {
  // Server-side only.
  const url = requireEnv("SUPABASE_URL");
  const supabaseKey = requireEnv("SUPABASE_KEY")


  return createClient(url, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export function getNotesBucketName() {
  return process.env.SUPABASE_NOTES_BUCKET ?? "notes";
}
