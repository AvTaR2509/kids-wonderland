export interface PDFDocument {
  id: string;
  name: string;
  titleHindi?: string;
  info: string;
  fileName: string;
  fileSize: number;
  fileSizeFormatted: string;
  mimeType: string;
  price: number; // In Rupees (0 = Free)
  priceFormatted: string; // e.g. "₹49" or "Free"
  ageGroup?: string; // e.g. "Age 2 - 4", "Age 4 - 6", "Age 6 - 8"
  category?: string; // e.g. "Coloring", "Writing", "Math Fun", "Hindi", "Stories"
  emoji?: string; // e.g. "🦁", "🎨", "🚀"
  badge?: string; // e.g. "🔥 Most Popular", "🎁 Free Gift"
  pageCount?: number; // e.g. 52
  bgColor?: string;
  sellerName?: string;
  sellerUpi?: string;
  googleDriveId?: string;
  webViewLink?: string;
  webContentLink?: string;
  storageType: 'google_drive' | 'local';
  createdAt: string;
  localPath?: string;
  salesCount?: number;
}

export interface PurchaseOrder {
  id: string;
  documentId: string;
  documentName: string;
  amount: number;
  buyerName: string;
  buyerEmail: string;
  paymentMethod: string;
  transactionId: string;
  createdAt: string;
  downloadLink?: string;
}

export interface DriveConfig {
  mode: 'apps_script' | 'service_account' | 'local';
  appsScriptUrl?: string;
  clientEmail?: string;
  privateKey?: string;
  folderId?: string;
  adminSecret?: string;
}
