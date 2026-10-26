'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PDFDocument, PurchaseOrder } from '@/lib/types';
import {
  X,
  CheckCircle2,
  Download,
  IndianRupee,
  ShieldCheck,
  QrCode,
  FileText,
  User,
  Phone,
  RefreshCw,
  Eye,
  Sparkles
} from 'lucide-react';

interface BuyModalProps {
  document: PDFDocument | null;
  onClose: () => void;
  onSuccess: (order: PurchaseOrder) => void;
}

export default function BuyModal({ document, onClose, onSuccess }: BuyModalProps) {
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<PurchaseOrder | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!document) return null;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName.trim()) {
      setErrorMsg('कृपया अपना नाम दर्ज करें (Please enter your name).');
      return;
    }
    if (!buyerPhone.trim()) {
      setErrorMsg('कृपया अपना मोबाइल / WhatsApp नंबर दर्ज करें.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: document.id,
          buyerName: buyerName.trim(),
          buyerEmail: buyerPhone.trim(),
          paymentMethod: 'PAYTM_QR',
          transactionId: transactionRef.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.order) {
        setCompletedOrder(data.order);
        onSuccess(data.order);

        // Save order to localStorage for buyer history
        try {
          const currentPurchases = JSON.parse(localStorage.getItem('my_purchases') || '[]');
          currentPurchases.unshift(data.order);
          localStorage.setItem('my_purchases', JSON.stringify(currentPurchases));
        } catch {
          // ignore
        }
      } else {
        setErrorMsg(data.error || 'Payment process karne me dikkat aayi.');
      }
    } catch {
      setErrorMsg('Network error. Kripya dobara koshish karein.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center border border-pink-500/30 text-xl">
              🎈
            </div>
            <div>
              <h3 className="font-extrabold text-base">
                {completedOrder ? 'भुगतान सफल! (Payment Verified)' : 'Paytm / UPI Barcode Scan & Pay'}
              </h3>
              <p className="text-xs text-slate-400">
                {completedOrder ? 'आपकी PDF फाइल अनलॉक हो चुकी है' : 'QR कोड स्कैन करके भुगतान करें'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {completedOrder ? (
            /* SUCCESS VIEW */
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner animate-in zoom-in-50">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
                  Payment Successful • ₹{completedOrder.amount}
                </span>
                <h2 className="text-xl font-black text-slate-900">
                  बधाई हो, {completedOrder.buyerName}! 🎉
                </h2>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  <strong>{completedOrder.documentName}</strong> सफलतापूर्वक अनलॉक हो गई है। नीचे से तुरंत डाउनलोड करें!
                </p>
              </div>

              {/* Receipt info */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-1.5 font-medium text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Order ID:</span>
                  <span className="font-mono font-bold text-slate-800">{completedOrder.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Amount Paid:</span>
                  <span className="font-bold text-emerald-600 text-sm">₹{completedOrder.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mobile / WhatsApp:</span>
                  <span className="text-slate-800 font-bold">{completedOrder.buyerEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Paid To:</span>
                  <span className="text-slate-800 font-bold">Mukesh (Paytm UPI)</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                {completedOrder.downloadLink ? (
                  <a
                    href={completedOrder.downloadLink}
                    download={document.fileName}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm shadow-lg shadow-emerald-600/20 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF Now 📥</span>
                  </a>
                ) : (
                  <a
                    href={document.webContentLink || document.webViewLink}
                    download={document.fileName}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-emerald-600 text-white font-black text-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF Now</span>
                  </a>
                )}

                {document.webViewLink && (
                  <a
                    href={document.webViewLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Preview File</span>
                  </a>
                )}
              </div>

              <button
                onClick={onClose}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 underline pt-2 block mx-auto cursor-pointer"
              >
                Close &amp; Back to Worksheets
              </button>
            </div>
          ) : (
            /* CHECKOUT FORM VIEW */
            <form onSubmit={handlePay} className="space-y-4">
              {/* Product Summary Card */}
              <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-2xl shrink-0">{document.emoji || '📚'}</span>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-slate-900 text-sm leading-snug truncate">
                      {document.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate">
                      {document.titleHindi || `${document.pageCount || 40} Pages PDF`}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xl font-black text-emerald-600 bg-white px-2.5 py-1 rounded-xl border border-emerald-200 shadow-2xs">
                    ₹{document.price}
                  </span>
                </div>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold">
                  {errorMsg}
                </div>
              )}

              {/* PAYTM QR CODE BARCODE SECTION */}
              <div className="p-4 bg-gradient-to-b from-sky-50 to-white rounded-2xl border-2 border-sky-300 text-center space-y-3 shadow-xs">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-black">
                  <span>Paytm से UPI • Mukesh</span>
                </div>

                {/* Real Paytm Barcode / QR Code Image */}
                <div className="relative w-56 h-72 mx-auto bg-white p-2 rounded-2xl border-2 border-sky-400 shadow-md overflow-hidden flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/payment-qr.jpg"
                    alt="Mukesh Paytm UPI QR Code Barcode"
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-black text-slate-800">
                    Scan via <span className="text-sky-600">Paytm</span>, <span className="text-purple-600">PhonePe</span>, <span className="text-blue-600">Google Pay</span> ya koi bhi UPI App
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Payment Name: <strong className="text-slate-800">Mukesh</strong> | Amount: <strong className="text-emerald-700 text-sm">₹{document.price}</strong>
                  </p>
                </div>
              </div>

              {/* Buyer Contact Fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    आपका नाम (Your Full Name) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Kumar"
                      value={buyerName}
                      onChange={e => setBuyerName(e.target.value)}
                      required
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600"
                    />
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    आपका मोबाइल / WhatsApp नंबर <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={buyerPhone}
                      onChange={e => setBuyerPhone(e.target.value)}
                      required
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600"
                    />
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    PDF download link aur receipt is number par confirm hoga.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    UPI UTR / Reference No. (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 12-digit UTR (Optional)"
                    value={transactionRef}
                    onChange={e => setTransactionRef(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm shadow-lg shadow-emerald-600/25 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying Payment...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-emerald-200" />
                      <span>मैंने Payment कर दिया — PDF डाउनलोड करें (₹{document.price})</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>100% सुरक्षित भुगतान • तुरंत PDF फाइल डाउनलोड</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
