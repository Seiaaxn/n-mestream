# 📡 NIMESTREAM API Documentation

## Overview

NIMESTREAM menggunakan **Sankavollerei API** (`https://www.sankavollerei.com/anime`) sebagai data source utama.

**Base URL:** `http://localhost:3000/api`

---

## 🛡️ Rate Limiting

Aplikasi telah mengimplementasikan rate limiting untuk mencegah abuse:

| Endpoint | Limit | Window |
|----------|-------|--------|
| General API | 60 requests | 15 minutes |
| Search | 30 requests | 15 minutes |
| Stream/Server | 10 requests | 1 minute |

**Response jika limit terlampaui:**
```json
{
  "success": false,
  "message": "Terlalu banyak request dari IP ini, silakan coba lagi nanti."
}
```

---

## 💾 Caching

Semua endpoint (kecuali `/api/server/:id`) menggunakan caching 10 menit untuk mengurangi beban ke server Sankavollerei.

- **Cache Key:** Otomatis berdasarkan endpoint dan parameter
- **TTL:** 10 menit
- **Clear Cache:** `GET /api/cache/clear?key=ADMIN_KEY`

---

## 🔗 Available Endpoints

### 1. **GET /api/health**
Health check endpoint.

**Request:**
```bash
curl http://localhost:3000/api/health
```

**Response:**
```json
{
  "success": true,
  "message": "Server running",
  "timestamp": "2025-02-24T15:30:00.000Z"
}
```

---

### 2. **GET /api/home**
Get homepage data (trending anime, featured, etc).

**Request:**
```bash
curl http://localhost:3000/api/home
```

**Response:**
```json
{
  "success": true,
  "data": {
    "featured": [...],
    "trending": [...],
    "recent": [...]
  }
}
```

**Cache:** 10 minutes

---

### 3. **GET /api/schedule**
Get anime schedule.

**Request:**
```bash
curl http://localhost:3000/api/schedule
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "day": "Monday",
      "anime": [...]
    }
  ]
}
```

**Cache:** 10 minutes

---

### 4. **GET /api/search**
Search anime by query.

**Parameters:**
- `query` (required): Search keyword

**Request:**
```bash
curl http://localhost:3000/api/search?query=naruto
```

**Response:**
```json
{
  "success": true,
  "query": "naruto",
  "data": [
    {
      "title": "Naruto",
      "slug": "naruto-sub-indo",
      "poster": "...",
      "rating": 8.5
    }
  ]
}
```

**Rate Limit:** 30 per 15 minutes
**Cache:** 10 minutes

---

### 5. **GET /api/anime/:slug**
Get detailed info about an anime.

**Parameters:**
- `slug` (required): Anime slug (e.g., `enen-shouboutai-season-3-p2-sub-indo`)

**Request:**
```bash
curl http://localhost:3000/api/anime/enen-shouboutai-season-3-p2-sub-indo
```

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "Enen no Shouboutai Season 3 P2",
    "slug": "enen-shouboutai-season-3-p2-sub-indo",
    "poster": "...",
    "synopsis": "...",
    "genres": ["action", "drama"],
    "episodes": [
      {
        "number": 1,
        "title": "Episode 1",
        "slug": "sd-p2-episode-1-sub-indo"
      }
    ]
  }
}
```

**Cache:** 10 minutes

---

### 6. **GET /api/ongoing**
Get ongoing anime with pagination.

**Parameters:**
- `page` (optional): Page number (default: 1)

**Request:**
```bash
curl http://localhost:3000/api/ongoing?page=1
```

**Response:**
```json
{
  "success": true,
  "page": 1,
  "data": [...]
}
```

**Cache:** 10 minutes

---

### 7. **GET /api/completed**
Get completed anime with pagination.

**Parameters:**
- `page` (optional): Page number (default: 1)

**Request:**
```bash
curl http://localhost:3000/api/completed?page=1
```

**Response:**
```json
{
  "success": true,
  "page": 1,
  "data": [...]
}
```

**Cache:** 10 minutes

---

### 8. **GET /api/genres**
Get all available genres.

**Request:**
```bash
curl http://localhost:3000/api/genres
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "Action",
      "slug": "action"
    },
    {
      "name": "Comedy",
      "slug": "comedy"
    }
  ]
}
```

**Cache:** 10 minutes

---

### 9. **GET /api/genre/:genreSlug**
Get anime by genre with pagination.

**Parameters:**
- `genreSlug` (required): Genre slug (e.g., `action`)
- `page` (optional): Page number (default: 1)

**Request:**
```bash
curl http://localhost:3000/api/genre/action?page=1
```

**Response:**
```json
{
  "success": true,
  "genre": "action",
  "page": 1,
  "data": [...]
}
```

**Cache:** 10 minutes

---

### 10. **GET /api/episode/:episodeSlug**
Get episode details and streaming links.

**Parameters:**
- `episodeSlug` (required): Episode slug (e.g., `sd-p2-episode-10-sub-indo`)

**Request:**
```bash
curl http://localhost:3000/api/episode/sd-p2-episode-10-sub-indo
```

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "Episode 10",
    "slug": "sd-p2-episode-10-sub-indo",
    "servers": [
      {
        "name": "Server 1",
        "id": "6DC77B-6-8B5u",
        "quality": "1080p"
      }
    ]
  }
}
```

