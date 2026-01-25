import { loginAction } from "@/lib/server/actions";
import { getCurrentUser } from "@/lib/server/auth";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  const sp = searchParams ? await searchParams : undefined;
  const error = sp?.error;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Academic Notes</h1>

        <form action={loginAction} className="mt-8 space-y-4 rounded-xl border bg-white p-6 shadow-sm">
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="w-full rounded-lg border px-3 py-2 text-sm"
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="w-full rounded-lg border px-3 py-2 text-sm"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Sign in
          </button>

          {/*
            In a real app you would:
            - Rate limit / lock out repeated attempts
            - Add CSRF protection
            - Add MFA, password reset, etc.
          */}
        </form>

      </div>
    </div>
  );
}
