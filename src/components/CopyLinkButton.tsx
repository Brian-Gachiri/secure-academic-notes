"use client";

import { useState } from "react";

export function CopyLinkButton({
  url,
  className,
}: {
  url: string;
  className?: string;
}) {
  const [label, setLabel] = useState("Copy link");

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setLabel("Copied");
      window.setTimeout(() => setLabel("Copy link"), 1200);
    } catch {
      try {
        const el = document.createElement("textarea");
        el.value = url;
        el.style.position = "fixed";
        el.style.left = "-9999px";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
        setLabel("Copied");
        window.setTimeout(() => setLabel("Copy link"), 1200);
      } catch {
        setLabel("Copy failed");
        window.setTimeout(() => setLabel("Copy link"), 1200);
      }
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      className={
        className ??
        "rounded-md border bg-white px-2 py-1 text-xs font-medium text-zinc-900 hover:bg-zinc-50"
      }
    >
      {label}
    </button>
  );
}
