import Link from "next/link";
import { requireUser } from "@/lib/server/auth";
import { createShareLinkAction, deleteNoteAction, listNotesAction, logoutAction, revokeShareLinkAction, uploadNoteAction } from "@/lib/server/actions";
import { listShareLinksForNote } from "@/lib/server/repo";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { ShareLinkCreateFormClient } from "@/components/ShareLinkCreateFormClient";
import { DeleteNoteButton } from "@/components/DeleteNoteButton";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; uploaded?: string; share?: string; revoked?: string; deleted?: string }>;
}) {
  const user = await requireUser();
  const notes = await listNotesAction();

  const appUrl = (process.env.APP_URL ?? "").replace(/\/$/, "");

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
  const deleted = sp?.deleted;

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
            Share link created: <span className="font-mono">{appUrl ? `${appUrl}/share/${share}` : `/share/${share}`}</span>
          </div>
        ) : null}

        {revoked ? (
          <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            Share link revoked.
          </div>
        ) : null}

        {deleted ? (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            Note deleted.
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
                      <div className="text-sm font-bold">{n.title}</div>
                      <div className="mt-0.5 text-xs text-zinc-500">Uploaded {new Date(n.createdAt).toLocaleString()}</div>

                      {user.role === "LECTURER" ? (
                        <div className="mt-3 space-y-2">
                          <ShareLinkCreateFormClient noteId={n.id} action={createShareLinkAction} />

                          <div className="space-y-1">
                            {(noteLinks.find((x) => x.noteId === n.id)?.links ?? []).slice(0, 3).map((l) => (
                              <div
                                key={l.token}
                                className="flex flex-col gap-2 rounded-lg border border-zinc-300 bg-zinc-100 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                              >
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="max-w-[520px] truncate font-mono text-xs text-zinc-900">
                                      {appUrl ? `${appUrl}/share/${l.token}` : `/share/${l.token}`}
                                    </span>
                                  </div>
                                  <div className="mt-1 flex flex-wrap items-center gap-2">
                                    {l.revokedAt ? (
                                      <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-[11px] font-medium text-zinc-700">
                                        Revoked
                                      </span>
                                    ) : l.expiresAt ? (
                                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">
                                        Expires {new Date(l.expiresAt).toLocaleString()}
                                      </span>
                                    ) : (
                                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                                        No expiry
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                  <CopyLinkButton
                                    url={appUrl ? `${appUrl}/share/${l.token}` : `/share/${l.token}`}
                                    className="rounded-md px-3 py-1.5 text-xs font-semibold border cursor-pointer hover:bg-zinc-300"
                                  />

                                  {!l.revokedAt ? (
                                    <form action={revokeShareLinkAction}>
                                      <input type="hidden" name="token" value={l.token} />
                                      <button
                                        type="submit"
                                        className="rounded-md border border-red-500 bg-red-50 px-3 py-1.5 text-xs cursor-pointer font-semibold text-red-500 hover:bg-red-200"
                                      >
                                        Revoke
                                      </button>
                                    </form>
                                  ) : (
                                    <button
                                      type="button"
                                      disabled
                                      className="rounded-md bg-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-600"
                                    >
                                      Revoked
                                    </button>
                                  )}
                                </div>
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

                      {user.role === "LECTURER" ? <DeleteNoteButton action={deleteNoteAction} noteId={n.id} /> : null}
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
