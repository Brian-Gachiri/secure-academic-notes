"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { getNotePdfBase64Action } from "@/lib/server/actions";
import { ViewerHardening } from "@/components/ViewerHardening";

export function NoteViewerClient({
  noteId,
  watermarkLabel,
  fetchPdf,
  backHref,
  backLabel,
}: {
  noteId: string;
  watermarkLabel: string;
  fetchPdf?: (noteId: string) => Promise<any>;
  backHref?: string;
  backLabel?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pdfDocRef = useRef<unknown>(null);

  const [status, setStatus] = useState<
    | { type: "idle" }
    | { type: "loading" }
    | { type: "error"; message: string }
    | {
        type: "ready";
        title: string;
        watermark: string;
      }
  >({ type: "idle" });

  const [pageCount, setPageCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.5);
  const [fitWidth, setFitWidth] = useState<boolean>(true);

  const createdAt = useMemo(() => new Date().toLocaleString(), []);

  useEffect(() => {
    let active = true;

    (async () => {
      setStatus({ type: "loading" });
      const loader = fetchPdf ?? getNotePdfBase64Action;
      const res = await loader(noteId);

      if (!active) return;

      if (!("ok" in res) || !res.ok) {
        setStatus({ type: "error", message: "Unable to load note." });
        return;
      }

      const bytes = Uint8Array.from(atob(res.pdfBase64), (c) => c.charCodeAt(0));

      // Render via pdf.js into <canvas> to discourage selection/download.
      // In a real product, consider server-side watermarking and DRM-like solutions.
      const pdfjs: any = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
      ).toString();

      const loadingTask = pdfjs.getDocument({ data: bytes });
      const pdf = await loadingTask.promise;
      pdfDocRef.current = pdf;

      setPageCount(pdf.numPages);
      setPage(1);
      setScale(1.5);
      setFitWidth(true);

      const watermark = `${watermarkLabel} • ${createdAt}`;

      setStatus({ type: "ready", title: res.title, watermark });
    })();

    return () => {
      active = false;
      pdfDocRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (status.type !== "ready") return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const pdf = pdfDocRef.current as any;
      if (!pdf) return;

      // Render current page
      const pdfPage = await pdf.getPage(page);
      if (cancelled) return;

      const baseViewport = pdfPage.getViewport({ scale: 1 });
      const container = containerRef.current;
      const containerWidth = container?.clientWidth ?? 0;
      const fitScale =
        fitWidth && containerWidth > 0 ? Math.max(0.25, Math.min(4, containerWidth / baseViewport.width)) : null;
      const effectiveScale = fitScale ?? scale;

      const viewport = pdfPage.getViewport({ scale: effectiveScale });
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);

      await pdfPage.render({ canvasContext: ctx, viewport }).promise;
    })();

    return () => {
      cancelled = true;
    };
  }, [page, status, scale, fitWidth]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (status.type !== "ready") return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setPage((p) => Math.max(1, p - 1));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setPage((p) => Math.min(pageCount || p + 1, p + 1));
      } else if ((e.ctrlKey || e.metaKey) && (e.key === "+" || e.key === "=")) {
        e.preventDefault();
        setFitWidth(false);
        setScale((s) => Math.min(4, Math.round((s + 0.1) * 10) / 10));
      } else if ((e.ctrlKey || e.metaKey) && e.key === "-") {
        e.preventDefault();
        setFitWidth(false);
        setScale((s) => Math.max(0.25, Math.round((s - 0.1) * 10) / 10));
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "0") {
        e.preventDefault();
        setFitWidth(false);
        setScale(1.5);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [status.type, pageCount]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <ViewerHardening />
      <div className="mx-auto w-full max-w-6xl px-6 py-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold">{status.type === "ready" ? status.title : "Loading…"}</h1>
          </div>
          {backHref ? (
            <Link href={backHref} className="rounded-lg bg-zinc-800 px-3 py-2 text-sm hover:bg-zinc-700">
              {backLabel ?? "Back"}
            </Link>
          ) : null}
        </div>

        {status.type === "ready" ? (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm">
            <div className="text-zinc-300">
              Page <span className="font-medium">{page}</span> / {pageCount || "…"}
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={fitWidth ? "fit" : String(Math.round(scale * 100))}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "fit") {
                    setFitWidth(true);
                    return;
                  }
                  const pct = Number(v);
                  if (!Number.isFinite(pct)) return;
                  setFitWidth(false);
                  setScale(Math.max(0.25, Math.min(4, pct / 100)));
                }}
                className="rounded-lg bg-zinc-800 px-3 py-2 text-sm hover:bg-zinc-700"
              >
                <option value="fit">Fit width</option>
                <option value="50">50%</option>
                <option value="75">75%</option>
                <option value="100">100%</option>
                <option value="125">125%</option>
                <option value="150">150%</option>
                <option value="175">175%</option>
                <option value="200">200%</option>
                <option value="250">250%</option>
                <option value="300">300%</option>
              </select>

              <div className="flex items-center gap-2">
                <span className="text-zinc-300">Page</span>
                <select
                  value={String(page)}
                  onChange={(e) => setPage(Number(e.target.value))}
                  className="rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-2 text-sm text-zinc-50"
                  disabled={!pageCount}
                >
                  {Array.from({ length: pageCount || 1 }, (_, i) => i + 1).map((p) => (
                    <option key={p} value={String(p)}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                className="rounded-lg bg-zinc-800 px-3 py-2 hover:bg-zinc-700 disabled:opacity-50"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Prev
              </button>
              <button
                type="button"
                className="rounded-lg bg-zinc-800 px-3 py-2 hover:bg-zinc-700 disabled:opacity-50"
                onClick={() => setPage((p) => Math.min(pageCount || p + 1, p + 1))}
                disabled={pageCount !== 0 && page >= pageCount}
              >
                Next
              </button>
            </div>
          </div>
        ) : null}

        <div
          ref={containerRef}
          className="relative mt-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900"
        >
          <div
            className="absolute inset-0 z-10 select-none pointer-events-none"
            style={{
              backgroundImage:
                status.type === "ready"
                  ? `repeating-linear-gradient(135deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 60px)`
                  : undefined,
            }}
          />

          {status.type === "ready" ? (
            <div className="absolute inset-0 z-20 flex items-center justify-center select-none pointer-events-none">
              <div className="rotate-[-20deg] whitespace-pre-wrap text-center text-sm font-semibold tracking-wide text-white/25">
                {status.watermark}
              </div>
            </div>
          ) : null}

          <div className="relative z-0">
            {status.type === "loading" || status.type === "idle" ? (
              <div className="p-10 text-sm text-zinc-300">Loading PDF…</div>
            ) : status.type === "error" ? (
              <div className="p-10 text-sm text-red-300">{status.message}</div>
            ) : (
              <div className="flex w-full justify-center bg-zinc-950">
                <canvas ref={canvasRef} className="max-w-full" />
              </div>
            )}
          </div>
        </div>

        <style jsx global>{`
          canvas {
            user-select: none;
            -webkit-user-select: none;
          }
        `}</style>
      </div>
    </div>
  );
}
