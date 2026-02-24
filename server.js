const express = require('express');
const axios = require('axios');
const cors = require('cors');
const compression = require('compression');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ===== RATE LIMITING =====
const rateLimit = require('express-rate-limit');

// General API rate limiter (60 requests per 15 minutes)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60,
  message: 'Terlalu banyak request dari IP ini, silakan coba lagi nanti.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Search rate limiter (30 requests per 15 minutes)
const searchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  skipSuccessfulRequests: false,
  keyGenerator: (req, res) => {
    return req.query.query || req.ip;
  },
});

// Server/Stream rate limiter (10 requests per minute)
const streamLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Terlalu banyak request streaming, tunggu sebentar.',
});

// Middleware
app.use(compression());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.static('public'));

// Cache middleware untuk mengurangi request ke API
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 }); // 10 menit cache

// ===== API BASE URLs =====
const SANKAVOLLEREI_API = 'https://www.sankavollerei.com/anime';

// User-Agent untuk request (beberapa server memerlukan ini)
const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
};

// ===== ERROR HANDLER =====
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  
  if (err.response?.status === 429) {
    return res.status(429).json({
      success: false,
      message: 'API rate limit exceeded, coba lagi nanti'
    });
  }
  
  if (err.code === 'ECONNREFUSED') {
    return res.status(503).json({
      success: false,
      message: 'Server sedang offline, coba lagi nanti'
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server error'
  });
};

// ===== HELPER FUNCTIONS =====

/**
 * Fetch dengan caching
 */
async function fetchWithCache(key, url, options = {}) {
  // Cek cache dulu
  const cached = cache.get(key);
  if (cached) {
    console.log(`[CACHE HIT] ${key}`);
    return cached;
  }

  try {
    console.log(`[API CALL] ${url}`);
    const response = await axios.get(url, {
      headers,
      timeout: 10000,
      ...options
    });
    
    // Simpan ke cache
    cache.set(key, response.data);
    return response.data;
  } catch (error) {
    console.error(`[API ERROR] ${url}:`, error.message);
    throw error;
  }
}

/**
 * Retry logic untuk API yang unstable
 */
