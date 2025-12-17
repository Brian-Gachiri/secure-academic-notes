import Link from "next/link";
import { requireUser } from "@/lib/server/auth";
import { listNotesAction, logoutAction, uploadNoteAction } from "@/lib/server/actions";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; uploaded?: string }>;
}) {
  const user = await requireUser();
  const notes = await listNotesAction();

  const sp = searchParams ? await searchParams : undefined;
  const error = sp?.error;
  const uploaded = sp?.uploaded;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
            <p className="mt-1 text-sm text-zinc-600">
              Signed in as <span className="font-medium">{user.name}</span> ({user.email})
              <span className="ml-2 rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium">
                {user.role}
              </span>
            </p>
          </div>
          <form action={logoutAction}>
            <button className="rounded-lg border bg-white px-3 py-2 text-sm hover:bg-zinc-50" type="submit">
              Logout
            </button>
          </form>
        </div>

        {error ? (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {uploaded ? (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            Uploaded.
          </div>
        ) : null}

        {user.role === "LECTURER" ? (
          <div className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold">Upload PDF notes</h2>
            <form action={uploadNoteAction} className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-1">
                <label className="text-sm font-medium" htmlFor="title">
                  Title
                </label>
                <input
                  id="title"
                  name="title"
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                  placeholder="Week 3 - Linear Algebra"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-sm font-medium" htmlFor="file">
                  PDF
                </label>
                <input
                  id="file"
                  name="file"
                  type="file"
                  accept="application/pdf"
                  className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm"
                  required
                />
              </div>

              <div className="sm:col-span-3">
                <button
                  type="submit"
                  className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
                >
                  Upload
                </button>
              </div>
            </form>

            {/*
              In a real app you would:
              - Store files in S3/GCS with access controls
              - Virus scan uploads
              - Validate PDFs more thoroughly
              - Extract text for search
            */}
          </div>
        ) : null}

        <div className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Notes</h2>
            <span className="text-xs text-zinc-500">{notes.length} total</span>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border bg-white">
            {notes.length === 0 ? (
              <div className="p-6 text-sm text-zinc-600">No notes uploaded yet.</div>
            ) : (
              <ul className="divide-y">
                {notes.map((n) => (
                  <li key={n.id} className="flex items-center justify-between gap-3 p-4">
                    <div>
                      <div className="text-sm font-medium">{n.title}</div>
                      <div className="mt-0.5 text-xs text-zinc-500">Uploaded {new Date(n.createdAt).toLocaleString()}</div>
                    </div>
                    <Link
                      href={`/notes/${n.id}`}
                      className="rounded-lg border bg-white px-3 py-2 text-sm hover:bg-zinc-50"
                    >
                      View
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
