import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { getDriveConfig, formatBytes } from './storage';

export const GOOGLE_APPS_SCRIPT_TEMPLATE = `// -------------------------------------------------------------
// Google Apps Script - Paste this into https://script.google.com
// Click Deploy > New deployment > Web app
// Set "Execute as: Me" and "Who has access: Anyone"
// Copy the Web App URL and paste it into this app's Admin settings!
// -------------------------------------------------------------
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var props = PropertiesService.getScriptProperties();

    if (data.action === "upload") {
      var decoded = Utilities.base64Decode(data.base64Data);
      var blob = Utilities.newBlob(decoded, data.mimeType || "application/pdf", data.fileName || "document.pdf");
      var file;
      if (data.folderId && data.folderId.trim() !== "") {
        var folder = DriveApp.getFolderById(data.folderId.trim());
        file = folder.createFile(blob);
      } else {
        file = DriveApp.createFile(blob);
      }
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      var fileId = file.getId();
      var webViewLink = file.getUrl();
      var webContentLink = "https://drive.google.com/uc?export=download&id=" + fileId;

      // Save document record in Google Apps Script properties
      if (data.documentMeta) {
        var raw = props.getProperty("DOCUMENTS") || "[]";
        var list = JSON.parse(raw);
        var meta = data.documentMeta;
        meta.googleDriveId = fileId;
        meta.webViewLink = webViewLink;
        meta.webContentLink = webContentLink;
        meta.storageType = "google_drive";
        list.unshift(meta);
        props.setProperty("DOCUMENTS", JSON.stringify(list));
      }

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        fileId: fileId,
        webViewLink: webViewLink,
        webContentLink: webContentLink
      })).setMimeType(ContentService.MimeType.JSON);
    } else if (data.action === "list_documents") {
      var raw = props.getProperty("DOCUMENTS") || "[]";
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        documents: JSON.parse(raw)
      })).setMimeType(ContentService.MimeType.JSON);
    } else if (data.action === "delete") {
      try {
        if (data.fileId) {
          var fileToDelete = DriveApp.getFileById(data.fileId);
          fileToDelete.setTrashed(true);
        }
      } catch (errDel) {}

      var rawDel = props.getProperty("DOCUMENTS") || "[]";
      var listDel = JSON.parse(rawDel);
      var filtered = listDel.filter(function(d) {
        return d.id !== data.documentId && d.googleDriveId !== data.fileId;
      });
      props.setProperty("DOCUMENTS", JSON.stringify(filtered));

      return ContentService.createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Invalid action" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    var props = PropertiesService.getScriptProperties();
    var raw = props.getProperty("DOCUMENTS") || "[]";
    return ContentService.createTextOutput(JSON.stringify({
      status: "Google Drive Backend is running!",
      count: JSON.parse(raw).length
    })).setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "running" }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
`;

export interface UploadResult {
  fileId?: string;
  webViewLink: string;
  webContentLink: string;
  storageType: 'google_drive' | 'local';
  localPath?: string;
}

