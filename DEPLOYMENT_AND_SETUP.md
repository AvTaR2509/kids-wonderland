# 🎈 Kids WonderLand - Deployment & Setup Guide

यह गाइड **Kids WonderLand (PDF Worksheet Marketplace)** को **GitHub**, **Netlify**, और **Google Drive** के साथ सेटअप करने के लिए तैयार की गई है।

---

## 🌟 मुख्य फीचर्स (Features)

1. **बच्चों के लिए स्पेशल लैंडिंग पेज:**
   - 🦁 Interactive Animal Soundboard (शेर, हाथी, बंदर, पक्षी की आवाजें)
   - 📚 Age filter (Age 2-4, 4-6, 6-8) के साथ वर्कशीट्स
   - 🎁 Free Gift / Free Download डायरेक्ट एक्सेस
   - 🛍️ Instant UPI QR Pay / Buy Now मॉडल
   - 🔍 PDF Preview Modal

2. **सुरक्षित Admin Panel (`/admin`):**
   - Username: `admin` | Password: `admin123`
   - नई वर्कशीट्स अपलोड करें (Title, Hindi Title, Price, Age, Emoji, Badge, PDF File)
   - Google Drive Integration: फाइल्स सीधे आपके Google Drive में स्टोर होती हैं!

---

## 🚀 Step 1: GitHub पर प्रोजेक्ट अपलोड करें

अपने कंप्यूटर में **PowerShell** या **Terminal** खोलें और निम्नलिखित कमांड्स रन करें:

```powershell
cd D:\pdf-marketplace
git add .
git commit -m "Kids WonderLand complete update for Netlify & Google Drive"
```

अगर आपने अभी तक GitHub पर Repository नहीं बनाई है:
1. **[github.com/new](https://github.com/new)** पर जाएं।
2. Repository का नाम रखें: `kids-wonderland` (Private या Public)।
3. **Create repository** पर क्लिक करें।
4. इसके बाद टर्मिनल में यह कमांड्स रन करें:

```powershell
git remote add origin https://github.com/avtar25/kids-wonderland.git
git branch -M main
git push -u origin main
```
*(यदि remote पहले से जुड़ा हुआ है तो केवल `git push -u origin main` करें)*

---

## 🌐 Step 2: Netlify पर पुराना प्रोजेक्ट हटाएं और नया Deploy करें

1. **[app.netlify.com/teams/avtar25/projects](https://app.netlify.com/teams/avtar25/projects)** पर जाएं।
2. **पुराने प्रोजेक्ट को हटाएं (Delete Old Project):**
   - पुराने प्रोजेक्ट के नाम पर क्लिक करें।
   - ऊपर मेनू से **Site configuration** (या **Site settings**) में जाएं।
   - सबसे नीचे स्क्रॉल करें और **Danger Zone** में **Delete this site** पर क्लिक करें।
   - कन्फर्म करने के लिए साइट का नाम टाइप करें और डिलीट कर दें।

3. **नया प्रोजेक्ट Deploy करें (Deploy New Site):**
   - वापस **Projects** या **Team Overview** पेज पर जाएं।
   - **"Add new site"** ➔ **"Import an existing project"** पर क्लिक करें।
   - **GitHub** को सेलेक्ट करें और अपनी `kids-wonderland` रिपॉजिटरी चुनें।
   - Build Settings जांचें:
     - **Base directory:** (खाली छोड़ें)
     - **Build command:** `npm run build`
     - **Publish directory:** `.next`
   - **"Deploy kids-wonderland"** पर क्लिक करें!
   - 1 से 2 मिनट में आपकी साइट लाइव हो जाएगी।

---

## ☁️ Step 3: Google Drive Integration (PDF Upload सीधे Google पर)

Netlify का सर्वर Serverless (Read-only) होता है, इसलिए फाइल्स को सीधे आपके Google Drive में भेजने के लिए Google Apps Script का उपयोग किया जाता है।

### Google Apps Script सेटअप करने के 4 आसान स्टेप्स:

1. **[script.google.com](https://script.google.com)** पर जाएं और **"New project"** पर क्लिक करें।
2. वहां मौजूद कोड को डिलीट करके नीचे दिया गया कोड पेस्ट करें:

```javascript
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
  return ContentService.createTextOutput(JSON.stringify({ status: "Google Drive Backend is running!" }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. ऊपर दाईं ओर **Deploy** ➔ **New deployment** पर क्लिक करें:
   - Select type: **Web app**
   - Description: `Kids Marketplace`
   - Execute as: **Me** (आपका ईमेल)
   - Who has access: **Anyone** *(महत्वपूर्ण)*
   - **Deploy** बटन दबाएं और Permissions Grant करें।
4. आपको एक **Web app URL** मिलेगा (जैसे: `https://script.google.com/macros/s/.../exec`).

### Admin Panel में URL जोड़ें:
1. अपनी वेबसाइट के `/admin` पेज पर जाएं (Username: `admin`, Password: `admin123`).
2. ऊपर **"Google Drive Settings"** (⚙️) बटन पर क्लिक करें।
3. वहां अपना **Web App URL** पेस्ट करें और **Save Settings** पर क्लिक करें।
4. बस! अब आप Admin Panel से जो भी नई PDF अपलोड करेंगे:
   - ✅ वह फाइल सीधे आपके **Google Drive** में सुरक्षित अपलोड होगी।
   - ✅ मुख्य लैंडिंग पेज पर वह वर्कशीट अपने आप लाइव दिखाई देगी।
   - ✅ कस्टमर उसे Preview कर सकेंगे और Buy/Download कर सकेंगे।
