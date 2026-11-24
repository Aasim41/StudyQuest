/**
 * StudyQuest Syllabus Auto-Refresh Service
 *
 * Tracks syllabus freshness per exam via AsyncStorage and uses Groq AI
 * to fetch trending topic changes when the local knowledgebase is stale (>90 days).
 *
 * Exports:
 *   checkAndRefreshSyllabus(examTarget)  – call on app launch / exam switch
 *   getLastSyllabusUpdate(examTarget)    – returns ISO date string or null
 *   forceSyllabusRefresh(examTarget)     – bypasses the 90-day check
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { normalizeExamKey } from '../config/studyGuideData';

// ── Groq config (mirrors aiService.js) ──────────────────────────────
const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const REQUEST_TIMEOUT_MS = 10000;

// ── Constants ────────────────────────────────────────────────────────
const STALE_THRESHOLD_MS = 90 * 24 * 60 * 60 * 1000; // 90 days

function versionKey(examKey) {
  return `@syllabus_version_${examKey}`;
}

function dataKey(examKey) {
  return `@syllabus_data_${examKey}`;
}

// ── Public API ───────────────────────────────────────────────────────

/**
 * Check if the cached syllabus for `examTarget` is older than 90 days.
 * If stale (or missing), fetches fresh trending topics from Groq AI,
 * merges them with existing cached data, and persists the result.
 *
 * Returns { refreshed: boolean, lastUpdated: string|null, data: object|null }
 */
export async function checkAndRefreshSyllabus(examTarget) {
  const examKey = normalizeExamKey(examTarget);

  try {
    const storedVersion = await AsyncStorage.getItem(versionKey(examKey));
    if (storedVersion) {
      const lastUpdated = new Date(storedVersion);
      const age = Date.now() - lastUpdated.getTime();
      if (age < STALE_THRESHOLD_MS) {
        // Still fresh — return cached data without hitting the network
        const cached = await AsyncStorage.getItem(dataKey(examKey));
        return {
          refreshed: false,
          lastUpdated: storedVersion,
          data: cached ? JSON.parse(cached) : null,
        };
      }
    }

    // Stale or missing — refresh
    return await _fetchAndPersist(examKey, examTarget);
  } catch (err) {
    console.warn('[SyllabusRefresh] checkAndRefresh error:', err.message);
    return { refreshed: false, lastUpdated: null, data: null };
  }
}

/**
 * Returns the ISO-8601 date string of the last syllabus refresh for the
 * given exam, or null if never refreshed.
 */
export async function getLastSyllabusUpdate(examTarget) {
  const examKey = normalizeExamKey(examTarget);
  try {
    return await AsyncStorage.getItem(versionKey(examKey));
  } catch {
    return null;
  }
}

/**
 * Force-refresh the syllabus data regardless of age.
 */
export async function forceSyllabusRefresh(examTarget) {
  const examKey = normalizeExamKey(examTarget);
  return await _fetchAndPersist(examKey, examTarget);
}

// ── Internal helpers ─────────────────────────────────────────────────

async function _fetchAndPersist(examKey, examTarget) {
  const freshData = await _fetchFromGroq(examTarget);

  if (!freshData) {
    return { refreshed: false, lastUpdated: null, data: null };
  }

  // Merge with any previously cached data
  let merged = freshData;
  try {
    const existing = await AsyncStorage.getItem(dataKey(examKey));
    if (existing) {
      const prev = JSON.parse(existing);
      merged = _mergeData(prev, freshData);
    }
  } catch {
    // If we can't read old data, just use the fresh data as-is
  }

  const now = new Date().toISOString();
  try {
    await AsyncStorage.setItem(versionKey(examKey), now);
    await AsyncStorage.setItem(dataKey(examKey), JSON.stringify(merged));
  } catch (err) {
    console.warn('[SyllabusRefresh] persist error:', err.message);
  }

  return { refreshed: true, lastUpdated: now, data: merged };
}

/**
 * Ask Groq AI for the latest syllabus changes and trending topics.
 * Returns the parsed JSON object on success, null on failure.
 */
async function _fetchFromGroq(examTarget) {
  if (!GROQ_API_KEY) {
    console.warn('[SyllabusRefresh] No Groq API key configured — skipping AI refresh');
    return null;
  }

  const currentYear = new Date().getFullYear();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const systemPrompt = `You are an expert Indian education analyst. Return ONLY valid JSON.`;
    const userPrompt = `What are the latest syllabus changes, new exam pattern modifications, and trending high-yield topics for ${examTarget} in the ${currentYear} session? Focus on what changed from the previous year.

Return JSON with this structure:
{
  "examTarget": "${examTarget}",
  "session": "${currentYear}",
  "syllabusChanges": [
    { "change": "Brief description of change", "impact": "high|medium|low" }
  ],
  "patternModifications": [
    { "modification": "Description", "details": "Specifics" }
  ],
  "trendingTopics": [
    { "topic": "Topic name", "reason": "Why it is trending / high-yield", "expectedWeightage": "marks or percentage" }
  ],
  "removedTopics": [
    { "topic": "Topic name", "reason": "Why removed or de-emphasized" }
  ]
}`;

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'qwen/qwen3.8-27b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 1200,
      }),
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        return JSON.parse(content);
      }
    }
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn(
      '[SyllabusRefresh] Groq fetch error:',
      err.name === 'AbortError' ? 'Timeout (10s)' : err.message
    );
  }

  return null;
}

/**
 * Merge previous cached data with freshly fetched data.
 * Fresh arrays replace old ones; we keep any extra keys from the old object
 * that the new one doesn't cover.
 */
function _mergeData(prev, fresh) {
  return {
    ...prev,
    ...fresh,
    // De-duplicate trending topics by name
    trendingTopics: _dedupeByField(
      [...(fresh.trendingTopics || []), ...(prev.trendingTopics || [])],
      'topic'
    ),
    syllabusChanges: _dedupeByField(
      [...(fresh.syllabusChanges || []), ...(prev.syllabusChanges || [])],
      'change'
    ),
  };
}

function _dedupeByField(arr, field) {
  const seen = new Set();
  return arr.filter((item) => {
    const key = (item[field] || '').toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
