# 📥 NIMESTREAM v2.0 - Download & Installation Guide

## 🎯 Pilih Format Download

Ada 3 format file yang tersedia:

### ✅ **Format 1: ZIP (Recommended)**
- **File:** `nimestream-v2.0.zip` (55 KB)
- **Untuk:** Windows, Mac, Linux
- **Tools:** WinRAR, 7-Zip, Built-in ekstrak
- **Cara extract:**
  ```bash
  unzip nimestream-v2.0.zip
  cd nimestream
  ```

### ✅ **Format 2: TAR.GZ**
- **File:** `nimestream-v2.0.tar.gz` (45 KB)
- **Untuk:** Linux, Mac, WSL
- **Tools:** tar command
- **Cara extract:**
  ```bash
  tar -xzf nimestream-v2.0.tar.gz
  cd nimestream
  ```

### ✅ **Format 3: Individual Files**
- **Files:** Semua file terpisah di folder ini
- **Untuk:** Custom installation, Git repository
- **Cara:** Copy file sesuai kebutuhan

---

## 🚀 Setup Instructions

### Prerequisites
```bash
# Check Node.js installed
node --version  # Should be v14+
npm --version   # Should be v6+

# If not installed, download from: https://nodejs.org
```

### Step 1: Extract & Navigate
```bash
# Extract ZIP
unzip nimestream-v2.0.zip
cd nimestream

# OR extract TAR.GZ
tar -xzf nimestream-v2.0.tar.gz
cd nimestream
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Setup Configuration (Optional)
```bash
# For comments & profile features:
# 1. Create Firebase project at https://console.firebase.google.com
# 2. Copy credentials to public/js/config.js
# 3. Update .env file with your settings
```

### Step 4: Run Application
```bash
# Development mode
npm run dev

# OR Production mode
npm start
```

### Step 5: Open Browser
```
Go to: http://localhost:3000
```

---

## 📋 Files Included

### Archive Contents
```
nimestream/
├── public/
│   ├── index.html          - Main SPA file
│   ├── css/
│   │   ├── style.css       - Main styles
│   │   └── responsive.css  - Mobile styles
│   └── js/
│       ├── config.js       - Firebase config
│       ├── api.js          - API calls
│       ├── firebase.js     - Firebase ops
│       ├── ui.js           - UI helpers
│       └── app.js          - Main logic
├── server.js               - Express server
├── package.json            - Dependencies
├── .env                    - Config template
├── .gitignore              - Git ignore
├── setup.sh                - Setup script
└── Documentation/
    ├── README.md           - Full guide
    ├── QUICKSTART.md       - 5-min setup
    ├── FEATURES.md         - Features detail
    ├── SUMMARY.md          - Overview
    └── FILES_MANIFEST.txt  - File descriptions
```

---

## 📚 Documentation Files

| File | Size | Purpose |
|------|------|---------|
| **00_START_HERE.txt** | 11 KB | Quick overview |
| **README.md** | 11 KB | Complete guide |
| **QUICKSTART.md** | 7 KB | 5-minute setup |
| **FEATURES.md** | 12 KB | Feature details |
| **SUMMARY.md** | 12 KB | Project overview |
| **FILES_MANIFEST.txt** | 15 KB | File descriptions |
| **DOWNLOAD_GUIDE.md** | This file | Download help |

---

## ✅ Verification

### After extraction, verify files:
```bash
# List files
ls -la

