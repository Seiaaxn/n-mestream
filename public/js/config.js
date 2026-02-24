// ===== FIREBASE CONFIG =====
// Ganti dengan konfigurasi Firebase Anda sendiri
const firebaseConfig = {
  apiKey: "AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "nimestream-xxxxx.firebaseapp.com",
  projectId: "nimestream-xxxxx",
  storageBucket: "nimestream-xxxxx.appspot.com",
  messagingSenderId: "xxxxxxxxxx",
  appId: "1:xxxxxxxxxx:web:xxxxxxxxxx"
};

// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Konfigurasi Firestore
db.settings({ 
  merge: true 
});

// ===== CONSTANTS =====
const API_BASE = 'http://localhost:3000/api';
const IMAGES_BASE = 'https://cdn.myanimelist.net/images/anime';

const PAGES = {
  HOME: 'homePage',
  EXPLORE: 'explorePage',
  DETAIL: 'detailPage',
  WATCH: 'watchPage',
  FAVORITES: 'favoritesPage',
  PROFILE: 'profilePage'
};

// ===== GLOBAL STATE =====
let currentUser = null;
let currentDetailId = null;
let currentWatchData = null;
let currentEpisodeList = [];
let currentPage = 'homePage';
let exploreFilter = 'all';
let exploreCurrentPage = 1;
let episodeCurrentPage = 1;
let userProfile = {
  uid: null,
  username: 'Anonymous',
  email: '',
  avatar: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22%3E%3Ccircle cx=%2212%22 cy=%2212%22 r=%2210%22 fill=%22%23e0e0e0%22/%3E%3Ccircle cx=%2212%22 cy=%228%22 r=%223%22 fill=%22%23999%22/%3E%3Cpath d=%22M12 14c-5 0-7 2-7 4v3h14v-3c0-2-2-4-7-4z%22 fill=%22%23999%22/%3E%3C/svg%3E',
  favorites: []
};

// ===== UTILITY FUNCTIONS =====
function showToast(message, duration = 2000) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

