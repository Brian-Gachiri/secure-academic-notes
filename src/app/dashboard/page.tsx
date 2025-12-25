import Link from "next/link";
import { requireUser } from "@/lib/server/auth";
import { createShareLinkAction, listNotesAction, logoutAction, revokeShareLinkAction, uploadNoteAction } from "@/lib/server/actions";
import { listShareLinksForNote } from "@/lib/server/repo";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; uploaded?: string; share?: string; revoked?: string }>;
}) {
  const user = await requireUser();
  const notes = await listNotesAction();

  const noteLinks =
    user.role === "LECTURER"
      ? await Promise.all(
          notes.map(async (n) => ({ noteId: n.id, links: await listShareLinksForNote(n.id) }))
        )
      : [];

  const sp = searchParams ? await searchParams : undefined;
  const error = sp?.error;
  const uploaded = sp?.uploaded;
  const share = sp?.share;
  const revoked = sp?.revoked;

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

        {share ? (
          <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            Share link created: <span className="font-mono">/share/{share}</span>
          </div>
        ) : null}

        {revoked ? (
          <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            Share link revoked.
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

                      {user.role === "LECTURER" ? (
                        <div className="mt-3 space-y-2">
                          <form action={createShareLinkAction} className="flex flex-wrap items-center gap-2">
                            <input type="hidden" name="noteId" value={n.id} />
                            <input
                              name="expiresInHours"
                              placeholder="Expires (hrs)"
                              className="w-32 rounded-lg border px-2 py-2 text-sm"
                            />
                            <button
                              type="submit"
                              className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
                            >
                              Create share link
                            </button>
                          </form>

                          <div className="space-y-1">
                            {(noteLinks.find((x) => x.noteId === n.id)?.links ?? []).slice(0, 3).map((l) => (
                              <div key={l.token} className="flex flex-wrap items-center gap-2 text-xs">
                                <span className="font-mono">/share/{l.token}</span>
                                <span className="text-zinc-500">
                                  {l.revokedAt
                                    ? "revoked"
                                    : l.expiresAt
                                      ? `expires ${new Date(l.expiresAt).toLocaleString()}`
                                      : "no expiry"}
                                </span>
                                {!l.revokedAt ? (
                                  <form action={revokeShareLinkAction}>
                                    <input type="hidden" name="token" value={l.token} />
                                    <button
                                      type="submit"
                                      className="rounded-md border bg-white px-2 py-1 text-xs hover:bg-zinc-50"
                                    >
                                      Revoke
                                    </button>
                                  </form>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/notes/${n.id}`}
                        className="rounded-lg border bg-white px-3 py-2 text-sm hover:bg-zinc-50"
                      >
                        View
                      </Link>
                    </div>
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
