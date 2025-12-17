import { NoteViewerClient } from "@/components/NoteViewerClient";
import { requireUser } from "@/lib/server/auth";

export default async function NoteViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const id = (await params).id
  return <NoteViewerClient noteId={id} user={{ name: user.name, email: user.email }} />;
}
