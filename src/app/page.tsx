import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <header className="border-b border-white/10">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
              <span className="text-sm font-semibold">AN</span>
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight">Academic Notes</div>
              <div className="text-xs text-zinc-400">Secure note distribution for classes</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-zinc-950 hover:bg-zinc-200"
            >
              Lecturer login
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 [background:radial-gradient(70%_55%_at_50%_0%,rgba(56,189,248,0.20)_0%,rgba(0,0,0,0)_60%)]" />
          <div className="mx-auto w-full max-w-6xl px-6 pb-16 pt-14">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Server Actions only • Supabase Postgres + Storage
            </div>

            <h1 className="mt-6 max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              Share academic notes securely, without exposing PDFs.
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-base text-zinc-300 sm:text-lg">
              Upload course PDFs once, then distribute them using expiring, revocable links.
              Students view through a hardened canvas-based viewer with per-view watermarking.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-zinc-950 hover:bg-zinc-200"
              >
                Get started
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-white hover:bg-white/10"
              >
                View demo credentials
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="text-sm font-semibold">Expiring links</div>
                <div className="mt-2 text-sm text-zinc-300">
                  Generate time-limited share tokens per note. Revoke anytime.
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="text-sm font-semibold">No direct file URLs</div>
                <div className="mt-2 text-sm text-zinc-300">
                  PDFs are streamed server-side; students never receive a Storage URL.
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="text-sm font-semibold">Viewer hardening</div>
                <div className="mt-2 text-sm text-zinc-300">
                  Canvas rendering + UI restrictions to discourage copying and downloading.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10">
          <div className="mx-auto w-full max-w-6xl px-6 py-14">
            <div className="grid gap-10 md:grid-cols-2 md:items-start">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Built for teaching workflows</h2>
                <p className="mt-3 text-sm text-zinc-300">
                  Keep distribution simple for students, while retaining control as a lecturer.
                </p>
              </div>
              <div className="grid gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="text-sm font-semibold">Upload once</div>
                  <div className="mt-2 text-sm text-zinc-300">
                    PDFs are stored in Supabase Storage; metadata lives in Postgres.
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="text-sm font-semibold">Share per chapter / course</div>
                  <div className="mt-2 text-sm text-zinc-300">
                    Generate a link for a specific note and send it to your class.
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="text-sm font-semibold">Audit access</div>
                  <div className="mt-2 text-sm text-zinc-300">
                    Guest views are logged to support basic monitoring.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10">
          <div className="mx-auto w-full max-w-6xl px-6 py-14">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-1">
                <h2 className="text-2xl font-semibold tracking-tight">Security model</h2>
                <p className="mt-3 text-sm text-zinc-300">
                  This is prototype-level hardening: it discourages casual copying, but cannot fully prevent extraction.
                </p>
              </div>
              <div className="md:col-span-2">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="text-sm font-semibold">Revocation</div>
                    <div className="mt-2 text-sm text-zinc-300">
                      Turn off a link instantly if it spreads beyond your audience.
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="text-sm font-semibold">Expiry</div>
                    <div className="mt-2 text-sm text-zinc-300">
                      Limit access to a defined time window (e.g. 48 hours after lecture).
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="text-sm font-semibold">Watermarking</div>
                    <div className="mt-2 text-sm text-zinc-300">
                      Overlays discourage redistribution and support attribution.
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="text-sm font-semibold">Server-only access</div>
                    <div className="mt-2 text-sm text-zinc-300">
                      The app fetches Storage objects on the server using admin credentials.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10">
          <div className="mx-auto w-full max-w-6xl px-6 py-14">
            <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">Ready to publish notes for your class?</h2>
                  <p className="mt-2 text-sm text-zinc-300">Sign in as a lecturer to upload PDFs and create share links.</p>
                </div>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-zinc-950 hover:bg-zinc-200"
                >
                  Go to dashboard
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto w-full max-w-6xl px-6 py-8 text-xs text-zinc-400">
          Academic Notes Prototype • Next.js App Router • Supabase
        </div>
      </footer>
    </div>
  );
}
