"use client";

import type { FormEvent } from "react";

export function DeleteNoteButton({
  action,
  noteId,
}: {
  action: (formData: FormData) => void | Promise<void>;
  noteId: string;
}) {
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    if (!window.confirm("Delete this note? This will remove the PDF and revoke related share links.")) {
      e.preventDefault();
    }
  }

  return (
    <form action={action} onSubmit={onSubmit}>
      <input type="hidden" name="noteId" value={noteId} />
      <button
        type="submit"
        className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-500"
      >
        Delete
      </button>
    </form>
  );
}
