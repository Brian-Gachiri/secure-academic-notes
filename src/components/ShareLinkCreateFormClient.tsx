"use client";

import { useState } from "react";

export function ShareLinkCreateFormClient({
  noteId,
  action,
}: {
  noteId: string;
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [mode, setMode] = useState<"hours" | "months" | "datetime">("months");
  const [loading, setLoading] = useState(false)

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="noteId" value={noteId} />

      <select
        name="expiryMode"
        value={mode}
        onChange={(e) => setMode(e.target.value as any)}
        className="rounded-lg border px-2 py-2 text-sm"
      >
        <option value="hours">Hourly</option>
        <option value="months">Monthly</option>
        <option value="datetime">Specific date &amp; time</option>
      </select>

      {mode === "hours" ? (
        <input
          name="expiresInHours"
          placeholder="Hours"
          className="w-24 rounded-lg border px-2 py-2 text-sm"
          inputMode="numeric"
        />
      ) : null}

      {mode === "months" ? (
        <input
          name="expiresInMonths"
          placeholder="Months"
          className="w-24 rounded-lg border px-2 py-2 text-sm"
          inputMode="numeric"
        />
      ) : null}

      {mode === "datetime" ? (
        <input
          type="datetime-local"
          name="expiresAtDateTime"
          className="rounded-lg border px-2 py-2 text-sm"
        />
      ) : null}

      <button
        type="submit"
        className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
      >
        {loading? "Loading..." : 'Create share link'}
      </button>
    </form>
  );
}
