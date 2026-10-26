'use client';

import { useState } from 'react';
import { PDFDocument, PurchaseOrder } from '@/lib/types';
import {
  X,
  CheckCircle2,
  Download,
  IndianRupee,
  ShieldCheck,
  CreditCard,
  QrCode,
  Zap,
  FileText,
  User,
  Mail,
  RefreshCw,
  Eye,
  Copy,
  Check
} from 'lucide-react';

interface BuyModalProps {
  document: PDFDocument | null;
  onClose: () => void;
  onSuccess: (order: PurchaseOrder) => void;
}

export default function BuyModal({ document, onClose, onSuccess }: BuyModalProps) {
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'instant' | 'card'>('instant');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<PurchaseOrder | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);

  if (!document) return null;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }
    if (!buyerEmail.trim()) {
      setErrorMsg('Please enter your email or phone.');
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
          buyerEmail: buyerEmail.trim(),
          paymentMethod: paymentMethod.toUpperCase(),
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
        setErrorMsg(data.error || 'Payment failed to process.');
      }
    } catch {
      setErrorMsg('Network error while processing purchase.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyUpiId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">
                {completedOrder ? 'Purchase Complete!' : 'Secure PDF Checkout'}
              </h3>
              <p className="text-xs text-slate-400">
                {completedOrder ? 'Your file is unlocked' : 'Instant download access upon payment'}
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
        <div className="p-6">
          {completedOrder ? (
            /* SUCCESS VIEW */
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner animate-in zoom-in-50">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
                  Payment Verified (₹{completedOrder.amount})
                </span>
                <h2 className="text-xl font-extrabold text-slate-900">
                  Congratulations, {completedOrder.buyerName}!
                </h2>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Your purchase of <strong>{completedOrder.documentName}</strong> was successful.
                </p>
              </div>

              {/* Receipt info */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-1.5 font-medium text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Transaction ID:</span>
                  <span className="font-mono font-bold text-slate-800">{completedOrder.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Amount Paid:</span>
                  <span className="font-bold text-emerald-600">₹{completedOrder.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Buyer Email:</span>
                  <span className="text-slate-800">{completedOrder.buyerEmail}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                {completedOrder.downloadLink && (
                  <a
                    href={completedOrder.downloadLink}
                    download={document.fileName}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all"
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
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Open Preview</span>
                  </a>
                )}
              </div>

              <button
                onClick={onClose}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 underline pt-2 block mx-auto"
              >
                Close &amp; Back to Marketplace
              </button>
            </div>
          ) : (
            /* CHECKOUT FORM VIEW */
            <form onSubmit={handlePay} className="space-y-5">
              {/* Product Summary Card */}
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100">
                <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wide">
                    {document.category || 'PDF Document'}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm leading-snug truncate">
                    {document.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    By {document.sellerName || 'Verified Seller'} • {document.fileSizeFormatted}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xl font-extrabold text-emerald-600">
                    {document.price === 0 ? 'FREE' : `₹${document.price}`}
                  </span>
                </div>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
                  {errorMsg}
                </div>
              )}

              {/* Buyer Contact Fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. Amit Kumar"
                      value={buyerName}
                      onChange={e => setBuyerName(e.target.value)}
                      required
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email or Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. amit@gmail.com or 9876543210"
                      value={buyerEmail}
                      onChange={e => setBuyerEmail(e.target.value)}
                      required
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Select Payment Option
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('instant')}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      paymentMethod === 'instant'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span className="text-xs">Instant Pay</span>
                    <span className="text-[10px] text-slate-400">1-Click Test</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      paymentMethod === 'upi'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs">UPI QR Code</span>
                    <span className="text-[10px] text-slate-400">GPay / PhonePe</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      paymentMethod === 'card'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs">Card / NetBank</span>
                    <span className="text-[10px] text-slate-400">Debit / Credit</span>
                  </button>
                </div>
              </div>

              {/* UPI Tab detail */}
              {paymentMethod === 'upi' && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
                  <div className="w-28 h-28 mx-auto bg-white p-2 rounded-xl border border-slate-200 flex flex-col items-center justify-center">
                    <QrCode className="w-20 h-20 text-slate-800" />
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Scan via <strong>PhonePe, Google Pay, Paytm, or BHIM</strong>
                  </p>
                  {document.sellerUpi && (
                    <div className="flex items-center justify-center gap-2 text-xs">
                      <span className="font-mono text-slate-700 font-semibold">{document.sellerUpi}</span>
                      <button
                        type="button"
                        onClick={() => copyUpiId(document.sellerUpi || '')}
                        className="p-1 text-slate-400 hover:text-indigo-600"
                        title="Copy UPI"
                      >
                        {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Submit / Pay Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying &amp; Unlocking File...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-emerald-200" />
                      <span>
                        {document.price === 0
                          ? 'Get Free Download Access'
                          : `Pay ₹${document.price} & Download PDF`}
                      </span>
                    </>
                  )}
                </button>
                <p className="text-[10px] text-slate-400 text-center mt-2 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  100% Secure Checkout • Instant Digital PDF Delivery
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
