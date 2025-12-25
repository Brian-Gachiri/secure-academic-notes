import { NoteViewerClient } from "@/components/NoteViewerClient";
import { getSharedPdfBase64Action } from "@/lib/server/actions";

export default async function ShareViewerPage({ params }: { params: Promise<{ token: string }> }) {
  const token = (await params).token

  return (
    <NoteViewerClient
      noteId={token}
      watermarkLabel={`Shared link`}
      fetchPdf={getSharedPdfBase64Action}
    />
  );
}
