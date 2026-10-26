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
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        fileId: file.getId(),
        webViewLink: file.getUrl(),
        webContentLink: "https://drive.google.com/uc?export=download&id=" + file.getId()
      })).setMimeType(ContentService.MimeType.JSON);
    } else if (data.action === "delete") {
      var fileToDelete = DriveApp.getFileById(data.fileId);
      fileToDelete.setTrashed(true);
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
  return ContentService.createTextOutput(JSON.stringify({ status: "Google Drive Backend is running!" }))
    .setMimeType(ContentService.MimeType.JSON);
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
  mimeType = 'application/pdf'
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

  // Mode 3: Local Storage Fallback
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
}

export async function deletePdfFile(fileId?: string, localPath?: string): Promise<boolean> {
  const config = getDriveConfig();

  // Try Apps Script delete
  if (fileId && config.mode === 'apps_script' && config.appsScriptUrl) {
    try {
      await fetch(config.appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', fileId }),
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