function formatDate(date) {
  if (!date) return '-';
  if (date.toDate) date = date.toDate();
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function timeAgo(date) {
  if (!date) return '-';
  if (date.toDate) date = date.toDate();
  
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  if (seconds < 60) return 'Sekarang';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d lalu`;
  
  return formatDate(date);
}

function truncate(str, length = 150) {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
}

function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme') || 'light';
  const newTheme = current === 'light' ? 'dark' : 'light';
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  const sunIcon = document.getElementById('sunIcon');
  const moonIcon = document.getElementById('moonIcon');
  
  if (theme === 'dark') {
    sunIcon.style.display = 'none';
    moonIcon.style.display = 'block';
  } else {
    sunIcon.style.display = 'block';
    moonIcon.style.display = 'none';
  }
}

function initTheme() {
  const theme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeIcon(theme);
}

function navSearch() {
  const searchWrap = document.querySelector('.nav-search-wrap');
  const input = document.getElementById('navSearchInput');
  
  searchWrap.classList.toggle('active');
  if (searchWrap.classList.contains('active')) {
    input.focus();
  }
}

function goPage(page, filter = null) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  
  // Update nav items
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  
  // Show selected page
  const pageEl = document.getElementById(page + 'Page');
  if (pageEl) {
    pageEl.classList.add('active');
    currentPage = page + 'Page';
  }
  
  // Update bottom nav active state
  const navItems = document.querySelectorAll('.nav-item');
  if (page === 'home') navItems[0].classList.add('active');
  else if (page === 'explore') navItems[1].classList.add('active');
  else if (page === 'favorites') navItems[2].classList.add('active');
  else if (page === 'profile') navItems[3].classList.add('active');
  
  // Handle specific page logic
  if (page === 'explore') {
    if (filter) {
      exploreFilter = filter;
      document.querySelectorAll('.explore-tab').forEach(tab => {
        tab.classList.remove('active');
      });
      document.querySelector(`[data-filter="${filter}"]`)?.classList.add('active');
    }
    loadExplore(1);
  } else if (page === 'home') {
    loadHome();
  }
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== AUTH ===== 
function initAuth() {
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      currentUser = user;
      userProfile.uid = user.uid;
      userProfile.email = user.email;
      
      // Load user profile from Firestore
      try {
        const docSnap = await db.collection('users').doc(user.uid).get();
        if (docSnap.exists) {
          Object.assign(userProfile, docSnap.data());
        } else {
          // Create user profile
          await db.collection('users').doc(user.uid).set({
            uid: user.uid,
            username: user.displayName || 'User',
            email: user.email,
            avatar: userProfile.avatar,
            favorites: [],
            createdAt: new Date(),
            lastLogin: new Date()
          });
        }
      } catch (e) {
        console.error('Error loading user profile:', e);
      }
      
      updateNavAvatar();
      document.querySelector('.nav-user-section').style.display = 'flex';
    } else {
      currentUser = null;
      userProfile = {
        uid: null,
        username: 'Anonymous',
        email: '',
        avatar: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22%3E%3Ccircle cx=%2212%22 cy=%2212%22 r=%2210%22 fill=%22%23e0e0e0%22/%3E%3Ccircle cx=%2212%22 cy=%228%22 r=%223%22 fill=%22%23999%22/%3E%3Cpath d=%22M12 14c-5 0-7 2-7 4v3h14v-3c0-2-2-4-7-4z%22 fill=%22%23999%22/%3E%3C/svg%3E',
        favorites: []
      };
    }
  });
}

function updateNavAvatar() {
  if (currentUser) {
    const navAvatar = document.getElementById('navAvatar');
    navAvatar.src = userProfile.avatar;
    navAvatar.style.cursor = 'pointer';
  }
}

function openProfileModal() {
  if (!currentUser) {
    alert('Silakan login terlebih dahulu');
    return;
  }
  
  document.getElementById('profileModal').style.display = 'flex';
  document.getElementById('usernameInput').value = userProfile.username;
  document.getElementById('emailInput').value = userProfile.email;
  document.getElementById('profileAvatarPreview').src = userProfile.avatar;
}

function closeProfileModal() {
  document.getElementById('profileModal').style.display = 'none';
}

async function uploadAvatar(event) {
  if (!currentUser) return;
  
  const file = event.target.files[0];
  if (!file) return;
  
  try {
    const storageRef = storage.ref(`avatars/${currentUser.uid}`);
    await storageRef.put(file);
    const downloadUrl = await storageRef.getDownloadURL();
    
    userProfile.avatar = downloadUrl;
    document.getElementById('profileAvatarPreview').src = downloadUrl;
    
    showToast('Avatar berhasil diperbarui');
  } catch (err) {
    console.error('Error uploading avatar:', err);
    showToast('Gagal upload avatar');
  }
}

async function submitProfileForm(e) {
  e.preventDefault();
  
  if (!currentUser) return;
  
  try {
    userProfile.username = document.getElementById('usernameInput').value;
    
    await db.collection('users').doc(currentUser.uid).update({
      username: userProfile.username,
      avatar: userProfile.avatar,
      lastUpdated: new Date()
    });
    
    updateNavAvatar();
    showToast('Profil berhasil diperbarui');
    closeProfileModal();
  } catch (err) {
    console.error('Error updating profile:', err);
    showToast('Gagal memperbarui profil');
  }
}

function logout() {
  auth.signOut().then(() => {
    showToast('Logout berhasil');
    goPage('home');
  }).catch(err => {
    console.error('Logout error:', err);
    showToast('Gagal logout');
  });
}

// Set up profile form submit
document.addEventListener('DOMContentLoaded', () => {
  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', submitProfileForm);
  }
  
  // Theme toggle
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  
  // Nav avatar click
  document.getElementById('navAvatar').addEventListener('click', (e) => {
    const dropdown = document.getElementById('userDropdown');
    dropdown.style.display = dropdown.style.display === 'none' ? 'flex' : 'none';
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    const userSection = document.querySelector('.nav-user-section');
    if (!userSection.contains(e.target)) {
      document.getElementById('userDropdown').style.display = 'none';
    }
  });
  
  // Nav search
  document.querySelector('.nav-search-icon').addEventListener('click', navSearch);
});

// ===== STORAGE HELPERS =====
function saveFavorite(animeId) {
  if (!currentUser) {
    alert('Silakan login untuk menambah favorit');
    return;
  }
  
  if (!userProfile.favorites.includes(animeId)) {
    userProfile.favorites.push(animeId);
    db.collection('users').doc(currentUser.uid).update({
      favorites: userProfile.favorites
    });
  }
}

function removeFavorite(animeId) {
  if (!currentUser) return;
  
  userProfile.favorites = userProfile.favorites.filter(id => id !== animeId);
  db.collection('users').doc(currentUser.uid).update({
    favorites: userProfile.favorites
  });
}

function isFavorite(animeId) {
  return userProfile.favorites.includes(animeId);
}

// ===== LOCAL STORAGE =====
function saveWatchedEpisode(episodeId, animeId) {
  let watched = JSON.parse(localStorage.getItem('watchedEpisodes') || '{}');
  watched[episodeId] = {
    animeId,
    watchedAt: new Date().toISOString()
  };
  localStorage.setItem('watchedEpisodes', JSON.stringify(watched));
}

function isWatchedEpisode(episodeId) {
  const watched = JSON.parse(localStorage.getItem('watchedEpisodes') || '{}');
  return !!watched[episodeId];
}
