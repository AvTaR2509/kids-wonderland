import { NextRequest, NextResponse } from 'next/server';
import { getDocumentById, addPurchase, getAllPurchases } from '@/lib/storage';
import { PurchaseOrder } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const buyerEmail = searchParams.get('email');
    const all = getAllPurchases();

    if (buyerEmail) {
      const filtered = all.filter(p => p.buyerEmail.toLowerCase() === buyerEmail.toLowerCase());
      return NextResponse.json({ success: true, purchases: filtered });
    }

    return NextResponse.json({ success: true, purchases: all });
  } catch (error) {
    console.error('Error fetching purchases:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch purchases' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentId, buyerName, buyerEmail, paymentMethod, transactionId } = body;

    if (!documentId) {
      return NextResponse.json({ success: false, error: 'Document ID is required' }, { status: 400 });
    }

    const doc = getDocumentById(documentId);
    if (!doc) {
      return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 });
    }

    const orderId = 'order_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const txnId = transactionId || 'TXN-' + Math.floor(1000000000 + Math.random() * 9000000000);

    const newOrder: PurchaseOrder = {
      id: orderId,
      documentId: doc.id,
      documentName: doc.name,
      amount: doc.price,
      buyerName: (buyerName || 'Valued Buyer').trim(),
      buyerEmail: (buyerEmail || 'buyer@example.com').trim(),
      paymentMethod: paymentMethod || 'UPI',
      transactionId: txnId,
      createdAt: new Date().toISOString(),
      downloadLink: doc.webContentLink || doc.webViewLink,
    };

    addPurchase(newOrder);

    return NextResponse.json({
      success: true,
      message: 'Purchase completed successfully! Access unlocked.',
      order: newOrder,
      downloadLink: doc.webContentLink || doc.webViewLink,
    });
  } catch (error) {
    console.error('Error in POST /api/buy:', error);
    return NextResponse.json({ success: false, error: (error as Error).message || 'Purchase processing failed' }, { status: 500 });
  }
}
