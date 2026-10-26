# DrivePDF Portal - Google Drive PDF Management System 📄☁️

Yeh application aapke diye gaye sketch / structure ke mutabik banai gayi hai:

---

## 📐 Architecture (Aapke Sketch ke anusar)

### 1. **Page 1: Home (`/`)**
- **Show All Files:** Saare uploaded PDF files ek attractive grid / table list me dikhte hain.
- **Name & Info:** Har file ka Name (Title) aur Info (Description / Notes) visible hai.
- **View / Details PDF Button:**
  - In-app PDF Viewer Modal me PDF document open hota hai.
  - Direct Download button.
  - Share link button.
  - Live Search (Name & Info search) aur Sort filters.

### 2. **Page 2: File Upload Admin (`/admin`)**
- **PDF Upload = Google Drive:**
  - Form fields:
    - **Name:** Document ka Title.
    - **Info:** Document ki details ya description.
    - **PDF File:** Drag-and-drop ya file browse selector.
  - "Upload to Google Drive" button file ko direct Google Drive backend me bhejta hai.
- **Show Uploading File Here Show Admin:**
  - Saare uploaded files ki list admin panel me table format me dikhti hai.
  - **Delete PDF Button:** Kisi bhi file ko Google Drive aur database se 1-click me delete karne ka option.
  - **Preview & Direct Link:** Har file ko inspect karne ke controls.
- **Admin Secret Security Gate (Password Lock):**
  - Admin page unauthorized visitors se protected hai.
  - Jab koi `/admin` open karega, sleek dark security screen dikhegi jahan **Secret Key** mangi jayegi.
  - **Default Secret Key:** `admin123`
  - Admin settings me jakar aap kabhi bhi apna naya secret password set kar sakte hain.
  - **Lock & Exit:** 1-click me panel ko dobara lock karne ka button.

---

## 🚀 How to Run (Project Start Karne Ka Tarika)

Application already **http://localhost:3000** par chal rahi hai!

Agar kabhi dubara start karna ho:
```bash
cd D:\pdf-marketplace
npm run dev
```

Browser me open karein:
- **Page 1 (Home):** [http://localhost:3000](http://localhost:3000)
- **Page 2 (Admin Upload):** [http://localhost:3000/admin](http://localhost:3000/admin)

---

## ☁️ Google Drive Backend Connect Karne Ke 2 Aasan Tarike

### Tarika 1: Google Apps Script (Sabse Aasan aur 100% Free - 2 Minutes)
1. Browser me [script.google.com](https://script.google.com) kholein aur **New Project** par click karein.
2. Purana code hata kar Admin panel me diya gaya script paste karein:
   ```javascript
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
     } catch (err) {
       return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
         .setMimeType(ContentService.MimeType.JSON);
     }
   }
   ```
3. Upar **Deploy** -> **New deployment** par click karein.
4. Select type: **Web app**.
5. **Execute as:** `Me` aur **Who has access:** `Anyone` select karein.
6. **Deploy** dabayein aur milne wala **Web App URL** copy karein.
7. Admin panel (`/admin`) me jakar "Google Drive Settings" me URL paste kar ke Save karein!

### Tarika 2: Google Cloud Service Account
Agar aapke paas Google Cloud Console ka Service Account email aur Private Key hai, to `.env` me set kar sakte hain:
```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
GOOGLE_DRIVE_FOLDER_ID=your_drive_folder_id
```

### Local Storage Mode (Out-of-the-box Fallback)
Jab tak aap Google Drive URL configure nahi karte, application safely local storage mode me kaam karti hai, taaki testing me koi rukawat na aaye!
