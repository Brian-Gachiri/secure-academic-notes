import { NoteViewerClient } from "@/components/NoteViewerClient";
import { requireUser } from "@/lib/server/auth";

export default async function NoteViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const id = (await params).id
  return (
    <NoteViewerClient
      noteId={id}
      watermarkLabel={`${user.name} • ${user.email}`}
      backHref="/dashboard"
      backLabel="Back"
    />
  );
}
