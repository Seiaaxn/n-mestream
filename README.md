# 🎬 NIMESTREAM v2.0 - Platform Streaming Anime Premium

Aplikasi web streaming anime dengan fitur lengkap, comment system berbasis Firebase, profile management, dan modern UI/UX.

## ✨ Fitur Utama

### 1. **Home Page**
- 🎞️ Hero carousel dengan anime trending terbaru
- 📺 Section trending, episode terbaru, dan upcoming
- Smooth transition dan responsive design
- Auto-play carousel setiap 5 detik

### 2. **Search & Explore**
- 🔍 Search bar real-time dengan autocomplete
- 📂 Filter: Semua, Ongoing, Completed, Movies, Genre
- 📊 Pagination untuk hasil unlimited
- History pencarian (disimpan di Firestore)

### 3. **Detail Anime**
- 🖼️ Poster dan rating ⭐
- 📖 Sinopsis lengkap
- 📺 Daftar episode dengan pagination
- ❤️ Favorit management
- 💬 Comment system real-time dengan Firebase

### 4. **Watch Page**
- 🎥 Video player dengan multi-server support
- 🖥️ Pilih quality (1080p, 720p, 480p, dll)
- ◀️ Navigation previous/next episode
- 📋 Episode quick list
- ✓ Auto mark episode sebagai watched

### 5. **User Profile**
- 👤 Profile management dengan avatar upload
- 🔐 Firebase Authentication
- ❤️ Favorites management
- 📺 Watchlist tracking
- 🎯 Activity feed
- 🔐 Secure logout

### 6. **Comments System**
- 💬 Real-time comments powered by Firebase
- 👤 Avatar profile saat berkomentar
- ⏰ Timestamp otomatis
- 📝 Edit/delete comment (owner only)
- ♥ Like comments
- Responsive comment layout

### 7. **Dark/Light Theme**
- 🌓 Theme toggle
- 💾 Persistent storage
- Smooth transition
- WCAG compliant colors

### 8. **Responsive Design**
- 📱 Mobile-first approach
- 💻 Desktop optimized
- 🖥️ Tablet friendly
- ⌨️ Keyboard navigation support

## 🚀 Instalasi & Setup

### Prerequisites
- Node.js v14+ dan npm
- Git
- Firebase account (untuk comments dan user data)

### Step 1: Clone & Install Dependencies

```bash
# Clone project
git clone <repository-url>
cd nimestream

# Install dependencies
npm install
```

### Step 2: Setup Firebase

1. Buat project baru di [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication (Google)
3. Enable Firestore Database
4. Enable Storage
5. Copy credential config

### Step 3: Konfigurasi Environment

```bash
# Copy .env.example ke .env
cp .env .env.local

# Edit .env.local dengan Firebase credentials Anda
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
# ... dst
```

### Step 4: Update Firebase Config di Code

Edit `public/js/config.js`:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "1:your-app-id:web:your-web-app-id"
};
```

### Step 5: Setup Firebase Firestore Rules

Buat rules untuk security (Firebase Console → Firestore → Rules):

```firebase
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{uid} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == uid;
    }
    
    // Comments collection
    match /comments/{document=**} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }
    
    // Watchlist collection
    match /watchlists/{document=**} {
      allow read, write: if request.auth.uid == resource.data.uid;
    }
    
    // Search history
    match /searchHistory/{document=**} {
      allow read, write: if request.auth.uid == resource.data.uid;
    }
    
    // Analytics
    match /analytics/{document=**} {
      allow write: if request.auth != null;
      allow read: if false; // Hanya backend
    }
  }
}
```

### Step 6: Setup Storage Rules

```firebase
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /avatars/{uid}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth.uid == uid && request.resource.size < 5 * 1024 * 1024;
    }
  }
}
```

### Step 7: Run Server

```bash
# Development
npm run dev

# Production
npm start

# Server akan berjalan di http://localhost:3000
```

### Step 8: Setup Web (Optional - jika deploy ke web server)

```bash
# Build/compile (jika menggunakan bundler)
npm run build

# Serve dari server
# Pastikan public folder accessible
```

## 📁 Struktur Project

```
nimestream/
├── public/
│   ├── index.html              # Main HTML
│   ├── css/
│   │   ├── style.css          # Main styles
│   │   └── responsive.css     # Responsive breakpoints
│   └── js/
│       ├── config.js          # Firebase & global config
│       ├── firebase.js        # Firebase helper functions
│       ├── api.js             # API calls & data loading
│       ├── ui.js              # UI components & helpers
│       └── app.js             # Main app logic
├── server.js                   # Node.js Express server
├── package.json               # Dependencies
├── .env                       # Environment variables
└── README.md                  # Documentation
```

## 🔑 Konfigurasi Lanjutan

### API Integration

Server menggunakan API dari:
- **Jikan API** (MyAnimeList) - Data anime
- **ConsumET API** - Streaming links

Edit `server.js` untuk mengubah endpoint:

```javascript
const API_BASE = 'https://api.jikan.moe/v4';
const ANIME_API = 'https://api.consumet.org/anime/gogoanime';
```

### Custom API Endpoint

Jika Anda memiliki API sendiri, update:

```javascript
// server.js
app.get('/api/anime/:id', async (req, res) => {
  // Custom logic di sini
});
```

### Database (Optional)

Untuk production, tambahkan database:

```javascript
// server.js
const db = require('./db'); // PostgreSQL/MongoDB connection

