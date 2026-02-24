// ===== APP INITIALIZATION & MAIN LOGIC =====

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 NIMESTREAM v2.0 initializing...');
  
  // Initialize theme
  initTheme();
  
  // Initialize Firebase Auth
  initAuth();
  
  // Initialize Nav Search
  initNavSearch();
  
  // Load home page
  await loadHome();
  
  // Initialize other listeners
  initEventListeners();
  
  // Hide loader
  setTimeout(() => {
    const loader = document.getElementById('loader');
    loader.classList.add('hidden');
    setTimeout(() => {
      loader.style.display = 'none';
    }, 500);
  }, 1500);
  
  console.log('✅ NIMESTREAM initialized successfully');
});

// ===== NAVIGATION SEARCH =====
function initNavSearch() {
  const searchInput = document.getElementById('navSearchInput');
  const searchWrap = document.querySelector('.nav-search-wrap');
  const searchIcon = document.querySelector('.nav-search-icon');
  
  if (!searchInput) return;
  
  // Toggle search visibility
  searchIcon?.addEventListener('click', () => {
    searchWrap?.classList.toggle('active');
    if (searchWrap?.classList.contains('active')) {
      searchInput.focus();
    }
  });
  
  // Search on input with debounce
  let searchTimeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();
    
    if (query.length < 2) {
      return;
    }
    
    searchTimeout = setTimeout(() => {
      performSearch(query);
    }, 300);
  });
  
  // Close search on escape
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchWrap?.classList.remove('active');
      searchInput.value = '';
    }
  });
  
  // Search on enter
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      performSearch(e.target.value);
    }
  });
}

async function performSearch(query) {
  if (!query.trim()) return;
  
  try {
    goPage('explore');
    
    // Save search to history
    if (currentUser) {
      addToSearchHistory(currentUser.uid, query);
    }
    
    const response = await apiFetch(`/search?query=${encodeURIComponent(query)}`);
    
    if (!response.success || !response.data) {
      showToast('Tidak ada hasil pencarian');
      return;
    }
    
    const grid = document.getElementById('exploreGrid');
    grid.innerHTML = response.data.map(anime => `
      <div class="anime-card" onclick="openDetail('${anime.mal_id}')">
        <img src="${anime.images?.jpg?.large_image_url || ''}" 
             alt="${anime.title}" 
             class="anime-card-image">
        <div class="anime-card-title">${anime.title}</div>
        <div class="anime-card-meta">⭐ ${anime.score || 'N/A'}</div>
      </div>
    `).join('');
    
    buildPagination(
      document.getElementById('explorePagination'), 
      1, 
      response.pagination, 
      (newPage) => {
        performSearch(query);
      }
    );
    
    document.getElementById('exploreTitle').textContent = `Hasil Pencarian: "${query}"`;
    
  } catch (error) {
    console.error('Search error:', error);
    showToast('Gagal melakukan pencarian');
  }
}

// ===== EVENT LISTENERS =====
function initEventListeners() {
  // Prevent body scroll when modal is open
  const style = document.createElement('style');
  style.textContent = `
    body.modal-open {
      overflow: hidden;
    }
  `;
  document.head.appendChild(style);
  
  // Close all modals on backdrop click
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal') && e.target.style.display !== 'none') {
      e.target.style.display = 'none';
    }
  });
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K for search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      document.querySelector('.nav-search-wrap')?.classList.add('active');
      document.getElementById('navSearchInput')?.focus();
    }
    
    // Escape to close search
    if (e.key === 'Escape') {
      document.querySelector('.nav-search-wrap')?.classList.remove('active');
    }
  });
  
  // Prevent accidental navigation
  window.addEventListener('beforeunload', (e) => {
    if (currentPage === 'watchPage') {
      e.preventDefault();
      e.returnValue = '';
    }
  });
}

