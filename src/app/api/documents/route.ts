import { NextRequest, NextResponse } from 'next/server';
import { getAllDocuments, addDocument, formatBytes, formatPrice } from '@/lib/storage';
import { uploadPdfFile, fetchGoogleDocuments } from '@/lib/googleDrive';
import { PDFDocument } from '@/lib/types';

export async function GET() {
  try {
    const localDocs = getAllDocuments();
    let googleDocs: any[] = [];
    try {
      googleDocs = await fetchGoogleDocuments();
    } catch {
      // ignore
    }

    const docMap = new Map<string, PDFDocument>();
    // Add Google Docs first
    for (const d of googleDocs) {
      if (d && d.id) docMap.set(d.id, d);
    }
    // Add local seed docs if not duplicate
    for (const d of localDocs) {
      if (d && d.id && !docMap.has(d.id)) {
        docMap.set(d.id, d);
      }
    }

    const merged = Array.from(docMap.values());
    return NextResponse.json({ success: true, documents: merged });
  } catch (error) {
    console.error('Error in GET /api/documents:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch documents' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const titleHindi = (formData.get('titleHindi') as string) || '';
    const info = (formData.get('info') as string) || '';
    const priceRaw = formData.get('price');
    const ageGroup = (formData.get('ageGroup') as string) || 'All Ages';
    const category = (formData.get('category') as string) || 'Coloring';
    const emoji = (formData.get('emoji') as string) || '🎨';
    const badge = (formData.get('badge') as string) || '⭐ New';
    const pageCountRaw = formData.get('pageCount');
    const pageCount = pageCountRaw ? parseInt(pageCountRaw.toString()) || 25 : 25;
    const sellerName = (formData.get('sellerName') as string) || 'Kids WonderLand';
    const file = formData.get('file') as File | null;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Worksheet / Book Title is required' }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({ success: false, error: 'PDF file is required' }, { status: 400 });
    }

    // Verify PDF mime type or extension
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      return NextResponse.json({ success: false, error: 'Uploaded file must be a PDF document' }, { status: 400 });
    }

    const price = priceRaw !== null && !isNaN(Number(priceRaw)) ? Math.max(0, Number(priceRaw)) : 0;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate playful background gradient based on category
    let bgColor = 'from-amber-100 to-orange-100 border-amber-300';
    if (category === 'Writing') bgColor = 'from-sky-100 to-blue-100 border-sky-300';
    else if (category === 'Math Fun') bgColor = 'from-emerald-100 to-teal-100 border-emerald-300';
    else if (category === 'Hindi') bgColor = 'from-rose-100 to-pink-100 border-rose-300';
    else if (category === 'Adventure' || category === 'Space') bgColor = 'from-purple-100 to-indigo-100 border-purple-300';
    else if (category === 'Stories') bgColor = 'from-yellow-100 to-lime-100 border-yellow-300';

    const tempDoc: PDFDocument = {
      id: 'doc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: name.trim(),
      titleHindi: titleHindi.trim(),
      info: info.trim(),
      fileName: file.name,
      fileSize: file.size,
      fileSizeFormatted: formatBytes(file.size),
      mimeType: 'application/pdf',
      price: price,
      priceFormatted: formatPrice(price),
      ageGroup: ageGroup.trim(),
      category: category.trim(),
      emoji: emoji.trim(),
      badge: badge.trim(),
      pageCount: pageCount,
      bgColor: bgColor,
      sellerName: sellerName.trim(),
      salesCount: 0,
      createdAt: new Date().toISOString(),
    };

    // Upload to Google Drive (or local fallback) and persist metadata in Google Storage
    const uploadResult = await uploadPdfFile(buffer, file.name, file.type || 'application/pdf', tempDoc);

    const newDoc: PDFDocument = {
      ...tempDoc,
      googleDriveId: uploadResult.fileId,
      webViewLink: uploadResult.webViewLink,
      webContentLink: uploadResult.webContentLink,
      storageType: uploadResult.storageType,
      localPath: uploadResult.localPath,
    };

    addDocument(newDoc);

    return NextResponse.json({
      success: true,
      message: 'PDF uploaded to Google Storage & published live successfully!',
      document: newDoc,
    });
  } catch (error) {
    console.error('Error in POST /api/documents:', error);
    return NextResponse.json({ success: false, error: (error as Error).message || 'Upload failed' }, { status: 500 });
  }
}