# Check main files exist
ls public/js/*.js
ls public/css/*.css
test -f server.js && echo "✓ server.js found"
test -f package.json && echo "✓ package.json found"
```

### After npm install:
```bash
# Check node_modules created
test -d node_modules && echo "✓ Dependencies installed"

# Check npm scripts available
npm run dev --help
```

### After npm start:
```bash
# Server should output:
# 🚀 Nimestream server running on http://localhost:3000

# Browser should load the page without errors
# Check: F12 → Console for any errors
```

---

## 🔍 Troubleshooting

### Extract Issues

**Error: "Cannot find zip program"**
```bash
# Windows: Use built-in or install WinRAR/7-Zip
# Mac: Use built-in Archive Utility
# Linux: sudo apt-get install unzip
unzip nimestream-v2.0.zip
```

**Error: "File corrupted"**
- Re-download the file
- Check file size matches: ZIP (55KB) or TAR.GZ (45KB)

### Installation Issues

**Error: "npm: command not found"**
```bash
# Node.js not installed
# Download from: https://nodejs.org
# Reinstall Node.js

# Verify installation:
node --version
npm --version
```

**Error: "Cannot find module"**
```bash
# node_modules not installed or corrupted
rm -rf node_modules package-lock.json
npm install
```

**Error: "Port 3000 already in use"**
```bash
# Edit server.js and change PORT:
# const PORT = process.env.PORT || 3001;

# OR kill process using port 3000:
# Windows: netstat -ano | findstr :3000
# Mac/Linux: lsof -i :3000 | kill -9 <PID>
```

### Runtime Issues

**Error: "Cannot GET /"**
```bash
# Server not running properly
# Check console output for errors
# Try: npm run dev (development mode)
```

**Blank page / white screen**
```bash
# F12 → Console → check for errors
# F12 → Network → check if files loading
# Ctrl+Shift+R → hard refresh
```

**Firebase errors**
```bash
# Comments not working?
# → Firebase not configured
# → Config credentials in config.js wrong
# → Firestore rules not set

# Working without Firebase is fine
# Comments will just be disabled
```

---

## 💾 File Sizes

| Item | Size |
|------|------|
| nimestream-v2.0.zip | 55 KB |
| nimestream-v2.0.tar.gz | 45 KB |
| Extracted folder | ~200 KB |
| After npm install | ~350 MB (node_modules) |

---

## 🌐 Platform Compatibility

| OS | ZIP | TAR.GZ | Status |
|----|-----|--------|--------|
| Windows | ✅ | ⚠️ (WSL) | Full support |
| macOS | ✅ | ✅ | Full support |
| Linux | ✅ | ✅ | Full support |
| iOS | ⚠️ | ❌ | Not supported |
| Android | ⚠️ | ❌ | Need Android terminal |

**Note:** For mobile, use online IDE or run on desktop.

---

## 📱 Access from Other Devices

### Same Network
```bash
# Find your IP address:
# Windows: ipconfig
# Mac/Linux: ifconfig

# On other device (same WiFi):
# Open: http://<YOUR_IP>:3000
# Example: http://192.168.1.100:3000
```

### Remote Access
```bash
# Use ngrok (free):
npm install -g ngrok
ngrok http 3000

# Share the ngrok URL:
# https://xxx.ngrok.io
```

---

## ✨ Features Ready to Use

✅ Home page with carousel
✅ Search functionality
✅ Explore with filters
✅ Detail page with sinopsis
✅ Comments system (with Firebase)
✅ User profile (with Firebase)
✅ Avatar upload (with Firebase)
✅ Dark/Light theme
✅ Responsive design
✅ Watch page

---

## 🔧 Configuration

### Without Firebase (Comments disabled)
```bash
# Just run:
npm install
npm start

# Everything works except comments
```

### With Firebase (Full features)
```bash
# 1. Create Firebase project: https://console.firebase.google.com
# 2. Copy credentials
# 3. Edit: public/js/config.js
# 4. Paste credentials
# 5. Run: npm start
```

---

## 🚀 Next Steps

1. **Extract:** Choose ZIP or TAR.GZ
2. **Install:** `npm install`
3. **Configure:** (Optional) Setup Firebase
4. **Run:** `npm start`
5. **Enjoy:** Open http://localhost:3000
6. **Read:** Check README.md for more info

---

## 📞 Need Help?

**Quick issues:**
→ Read: QUICKSTART.md

**Detailed setup:**
→ Read: README.md

**Feature questions:**
→ Read: FEATURES.md

**File descriptions:**
→ Read: FILES_MANIFEST.txt

**Code comments:**
→ Check source files (well commented)

---

## ✅ Success Checklist

After following this guide:

- [ ] Files extracted successfully
- [ ] npm install completed
- [ ] Server started without errors
- [ ] Browser loaded http://localhost:3000
- [ ] Home page visible with anime data
- [ ] Search works
- [ ] Dark mode toggle works
- [ ] No console errors (F12)

---

**Version:** 2.0.0  
**Date:** February 24, 2025  
**Status:** ✅ Complete & Production-Ready

Happy Streaming! 🎬🍿
