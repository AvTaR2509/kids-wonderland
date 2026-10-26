import { NextRequest, NextResponse } from 'next/server';
import { getDocumentById, deleteDocument } from '@/lib/storage';
import { deletePdfFile } from '@/lib/googleDrive';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const doc = getDocumentById(id);

    if (!doc) {
      return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 });
    }

    // Delete from Google Drive or local storage
    await deletePdfFile(doc.googleDriveId, doc.localPath, id);

    // Remove from documents database
    const removed = deleteDocument(id);

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully',
      document: removed,
    });
  } catch (error) {
    console.error('Error in DELETE /api/documents/[id]:', error);
    return NextResponse.json({ success: false, error: (error as Error).message || 'Delete failed' }, { status: 500 });
  }
}
