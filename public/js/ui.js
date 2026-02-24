// ===== UI HELPERS =====

// Modal Management
const modals = {};

function createModal(id, options = {}) {
  const {
    title = 'Modal',
    content = '',
    buttons = [],
    onClose = null,
    size = 'medium'
  } = options;
  
  const modalEl = document.getElementById(id);
  if (!modalEl) return;
  
  modals[id] = {
    open: () => {
      modalEl.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    },
    close: () => {
      modalEl.style.display = 'none';
      document.body.style.overflow = 'auto';
      if (onClose) onClose();
    }
  };
  
  return modals[id];
}

function openModal(id) {
  if (modals[id]) modals[id].open();
}

function closeModal(id) {
  if (modals[id]) modals[id].close();
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    e.target.style.display = 'none';
  }
});

// Dropdown Menu
class Dropdown {
  constructor(triggerId, menuId) {
    this.trigger = document.getElementById(triggerId);
    this.menu = document.getElementById(menuId);
    
    if (this.trigger && this.menu) {
      this.trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggle();
      });
      
      document.addEventListener('click', () => this.close());
    }
  }
  
  toggle() {
    this.menu.style.display = 
      this.menu.style.display === 'none' ? 'flex' : 'none';
  }
  
  open() {
    this.menu.style.display = 'flex';
  }
  
  close() {
    this.menu.style.display = 'none';
  }
}

// Search functionality
class Search {
  constructor(inputId, resultsId) {
    this.input = document.getElementById(inputId);
    this.resultsContainer = document.getElementById(resultsId);
    this.debounceTimer = null;
    
    if (this.input) {
      this.input.addEventListener('input', (e) => {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
          this.search(e.target.value);
        }, 300);
      });
    }
  }
  
  async search(query) {
    if (!query || query.length < 2) {
      this.resultsContainer.innerHTML = '';
      return;
    }
    
    try {
      const response = await apiFetch(`/search?query=${encodeURIComponent(query)}`);
      
      if (!response.success || !response.data) {
        this.resultsContainer.innerHTML = '<p class="text-muted">Tidak ada hasil</p>';
        return;
      }
      
      this.renderResults(response.data.slice(0, 10));
    } catch (error) {
      console.error('Search error:', error);
      this.resultsContainer.innerHTML = '<p class="text-muted">Error saat mencari</p>';
    }
  }
  
  renderResults(results) {
    if (!results || results.length === 0) {
      this.resultsContainer.innerHTML = '<p class="text-muted">Tidak ada hasil</p>';
      return;
    }
    
    this.resultsContainer.innerHTML = results.map(anime => `
      <div class="search-result-item" onclick="openDetail('${anime.mal_id}')">
        <img src="${anime.images?.jpg?.small_image_url}" alt="${anime.title}">
        <div class="search-result-info">
          <div class="search-result-title">${anime.title}</div>
          <div class="search-result-meta">${anime.year || 'N/A'} • ${anime.type || 'N/A'}</div>
        </div>
      </div>
    `).join('');
  }
}

// Rating Component
class Rating {
  constructor(containerId, initialValue = 0) {
    this.container = document.getElementById(containerId);
    this.value = initialValue;
    this.render();
  }
  
  render() {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= this.value;
      stars.push(`
        <span class="star ${isFilled ? 'filled' : ''}" 
              onclick="this.rating.setValue(${i})">
          ★
        </span>
      `);
    }
    
    this.container.innerHTML = `<div class="rating-stars">${stars.join('')}</div>`;
    
    // Bind rating instance to stars
    this.container.querySelectorAll('.star').forEach(star => {
      star.rating = this;
    });
  }
  
  setValue(value) {
    this.value = value;
    this.render();
  }
  
  getValue() {
    return this.value;
  }
}

// Carousel/Slider
class Carousel {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.items = [];
    this.currentIndex = 0;
    this.autoPlay = options.autoPlay ?? true;
    this.autoPlayInterval = options.autoPlayInterval || 5000;
    this.transitionDuration = options.transitionDuration || 300;
    
    if (this.autoPlay) {
      this.startAutoPlay();
    }
  }
  
  addItem(item) {
    this.items.push(item);
  }
  
  render() {
    if (this.items.length === 0) return;
    
    const html = this.items.map((item, idx) => `
      <div class="carousel-item ${idx === this.currentIndex ? 'active' : ''}"
           style="transform: translateX(${(idx - this.currentIndex) * 100}%)">
        ${item}
      </div>
    `).join('');
    
    this.container.innerHTML = html;
  }
  
  next() {
    this.currentIndex = (this.currentIndex + 1) % this.items.length;
    this.render();
  }
  
  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
    this.render();
  }
  
  goTo(index) {
    this.currentIndex = Math.max(0, Math.min(index, this.items.length - 1));
    this.render();
  }
  
  startAutoPlay() {
    this.autoPlayTimer = setInterval(() => this.next(), this.autoPlayInterval);
  }
  
  stopAutoPlay() {
    clearInterval(this.autoPlayTimer);
  }
}

