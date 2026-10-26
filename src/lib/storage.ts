import fs from 'fs';
import path from 'path';
import { PDFDocument, DriveConfig, PurchaseOrder } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DOCUMENTS_FILE = path.join(DATA_DIR, 'documents.json');
const PURCHASES_FILE = path.join(DATA_DIR, 'purchases.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatPrice(price: number): string {
  if (price <= 0 || isNaN(price)) return 'FREE';
  return `₹${price}`;
}

export function getInitialSeedDocuments(): PDFDocument[] {
  return [
    {
      id: 'kids_seed_1',
      name: 'Animal Kingdom Jumbo Coloring Book',
      titleHindi: 'जानवर रंग भरो पुस्तक (50+ चित्र)',
      info: 'Big bold outlines of Lions, Elephants, Giraffes & Birds. Perfect for crayons & sketch pens!',
      fileName: 'animal-kingdom-coloring-book.pdf',
      fileSize: 4500000,
      fileSizeFormatted: '4.3 MB',
      mimeType: 'application/pdf',
      price: 49,
      priceFormatted: '₹49',
      ageGroup: 'Age 2 - 6',
      category: 'Coloring',
      emoji: '🦁',
      badge: '🔥 Most Popular',
      pageCount: 52,
      bgColor: 'from-amber-100 to-orange-100 border-amber-300',
      salesCount: 86,
      webViewLink: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      webContentLink: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      storageType: 'local',
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    },
    {
      id: 'kids_seed_2',
      name: 'ABC Alphabet & Phonics Tracing Fun',
      titleHindi: 'A से Z लिखना सीखें वर्कशीट्स',
      info: 'Dotted tracing lines with picture phonics (A for Apple, B for Ball) to build pencil grip.',
      fileName: 'abc-alphabet-tracing-phonics.pdf',
      fileSize: 2800000,
      fileSizeFormatted: '2.7 MB',
      mimeType: 'application/pdf',
      price: 0,
      priceFormatted: 'FREE',
      ageGroup: 'Age 3 - 5',
      category: 'Writing',
      emoji: '🅰️',
      badge: '🎁 Free Gift',
      pageCount: 36,
      bgColor: 'from-sky-100 to-blue-100 border-sky-300',
      salesCount: 230,
      webViewLink: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      webContentLink: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      storageType: 'local',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
    {
      id: 'kids_seed_3',
      name: '123 Numbers, Counting & Shapes Maze',
      titleHindi: 'गिनती और आकृतियों का खेल (1-50)',
      info: 'Fun counting objects, connecting dots, maze puzzles & geometric shape coloring activities.',
      fileName: '123-numbers-shapes-maze.pdf',
      fileSize: 3200000,
      fileSizeFormatted: '3.1 MB',
      mimeType: 'application/pdf',
      price: 39,
      priceFormatted: '₹39',
      ageGroup: 'Age 3 - 6',
      category: 'Math Fun',
      emoji: '🔢',
      badge: '🧠 Brain Booster',
      pageCount: 44,
      bgColor: 'from-emerald-100 to-teal-100 border-emerald-300',
      salesCount: 114,
      webViewLink: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      webContentLink: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      storageType: 'local',
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
    {
      id: 'kids_seed_4',
      name: 'Hindi Varnamala Swar & Vyanjan Practice',
      titleHindi: 'हिन्दी वर्णमाला (अ से ज्ञ) अभ्यास',
      info: 'Step-by-step Hindi akshar tracing with colorful Hindi pictures (अ से अनार, क से कबूतर).',
      fileName: 'hindi-varnamala-abhyas.pdf',
      fileSize: 3800000,
      fileSizeFormatted: '3.6 MB',
      mimeType: 'application/pdf',
      price: 49,
      priceFormatted: '₹49',
      ageGroup: 'Age 4 - 7',
      category: 'Hindi',
      emoji: '🇮🇳',
      badge: '⭐ School Ready',
      pageCount: 48,
      bgColor: 'from-rose-100 to-pink-100 border-rose-300',
      salesCount: 95,
      webViewLink: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      webContentLink: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      storageType: 'local',
      createdAt: new Date().toISOString(),
    }
  ];
}

export function getAllDocuments(): PDFDocument[] {
  ensureDataDir();
  if (!fs.existsSync(DOCUMENTS_FILE)) {
    const seed = getInitialSeedDocuments();
    fs.writeFileSync(DOCUMENTS_FILE, JSON.stringify(seed, null, 2), 'utf-8');
    return seed;
  }
  try {
    const content = fs.readFileSync(DOCUMENTS_FILE, 'utf-8');
    const docs = JSON.parse(content) as PDFDocument[];
    if (docs.length === 0) {
      const seed = getInitialSeedDocuments();
      fs.writeFileSync(DOCUMENTS_FILE, JSON.stringify(seed, null, 2), 'utf-8');
      return seed;
    }
    return docs.map(d => ({
      ...d,
      price: typeof d.price === 'number' ? d.price : 0,
      priceFormatted: d.priceFormatted || formatPrice(d.price || 0),
      salesCount: d.salesCount || 0,
    }));
  } catch (error) {
    console.error('Error reading documents:', error);
    return [];
  }
}

export function getDocumentById(id: string): PDFDocument | null {
  const docs = getAllDocuments();
  return docs.find(d => d.id === id) || null;
}

export function saveAllDocuments(docs: PDFDocument[]): void {
  ensureDataDir();
  fs.writeFileSync(DOCUMENTS_FILE, JSON.stringify(docs, null, 2), 'utf-8');
}

export function addDocument(doc: PDFDocument): PDFDocument {
  const docs = getAllDocuments();
  const preparedDoc: PDFDocument = {
    ...doc,
    price: typeof doc.price === 'number' ? doc.price : 0,
    priceFormatted: doc.priceFormatted || formatPrice(doc.price || 0),
    salesCount: doc.salesCount || 0,
  };
  docs.unshift(preparedDoc);
  saveAllDocuments(docs);
  return preparedDoc;
}

export function incrementDocumentSales(id: string): void {
  const docs = getAllDocuments();
  const doc = docs.find(d => d.id === id);
  if (doc) {
    doc.salesCount = (doc.salesCount || 0) + 1;
    saveAllDocuments(docs);
  }
}

export function deleteDocument(id: string): PDFDocument | null {
  const docs = getAllDocuments();
  const index = docs.findIndex(d => d.id === id);
  if (index === -1) return null;
  const [removed] = docs.splice(index, 1);
  saveAllDocuments(docs);
  return removed;
}

// Purchases Storage
export function getAllPurchases(): PurchaseOrder[] {
  ensureDataDir();
  if (!fs.existsSync(PURCHASES_FILE)) {
    return [];
  }
  try {
    const content = fs.readFileSync(PURCHASES_FILE, 'utf-8');
    return JSON.parse(content) as PurchaseOrder[];
  } catch (err) {
    console.error('Error reading purchases:', err);
    return [];
  }
}

export function addPurchase(order: PurchaseOrder): PurchaseOrder {
  ensureDataDir();
  const purchases = getAllPurchases();
  purchases.unshift(order);
  fs.writeFileSync(PURCHASES_FILE, JSON.stringify(purchases, null, 2), 'utf-8');
  incrementDocumentSales(order.documentId);
  return order;
}

export function getDriveConfig(): DriveConfig {
  ensureDataDir();
  const envAppsScript = process.env.GOOGLE_APPS_SCRIPT_URL;
  const envClientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const envPrivateKey = process.env.GOOGLE_PRIVATE_KEY;
  const envFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (fs.existsSync(CONFIG_FILE)) {
    try {
      const savedConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8')) as DriveConfig;
      return {
        mode: savedConfig.mode || (savedConfig.appsScriptUrl ? 'apps_script' : (savedConfig.clientEmail ? 'service_account' : 'local')),
        appsScriptUrl: savedConfig.appsScriptUrl || envAppsScript || '',
        clientEmail: savedConfig.clientEmail || envClientEmail || '',
        privateKey: savedConfig.privateKey || envPrivateKey || '',
        folderId: savedConfig.folderId || envFolderId || '',
        adminSecret: savedConfig.adminSecret || process.env.ADMIN_SECRET || 'admin123',
      };
    } catch {
      // ignore
    }
  }

  return {
    mode: envAppsScript ? 'apps_script' : (envClientEmail ? 'service_account' : 'local'),
    appsScriptUrl: envAppsScript || '',
    clientEmail: envClientEmail || '',
    privateKey: envPrivateKey || '',
    folderId: envFolderId || '',
    adminSecret: process.env.ADMIN_SECRET || 'admin123',
  };
}

export function saveDriveConfig(config: Partial<DriveConfig>): DriveConfig {
  ensureDataDir();
  const current = getDriveConfig();
  const updated: DriveConfig = {
    ...current,
    ...config,
  };
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  return updated;
}
