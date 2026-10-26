'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import PdfViewerModal from '@/components/PdfViewerModal';
import { PDFDocument } from '@/lib/types';
import {
  UploadCloud,
  FileText,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  Cloud,
  Settings,
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  FolderPlus,
  Shield,
  ShieldCheck,
  Lock,
  LogOut,
  KeyRound,
  Sparkles,
  Smile,
  Palette,
  IndianRupee,
  Layers,
  Tag
} from 'lucide-react';

const EMOJI_OPTIONS = ['🦁', '🎨', '🚀', '🔢', '🅰️', '🦖', '🐘', '📖', '⭐', '🌈', '🐱', '🐶'];

const AGE_OPTIONS = ['Age 2 - 4', 'Age 3 - 5', 'Age 4 - 6', 'Age 4 - 7', 'Age 5 - 8', 'All Ages'];

const CATEGORY_OPTIONS = ['Coloring', 'Writing', 'Math Fun', 'Hindi', 'Adventure', 'Stories', 'General'];

const BADGE_OPTIONS = ['🔥 Most Popular', '🎁 Free Gift', '🧠 Brain Booster', '⭐ School Ready', '✨ Super Fun', '❤️ Moral Values', '🎉 New Release'];

export default function AdminPage() {
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loginUsername, setLoginUsername] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Document states
  const [documents, setDocuments] = useState<PDFDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  // New Worksheet Form states
  const [name, setName] = useState('');
  const [titleHindi, setTitleHindi] = useState('');
  const [info, setInfo] = useState('');
  const [price, setPrice] = useState<number>(49);
  const [ageGroup, setAgeGroup] = useState(AGE_OPTIONS[0]);
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [emoji, setEmoji] = useState(EMOJI_OPTIONS[0]);
  const [badge, setBadge] = useState(BADGE_OPTIONS[0]);
  const [pageCount, setPageCount] = useState<number>(40);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error'; text: string; link?: string } | null>(null);

  // Deleting state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Settings & Config state
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [config, setConfig] = useState<{
    mode: string;
    appsScriptUrl: string;
    hasAppsScriptUrl: boolean;
    folderId: string;
  }>({
    mode: 'apps_script',
    appsScriptUrl: '',
    hasAppsScriptUrl: false,
    folderId: '',
  });
  const [templateScript, setTemplateScript] = useState('');
  const [copiedScript, setCopiedScript] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [configSuccess, setConfigSuccess] = useState(false);

  // Preview modal
  const [selectedDoc, setSelectedDoc] = useState<PDFDocument | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check stored auth session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token');
    if (savedToken) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPassword) return;

    setIsVerifying(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', secretKey: loginPassword.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('admin_token', data.token);
        setIsAuthenticated(true);
        setLoginPassword('');
        fetchDocuments();
        fetchConfig();
      } else {
        setAuthError(data.error || 'Access Denied: Incorrect Password or Secret Key');
      }
    } catch {
      setAuthError('Connection error while logging in');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsAuthenticated(false);
    setLoginPassword('');
  };

  const fetchDocuments = async () => {
    setLoadingDocs(true);
    try {
      const res = await fetch('/api/documents');
      const data = await res.json();
      if (data.success) {
        setDocuments(data.documents || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDocs(false);
    }
  };

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/config');
      const data = await res.json();
      if (data.success) {
        setConfig(data.config);
        setTemplateScript(data.templateScript || '');
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDocuments();
      fetchConfig();
    }
  }, [isAuthenticated]);

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type === 'application/pdf' || selected.name.toLowerCase().endsWith('.pdf')) {
        setFile(selected);
        if (!name) {
          setName(selected.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' '));
        }
        setUploadMessage(null);
      } else {
        alert('Please select a valid PDF file.');
      }
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      if (dropped.type === 'application/pdf' || dropped.name.toLowerCase().endsWith('.pdf')) {
        setFile(dropped);
        if (!name) {
          setName(dropped.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' '));
        }
        setUploadMessage(null);
      } else {
        alert('Please drop a valid PDF file.');
      }
    }
  };

  // Submit Upload to Google Storage / Local
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setUploadMessage({ type: 'error', text: 'Worksheet Title is required.' });
      return;
    }
    if (!file) {
      setUploadMessage({ type: 'error', text: 'Please select a PDF file to upload.' });
      return;
    }

    setIsUploading(true);
    setUploadMessage(null);

    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('titleHindi', titleHindi.trim());
      formData.append('info', info.trim());
      formData.append('price', price.toString());
      formData.append('ageGroup', ageGroup);
      formData.append('category', category);
      formData.append('emoji', emoji);
      formData.append('badge', badge);
      formData.append('pageCount', pageCount.toString());
      formData.append('sellerName', 'Kids WonderLand');
      formData.append('file', file);

      const res = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setUploadMessage({
          type: 'success',
          text: `"${name}" uploaded to Google Storage and published to Main Page successfully! 🎉`,
          link: data.document.webViewLink,
        });
        setName('');
        setTitleHindi('');
        setInfo('');
        setPrice(49);
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchDocuments();
      } else {
        setUploadMessage({ type: 'error', text: data.error || 'Upload failed.' });
      }
    } catch (err) {
      console.error(err);
      setUploadMessage({ type: 'error', text: 'Network error during upload.' });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Delete
  const handleDelete = async (doc: PDFDocument) => {
    if (!confirm(`Are you sure you want to delete "${doc.name}" from the site?`)) return;

    setDeletingId(doc.id);
    try {
      const res = await fetch(`/api/documents/${doc.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setDocuments(prev => prev.filter(d => d.id !== doc.id));
      } else {
        alert(data.error || 'Failed to delete file.');
      }
    } catch {
      alert('Network error while deleting.');
    } finally {
      setDeletingId(null);
    }
  };

  // Handle Save Drive Config
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'apps_script',
          appsScriptUrl: config.appsScriptUrl,
          folderId: config.folderId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setConfigSuccess(true);
        setTimeout(() => setConfigSuccess(false), 3000);
        fetchConfig();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingConfig(false);
    }
  };

  const copyScriptToClipboard = () => {
    navigator.clipboard.writeText(templateScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  // -------------------------------------------------------------------------
  // 1. LOGIN VIEW
  // -------------------------------------------------------------------------
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Navbar />

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-pink-500 via-amber-400 to-emerald-500"></div>

              {/* Icon & Heading */}
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 mb-3 text-3xl">
                  🎈
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold uppercase tracking-wider mb-2 border border-slate-700">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin Login Panel</span>
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight">Kids Worksheets Admin</h2>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Login to upload new PDFs to Google Storage and manage the main page.
                </p>
              </div>

              {/* Error Message */}
              {authError && (
                <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Username
                  </label>
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={e => setLoginUsername(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Password / Secret Key
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter admin password (admin123)..."
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      required
                      autoFocus
                      className="w-full pl-4 pr-11 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isVerifying || !loginPassword}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white font-extrabold text-sm shadow-lg shadow-pink-500/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Login to Admin Panel</span>
                    </>
                  )}
                </button>
              </form>

              {/* Hint Box */}
              <div className="mt-6 pt-4 border-t border-slate-800 text-center">
                <p className="text-[11px] text-slate-500">
                  Default Password: <code className="text-amber-400 font-mono bg-slate-800 px-1.5 py-0.5 rounded">admin123</code>
                </p>
                <div className="mt-3">
                  <Link
                    href="/"
                    className="text-xs text-slate-400 hover:text-slate-200 inline-flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Return to Kids Home Page</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading initial auth state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin text-pink-500" />
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // 2. AUTHENTICATED ADMIN DASHBOARD
  // -------------------------------------------------------------------------
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold uppercase tracking-wider mb-2 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Admin Logged In • Kids WonderLand</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Upload New Kids PDF to Google Storage
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Add new printable worksheets, coloring books, and tracing PDFs. They immediately appear on the Main Page!
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowSettingsModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-pink-600 hover:border-pink-200 text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all"
            >
              <Cloud className="w-4 h-4 text-emerald-600" />
              <span>Google Drive Settings</span>
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs sm:text-sm font-bold transition-all"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs sm:text-sm font-bold shadow-xs transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>View Main Page</span>
            </Link>
          </div>
        </div>

        {/* Google Storage Status Banner */}
        <div className="mb-8 p-4 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-sm text-slate-900">Google Storage Backend:</h4>
                {config.hasAppsScriptUrl ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    ● Connected to Your Google Drive
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    Local Storage Active (Ready to link Google Drive)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {config.hasAppsScriptUrl
                  ? 'All PDF uploads are automatically uploaded and stored into your Google Drive account.'
                  : 'Files upload safely to storage. Click "Google Drive Settings" to link your personal Google Drive!'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowSettingsModal(true)}
            className="text-xs font-bold text-pink-600 hover:text-pink-800 underline shrink-0"
          >
            Configure Google Drive
          </button>
        </div>

        {/* SECTION 1: UPLOAD NEW KIDS PDF FORM */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 mb-12">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-pink-500/20 text-xl">
              🎈
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Upload New Worksheet / Book</h2>
              <p className="text-xs text-slate-500">
                Uploaded PDF will be stored in Google Storage and immediately visible on the Main Page!
              </p>
            </div>
          </div>

          {/* Feedback messages */}
          {uploadMessage && (
            <div
              className={`mb-6 p-4 rounded-2xl border flex items-start gap-3 ${
                uploadMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-red-50 border-red-200 text-red-900'
              }`}
            >
              {uploadMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="text-sm">
                <p className="font-bold">{uploadMessage.text}</p>
                {uploadMessage.link && (
                  <a
                    href={uploadMessage.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-pink-600 hover:underline mt-1 text-xs"
                  >
                    <span>View uploaded PDF file</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleUpload} className="space-y-6">
            {/* Title & Hindi Title */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Worksheet Title (English) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Magic Dinosaur Coloring & Maze Book"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Hindi Subtitle / Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. डायनासोर रंग भरो और भूलभुलैया (50 पेज)"
                  value={titleHindi}
                  onChange={e => setTitleHindi(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                />
              </div>
            </div>

            {/* Age, Category, Emoji, Badge, Pages, Price */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              {/* Age Group */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                  Age Group
                </label>
                <select
                  value={ageGroup}
                  onChange={e => setAgeGroup(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs font-bold bg-white"
                >
                  {AGE_OPTIONS.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs font-bold bg-white"
                >
                  {CATEGORY_OPTIONS.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Emoji Icon */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                  Emoji Mascot
                </label>
                <select
                  value={emoji}
                  onChange={e => setEmoji(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-300 text-slate-900 text-sm font-bold bg-white"
                >
                  {EMOJI_OPTIONS.map(em => (
                    <option key={em} value={em}>{em}</option>
                  ))}
                </select>
              </div>

              {/* Badge */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                  Badge Tag
                </label>
                <select
                  value={badge}
                  onChange={e => setBadge(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs font-bold bg-white"
                >
                  {BADGE_OPTIONS.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Number of Pages */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                  Pages
                </label>
                <input
                  type="number"
                  min={1}
                  value={pageCount}
                  onChange={e => setPageCount(parseInt(e.target.value) || 20)}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs font-bold bg-white"
                />
              </div>

              {/* Price in Rupees */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                  Price (₹ INR)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">₹</span>
                  <input
                    type="number"
                    min={0}
                    value={price}
                    onChange={e => setPrice(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full pl-6 pr-2 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs font-bold bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Worksheet Description &amp; Highlights
              </label>
              <textarea
                placeholder="Describe what activities are inside (e.g. 50 full-page outlines, dotted numbers, spot the difference)..."
                value={info}
                onChange={e => setInfo(e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 resize-none"
              />
            </div>

            {/* PDF File Dropzone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                PDF File Attachment <span className="text-red-500">*</span>
              </label>

              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-pink-500 bg-pink-50/50 scale-[0.99]'
                    : file
                    ? 'border-emerald-400 bg-emerald-50/30'
                    : 'border-slate-300 hover:border-pink-400 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {file ? (
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-3 shadow-xs">
                      <FileText className="w-7 h-7" />
                    </div>
                    <span className="font-bold text-slate-800 text-base">{file.name}</span>
                    <span className="text-xs text-slate-500 mt-1">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload to Google Storage
                    </span>
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        setFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="mt-3 text-xs font-semibold text-red-600 hover:text-red-700 underline"
                    >
                      Choose a different file
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center mb-3">
                      <UploadCloud className="w-7 h-7" />
                    </div>
                    <p className="text-sm font-bold text-slate-800">
                      Drag &amp; Drop your PDF file here, or <span className="text-pink-600 underline">Browse</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Uploads directly to your Google Drive / Storage</p>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end pt-2">
              <button
                type="submit"
                disabled={isUploading || !file}
                className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white font-black text-sm shadow-md shadow-pink-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Uploading to Google Storage...</span>
                  </>
                ) : (
                  <>
                    <Cloud className="w-4 h-4" />
                    <span>Upload to Google Storage &amp; Publish Live</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* SECTION 2: LIVE WORKSHEETS LIST */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900">Worksheets Live on Main Page</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-pink-100 text-pink-800 border border-pink-200">
                  {documents.length} files
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                These worksheets are currently displayed to visitors on the main page.
              </p>
            </div>

            <button
              onClick={fetchDocuments}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingDocs ? 'animate-spin' : ''}`} />
              <span>Refresh List</span>
            </button>
          </div>

          {loadingDocs ? (
            <div className="py-12 text-center text-slate-500">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-pink-600" />
              <p className="text-xs font-medium">Fetching file records...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <p className="text-sm font-medium">No files uploaded yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-black tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3.5">Worksheet</th>
                    <th className="px-4 py-3.5">Price</th>
                    <th className="px-4 py-3.5">Age &amp; Category</th>
                    <th className="px-4 py-3.5">Storage</th>
                    <th className="px-4 py-3.5">Size</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {documents.map(doc => (
                    <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name with Emoji */}
                      <td className="px-4 py-4 text-slate-900 font-bold">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-xl shrink-0">
                            {doc.emoji || '📄'}
                          </div>
                          <div>
                            <div className="truncate max-w-xs">{doc.name}</div>
                            {doc.titleHindi && (
                              <div className="text-[11px] text-slate-400 font-normal truncate max-w-xs">{doc.titleHindi}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`font-black px-2.5 py-0.5 rounded-full text-xs ${
                          doc.price === 0
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}>
                          {doc.priceFormatted || (doc.price ? `₹${doc.price}` : 'FREE')}
                        </span>
                      </td>

                      {/* Age & Category */}
                      <td className="px-4 py-4 text-xs text-slate-600 whitespace-nowrap">
                        <span className="font-bold text-slate-800">{doc.ageGroup || 'All Ages'}</span>
                        <span className="text-slate-400"> • </span>
                        <span>{doc.category || 'General'}</span>
                      </td>

                      {/* Storage */}
                      <td className="px-4 py-4">
                        {doc.storageType === 'google_drive' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Cloud className="w-3 h-3" />
                            Google Drive
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            <HardDrive className="w-3 h-3" />
                            Local Storage
                          </span>
                        )}
                      </td>

                      {/* Size */}
                      <td className="px-4 py-4 text-xs text-slate-500 whitespace-nowrap">
                        {doc.fileSizeFormatted}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedDoc(doc)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-pink-50 text-pink-700 hover:bg-pink-100 text-xs font-bold transition-colors"
                            title="Preview PDF"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview</span>
                          </button>

                          <button
                            onClick={() => handleDelete(doc)}
                            disabled={deletingId === doc.id}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                            title="Delete worksheet"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* GOOGLE DRIVE CONFIG MODAL */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Cloud className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-base">Google Storage &amp; Drive Setup</h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {configSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold">
                  ✓ Google Drive settings successfully updated!
                </div>
              )}

              <form onSubmit={handleSaveConfig} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Google Apps Script Web App URL (100% Free Google Drive Uploads)
                  </label>
                  <input
                    type="url"
                    placeholder="https://script.google.com/macros/s/.../exec"
                    value={config.appsScriptUrl}
                    onChange={e => setConfig({ ...config, appsScriptUrl: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Paste your deployed Google Apps Script Web App URL here. All PDFs will be stored in your Drive!
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Google Drive Folder ID (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1a2b3c4d5e6f7g8h9i0j"
                    value={config.folderId}
                    onChange={e => setConfig({ ...config, folderId: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Leave blank to save directly into your Google Drive root directory.
                  </p>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingConfig}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all"
                  >
                    {savingConfig ? 'Saving...' : 'Save Google Drive Config'}
                  </button>
                </div>
              </form>

              {/* 2-Minute Script Template Guide */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-xs text-slate-800">
                    How to get your Free Google Apps Script in 2 minutes:
                  </h4>
                  <button
                    type="button"
                    onClick={copyScriptToClipboard}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-pink-600 hover:underline"
                  >
                    {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedScript ? 'Copied!' : 'Copy Script'}</span>
                  </button>
                </div>
                <ol className="list-decimal list-inside text-xs text-slate-600 space-y-1">
                  <li>Open <a href="https://script.google.com" target="_blank" rel="noreferrer" className="text-pink-600 underline font-bold">script.google.com</a> and click <strong>New Project</strong>.</li>
                  <li>Delete default code, click &quot;Copy Script&quot; above, and paste it.</li>
                  <li>Click <strong>Deploy &gt; New deployment &gt; Select type: Web app</strong>.</li>
                  <li>Set <em>Execute as: Me</em> and <em>Who has access: Anyone</em>.</li>
                  <li>Click Deploy and paste the Web App URL into the box above!</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF VIEWER MODAL */}
      <PdfViewerModal
        document={selectedDoc}
        onClose={() => setSelectedDoc(null)}
      />
    </div>
  );
}