app.get('/api/comments/:animeId', async (req, res) => {
  const comments = await db.query('SELECT * FROM comments WHERE anime_id = ?');
  res.json(comments);
});
```

## 🎨 Customization

### Ubah Tema Warna

Edit `public/css/style.css`:

```css
:root {
  --primary: #6366F1;          /* Ubah warna utama */
  --accent: #F43F5E;           /* Ubah accent */
  --success: #10B981;          /* Ubah success */
  /* ... dst */
}
```

### Ubah Logo/Brand

Edit `public/index.html`:

```html
<span class="nav-logo-text">NIMESTREAM</span>  <!-- Ganti nama -->
<span class="nav-logo-icon">▶</span>            <!-- Ganti icon -->
```

### Ubah Nama Aplikasi

Edit:
1. `public/index.html` - `<title>` tag
2. `public/js/config.js` - PAGES constant
3. `public/js/app.js` - Console log messages

## 🔐 Security Tips

### 1. Protect API Keys

```javascript
// .env.local (never commit this)
FIREBASE_API_KEY=your_secret_key
```

### 2. Enable CORS Properly

```javascript
// server.js
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
```

### 3. Rate Limiting

```bash
npm install express-rate-limit
```

```javascript
// server.js
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);
```

### 4. Input Validation

```javascript
// server.js
const { body, validationResult } = require('express-validator');

app.post('/api/comments', [
  body('text').trim().isLength({ min: 1, max: 500 })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // Process comment
});
```

## 📊 Performance Optimization

### 1. Image Optimization

```html
<!-- Lazy load images -->
<img src="..." loading="lazy" alt="...">

<!-- Responsive images -->
<img srcset="small.jpg 480w, medium.jpg 1024w, large.jpg 1920w"
     src="medium.jpg" alt="...">
```

### 2. Code Splitting

```javascript
// Dynamic imports
const module = await import('./heavy-module.js');
```

### 3. Caching

```javascript
// server.js
app.use((req, res, next) => {
  res.set('Cache-Control', 'public, max-age=3600');
  next();
});
```

### 4. Compression

```javascript
// server.js
const compression = require('compression');
app.use(compression());
```

## 🐛 Troubleshooting

### Firebase Auth tidak bekerja

```javascript
// Pastikan config di config.js benar
// Aktifkan Authentication di Firebase Console
// Setup redirect URL di Firebase settings
```

### Comments tidak muncul

```javascript
// Check Firestore rules
// Pastikan user ter-authenticate
// Check browser console untuk error
```

### Video player tidak berjalan

```javascript
// Ganti iframe source dengan working streaming link
// Install ad-blocking extension
// Check CORS settings
```

### Halaman white screen

```bash
# Check console untuk error
# Verify semua file JS ter-load
# Check network tab di DevTools
```

## 📱 Browser Support

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🚀 Deployment

### Deploy ke Vercel

```bash
npm i -g vercel
vercel
```

### Deploy ke Heroku

```bash
heroku create nimestream
git push heroku main
```

### Deploy ke Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase deploy
```

### Deploy ke VPS (Ubuntu)

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone <url>
cd nimestream

# Install & run
npm install
npm start

# Setup PM2 untuk persistence
npm install -g pm2
pm2 start server.js --name "nimestream"
pm2 startup
pm2 save
```

## 📚 API Documentation

### Endpoints

#### Home
```
GET /api/home
Response: { trending, recent, upcoming }
```

#### Search
```
GET /api/search?query=naruto&page=1
Response: { data: [], pagination: {} }
```

#### Anime Detail
```
GET /api/anime/:id
Response: { data: { title, score, synopsis, ... } }
```

#### Ongoing Anime
```
GET /api/ongoing?page=1
Response: { data: [], pagination: {} }
```

#### Genre
```
GET /api/genres
GET /api/genre/:id?page=1
Response: { data: [], pagination: {} }
```

## 📝 License

MIT License - Bebas digunakan untuk project personal dan commercial

## 🤝 Contributing

Pull requests welcome! Silakan fork dan buat changes.

## 📞 Support

- 📧 Email: support@nimestream.com
- 💬 Discord: [Join Server]
- 🐛 Issues: GitHub Issues
- 📖 Docs: [Full Documentation]

## 🎯 Roadmap

- [ ] Video quality options (1080p, 720p, 480p)
- [ ] Social features (follow users, share)
- [ ] Recommendation engine
- [ ] Mobile app (React Native)
- [ ] Advanced search filters
- [ ] Batch download
- [ ] Subtitle support
- [ ] Continue watching feature
- [ ] Episode schedule notifications
- [ ] Analytics dashboard

## 🙏 Credits

- UI Design: Inspiration dari modern streaming platforms
- Data: MyAnimeList API (Jikan)
- Streaming: ConsumET API
- Backend: Express.js
- Database: Firebase
- Frontend: Vanilla HTML/CSS/JS

---

**Made with ❤️ by Anime Enthusiasts**

Happy Streaming! 🎉