// ===== PROFILE PAGE =====
async function goPage(page, filter = null) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  
  // Update nav items
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  
  // Show selected page
  let pageId = page + 'Page';
  const pageEl = document.getElementById(pageId);
  
  if (!pageEl && page !== 'favorites' && page !== 'profile') {
    console.error(`Page ${pageId} not found`);
    return;
  }
  
  // Handle special pages that don't exist yet
  if (page === 'favorites' || page === 'profile') {
    if (page === 'favorites') {
      loadFavoritesPage();
    } else if (page === 'profile') {
      loadProfilePage();
    }
    return;
  }
  
  if (pageEl) {
    pageEl.classList.add('active');
    currentPage = pageId;
  }
  
  // Update bottom nav active state
  const navItems = document.querySelectorAll('.nav-item');
  if (page === 'home') {
    navItems[0]?.classList.add('active');
  } else if (page === 'explore') {
    navItems[1]?.classList.add('active');
  } else if (page === 'favorites') {
    navItems[2]?.classList.add('active');
  } else if (page === 'profile') {
    navItems[3]?.classList.add('active');
  }
  
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

async function loadFavoritesPage() {
  if (!currentUser) {
    // Create favorites page dynamically
    const pageEl = document.createElement('div');
    pageEl.id = 'favoritesPage';
    pageEl.className = 'page active';
    pageEl.innerHTML = `
      <div style="padding: 20px; text-align: center; min-height: 60vh; display: flex; align-items: center; justify-content: center; flex-direction: column;">
        <div style="font-size: 48px; margin-bottom: 16px;">🔐</div>
        <h2>Login Required</h2>
        <p style="color: var(--text3); margin-bottom: 24px;">Silakan login untuk melihat favorit Anda</p>
        <button class="btn btn-primary" onclick="alert('Firebase Auth belum dikonfigurasi')">
          Login dengan Google
        </button>
      </div>
    `;
    
    const mainContent = document.querySelector('.main-content');
    mainContent.innerHTML = '';
    mainContent.appendChild(pageEl);
    
    updateNavState('favorites');
    return;
  }
  
  try {
    const favorites = await getFavorites(currentUser.uid);
    
    const pageEl = document.createElement('div');
    pageEl.id = 'favoritesPage';
    pageEl.className = 'page active';
    
    if (favorites.length === 0) {
      pageEl.innerHTML = `
        <div style="padding: 20px;">
          <h2 style="margin-bottom: 20px;">Favorit Saya</h2>
          <div style="text-align: center; padding: 60px 20px; color: var(--text3);">
            <div style="font-size: 48px; margin-bottom: 16px;">💔</div>
            <p>Belum ada anime favorit. Mulai tambahkan anime favorit Anda!</p>
          </div>
        </div>
      `;
    } else {
      let html = '<div style="padding: 20px;"><h2 style="margin-bottom: 20px;">Favorit Saya</h2>';
      html += '<div class="explore-grid">';
      
      favorites.forEach(fav => {
        html += `
          <div class="anime-card" onclick="openDetail('${fav.animeId}')">
            <img src="${fav.image}" alt="${fav.title}" class="anime-card-image">
            <div class="anime-card-title">${fav.title}</div>
            <div class="anime-card-meta">⭐ ${fav.score || 'N/A'}</div>
          </div>
        `;
      });
      
      html += '</div></div>';
      pageEl.innerHTML = html;
    }
    
    const mainContent = document.querySelector('.main-content');
    mainContent.innerHTML = '';
    mainContent.appendChild(pageEl);
    
    updateNavState('favorites');
    
  } catch (error) {
    console.error('Error loading favorites:', error);
    showToast('Gagal memuat favorit');
  }
}