export async function uploadPdfFile(
  fileBuffer: Buffer,
  fileName: string,
  mimeType = 'application/pdf',
  documentMeta?: any
): Promise<UploadResult> {
  const config = getDriveConfig();

  // Mode 1: Google Apps Script Web App
  if (config.mode === 'apps_script' && config.appsScriptUrl) {
    try {
      const base64Data = fileBuffer.toString('base64');
      const payload = {
        action: 'upload',
        fileName,
        mimeType,
        base64Data,
        folderId: config.folderId || '',
        documentMeta: documentMeta || null,
      };

      const response = await fetch(config.appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        redirect: 'follow',
      });

      const data = await response.json();
      if (data.success && data.fileId) {
        return {
          fileId: data.fileId,
          webViewLink: data.webViewLink || `https://drive.google.com/file/d/${data.fileId}/view`,
          webContentLink: data.webContentLink || `https://drive.google.com/uc?export=download&id=${data.fileId}`,
          storageType: 'google_drive',
        };
      } else {
        console.warn('Apps Script upload returned error, falling back:', data.error);
      }
    } catch (err) {
      console.error('Error uploading via Google Apps Script:', err);
    }
  }

  // Mode 2: Google Service Account
  if (config.mode === 'service_account' && config.clientEmail && config.privateKey) {
    try {
      const formattedKey = config.privateKey.replace(/\\n/g, '\n');
      const auth = new google.auth.JWT({
        email: config.clientEmail,
        key: formattedKey,
        scopes: ['https://www.googleapis.com/auth/drive'],
      });

      const drive = google.drive({ version: 'v3', auth });

      const stream = new Readable();
      stream.push(fileBuffer);
      stream.push(null);

      const requestBody: { name: string; parents?: string[] } = {
        name: fileName,
      };
      if (config.folderId) {
        requestBody.parents = [config.folderId];
      }

      const response = await drive.files.create({
        requestBody,
        media: {
          mimeType,
          body: stream,
        },
        fields: 'id, name, webViewLink, webContentLink',
      });

      const fileId = response.data.id;
      if (fileId) {
        // Make file readable to anyone with link
        try {
          await drive.permissions.create({
            fileId,
            requestBody: {
              role: 'reader',
              type: 'anyone',
            },
          });
        } catch (permErr) {
          console.warn('Could not set public permission on Drive file:', permErr);
        }

        return {
          fileId,
          webViewLink: response.data.webViewLink || `https://drive.google.com/file/d/${fileId}/view`,
          webContentLink: response.data.webContentLink || `https://drive.google.com/uc?export=download&id=${fileId}`,
          storageType: 'google_drive',
        };
      }
    } catch (err) {
      console.error('Error uploading via Google Service Account:', err);
    }
  }

  // Mode 3: Local Storage Fallback (only in non-serverless / local dev)
  // On Netlify / Vercel / serverless, filesystem is read-only — skip local storage
  const isServerless = process.env.NETLIFY === 'true' || process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined;

  if (isServerless) {
    console.warn('Running on serverless platform — local file storage not available. Please configure Google Apps Script URL in Admin Panel.');
    return {
      webViewLink: '',
      webContentLink: '',
      storageType: 'local',
    };
  }

  try {
    const uniquePrefix = Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const savedFileName = `${uniquePrefix}-${safeName}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, savedFileName);
    fs.writeFileSync(filePath, fileBuffer);

    const localUrl = `/uploads/${savedFileName}`;
    return {
      webViewLink: localUrl,
      webContentLink: localUrl,
      storageType: 'local',
      localPath: filePath,
    };
  } catch (err) {
    console.error('Local file storage failed:', err);
    return {
      webViewLink: '',
      webContentLink: '',
      storageType: 'local',
    };
  }
}

export async function fetchGoogleDocuments(): Promise<any[]> {
  const config = getDriveConfig();
  if (config.mode === 'apps_script' && config.appsScriptUrl) {
    try {
      const response = await fetch(config.appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list_documents' }),
        redirect: 'follow',
      });
      const data = await response.json();
      if (data.success && Array.isArray(data.documents)) {
        return data.documents;
      }
    } catch (err) {
      console.error('Error fetching documents from Apps Script:', err);
    }
  }
  return [];
}

export async function deletePdfFile(fileId?: string, localPath?: string, documentId?: string): Promise<boolean> {
  const config = getDriveConfig();

  // Try Apps Script delete
  if (config.mode === 'apps_script' && config.appsScriptUrl) {
    try {
      await fetch(config.appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', fileId: fileId || '', documentId: documentId || '' }),
        redirect: 'follow',
      });
      return true;
    } catch (err) {
      console.error('Error deleting file via Apps Script:', err);
    }
  }

  // Try Service Account delete
  if (fileId && config.mode === 'service_account' && config.clientEmail && config.privateKey) {
    try {
      const formattedKey = config.privateKey.replace(/\\n/g, '\n');
      const auth = new google.auth.JWT({
        email: config.clientEmail,
        key: formattedKey,
        scopes: ['https://www.googleapis.com/auth/drive'],
      });
      const drive = google.drive({ version: 'v3', auth });
      await drive.files.delete({ fileId });
      return true;
    } catch (err) {
      console.error('Error deleting file via Service Account:', err);
    }
  }

  // Local file delete
  if (localPath && fs.existsSync(localPath)) {
    try {
      fs.unlinkSync(localPath);
      return true;
    } catch (err) {
      console.error('Error removing local file:', err);
    }
  }

  return true;
}