**Cache:** 10 minutes
**Timeout:** 15 seconds (longer due to heavy data)

---

### 11. **GET /api/batch/:batchSlug**
Get batch download information.

**Parameters:**
- `batchSlug` (required): Batch slug (e.g., `jshk-s2-batch-sub-indo`)

**Request:**
```bash
curl http://localhost:3000/api/batch/jshk-s2-batch-sub-indo
```

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "JSHK Season 2 Batch",
    "links": [...]
  }
}
```

**Cache:** 10 minutes

---

### 12. **GET /api/server/:serverId**
Get streaming server link.

**Parameters:**
- `serverId` (required): Server ID (e.g., `6DC77B-6-8B5u`)

**Request:**
```bash
curl http://localhost:3000/api/server/6DC77B-6-8B5u
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://streaming-server.com/video/...",
    "quality": "1080p",
    "expires": "2025-02-25T15:30:00Z"
  }
}
```

**Rate Limit:** 10 per minute
**Cache:** NO (server links expire frequently)
**Retry:** Up to 3 attempts with exponential backoff

---

### 13. **GET /api/unlimited**
Get unlimited streaming anime.

**Request:**
```bash
curl http://localhost:3000/api/unlimited
```

**Response:**
```json
{
  "success": true,
  "data": [...]
}
```

**Cache:** 10 minutes

---

### 14. **GET /api/cache/stats**
Get cache statistics (debug endpoint).

**Request:**
```bash
curl http://localhost:3000/api/cache/stats
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalCachedKeys": 15,
    "cacheSize": 15,
    "keys": ["home_data", "search_naruto", ...],
    "details": [
      {
        "key": "home_data",
        "ttl": 1645711800000
      }
    ]
  }
}
```

---

### 15. **GET /api/cache/clear**
Clear all cache (admin only).

**Parameters:**
- `key` (required): Admin key (set in `.env` as `ADMIN_KEY`)

**Request:**
```bash
curl "http://localhost:3000/api/cache/clear?key=your_admin_key"
```

**Response:**
```json
{
  "success": true,
  "message": "Cache cleared"
}
```

---

## 🚀 Usage Examples

### Search anime
```javascript
// Frontend code
const response = await fetch('/api/search?query=naruto');
const data = await response.json();
console.log(data.data); // Search results
```

### Get anime detail
```javascript
const response = await fetch('/api/anime/enen-shouboutai-season-3-p2-sub-indo');
const anime = await response.json();
console.log(anime.data.episodes); // List of episodes
```

### Get episode streaming link
```javascript
const response = await fetch('/api/episode/sd-p2-episode-10-sub-indo');
const episode = await response.json();
console.log(episode.data.servers); // Available servers
```

### Get server link
```javascript
const response = await fetch('/api/server/6DC77B-6-8B5u');
const server = await response.json();
console.log(server.data.url); // Streaming URL
```

---

## 🔍 Error Handling

### Invalid Parameters
```json
{
  "success": false,
  "message": "Query parameter required"
}
```

### Rate Limit Exceeded
```json
{
  "success": false,
  "message": "Terlalu banyak request dari IP ini, silakan coba lagi nanti."
}
```

### Server Offline
```json
{
  "success": false,
  "message": "Server sedang offline, coba lagi nanti"
}
```

### Not Found
```json
{
  "success": false,
  "message": "Endpoint not found"
}
```

---

## 📊 Performance Tips

1. **Use Caching:** Cache data on frontend (localStorage, sessionStorage)
2. **Batch Requests:** Don't make repeated requests for same data
3. **Pagination:** Use `page` parameter instead of loading all results
4. **Check Cache Stats:** Use `/api/cache/stats` to monitor backend cache
5. **Respect Rate Limits:** Implement exponential backoff for retries

---

## 🔐 Security

- Rate limiting enabled to prevent abuse
- Input validation on all parameters
- User-Agent header set to avoid blocks
- Timeout configured (10-15 seconds)
- Graceful error handling

---

## 🔧 Configuration

Set in `.env` file:

```bash
PORT=3000
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
ADMIN_KEY=your_secret_admin_key
```

---

## 📈 Monitoring

### Check Server Status
```bash
curl http://localhost:3000/api/health
```

### Monitor Cache
```bash
curl http://localhost:3000/api/cache/stats
```

### Server Logs
Check terminal output when running `npm start` or `npm run dev`

---

## 🚨 Troubleshooting

### "Terlalu banyak request"
- Reduce request frequency
- Use cached data
- Wait for rate limit window to reset (15 minutes)

### "Server sedang offline"
- Check if Sankavollerei API is online
- Try again in a few minutes
- Check your internet connection

### Empty Results
- Verify slug/parameter is correct
- Try searching instead of direct slug
- Check if anime exists on Sankavollerei

### Slow Response
- Check network connection
- Server might be loading - retry in 5 seconds
- Check `/api/cache/stats` if cache is full

---

## 📝 API Update Log

### v2.1.0 (Current)
- ✅ Integrated Sankavollerei API
- ✅ Added rate limiting
- ✅ Added caching with 10-min TTL
- ✅ Added retry logic with exponential backoff
- ✅ Added cache statistics endpoint
- ✅ Added admin cache clear endpoint

### v2.0.0
- Initial release with Jikan API

---

**Last Updated:** February 24, 2025
**API Version:** 2.1.0
**Status:** ✅ Production Ready