async function loadProfilePage() {
  if (!currentUser) {
    const pageEl = document.createElement('div');
    pageEl.id = 'profilePage';
    pageEl.className = 'page active';
    pageEl.innerHTML = `
      <div style="padding: 20px; text-align: center; min-height: 60vh; display: flex; align-items: center; justify-content: center; flex-direction: column;">
        <div style="font-size: 48px; margin-bottom: 16px;">👤</div>
        <h2>Login Required</h2>
        <p style="color: var(--text3); margin-bottom: 24px;">Silakan login untuk mengakses profil</p>
        <button class="btn btn-primary" onclick="alert('Firebase Auth belum dikonfigurasi')">
          Login dengan Google
        </button>
      </div>
    `;
    
    const mainContent = document.querySelector('.main-content');
    mainContent.innerHTML = '';
    mainContent.appendChild(pageEl);
    
    updateNavState('profile');
    return;
  }
  
  try {
    const userProfile = await getUserProfile(currentUser.uid);
    const watchlist = await getWatchlist(currentUser.uid);
    const activities = await getUserActivity(currentUser.uid);
    
    const pageEl = document.createElement('div');
    pageEl.id = 'profilePage';
    pageEl.className = 'page active';
    
    let html = `
      <div style="padding: 20px;">
        <div style="background: var(--surface); padding: 24px; border-radius: var(--radius); margin-bottom: 24px; box-shadow: var(--shadow-sm);">
          <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 20px;">
            <img src="${userProfile.avatar}" alt="Avatar" style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid var(--primary);">
            <div>
              <h2 style="margin-bottom: 4px;">${userProfile.username}</h2>
              <p style="color: var(--text3); font-size: 14px;">${userProfile.email}</p>
              <button class="btn btn-secondary" onclick="openProfileModal()" style="margin-top: 8px;">Edit Profil</button>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 20px;">
            <div style="background: var(--bg); padding: 12px; border-radius: var(--radius-sm); text-align: center;">
              <div style="font-size: 24px; font-weight: 800; color: var(--primary);">${watchlist.length}</div>
              <div style="font-size: 12px; color: var(--text3);">Watchlist</div>
            </div>
            <div style="background: var(--bg); padding: 12px; border-radius: var(--radius-sm); text-align: center;">
              <div style="font-size: 24px; font-weight: 800; color: var(--primary);">${userProfile.favorites?.length || 0}</div>
              <div style="font-size: 12px; color: var(--text3);">Favorit</div>
            </div>
            <div style="background: var(--bg); padding: 12px; border-radius: var(--radius-sm); text-align: center;">
              <div style="font-size: 24px; font-weight: 800; color: var(--primary);">${activities.length}</div>
              <div style="font-size: 12px; color: var(--text3);">Aktivitas</div>
            </div>
          </div>
        </div>
        
        <div style="background: var(--surface); padding: 24px; border-radius: var(--radius); box-shadow: var(--shadow-sm);">
          <h3 style="margin-bottom: 16px;">Aktivitas Terbaru</h3>
          ${activities.length === 0 ? 
            '<p style="color: var(--text3); text-align: center; padding: 20px;">Belum ada aktivitas</p>' :
            activities.slice(0, 5).map(activity => `
              <div style="padding: 12px 0; border-bottom: 1px solid var(--border); font-size: 13px;">
                <strong>${activity.username}</strong> ${activity.type.replace(/_/g, ' ')}
                <div style="color: var(--text3); font-size: 12px;">${timeAgo(activity.createdAt)}</div>
              </div>
            `).join('')
          }
        </div>
        
        <button class="btn btn-secondary" onclick="logout()" style="width: 100%; margin-top: 24px;">Logout</button>
      </div>
    `;
    
    pageEl.innerHTML = html;
    const mainContent = document.querySelector('.main-content');
    mainContent.innerHTML = '';
    mainContent.appendChild(pageEl);
    
    updateNavState('profile');
    
  } catch (error) {
    console.error('Error loading profile:', error);
    showToast('Gagal memuat profil');
  }
}

function updateNavState(page) {
  document.querySelectorAll('.nav-item').forEach((item, idx) => {
    item.classList.remove('active');
  });
  
  const navItems = document.querySelectorAll('.nav-item');
  if (page === 'home') navItems[0]?.classList.add('active');
  else if (page === 'explore') navItems[1]?.classList.add('active');
  else if (page === 'favorites') navItems[2]?.classList.add('active');
  else if (page === 'profile') navItems[3]?.classList.add('active');
}

// ===== UTILITY EXPORTS =====
window.goPage = goPage;
window.openDetail = openDetail;
window.openWatch = openWatch;
window.toggleFavorite = toggleFavorite;
window.startWatching = startWatching;
window.loadExplore = loadExplore;
window.filterExplore = filterExplore;
window.showGenres = showGenres;
window.openGenre = openGenre;
window.submitComment = submitComment;
window.loadComments = loadComments;
window.toggleTheme = toggleTheme;
window.openProfileModal = openProfileModal;
window.closeProfileModal = closeProfileModal;
window.uploadAvatar = uploadAvatar;
window.logout = logout;
window.showToast = showToast;
window.loadStreamingServer = loadStreamingServer;

console.log('✨ App utilities exported to window');