async function fetchWithRetry(url, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await axios.get(url, {
        headers,
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      console.log(`[RETRY ${i + 1}/${maxRetries}] ${url}`);
      if (i === maxRetries - 1) throw error;
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
}

// ===== ROUTES =====

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server running',
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/home
 * Get homepage data (trending, schedule, etc)
 */
app.get('/api/home', apiLimiter, async (req, res, next) => {
  try {
    const cacheKey = 'home_data';
    
    const homeData = await fetchWithCache(
      cacheKey,
      `${SANKAVOLLEREI_API}/home`
    );

    res.json({
      success: true,
      data: homeData
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/schedule
 * Get anime schedule
 */
app.get('/api/schedule', apiLimiter, async (req, res, next) => {
  try {
    const cacheKey = 'schedule_data';
    
    const scheduleData = await fetchWithCache(
      cacheKey,
      `${SANKAVOLLEREI_API}/schedule`
    );

    res.json({
      success: true,
      data: scheduleData
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/search
 * Search anime by query
 */
app.get('/api/search', searchLimiter, async (req, res, next) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter required'
      });
    }

    const cacheKey = `search_${query}`;
    
    const results = await fetchWithCache(
      cacheKey,
      `${SANKAVOLLEREI_API}/search/${encodeURIComponent(query)}`
    );

    res.json({
      success: true,
      query: query,
      data: results
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/anime/:slug
 * Get anime detail by slug
 */
app.get('/api/anime/:slug', apiLimiter, async (req, res, next) => {
  try {
    const { slug } = req.params;
    
    if (!slug) {
      return res.status(400).json({
        success: false,
        message: 'Anime slug required'
      });
    }

    const cacheKey = `anime_${slug}`;
    
    const animeData = await fetchWithCache(
      cacheKey,
      `${SANKAVOLLEREI_API}/anime/${slug}`
    );

    res.json({
      success: true,
      data: animeData
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/ongoing
 * Get ongoing anime with pagination
 */
app.get('/api/ongoing', apiLimiter, async (req, res, next) => {
  try {
    const { page = 1 } = req.query;
    const cacheKey = `ongoing_page_${page}`;
    
    const ongoingData = await fetchWithCache(
      cacheKey,
      `${SANKAVOLLEREI_API}/ongoing-anime?page=${page}`
    );

    res.json({
      success: true,
      page: parseInt(page),
      data: ongoingData
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/completed
 * Get completed anime with pagination
 */
app.get('/api/completed', apiLimiter, async (req, res, next) => {
  try {
    const { page = 1 } = req.query;
    const cacheKey = `completed_page_${page}`;
    
    const completedData = await fetchWithCache(
      cacheKey,
      `${SANKAVOLLEREI_API}/complete-anime?page=${page}`
    );

    res.json({
      success: true,
      page: parseInt(page),
      data: completedData
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/genres
 * Get all available genres
 */
app.get('/api/genres', apiLimiter, async (req, res, next) => {
  try {
    const cacheKey = 'genres_list';
    
    const genresData = await fetchWithCache(
      cacheKey,
      `${SANKAVOLLEREI_API}/genre`
    );

    res.json({
      success: true,
      data: genresData
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/genre/:genreSlug
 * Get anime by genre with pagination
 */
app.get('/api/genre/:genreSlug', apiLimiter, async (req, res, next) => {
  try {
    const { genreSlug } = req.params;
    const { page = 1 } = req.query;
    
    if (!genreSlug) {
      return res.status(400).json({
        success: false,
        message: 'Genre slug required'
      });
    }

    const cacheKey = `genre_${genreSlug}_page_${page}`;
    
    const genreData = await fetchWithCache(
      cacheKey,
      `${SANKAVOLLEREI_API}/genre/${genreSlug}?page=${page}`
    );

    res.json({
      success: true,
      genre: genreSlug,
      page: parseInt(page),
      data: genreData
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/episode/:episodeSlug
 * Get episode details and streaming links
 */
app.get('/api/episode/:episodeSlug', apiLimiter, async (req, res, next) => {
  try {
    const { episodeSlug } = req.params;
    
    if (!episodeSlug) {
      return res.status(400).json({
        success: false,
        message: 'Episode slug required'
      });
    }

    const cacheKey = `episode_${episodeSlug}`;
    
    const episodeData = await fetchWithCache(
      cacheKey,
      `${SANKAVOLLEREI_API}/episode/${episodeSlug}`,
      { timeout: 15000 } // Longer timeout for episode data
    );

    res.json({
      success: true,
      data: episodeData
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/batch/:batchSlug
 * Get batch download info
 */
app.get('/api/batch/:batchSlug', apiLimiter, async (req, res, next) => {
  try {
    const { batchSlug } = req.params;
    
    if (!batchSlug) {
      return res.status(400).json({
        success: false,
        message: 'Batch slug required'
      });
    }

    const cacheKey = `batch_${batchSlug}`;
    
    const batchData = await fetchWithCache(
      cacheKey,
      `${SANKAVOLLEREI_API}/batch/${batchSlug}`
    );

    res.json({
      success: true,
      data: batchData
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/server/:serverId
 * Get streaming server link
 * Rate limited to prevent abuse
 */
app.get('/api/server/:serverId', streamLimiter, async (req, res, next) => {
  try {
    const { serverId } = req.params;
    
    if (!serverId) {
      return res.status(400).json({
        success: false,
        message: 'Server ID required'
      });
    }

    // Don't cache server links (they might expire)
    const serverData = await fetchWithRetry(
      `${SANKAVOLLEREI_API}/server/${serverId}`
    );

    res.json({
      success: true,
      data: serverData
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/unlimited
 * Get unlimited streaming anime
 */
app.get('/api/unlimited', apiLimiter, async (req, res, next) => {
  try {
    const cacheKey = 'unlimited_data';
    
    const unlimitedData = await fetchWithCache(
      cacheKey,
      `${SANKAVOLLEREI_API}/unlimited`
    );

    res.json({
      success: true,
      data: unlimitedData
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/cache/clear
 * Clear all cache (admin only - add auth in production)
 */
app.get('/api/cache/clear', (req, res) => {
  // In production, add authentication here
  const adminKey = req.query.key;
  
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized'
    });
  }

  cache.flushAll();
  res.json({
    success: true,
    message: 'Cache cleared'
  });
});

/**
 * GET /api/cache/stats
 * Get cache statistics
 */
app.get('/api/cache/stats', (req, res) => {
  const keys = cache.keys();
  
  res.json({
    success: true,
    stats: {
      totalCachedKeys: keys.length,
      cacheSize: keys.length,
      keys: keys,
      details: keys.map(key => ({
        key: key,
        ttl: cache.getTtl(key)
      }))
    }
  });
});

// ===== ERROR HANDLING =====
app.use(errorHandler);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    availableEndpoints: [
      'GET /api/health',
      'GET /api/home',
      'GET /api/schedule',
      'GET /api/search?query=anime',
      'GET /api/anime/:slug',
      'GET /api/ongoing?page=1',
      'GET /api/completed?page=1',
      'GET /api/genres',
      'GET /api/genre/:slug?page=1',
      'GET /api/episode/:slug',
      'GET /api/batch/:slug',
      'GET /api/server/:id',
      'GET /api/unlimited',
      'GET /api/cache/stats',
      'GET /api/cache/clear?key=admin_key'
    ]
  });
});

// ===== START SERVER =====
const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║           🎬 NIMESTREAM v2.0 Server Started 🎬               ║
║                                                                ║
║  Server: http://localhost:${PORT}                          ║
║  API Base: https://www.sankavollerei.com/anime               ║
║  Status: ✅ Online & Ready                                    ║
║                                                                ║
║  Features:                                                     ║
║  ✅ Rate Limiting (60 req/15min per IP)                       ║
║  ✅ Request Caching (10 min TTL)                              ║
║  ✅ Retry Logic (exponential backoff)                         ║
║  ✅ CORS Enabled                                              ║
║  ✅ Compression Enabled                                       ║
║                                                                ║
║  Available Endpoints:                                          ║
║  - GET /api/health                                             ║
║  - GET /api/home                                               ║
║  - GET /api/schedule                                           ║
║  - GET /api/search?query=anime                                ║
║  - GET /api/anime/:slug                                        ║
║  - GET /api/ongoing?page=1                                     ║
║  - GET /api/completed?page=1                                   ║
║  - GET /api/genres                                             ║
║  - GET /api/genre/:slug                                        ║
║  - GET /api/episode/:slug                                      ║
║  - GET /api/batch/:slug                                        ║
║  - GET /api/server/:id                                         ║
║  - GET /api/unlimited                                          ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 Server shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

module.exports = app;
