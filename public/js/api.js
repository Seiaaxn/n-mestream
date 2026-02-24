// ===== API HELPER =====
async function apiFetch(endpoint, options = {}) {
  try {
    const url = `${API_BASE}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// ===== HOME PAGE =====
async function loadHome() {
  try {
    const response = await apiFetch('/home');
    
    if (!response.success) throw new Error('Failed to load home');
    
    const { trending, recent, upcoming } = response.data;
    
    // Load hero with trending anime
    if (trending.length) {
      loadHero(trending);
    }
    
    // Load sections
    loadSection('trendingScroll', trending.slice(0, 10));
    loadSection('recentScroll', recent.slice(0, 10));
    loadSection('upcomingScroll', upcoming.slice(0, 10));
    
  } catch (error) {
    console.error('Error loading home:', error);
    showToast('Gagal memuat beranda');
  }
}

function loadHero(animeList) {
  const heroSlides = document.getElementById('heroSlides');
  const heroDots = document.getElementById('heroDots');
  
  heroSlides.innerHTML = animeList.slice(0, 5).map(anime => `
    <div class="hero-slide" onclick="openDetail('${anime.mal_id}')" 
         style="background-image:url('${anime.images?.jpg?.large_image_url || ''}')">
      <div class="hero-content">
        <div class="hero-title">${anime.title}</div>
        <div class="hero-info">
          ⭐ ${anime.score || 'N/A'} • 📺 ${anime.episodes || '?'} Episode
        </div>
      </div>
    </div>
  `).join('');
  
  heroDots.innerHTML = animeList.slice(0, 5).map((_, i) => `
    <div class="hero-dot${i === 0 ? ' active' : ''}" onclick="slideHero(${i})"></div>
  `).join('');
  
  let currentHeroSlide = 0;
  const totalSlides = Math.min(5, animeList.length);
  
  function updateHero() {
    heroSlides.style.transform = `translateX(-${currentHeroSlide * 100}%)`;
    document.querySelectorAll('.hero-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentHeroSlide);
    });
  }
  
  window.slideHero = (index) => {
    currentHeroSlide = index;
    updateHero();
  };
  
  window.heroPrev = () => {
    currentHeroSlide = (currentHeroSlide - 1 + totalSlides) % totalSlides;
    updateHero();
  };
  
  window.heroNext = () => {
    currentHeroSlide = (currentHeroSlide + 1) % totalSlides;
    updateHero();
  };
  
  // Auto slide every 5 seconds
  setInterval(() => {
    currentHeroSlide = (currentHeroSlide + 1) % totalSlides;
    updateHero();
  }, 5000);
  
  // Attach button handlers
  document.getElementById('heroPrev').addEventListener('click', window.heroPrev);
  document.getElementById('heroNext').addEventListener('click', window.heroNext);
}

function loadSection(sectionId, animeList) {
  const section = document.getElementById(sectionId);
  
  section.innerHTML = animeList.map(anime => `
    <div class="anime-card" onclick="openDetail('${anime.mal_id}')">
      <img src="${anime.images?.jpg?.large_image_url || ''}" 
           alt="${anime.title}" 
           class="anime-card-image"
           onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 300 400%22%3E%3Crect fill=%22%23e0e0e0%22 width=%22300%22 height=%22400%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2224%22 fill=%22%23999%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22%3ENo Image%3C/text%3E%3C/svg%3E'">
      <div class="anime-card-title">${anime.title}</div>
      <div class="anime-card-meta">
        <span>⭐ ${anime.score || 'N/A'}</span>
      </div>
    </div>
  `).join('');
}

// ===== EXPLORE PAGE =====
async function loadExplore(page = 1) {
  try {
    let response;
    
    switch (exploreFilter) {
      case 'ongoing':
        response = await apiFetch(`/ongoing?page=${page}`);
        break;
      case 'completed':
        response = await apiFetch(`/completed?page=${page}`);
        break;
      case 'movies':
        response = await apiFetch(`/movies?page=${page}`);
        break;
      default:
        response = await apiFetch(`/search?query=&page=${page}`);
    }
    
    if (!response.success) throw new Error('Failed to load explore');
    
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
    
    // Update pagination
    buildPagination(document.getElementById('explorePagination'), page, response.pagination, (newPage) => {
      exploreCurrentPage = newPage;
      loadExplore(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    exploreCurrentPage = page;
    
  } catch (error) {
    console.error('Error loading explore:', error);
    showToast('Gagal memuat explore');
  }
}

function filterExplore(filter) {
  exploreFilter = filter;
  document.querySelectorAll('.explore-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.filter === filter);
  });
  loadExplore(1);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function showGenres() {
  try {
    const response = await apiFetch('/genres');
    if (!response.success) throw new Error('Failed to load genres');
    
    const genreGrid = document.getElementById('genreGrid');
    genreGrid.innerHTML = response.data.map(genre => `
      <div class="genre-item" onclick="openGenre('${genre.mal_id}', '${genre.name}')">
        ${genre.name}
      </div>
    `).join('');
    
    document.getElementById('genreModal').style.display = 'flex';
  } catch (error) {
    console.error('Error loading genres:', error);
    showToast('Gagal memuat genre');
  }
}

async function openGenre(genreId, genreName) {
  document.getElementById('genreModal').style.display = 'none';
  document.getElementById('exploreTitle').textContent = genreName;
  
  try {
    const response = await apiFetch(`/genre/${genreId}?page=1`);
    if (!response.success) throw new Error('Failed to load genre');
    
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
    
    buildPagination(document.getElementById('explorePagination'), 1, response.pagination, (newPage) => {
      openGenre(genreId, genreName);
    });
    
  } catch (error) {
    console.error('Error loading genre:', error);
    showToast('Gagal memuat genre');
  }
}

// ===== DETAIL PAGE =====
async function openDetail(animeId) {
  try {
    currentDetailId = animeId;
    goPage('detail');
    
    const response = await apiFetch(`/anime/${animeId}`);
    if (!response.success) throw new Error('Failed to load detail');
    
    const anime = response.data;
    
    // Update detail info
    document.getElementById('detailPoster').src = anime.images?.jpg?.large_image_url || '';
    document.getElementById('detailTitle').textContent = anime.title || anime.title_english || '';
    document.getElementById('detailRating').textContent = `⭐ ${anime.score || 'N/A'}`;
    
    // Meta info
    document.getElementById('detailMeta').innerHTML = `
      ${anime.episodes ? `📺 ${anime.episodes} Episode` : '?'} • 
      ${anime.year || 'N/A'} • 
      ${anime.status || 'N/A'}
    `;
    
    // Badges
    const badges = document.getElementById('detailBadges');
    badges.innerHTML = (anime.genres || []).slice(0, 5).map(g => 
      `<div class="badge">${g.name}</div>`
    ).join('');
    
    // Synopsis
    document.getElementById('detailSynopsis').textContent = anime.synopsis || 'Tidak ada sinopsis';
    
    // Favorite button
    const favBtn = document.getElementById('favBtn');
    if (isFavorite(animeId)) {
      favBtn.classList.add('active');
      favBtn.textContent = '♥ Hapus dari Favorit';
    } else {
      favBtn.classList.remove('active');
      favBtn.textContent = '♡ Tambahkan Favorit';
    }
    favBtn.onclick = () => toggleFavorite(animeId);
    
    // Load episodes
    await loadEpisodes(animeId);
    
    // Load comments
    loadComments(animeId);
    
  } catch (error) {
    console.error('Error loading detail:', error);
    showToast('Gagal memuat detail anime');
  }
}

async function loadEpisodes(animeId, page = 1) {
  try {
    // Menggunakan data dari API
    const animeResponse = await apiFetch(`/anime/${animeId}`);
    const episodes = animeResponse.data?.episodes || [];
    
    currentEpisodeList = episodes;
    episodeCurrentPage = page;
    
    const itemsPerPage = 20;
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedEpisodes = episodes.slice(start, end);
    
    const episodeList = document.getElementById('episodeList');
    episodeList.innerHTML = paginatedEpisodes.map((ep, idx) => `
      <div class="episode-item ${isWatchedEpisode(ep.url || `${animeId}-${idx}`) ? 'watched' : ''}" 
           onclick="openWatch('${animeId}', ${idx})">
        Ep ${start + idx + 1}
      </div>
    `).join('');
    
    // Pagination
    const totalPages = Math.ceil(episodes.length / itemsPerPage);
    document.getElementById('epPageInfo').textContent = `Halaman ${page}/${totalPages}`;
    document.getElementById('epPrevBtn').style.display = page > 1 ? 'block' : 'none';
    document.getElementById('epNextBtn').style.display = page < totalPages ? 'block' : 'none';
    
    window.episodePrevPage = () => loadEpisodes(animeId, page - 1);
    window.episodeNextPage = () => loadEpisodes(animeId, page + 1);
    
  } catch (error) {
    console.error('Error loading episodes:', error);
  }
}

function toggleFavorite(animeId) {
  if (!currentUser) {
    alert('Silakan login untuk menambah favorit');
    return;
  }
  
  if (isFavorite(animeId)) {
    removeFavorite(animeId);
    showToast('Dihapus dari favorit');
    document.getElementById('favBtn').textContent = '♡ Tambahkan Favorit';
  } else {
    saveFavorite(animeId);
    showToast('Ditambahkan ke favorit');
    document.getElementById('favBtn').textContent = '♥ Hapus dari Favorit';
  }
}

// ===== WATCH PAGE =====
async function openWatch(animeId, episodeIndex) {
  try {
    goPage('watch');
    
    const episodeItem = currentEpisodeList[episodeIndex];
    document.getElementById('watchTitle').textContent = `Episode ${episodeIndex + 1}`;
    
    // Populate video container with placeholder
    const videoContainer = document.getElementById('videoContainer');
    videoContainer.innerHTML = `
      <div class="video-placeholder">
        <div style="font-size:48px">▶️</div>
        <p>Silakan pilih server di bawah untuk mulai menonton</p>
      </div>
    `;
    
    // Load servers
    loadServerList(animeId, episodeIndex);
    
    // Load episode quick list
    loadEpisodeQuickList(animeId, episodeIndex);
    
    // Previous/Next buttons
    document.getElementById('watchPrevBtn').disabled = episodeIndex === 0;
    document.getElementById('watchNextBtn').disabled = episodeIndex === currentEpisodeList.length - 1;
    
    window.watchPrevEpisode = () => {
      if (episodeIndex > 0) openWatch(animeId, episodeIndex - 1);
    };
    
    window.watchNextEpisode = () => {
      if (episodeIndex < currentEpisodeList.length - 1) openWatch(animeId, episodeIndex + 1);
    };
    
    // Mark as watched
    saveWatchedEpisode(`${animeId}-${episodeIndex}`, animeId);
    
  } catch (error) {
    console.error('Error opening watch:', error);
    showToast('Gagal membuka video');
  }
}

async function loadServerList(animeId, episodeIndex) {
  try {
    // Simulasi data server (implementasi sesuai API)
    const serverList = document.getElementById('serverList');
    const servers = [
      { id: 'server1', name: 'Server 1', quality: '1080p' },
      { id: 'server2', name: 'Server 2', quality: '720p' },
      { id: 'server3', name: 'Server 3', quality: '480p' }
    ];
    
    serverList.innerHTML = servers.map(server => `
      <div class="server-item" onclick="loadStreamingServer('${server.id}', this)">
        ${server.name} (${server.quality})
      </div>
    `).join('');
    
  } catch (error) {
    console.error('Error loading servers:', error);
  }
}

async function loadStreamingServer(serverId, element) {
  try {
    document.querySelectorAll('.server-item').forEach(s => s.classList.remove('active'));
    element.classList.add('active');
    
    // Update video container (simulasi)
    const videoContainer = document.getElementById('videoContainer');
    videoContainer.innerHTML = `
      <iframe 
        src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
        allowfullscreen 
        allow="autoplay; fullscreen"
        style="position:absolute;width:100%;height:100%;border:none;">
      </iframe>
    `;
    
  } catch (error) {
    console.error('Error loading streaming server:', error);
    showToast('Gagal memuat streaming');
  }
}

function loadEpisodeQuickList(animeId, currentIndex) {
  const quickList = document.getElementById('episodeQuickList');
  const itemsToShow = Math.min(12, currentEpisodeList.length);
  
  quickList.innerHTML = currentEpisodeList.slice(0, itemsToShow).map((ep, idx) => `
    <div class="ep-quick-item ${idx === currentIndex ? 'active' : ''}" 
         onclick="openWatch('${animeId}', ${idx})">
      ${idx + 1}
    </div>
  `).join('');
}

function startWatching() {
  if (currentEpisodeList.length > 0) {
    openWatch(currentDetailId, 0);
  } else {
    showToast('Tidak ada episode yang tersedia');
  }
}

// ===== COMMENTS =====
async function loadComments(animeId) {
  try {
    const commentsContainer = document.getElementById('commentsContainer');
    
    if (!currentUser) {
      commentsContainer.innerHTML = `
        <div class="comment-form-wrapper empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <p>Silakan login untuk menambah komentar</p>
        </div>
      `;
      return;
    }
    
    // Form tambah komentar
    const formHTML = `
      <div class="comment-form-wrapper">
        <img src="${userProfile.avatar}" alt="Avatar" class="comment-user-avatar">
        <div class="comment-form-content">
          <textarea id="commentText" class="form-textarea" placeholder="Bagikan pendapatmu..."></textarea>
          <div class="form-actions">
            <button class="btn btn-primary" onclick="submitComment('${animeId}')">Kirim Komentar</button>
          </div>
        </div>
      </div>
    `;
    
    // Fetch comments dari Firestore
    const commentsSnapshot = await db.collection('comments')
      .where('animeId', '==', animeId)
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get();
    
    let commentsHTML = formHTML;
    
    if (commentsSnapshot.empty) {
      commentsHTML += `<div class="no-comments">Belum ada komentar. Jadilah yang pertama!</div>`;
    } else {
      commentsHTML += commentsSnapshot.docs.map(doc => {
        const comment = doc.data();
        return `
          <div class="comment-item">
            <img src="${comment.userAvatar}" alt="Avatar" class="comment-avatar" 
                 onerror="this.src='${userProfile.avatar}'">
            <div class="comment-body">
              <div class="comment-header">
                <span class="comment-user">${comment.username}</span>
                <span class="comment-time">${timeAgo(comment.createdAt)}</span>
              </div>
              <div class="comment-text">${comment.text}</div>
            </div>
          </div>
        `;
      }).join('');
    }
    
    commentsContainer.innerHTML = commentsHTML;
    
  } catch (error) {
    console.error('Error loading comments:', error);
  }
}

async function submitComment(animeId) {
  if (!currentUser) {
    alert('Silakan login untuk menambah komentar');
    return;
  }
  
  const text = document.getElementById('commentText').value.trim();
  if (!text) {
    showToast('Komentar tidak boleh kosong');
    return;
  }
  
  try {
    await db.collection('comments').add({
      animeId: animeId || currentDetailId,
      userId: currentUser.uid,
      username: userProfile.username,
      userAvatar: userProfile.avatar,
      text: text,
      createdAt: new Date(),
      likes: 0
    });
    
    document.getElementById('commentText').value = '';
    showToast('Komentar berhasil ditambahkan');
    loadComments(animeId || currentDetailId);
    
  } catch (error) {
    console.error('Error submitting comment:', error);
    showToast('Gagal menambahkan komentar');
  }
}

// ===== PAGINATION BUILDER =====
function buildPagination(container, current, pagination, callback) {
  if (!pagination) {
    container.innerHTML = '';
    return;
  }
  
  const prev = pagination.prevPage;
  const next = pagination.nextPage;
  const total = pagination.totalPage || '?';
  
  container.innerHTML = `
    <button class="pagination-btn" ${!prev ? 'disabled' : ''} onclick="argument_prev">← Sebelumnya</button>
    <span class="pagination-info">Halaman ${current} / ${total}</span>
    <button class="pagination-btn" ${!next ? 'disabled' : ''} onclick="argument_next">Selanjutnya →</button>
  `;
  
  if (prev) {
    container.querySelector('button:first-child').onclick = () => callback(current - 1);
  }
  if (next) {
    container.querySelector('button:last-child').onclick = () => callback(current + 1);
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initAuth();
  loadHome();
});
