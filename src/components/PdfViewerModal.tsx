'use client';

import { X, ExternalLink, Download, FileText, Share2, Check } from 'lucide-react';
import { useState } from 'react';
import { PDFDocument } from '@/lib/types';

interface PdfViewerModalProps {
  document: PDFDocument | null;
  onClose: () => void;
}

export default function PdfViewerModal({ document, onClose }: PdfViewerModalProps) {
  const [copied, setCopied] = useState(false);

  if (!document) return null;

  const handleCopyLink = () => {
    const url = document.webViewLink || window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Build appropriate view URL
  // If it's a google drive file, we can embed via Google Drive preview or direct link
  let embedUrl = document.webViewLink || '';
  if (document.googleDriveId) {
    embedUrl = `https://drive.google.com/file/d/${document.googleDriveId}/preview`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[88vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-red-600/90 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-base truncate">{document.name}</h3>
              <p className="text-xs text-slate-400 truncate">
                {document.fileName} • {document.fileSizeFormatted}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Copy Link"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>

            {/* Direct Download */}
            {document.webContentLink && (
              <a
                href={document.webContentLink}
                download={document.fileName}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </a>
            )}

            {/* Open in Google Drive / New Tab */}
            {document.webViewLink && (
              <a
                href={document.webViewLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Tab</span>
              </a>
            )}

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Close viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Info Banner */}
        {document.info && (
          <div className="px-6 py-2.5 bg-blue-50/70 border-b border-blue-100 flex items-center justify-between text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-blue-900">Description:</span>
              <span>{document.info}</span>
            </div>
            <span className="text-slate-500 shrink-0">
              Uploaded: {new Date(document.createdAt).toLocaleDateString()}
            </span>
          </div>
        )}

        {/* PDF Embedded Frame */}
        <div className="flex-1 bg-slate-100 relative overflow-hidden">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="w-full h-full border-0"
              title={document.name}
              allow="autoplay"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 p-6">
              <FileText className="w-16 h-16 text-slate-300 mb-3" />
              <p className="font-medium">No preview available for this file</p>
              {document.webContentLink && (
                <a
                  href={document.webContentLink}
                  download
                  className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                >
                  Download File
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
