# ⚡ Quick Start Guide - Setup 5 Menit

## 🎯 Tujuan
Menjalankan NIMESTREAM aplikasi anime streaming di komputer Anda dalam 5 menit.

## ✅ Prerequisites
- Node.js v14+ (Download: https://nodejs.org)
- Git (Download: https://git-scm.com) - Optional
- Browser modern (Chrome, Firefox, Safari, Edge)

## 🚀 Langkah-langkah Setup

### 1️⃣ Extract/Clone Project (1 menit)

```bash
# Option A: Jika dari ZIP
unzip nimestream.zip
cd nimestream

# Option B: Jika dari Git
git clone <repository-url>
cd nimestream
```

### 2️⃣ Install Dependencies (2 menit)

```bash
npm install
# Tunggu sampai selesai (~50-100MB)
```

### 3️⃣ Setup Firebase (OPTIONAL - untuk fitur comments)

Jika ingin menggunakan comments & user profiles:

**A. Buat Firebase Project:**
1. Buka https://console.firebase.google.com
2. Klik "Create Project"
3. Isi project name: "nimestream" (atau nama lain)
4. Klik "Create"

**B. Setup Authentication:**
1. Firebase Console → Authentication → Get Started
2. Enable "Email/Password" & "Google"

**C. Setup Firestore:**
1. Firebase Console → Firestore Database → Create Database
2. Mode: Test mode (untuk development)
3. Location: (pilih terdekat dengan lokasi Anda)

**D. Setup Storage:**
1. Firebase Console → Storage → Get Started
2. Rules: Click next, next, done

**E. Copy Credentials:**
1. Firebase Console → Project settings (gear icon)
2. Copy "firebaseConfig" object
3. Edit `public/js/config.js` - paste credentials

```javascript
const firebaseConfig = {
  apiKey: "COPY_DARI_FIREBASE",
  authDomain: "COPY_DARI_FIREBASE",
  projectId: "COPY_DARI_FIREBASE",
  // ... dst
};
```

### 4️⃣ Jalankan Server (1 menit)

```bash
# Development mode (dengan auto-reload)
npm run dev

# Atau Production mode
npm start

# Server akan running di: http://localhost:3000
```

### 5️⃣ Buka di Browser

Pergi ke: **http://localhost:3000**

---

## ✨ Apa yang Bisa Dilakukan Sekarang

✅ **Home Page** - Lihat anime trending, recent, upcoming
✅ **Search** - Cari anime favorit Anda
✅ **Explore** - Filter: All, Ongoing, Completed, Movies, Genre
✅ **Detail** - Lihat sinopsis lengkap & daftar episode
✅ **Comments** - Posting komentar (jika Firebase configured)
✅ **Profile** - Upload avatar & manage profile (jika Firebase configured)
✅ **Watch** - Pilih server & quality untuk menonton
✅ **Favorites** - Tambahkan anime favorit (jika Firebase configured)
✅ **Dark Mode** - Toggle tema gelap/terang

---

## 🔌 Tanpa Firebase (Comments Disabled)

Jika tidak ingin setup Firebase, aplikasi tetap berfungsi 100%:
- ✅ Home page
- ✅ Search & explore
- ✅ Detail & sinopsis
- ✅ Watch video
- ✅ Dark mode
- ❌ Comments (akan meminta login)
- ❌ Favorites persistence (akan hilang saat refresh)
- ❌ Avatar upload

---

## 🛠️ Troubleshooting

### Error: "Cannot find module 'express'"
```bash
# Jalankan lagi:
npm install
```

### Port 3000 sudah terpakai
```bash
# Ubah port di server.js:
const PORT = process.env.PORT || 3001;  // ganti 3001 dengan port lain

# Atau set environment variable:
PORT=3001 npm start
```

### Firebase connection error
```
Jika comments tidak berfungsi tapi halaman normal:
→ Firebase config belum disetup dengan benar
→ Cek apakah credentials di public/js/config.js benar
→ Cek internet connection
```

### "Cannot GET /"
```bash
# Pastikan server running:
npm start

# Browser belum reload, coba:
Ctrl + Shift + R (hard refresh)
atau
Cmd + Shift + R (Mac)
```

### Blank page / white screen
```
1. Buka DevTools: F12
2. Check Console tab untuk error
3. Check Network tab - apakah file JS/CSS ter-load?
4. Report error message ke development team
```

---

## 📁 File Structure Quick Reference

```
nimestream/
├── public/              ← Frontend files
│   ├── index.html       ← Main page
│   ├── css/
│   │   ├── style.css    ← Main styles (24KB)
│   │   └── responsive.css ← Mobile styles
│   └── js/
│       ├── config.js    ← Firebase config
│       ├── api.js       ← API calls
│       ├── firebase.js  ← Firebase operations
│       ├── ui.js        ← UI helpers
│       └── app.js       ← Main logic
├── server.js            ← Express.js server
├── package.json         ← Dependencies
├── .env                 ← Environment variables
└── README.md            ← Full documentation
```

---

## 📱 Testing di Different Devices

### Desktop
```
Langsung buka: http://localhost:3000
```

### Mobile (Simulasi)
```
F12 → Toggle device toolbar (Ctrl+Shift+M)
Pilih device: iPhone, Android, iPad
```

### Mobile Real Device (Same WiFi)
```
1. Cari IP address komputer:
   - Windows: ipconfig | grep "IPv4"
   - Mac/Linux: ifconfig | grep "inet "

2. Di phone buka: http://<IP>:3000
   Contoh: http://192.168.1.100:3000
```

---

## 🎮 Demo Actions

1. **Search Anime**
   - Klik search icon di navbar
   - Ketik: "naruto" atau "attack on titan"
   - Lihat hasil pencarian

2. **Browse Genre**
   - Explore → Genre
   - Klik salah satu genre
   - Lihat daftar anime genre tersebut

3. **View Detail**
   - Klik anime card manapun
   - Lihat sinopsis lengkap
   - Lihat daftar episode

4. **Simulate Watch**
   - Klik "Mulai Menonton" atau episode
   - Pilih server
   - (Video placeholder - ganti dengan real link)

5. **Add Comment** (jika Firebase setup)
   - Scroll ke bagian comments
   - Ketik komentar
   - Klik "Kirim"

6. **Change Avatar** (jika Firebase setup)
   - Klik avatar di navbar
   - Edit Profil
   - Upload gambar
   - Save

---

## 🔒 Security Notes

- ❗ **Jangan commit `.env` ke Git** - Sudah di `.gitignore`
- ❗ **Jangan share Firebase credentials publicly**
- ❗ **Setup proper Firestore rules sebelum production**
- ✅ CORS enabled untuk development

---

## 📚 Dokumentasi Lengkap

Untuk dokumentasi detail:
- Baca: `README.md`
- Implementasi fitur: `FEATURES.md`
- API docs: `README.md` → API Documentation

---

## ✅ Checklist Setup Berhasil

- [ ] npm install selesai tanpa error
- [ ] npm start/npm run dev berjalan
- [ ] Browser buka http://localhost:3000 sukses
- [ ] Halaman home menampilkan anime
- [ ] Search berfungsi
- [ ] Dark mode toggle bekerja
- [ ] Explore page bisa di-filter

---

## 🆘 Need Help?

Jika ada masalah:

1. **Cek error di console:**
   - F12 → Console tab
   - Catat error message

2. **Cek error di server:**
   - Lihat terminal/cmd output saat npm start
   - Catat error message

3. **Restart:**
   ```bash
   Ctrl+C (stop server)
   npm start (jalankan lagi)
   ```

4. **Reinstall:**
   ```bash
   rm -rf node_modules
   npm install
   npm start
   ```

5. **Check internet:**
   - Pastikan API bisa diakses: https://api.jikan.moe/v4/anime/1

---

## 🎉 Selamat!

Aplikasi Anda sudah running! 🚀

Sekarang Anda bisa:
- Explore anime library
- Search anime favorit
- View detail & sinopsis
- Konfigurasi Firebase untuk comments
- Deploy ke production

Enjoy! 🎬🍿

---

**Next Steps:**
- Baca `README.md` untuk setup production
- Baca `FEATURES.md` untuk detailed features
- Customize colors & branding
- Deploy ke Heroku/Vercel/Firebase Hosting
