/**
 * College Controller
 * Handles fuzzy search over universities.json with caching and pagination.
 *
 * Fuzzy matching strategy:
 * 1. Tokenize the query into words
 * 2. For each institution, score by how many query tokens match (substring) in
 *    the name, state, district, or management fields
 * 3. Rank by score (descending), with exact name matches boosted
 * 4. Support filters: state, district, type (college/standalone)
 */

const fs = require('fs');
const path = require('path');

const UNIVERSITIES_PATH = path.join(__dirname, '..', 'universities.json');

// ─── In-memory cache ────────────────────────────────────────────────────────
let universitiesCache = null;
let cacheLoadedAt = null;

/**
 * Load universities data with file-change detection.
 * Reloads if the file has been modified since last cache.
 */
function loadUniversities() {
  try {
    const stats = fs.statSync(UNIVERSITIES_PATH);
    const lastModified = stats.mtimeMs;

    if (universitiesCache && cacheLoadedAt && cacheLoadedAt >= lastModified) {
      return universitiesCache;
    }

    console.log('[COLLEGES] Loading universities.json into memory...');
    const raw = fs.readFileSync(UNIVERSITIES_PATH, 'utf-8');
    const data = JSON.parse(raw);

    if (!Array.isArray(data)) {
      throw new Error('universities.json is not a JSON array');
    }

    // Pre-compute lowercase searchable text for each entry
    universitiesCache = data.map((entry) => ({
      ...entry,
      _searchText: [
        entry.name,
        entry.state,
        entry.district,
        entry.college_type,
        entry.management,
        entry.university,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase(),
    }));

    cacheLoadedAt = Date.now();
    console.log(`[COLLEGES] Loaded ${universitiesCache.length} institutions`);
    return universitiesCache;
  } catch (error) {
    console.error(`[COLLEGES] Failed to load universities.json: ${error.message}`);
    return null;
  }
}

/**
 * Score an institution against query tokens using fuzzy substring matching.
 */
function scoreMatch(entry, queryTokens, queryLower) {
  let score = 0;
  const searchText = entry._searchText;
  const nameLower = (entry.name || '').toLowerCase();

  // Exact full-query match in name → highest boost
  if (nameLower.includes(queryLower)) {
    score += 100;
  }

  // Per-token matching
  for (const token of queryTokens) {
    if (searchText.includes(token)) {
      score += 10;

      // Extra boost if token matches in the name specifically
      if (nameLower.includes(token)) {
        score += 5;
      }
    }
  }

  // Boost for state/district exact match
  const stateLower = (entry.state || '').toLowerCase();
  const districtLower = (entry.district || '').toLowerCase();

  for (const token of queryTokens) {
    if (stateLower === token) score += 20;
    if (districtLower === token) score += 15;
  }

  return score;
}

/**
 * GET /api/colleges/search?q=query&state=X&district=Y&type=college|standalone&page=1&limit=20
 */
async function searchColleges(req, res) {
  const { q, state, district, type, page = '1', limit = '20' } = req.query;

  if (!q || q.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'Query parameter "q" is required. Usage: /api/colleges/search?q=engineering',
    });
  }

  const queryTrimmed = q.trim();
  if (queryTrimmed.length < 2) {
    return res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'Query must be at least 2 characters long',
    });
  }

  // Load data
  const universities = loadUniversities();
  if (!universities || universities.length === 0) {
    return res.status(503).json({
      success: false,
      error: 'Service Unavailable',
      message: 'University data is not loaded yet. Please try again later.',
    });
  }

  // Parse pagination
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

  // Tokenize query
  const queryLower = queryTrimmed.toLowerCase();
  const queryTokens = queryLower.split(/\s+/).filter((t) => t.length >= 2);

  if (queryTokens.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'Query must contain meaningful search terms',
    });
  }

  // Filter + Score
  let results = [];

  for (const entry of universities) {
    // Apply filters first (fast rejection)
    if (state && entry.state.toLowerCase() !== state.toLowerCase()) continue;
    if (district && entry.district.toLowerCase() !== district.toLowerCase()) continue;
    if (type) {
      const typeFilter = type.toLowerCase();
      if (typeFilter === 'college' && entry.institution_type !== 'College') continue;
      if (typeFilter === 'standalone' && entry.institution_type !== 'Standalone') continue;
    }

    const score = scoreMatch(entry, queryTokens, queryLower);

    if (score > 0) {
      results.push({ score, entry });
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  // Paginate
  const totalResults = results.length;
  const totalPages = Math.ceil(totalResults / limitNum);
  const startIdx = (pageNum - 1) * limitNum;
  const paginatedResults = results.slice(startIdx, startIdx + limitNum);

  // Strip internal _searchText field from response
  const responseData = paginatedResults.map(({ score, entry }) => {
    const { _searchText, ...cleanEntry } = entry;
    return cleanEntry;
  });

  res.json({
    success: true,
    query: queryTrimmed,
    filters: {
      ...(state && { state }),
      ...(district && { district }),
      ...(type && { type }),
    },
    pagination: {
      page: pageNum,
      limit: limitNum,
      totalResults,
      totalPages,
      hasNext: pageNum < totalPages,
      hasPrev: pageNum > 1,
    },
    results: responseData,
  });
}

module.exports = { searchColleges };