// Tabs Component
class Tabs {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.tabs = [];
    this.activeTab = 0;
  }
  
  addTab(label, content) {
    this.tabs.push({ label, content });
  }
  
  render() {
    const tabsHTML = this.tabs.map((tab, idx) => `
      <button class="tab-button ${idx === this.activeTab ? 'active' : ''}"
              onclick="this.tabs.setActive(${idx})">
        ${tab.label}
      </button>
    `).join('');
    
    const contentHTML = this.tabs[this.activeTab]?.content || '';
    
    this.container.innerHTML = `
      <div class="tabs-header">${tabsHTML}</div>
      <div class="tabs-content">${contentHTML}</div>
    `;
    
    // Bind instance to buttons
    this.container.querySelectorAll('.tab-button').forEach(btn => {
      btn.tabs = this;
    });
  }
  
  setActive(index) {
    this.activeTab = index;
    this.render();
  }
}

// Notification/Alert Component
class Alert {
  static success(message, duration = 3000) {
    this.show(message, 'success', duration);
  }
  
  static error(message, duration = 4000) {
    this.show(message, 'error', duration);
  }
  
  static warning(message, duration = 3000) {
    this.show(message, 'warning', duration);
  }
  
  static info(message, duration = 3000) {
    this.show(message, 'info', duration);
  }
  
  static show(message, type = 'info', duration = 3000) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show alert-${type}`;
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  }
}

// Loading Spinner
class Spinner {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }
  
  show() {
    if (this.container) {
      this.container.innerHTML = `
        <div class="spinner-container">
          <div class="spinner"></div>
          <p>Loading...</p>
        </div>
      `;
    }
  }
  
  hide() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

// Image Lazy Loading
class LazyImage {
  constructor() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        });
      });
      
      document.querySelectorAll('img.lazy').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }
}

// Pagination Helper
class Paginator {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentPage = 1;
    this.totalPages = 1;
    this.callback = null;
  }
  
  render(currentPage, totalPages, callback) {
    this.currentPage = currentPage;
    this.totalPages = totalPages;
    this.callback = callback;
    
    let html = `
      <div class="pagination-controls">
    `;
    
    // Previous button
    if (currentPage > 1) {
      html += `
        <button class="pagination-btn" onclick="this.paginator.goTo(${currentPage - 1})">
          ← Sebelumnya
        </button>
      `;
    }
    
    // Page info
    html += `<span class="page-info">Halaman ${currentPage} / ${totalPages}</span>`;
    
    // Next button
    if (currentPage < totalPages) {
      html += `
        <button class="pagination-btn" onclick="this.paginator.goTo(${currentPage + 1})">
          Selanjutnya →
        </button>
      `;
    }
    
    html += `</div>`;
    this.container.innerHTML = html;
    
    // Bind instance
    this.container.querySelectorAll('.pagination-btn').forEach(btn => {
      btn.paginator = this;
    });
  }
  
  goTo(page) {
    if (page >= 1 && page <= this.totalPages && this.callback) {
      this.callback(page);
    }
  }
}

// Form Validation
class FormValidator {
  static validate(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;
    
    let isValid = true;
    
    form.querySelectorAll('[required]').forEach(field => {
      if (!field.value.trim()) {
        field.classList.add('error');
        isValid = false;
      } else {
        field.classList.remove('error');
      }
      
      // Email validation
      if (field.type === 'email') {
        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
        if (!isValidEmail) {
          field.classList.add('error');
          isValid = false;
        }
      }
    });
    
    return isValid;
  }
  
  static clear(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    form.querySelectorAll('[required]').forEach(field => {
      field.classList.remove('error');
    });
  }
}

// Confirmation Dialog
class Dialog {
  static confirm(message, onConfirm, onCancel) {
    return new Promise((resolve) => {
      const confirmed = window.confirm(message);
      
      if (confirmed) {
        if (onConfirm) onConfirm();
        resolve(true);
      } else {
        if (onCancel) onCancel();
        resolve(false);
      }
    });
  }
}

// Initialize UI components on page load
document.addEventListener('DOMContentLoaded', () => {
  // Initialize lazy image loading
  new LazyImage();
});
