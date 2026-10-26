'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import BuyModal from '@/components/BuyModal';
import PdfViewerModal from '@/components/PdfViewerModal';
import { PDFDocument } from '@/lib/types';
import {
  Sparkles,
  Smile,
  Star,
  Palette,
  BookOpen,
  Heart,
  Award,
  Download,
  CheckCircle2,
  Volume2,
  Sun,
  PartyPopper,
  Printer,
  ShoppingBag,
  ShieldCheck,
  Check,
  Eye,
  Gift,
  RefreshCw,
  Cloud,
  Lock
} from 'lucide-react';

const ANIMAL_SOUNDS = [
  { name: 'Lion', emoji: '🦁', sound: 'Roaaar!', freq: 140 },
  { name: 'Elephant', emoji: '🐘', sound: 'Pawoo!', freq: 280 },
  { name: 'Cat', emoji: '🐱', sound: 'Meoww!', freq: 650 },
  { name: 'Dog', emoji: '🐶', sound: 'Woof Woof!', freq: 350 },
  { name: 'Bird', emoji: '🐦', sound: 'Chirp Chirp!', freq: 900 },
  { name: 'Rocket', emoji: '🚀', sound: 'Whooosh!', freq: 120 }
];

export default function KidsHomePage() {
  const [documents, setDocuments] = useState<PDFDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAge, setSelectedAge] = useState<string>('all');
  const [activeAnimalSound, setActiveAnimalSound] = useState<string | null>(null);

  // Buy and preview modals
  const [buyDoc, setBuyDoc] = useState<PDFDocument | null>(null);
  const [previewDoc, setPreviewDoc] = useState<PDFDocument | null>(null);

  // Fetch live documents from API (loaded from Google Storage / Data)
  const fetchWorksheets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/documents');
      const data = await res.json();
      if (data.success && data.documents) {
        setDocuments(data.documents);
      }
    } catch (err) {
      console.error('Failed to fetch worksheets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorksheets();
  }, []);

  // Play synthesized joyful sound using Web Audio API
  const playJoySound = (freq = 440, soundText = 'Yay!') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, audioCtx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch {
      // AudioContext fallback
    }
    setActiveAnimalSound(soundText);
    setTimeout(() => setActiveAnimalSound(null), 1500);
  };

  const filteredWorksheets = documents.filter(doc => {
    if (selectedAge === 'all') return true;
    const age = (doc.ageGroup || '').toLowerCase();
    return age.includes(selectedAge.toLowerCase());
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] font-sans selection:bg-pink-400 selection:text-white">
      <Navbar />

      {/* Floating Announcement Bar */}
      <div className="bg-gradient-to-r from-pink-500 via-amber-400 to-emerald-400 py-2.5 px-4 text-center text-white text-xs sm:text-sm font-extrabold tracking-wide shadow-sm flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 text-yellow-200 animate-spin" />
        <span>🎈 बच्चों के लिए बेस्ट प्रिंटेबल वर्कशीट्स और कलरिंग बुक्स! 100% Screen-Free Fun!</span>
        <Sparkles className="w-4 h-4 text-yellow-200 animate-spin" />
      </div>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* HERO SECTION */}
        <div className="relative rounded-3xl bg-gradient-to-b from-amber-50 via-pink-50/50 to-sky-50 border-4 border-amber-200/80 p-6 sm:p-12 shadow-xl overflow-hidden mb-12">
          {/* Floating background shapes */}
          <div className="absolute top-4 left-6 text-4xl animate-bounce pointer-events-none">⭐</div>
          <div className="absolute top-8 right-10 text-5xl animate-pulse pointer-events-none">🎨</div>
          <div className="absolute bottom-6 left-12 text-5xl pointer-events-none">🚀</div>
          <div className="absolute bottom-6 right-8 text-4xl pointer-events-none">🎈</div>

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100 text-pink-700 border-2 border-pink-300 text-xs sm:text-sm font-black uppercase tracking-wider mb-4 shadow-xs">
              <Sun className="w-4 h-4 text-amber-500 fill-amber-400 animate-spin" />
              <span>Smart Learning for Kids (Age 2 - 8 Years)</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              छोटे बच्चों के लिए{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600">
                मजेदार वर्कशीट्स
              </span>{' '}
              और कलरिंग बुक्स! 🌈
            </h1>

            {/* Hindi + English Subtitle */}
            <p className="mt-4 text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
              घर पर आसानी से <strong>Print (A4)</strong> निकालें और बच्चों की लिखावट (Pencil Grip), एकाग्रता,
              रंग भरने और गिनती सीखने को मजेदार बनाएं। स्क्रीन टाइम कम करें, क्रिएटिविटी बढ़ाएं!
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <a
                href="#worksheets-grid"
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500 text-white font-black text-base shadow-xl shadow-pink-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5"
              >
                <Palette className="w-5 h-5" />
                <span>वर्कशीट्स देखें और डाउनलोड करें ({documents.length} Live)</span>
              </a>

              <a
                href="#free-downloads"
                className="px-6 py-4 rounded-2xl bg-white border-2 border-amber-300 text-slate-800 font-extrabold text-base hover:bg-amber-50 shadow-md shadow-amber-500/10 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <Gift className="w-5 h-5 text-amber-500" />
                <span>मुफ्त सैंपल (FREE)</span>
              </a>
            </div>

            {/* Trust highlights */}
            <div className="mt-8 pt-6 border-t-2 border-dashed border-amber-200/80 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-bold text-slate-600">
              <span className="flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-emerald-600" />
                A4 साइज प्रिंटेबल PDF
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                100% Child-Safe Content
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-pink-600" />
                No Ads • No Distraction
              </span>
            </div>
          </div>
        </div>

        {/* INTERACTIVE SOUNDBOARD / ANIMAL CLICKER */}
        <div id="fun-soundboard" className="scroll-mt-20 bg-white rounded-3xl border-2 border-purple-200 p-6 shadow-md mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold uppercase mb-2">
            <Volume2 className="w-3.5 h-3.5" />
            <span>Interactive Fun Soundboard for Little Kids</span>
          </div>
          <h3 className="text-xl font-black text-slate-800">
            Click Animals to Hear Fun Sounds! 🎵
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 mb-5">
            Tap any button below to hear cheerful animal cheers:
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {ANIMAL_SOUNDS.map(a => (
              <button
                key={a.name}
                onClick={() => playJoySound(a.freq, `${a.name}: ${a.sound}`)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100 hover:from-yellow-100 hover:to-amber-100 border-2 border-slate-200 hover:border-amber-400 text-slate-800 font-bold text-sm shadow-xs hover:shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <span className="text-2xl">{a.emoji}</span>
                <span>{a.name}</span>
              </button>
            ))}
          </div>

          {activeAnimalSound && (
            <div className="mt-4 inline-block px-5 py-2 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-sm border border-emerald-300 animate-bounce">
              🎉 {activeAnimalSound}
            </div>
          )}
        </div>

        {/* AGE FILTER BAR & WORKSHEETS HEADER */}
        <div id="worksheets-grid" className="scroll-mt-20 mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
                <span>📚 बच्चों की लोकप्रिय वर्कशीट्स</span>
                <span className="text-sm font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                  {filteredWorksheets.length} PDFs Live
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Filter by Age to find the perfect learning sheets for your child.
              </p>
            </div>

            {/* Age Filter Tabs */}
            <div className="flex items-center gap-2 bg-amber-100/60 p-1.5 rounded-2xl border border-amber-200">
              {[
                { id: 'all', label: 'All Ages' },
                { id: '2', label: 'Age 2 - 4' },
                { id: '4', label: 'Age 4 - 6' },
                { id: '6', label: 'Age 6 - 8' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedAge(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                    selectedAge === tab.id
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* WORKSHEETS CARDS GRID - DYNAMICALLY POPULATED FROM GOOGLE STORAGE / API */}
        {loading ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 mb-16">
            <RefreshCw className="w-8 h-8 text-pink-500 animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-600">Loading Kids Worksheets from Storage...</p>
          </div>
        ) : (
          <div id="free-gift-section" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {filteredWorksheets.map(doc => {
              const isFree = doc.price === 0;
              const cardBg = doc.bgColor || 'from-amber-100 to-orange-100 border-amber-300';

              return (
                <div
                  key={doc.id}
                  className={`rounded-3xl border-3 p-6 bg-gradient-to-br ${cardBg} shadow-md hover:shadow-2xl transition-all flex flex-col justify-between group relative overflow-hidden`}
                >
                  <div>
                    {/* Header tag & emoji */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                        {doc.emoji || '🎨'}
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-white shadow-xs text-slate-800 border border-slate-200">
                          {doc.badge || '⭐ Kids Fun'}
                        </span>
                        <div className="flex items-center gap-1">
                          {doc.storageType === 'google_drive' && (
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1 border border-emerald-300">
                              <Cloud className="w-3 h-3" /> Drive
                            </span>
                          )}
                          <span className="text-[11px] font-bold text-slate-600 bg-white/70 px-2 py-0.5 rounded-md">
                            {doc.ageGroup || 'All Ages'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-black text-slate-900 leading-snug mb-1">
                      {doc.name}
                    </h3>
                    {doc.titleHindi && (
                      <h4 className="text-xs font-bold text-slate-700 mb-3">
                        {doc.titleHindi}
                      </h4>
                    )}

                    {/* Description */}
                    <p className="text-xs text-slate-700 leading-relaxed font-medium mb-4 min-h-[40px]">
                      {doc.info || 'Interactive fun worksheet designed to improve creativity and learning!'}
                    </p>

                    {/* Meta details */}
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-600 mb-4 pb-3 border-b border-black/10">
                      <span className="flex items-center gap-1">
                        <Printer className="w-3.5 h-3.5 text-slate-500" />
                        {doc.pageCount ? `${doc.pageCount} Pages` : doc.fileSizeFormatted}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-slate-500" />
                        HD Quality Print
                      </span>
                    </div>
                  </div>

                  {/* Price & Actions */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-900">
                          {doc.priceFormatted || (isFree ? 'FREE' : `₹${doc.price}`)}
                        </span>
                        {!isFree && (
                          <span className="text-xs font-semibold text-slate-500 line-through">
                            ₹{doc.price + 50}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Instant Download
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-extrabold border border-slate-300 shadow-xs transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </button>

                      {isFree ? (
                        <a
                          id={doc.category === 'Writing' ? 'free-downloads' : undefined}
                          href={doc.webContentLink || doc.webViewLink}
                          download={doc.fileName}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-600/20 transition-all"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Free Download</span>
                        </a>
                      ) : (
                        <button
                          onClick={() => setBuyDoc(doc)}
                          className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black shadow-md shadow-slate-900/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                          <span>Buy Now (₹{doc.price})</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MEGA BUNDLE BANNER */}
        <div id="mega-bundle" className="scroll-mt-20 rounded-3xl bg-gradient-to-r from-purple-700 via-pink-600 to-amber-500 p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden mb-16">
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl text-center lg:text-left">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/20 text-yellow-200 text-xs font-black uppercase tracking-wider mb-3">
                <PartyPopper className="w-4 h-4" />
                <span>Special Offer • 80% Discount</span>
              </span>
              <h3 className="text-3xl sm:text-4xl font-black tracking-tight leading-snug">
                All-in-One Jumbo Kids Activity Bundle! 🎁
              </h3>
              <p className="mt-3 text-pink-100 text-sm sm:text-base leading-relaxed">
                Get all Workbooks (250+ Pages) together in one single package! Includes Animal Coloring,
                ABC Tracing, 123 Math Games, Hindi Varnamala, Dinosaurs &amp; Panchatantra Stories.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-bold">
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/20">
                  <Check className="w-4 h-4 text-emerald-300" /> Lifetime Access
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/20">
                  <Check className="w-4 h-4 text-emerald-300" /> Unlimited Home Prints
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/20">
                  <Check className="w-4 h-4 text-emerald-300" /> Certificate for Child
                </span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 text-slate-900 text-center w-full sm:w-80 shadow-2xl shrink-0">
              <span className="text-xs font-extrabold uppercase tracking-wider text-pink-600 bg-pink-50 px-3 py-1 rounded-full border border-pink-200">
                Special Combo Deal
              </span>
              <div className="mt-4 flex items-baseline justify-center gap-2">
                <span className="text-4xl sm:text-5xl font-black text-slate-900">₹99</span>
                <span className="text-lg font-bold text-slate-400 line-through">₹499</span>
              </div>
              <p className="text-xs text-slate-500 mt-1 mb-6">
                All Kids Books • 250+ Printable Pages
              </p>

              <button
                onClick={() =>
                  setBuyDoc({
                    id: 'kids_mega_bundle',
                    name: 'Jumbo Kids Mega Activity Bundle (All Workbooks)',
                    titleHindi: 'सम्पूर्ण पुस्तकें - 250+ पेज एक्टिविटी बंडल',
                    info: 'Complete all-in-one bundle for children covering coloring, writing, math, Hindi, and moral stories.',
                    fileName: 'kids-jumbo-activity-bundle.pdf',
                    fileSize: 15000000,
                    fileSizeFormatted: '15.0 MB',
                    mimeType: 'application/pdf',
                    price: 99,
                    priceFormatted: '₹99',
                    ageGroup: 'Age 2 - 8',
                    category: 'Combo Bundle',
                    emoji: '🎁',
                    badge: 'Mega Saver',
                    storageType: 'local',
                    createdAt: new Date().toISOString()
                  })
                }
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-black text-base shadow-lg shadow-pink-600/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-5 h-5 text-yellow-300" />
                <span>Get Mega Bundle (₹99)</span>
              </button>
            </div>
          </div>
        </div>

        {/* WHY PARENTS LOVE THESE WORKBOOKS */}
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-8 sm:p-12 shadow-sm mb-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Parents &amp; Teachers Choice
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
              ये वर्कशीट्स बच्चों के लिए क्यों फायदेमंद हैं?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Designed by pre-school educators to turn playful curiosity into strong learning foundations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-2xl mx-auto mb-3">
                📵
              </div>
              <h4 className="font-extrabold text-slate-900 text-base mb-1">Zero Screen Time</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Help kids reduce mobile/TV addiction through fun physical paper activities.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-pink-50/60 border border-pink-200 text-center">
              <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-700 flex items-center justify-center text-2xl mx-auto mb-3">
                ✏️
              </div>
              <h4 className="font-extrabold text-slate-900 text-base mb-1">Strong Pencil Grip</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Step-by-step dotted tracing trains motor skills and improves handwriting.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-sky-50/60 border border-sky-200 text-center">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center text-2xl mx-auto mb-3">
                🖨️
              </div>
              <h4 className="font-extrabold text-slate-900 text-base mb-1">Print Anytime</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Print single sheets or complete booklets on any normal home printer (A4).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl mx-auto mb-3">
                🧠
              </div>
              <h4 className="font-extrabold text-slate-900 text-base mb-1">Brain Booster Puzzles</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mazes, counting games and differences enhance memory and analytical skills.
              </p>
            </div>
          </div>
        </div>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <div className="max-w-3xl mx-auto mb-16">
          <h3 className="text-2xl font-black text-center text-slate-900 mb-8">
            Frequently Asked Questions (अक्सर पूछे जाने वाले सवाल)
          </h3>

          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <h4 className="font-extrabold text-sm text-slate-900 mb-1">
                Q. मैं इन वर्कशीट्स को कैसे प्रिंट करूँ?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                पेमेंट करते ही आपको PDF डाउनलोड का बटन मिल जाता है। आप इसे अपने मोबाइल या लैपटॉप में सेव कर सकते हैं और किसी भी सामान्य प्रिंटर या साइबर कैफे से A4 साइज पेज पर प्रिंट निकाल सकते हैं।
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <h4 className="font-extrabold text-sm text-slate-900 mb-1">
                Q. क्या यह हिंदी और अंग्रेजी दोनों माध्यम के बच्चों के लिए है?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                हाँ! हमारी वर्कशीट्स द्विभाषी (Bilingual) हैं। इसमें अंग्रेजी वर्णमाला (ABC), हिंदी वर्णमाला (अ से ज्ञ), गिनती और रंग भरने के सभी चित्र शामिल हैं।
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <h4 className="font-extrabold text-sm text-slate-900 mb-1">
                Q. क्या मैं एक बार खरीदकर कई बार प्रिंट निकाल सकता हूँ?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                बिल्कुल! PDF हमेशा के लिए आपकी हो जाती है। आप जब चाहें जितनी बार चाहें बच्चों के अभ्यास के लिए दोबारा प्रिंट निकाल सकते हैं।
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* MODALS */}
      <BuyModal
        document={buyDoc}
        onClose={() => setBuyDoc(null)}
        onSuccess={() => fetchWorksheets()}
      />

      <PdfViewerModal
        document={previewDoc}
        onClose={() => setPreviewDoc(null)}
      />

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎈</span>
            <div>
              <span className="font-black text-slate-900 text-sm">Kids WonderLand Worksheets</span>
              <p className="text-[11px] text-slate-400">Printable Activity Packs &amp; Learning PDFs for Children</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <p className="text-slate-400 text-xs">
              © 2026 Kids WonderLand • 100% Child-Safe
            </p>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-800 transition-colors"
              title="Admin Login Gate"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Login</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
