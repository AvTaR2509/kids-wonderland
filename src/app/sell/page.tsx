'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import {
  UploadCloud,
  FileText,
  IndianRupee,
  Tag,
  User,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  ShoppingBag,
  FileCheck,
  RefreshCw
} from 'lucide-react';

const CATEGORIES = [
  'Coding & Tech',
  'Study Notes',
  'Exam Prep (UPSC / SSC / JEE)',
  'Business & Startup',
  'E-Books & Novels',
  'Templates & Resumes',
  'Finance & Investing',
  'Other'
];

const PRESET_PRICES = [0, 49, 99, 149, 199, 499];

export default function SellPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [info, setInfo] = useState('');
  const [price, setPrice] = useState<number>(99);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [sellerName, setSellerName] = useState('');
  const [sellerUpi, setSellerUpi] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successDoc, setSuccessDoc] = useState<{ id: string; name: string; priceFormatted: string } | null>(null);

  const handleFile = (f: File) => {
    if (f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')) {
      setFile(f);
      if (!name) {
        setName(f.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' '));
      }
      setErrorMsg(null);
    } else {
      setErrorMsg('Please choose a valid PDF file.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg('Please select a PDF file to upload.');
      return;
    }
    if (!name.trim()) {
      setErrorMsg('Please provide a document title.');
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', name.trim());
      formData.append('info', info.trim());
      formData.append('price', price.toString());
      formData.append('category', category);
      formData.append('sellerName', (sellerName || 'Verified Seller').trim());
      formData.append('sellerUpi', (sellerUpi || '').trim());

      const res = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.document) {
        setSuccessDoc(data.document);
      } else {
        setErrorMsg(data.error || 'Failed to upload document.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Network error while uploading your file.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Breadcrumb / Back button */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Marketplace</span>
          </Link>
        </div>

        {/* Success Modal / Banner */}
        {successDoc ? (
          <div className="bg-white rounded-3xl border border-emerald-200 p-8 shadow-xl text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-200">
              Listed For Sale!
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
              Your PDF is now Live in the Store!
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
              <strong>&ldquo;{successDoc.name}&rdquo;</strong> is now listed for{' '}
              <span className="font-bold text-emerald-600">{successDoc.priceFormatted}</span>. Buyers can now view, pay, and download it instantly.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/"
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all inline-flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>View in Marketplace</span>
              </Link>
              <button
                onClick={() => {
                  setSuccessDoc(null);
                  setFile(null);
                  setName('');
                  setInfo('');
                  setPrice(99);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="px-6 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-sm transition-all inline-flex items-center gap-2"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload Another PDF</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            {/* Header banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 p-6 sm:p-8 text-white relative">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-2 backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Sell &amp; Monetize PDFs</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Upload &amp; Sell Your PDF File
              </h1>
              <p className="mt-1 text-emerald-100 text-sm max-w-xl">
                Upload your study notes, e-books, cheat sheets, or documents, set your price in Rupees (₹), and start earning from buyers immediately!
              </p>
            </div>

            {/* Error Notification */}
            {errorMsg && (
              <div className="m-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">{errorMsg}</p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              {/* 1. PDF File Dropzone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  1. Select PDF File <span className="text-red-500">*</span>
                </label>
                <div
                  onDragEnter={e => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragOver={e => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={e => {
                    e.preventDefault();
                    setDragActive(false);
                  }}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                    dragActive
                      ? 'border-emerald-600 bg-emerald-50/50 scale-[0.99]'
                      : file
                      ? 'border-emerald-400 bg-emerald-50/20'
                      : 'border-slate-300 hover:border-emerald-500 bg-slate-50/60 hover:bg-slate-50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
                    className="hidden"
                  />

                  {file ? (
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-3 shadow-xs">
                        <FileText className="w-7 h-7" />
                      </div>
                      <span className="font-bold text-slate-800 text-base">{file.name}</span>
                      <span className="text-xs text-slate-500 mt-1">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB • File selected and ready
                      </span>
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          setFile(null);
                        }}
                        className="mt-3 text-xs font-semibold text-red-600 hover:text-red-700 underline"
                      >
                        Change file
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                        <UploadCloud className="w-7 h-7" />
                      </div>
                      <p className="text-sm font-semibold text-slate-800">
                        Drag and drop your PDF file here, or{' '}
                        <span className="text-emerald-600 underline">Browse files</span>
                      </p>
                      <p className="text-xs text-slate-400 mt-1">PDF format supported up to 50 MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Title & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    2. Document Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Complete Organic Chemistry Notes 2026"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Category / Subject
                  </label>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white appearance-none"
                    >
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <Tag className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* 3. Description / Info */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  3. Description &amp; Highlights
                </label>
                <textarea
                  placeholder="Explain what is included in this PDF, key topics covered, number of pages, exam targets, etc..."
                  value={info}
                  onChange={e => setInfo(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              {/* 4. Price in ₹ */}
              <div className="bg-emerald-50/50 rounded-2xl border border-emerald-100 p-5">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <IndianRupee className="w-4 h-4 text-emerald-600" />
                    4. Selling Price (₹ INR) <span className="text-red-500">*</span>
                  </span>
                  <span className="text-xs font-semibold text-emerald-700">
                    {price === 0 ? 'Free Download' : `Selling at ₹${price}`}
                  </span>
                </label>

                {/* Preset buttons */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {PRESET_PRICES.map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPrice(p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        price === p
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:border-emerald-300'
                      }`}
                    >
                      {p === 0 ? 'FREE' : `₹${p}`}
                    </button>
                  ))}
                </div>

                <div className="relative max-w-xs">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-600">
                    ₹
                  </div>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={price}
                    onChange={e => setPrice(Math.max(0, parseInt(e.target.value) || 0))}
                    placeholder="Enter custom price..."
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-bold text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Tip: Setting ₹0 makes the PDF free for everyone to download. Popular selling prices are ₹49, ₹99, and ₹149.
                </p>
              </div>

              {/* 5. Seller Details & UPI */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Seller Name / Channel
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma or TechNotes Hub"
                      value={sellerName}
                      onChange={e => setSellerName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Your UPI ID (For Direct Payouts)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. yourname@okaxis or 9876543210@paytm"
                      value={sellerUpi}
                      onChange={e => setSellerUpi(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    />
                    <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <Link
                  href="/"
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isUploading || !file}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Publishing PDF for Sale...</span>
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-4 h-4" />
                      <span>Publish &amp; Start Selling (₹{price})</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
