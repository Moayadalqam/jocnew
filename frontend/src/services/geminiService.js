import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// ============================================
// Rate Limiting Configuration
// ============================================
const RATE_LIMIT = {
  maxRequestsPerMinute: 15, // Gemini free tier limit
  minIntervalMs: 4000, // Minimum 4 seconds between requests
  retryDelayMs: 10000, // Wait 10s on rate limit error
  maxRetries: 3
};

// Request queue and timestamps
let requestQueue = [];
let requestTimestamps = [];
let isProcessing = false;

// ============================================
// Caching System
// ============================================
const CACHE_CONFIG = {
  maxAge: 5 * 60 * 1000, // 5 minutes cache
  maxSize: 50 // Maximum cached responses
};

const responseCache = new Map();

function generateCacheKey(data) {
  return JSON.stringify(data).substring(0, 500); // Use first 500 chars as key
}

function getCachedResponse(key) {
  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_CONFIG.maxAge) {
    console.log('📦 Using cached Gemini response');
    return cached.data;
  }
  if (cached) {
    responseCache.delete(key); // Remove expired cache
  }
  return null;
}

function setCachedResponse(key, data) {
  // Enforce max cache size
  if (responseCache.size >= CACHE_CONFIG.maxSize) {
    const oldestKey = responseCache.keys().next().value;
    responseCache.delete(oldestKey);
  }
  responseCache.set(key, { data, timestamp: Date.now() });
}

// ============================================
// Rate Limiting Functions
// ============================================
function cleanOldTimestamps() {
  const oneMinuteAgo = Date.now() - 60000;
  requestTimestamps = requestTimestamps.filter(ts => ts > oneMinuteAgo);
}

function canMakeRequest() {
  cleanOldTimestamps();
  if (requestTimestamps.length >= RATE_LIMIT.maxRequestsPerMinute) {
    return false;
  }
  const lastRequest = requestTimestamps[requestTimestamps.length - 1] || 0;
  return Date.now() - lastRequest >= RATE_LIMIT.minIntervalMs;
}

async function waitForRateLimit() {
  cleanOldTimestamps();

  if (requestTimestamps.length >= RATE_LIMIT.maxRequestsPerMinute) {
    const oldestTimestamp = requestTimestamps[0];
    const waitTime = 60000 - (Date.now() - oldestTimestamp) + 1000;
    console.log(`⏳ Rate limit reached. Waiting ${Math.ceil(waitTime/1000)}s...`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }

  const lastRequest = requestTimestamps[requestTimestamps.length - 1] || 0;
  const timeSinceLast = Date.now() - lastRequest;

  if (timeSinceLast < RATE_LIMIT.minIntervalMs) {
    const waitTime = RATE_LIMIT.minIntervalMs - timeSinceLast;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
}

function recordRequest() {
  requestTimestamps.push(Date.now());
}

// ============================================
// Retry Logic with Exponential Backoff
// ============================================
async function executeWithRetry(fn, retries = RATE_LIMIT.maxRetries) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await waitForRateLimit();
      recordRequest();
      return await fn();
    } catch (error) {
      const isRateLimitError = error.message?.includes('429') ||
                               error.message?.includes('quota') ||
                               error.message?.includes('rate');

      if (isRateLimitError && attempt < retries) {
        const delay = RATE_LIMIT.retryDelayMs * attempt;
        console.warn(`⚠️ Rate limit hit. Retry ${attempt}/${retries} in ${delay/1000}s`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      if (attempt === retries) {
        console.error('❌ Max retries exceeded for Gemini API');
        throw error;
      }

      throw error;
    }
  }
}

// ============================================
// Get Rate Limit Status (for UI display)
// ============================================
export function getRateLimitStatus() {
  cleanOldTimestamps();
  return {
    requestsInLastMinute: requestTimestamps.length,
    maxRequestsPerMinute: RATE_LIMIT.maxRequestsPerMinute,
    remainingRequests: Math.max(0, RATE_LIMIT.maxRequestsPerMinute - requestTimestamps.length),
    canMakeRequest: canMakeRequest(),
    cacheSize: responseCache.size,
    cacheMaxSize: CACHE_CONFIG.maxSize
  };
}

// ============================================
// Clear Cache (for manual refresh)
// ============================================
export function clearCache() {
  responseCache.clear();
  console.log('🗑️ Gemini response cache cleared');
}

// ============================================
// Taekwondo Analysis Prompt
// ============================================
const TAEKWONDO_ANALYSIS_PROMPT = `You are an expert Taekwondo biomechanical analyst for the Jordan Olympic Committee.
Analyze the following pose data and provide a detailed technical assessment.

KICK TYPES:
- Dollyo Chagi (Roundhouse): High hip rotation, 45-degree chamber, snap extension
- Yeop Chagi (Side Kick): Linear trajectory, full hip pivot, heel strike
- Ap Chagi (Front Kick): Direct front chamber, ball-of-foot impact
- Dwi Chagi (Back Kick): 180-degree turn, linear back thrust
- Naeryo Chagi (Axe Kick): High vertical lift, downward strike
- Dwi Huryeo Chagi (Spinning Hook): 360-degree spin, hooking motion
- Bandae Dollyo (Reverse Roundhouse): Opposite direction roundhouse
- Mom Dollyo Chagi (Tornado): Jump spin kick

ANALYSIS CRITERIA:
1. Joint Angles: Knee flexion (ideal chamber: 90-110°), hip rotation, ankle extension
2. Timing: Chamber phase (0.15-0.25s), extension (0.10-0.20s), retraction (0.15-0.25s)
3. Balance: Center of mass alignment, support leg stability
4. Power Generation: Hip rotation speed, kinetic chain efficiency
5. Technical Form: World Taekwondo standards compliance

Provide response as JSON with this exact structure:
{
  "metrics": {
    "kneeAngle": { "avg": number, "min": number, "max": number },
    "hipFlexion": { "avg": number, "min": number, "max": number },
    "kickHeight": { "avg": number, "min": number, "max": number },
    "chamberTime": number,
    "extensionTime": number,
    "retractionTime": number,
    "totalTime": number,
    "peakVelocity": number,
    "balanceScore": number,
    "formScore": number,
    "powerScore": number,
    "overallScore": number
  },
  "recommendations": [
    { "type": "good|improvement|warning", "message": "string" }
  ],
  "technicalNotes": "string",
  "confidenceLevel": "high|medium|low"
}`;

// ============================================
// Main Analysis Function (with caching and rate limiting)
// ============================================
export async function analyzeWithGemini(landmarks, kickType, frameCount, fps) {
  // Generate cache key
  const cacheKey = generateCacheKey({ landmarks: landmarks?.slice(0, 5), kickType, frameCount });

  // Check cache first
  const cached = getCachedResponse(cacheKey);
  if (cached) {
    return cached;
  }

  const landmarkSummary = summarizeLandmarks(landmarks);

  const prompt = `${TAEKWONDO_ANALYSIS_PROMPT}

POSE DATA:
- Kick Type: ${kickType}
- Frame Count: ${frameCount}
- FPS: ${fps}
- Landmark Summary: ${JSON.stringify(landmarkSummary, null, 2)}

Analyze this technique and provide your assessment as JSON only (no markdown, no explanation):`;

  const result = await executeWithRetry(async () => {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const response = await model.generateContent(prompt);
    return response;
  });

  const response = await result.response;
  const text = response.text();

  // Parse JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    const parsed = JSON.parse(jsonMatch[0]);
    setCachedResponse(cacheKey, parsed);
    return parsed;
  }

  throw new Error('Invalid response format from Gemini');
}

// ============================================
// Coaching Feedback (with caching and rate limiting)
// ============================================
export async function generateCoachingFeedback(analysisData, athleteHistory) {
  const cacheKey = generateCacheKey({ type: 'coaching', analysisData });

  const cached = getCachedResponse(cacheKey);
  if (cached) {
    return cached;
  }

  const prompt = `As a World Taekwondo certified coach, provide 3-5 specific coaching recommendations based on this analysis:

Current Analysis:
${JSON.stringify(analysisData, null, 2)}

${athleteHistory ? `Athlete History: ${JSON.stringify(athleteHistory, null, 2)}` : ''}

Provide actionable, specific feedback for Olympic-level training. Response as JSON array:
[{ "priority": "high|medium|low", "area": "string", "recommendation": "string", "drill": "string" }]`;

  try {
    const result = await executeWithRetry(async () => {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      return await model.generateContent(prompt);
    });

    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      setCachedResponse(cacheKey, parsed);
      return parsed;
    }

    return [];
  } catch (error) {
    console.error('Coaching feedback error:', error);
    return [];
  }
}

// ============================================
// Landmark Summary Helper
// ============================================
function summarizeLandmarks(landmarks) {
  if (!landmarks || landmarks.length === 0) {
    return { status: 'no_landmarks', message: 'No pose data available' };
  }

  // MediaPipe landmark indices
  const indices = {
    LEFT_SHOULDER: 11, RIGHT_SHOULDER: 12,
    LEFT_HIP: 23, RIGHT_HIP: 24,
    LEFT_KNEE: 25, RIGHT_KNEE: 26,
    LEFT_ANKLE: 27, RIGHT_ANKLE: 28,
    LEFT_FOOT: 31, RIGHT_FOOT: 32
  };

  const getLandmark = (idx) => landmarks[idx] || { x: 0, y: 0, z: 0, visibility: 0 };

  // Calculate angles
  const calculateAngle = (p1, p2, p3) => {
    const radians = Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    if (angle > 180) angle = 360 - angle;
    return Math.round(angle);
  };

  const rightKneeAngle = calculateAngle(
    getLandmark(indices.RIGHT_HIP),
    getLandmark(indices.RIGHT_KNEE),
    getLandmark(indices.RIGHT_ANKLE)
  );

  const leftKneeAngle = calculateAngle(
    getLandmark(indices.LEFT_HIP),
    getLandmark(indices.LEFT_KNEE),
    getLandmark(indices.LEFT_ANKLE)
  );

  const rightHipAngle = calculateAngle(
    getLandmark(indices.RIGHT_SHOULDER),
    getLandmark(indices.RIGHT_HIP),
    getLandmark(indices.RIGHT_KNEE)
  );

  const leftHipAngle = calculateAngle(
    getLandmark(indices.LEFT_SHOULDER),
    getLandmark(indices.LEFT_HIP),
    getLandmark(indices.LEFT_KNEE)
  );

  // Calculate kick height (relative to hip)
  const rightHip = getLandmark(indices.RIGHT_HIP);
  const rightAnkle = getLandmark(indices.RIGHT_ANKLE);
  const leftHip = getLandmark(indices.LEFT_HIP);
  const leftAnkle = getLandmark(indices.LEFT_ANKLE);

  const rightKickHeight = Math.abs(rightHip.y - rightAnkle.y) * 100;
  const leftKickHeight = Math.abs(leftHip.y - leftAnkle.y) * 100;

  return {
    rightKneeAngle,
    leftKneeAngle,
    rightHipAngle,
    leftHipAngle,
    rightKickHeight: Math.round(rightKickHeight),
    leftKickHeight: Math.round(leftKickHeight),
    averageVisibility: landmarks.reduce((acc, l) => acc + (l?.visibility || 0), 0) / landmarks.length
  };
}

// ============================================
// Kick Type Detection (with caching and rate limiting)
// ============================================
export async function detectKickType(landmarks) {
  const cacheKey = generateCacheKey({ type: 'kickDetect', landmarks: landmarks?.slice(0, 10) });

  const cached = getCachedResponse(cacheKey);
  if (cached) {
    return cached;
  }

  const landmarkSummary = summarizeLandmarks(landmarks);

  const prompt = `Based on these Taekwondo pose landmarks, identify the most likely kick type being performed:

Landmark Data: ${JSON.stringify(landmarkSummary)}

Possible kicks: dollyo_chagi, yeop_chagi, ap_chagi, dwi_chagi, naeryo_chagi, dwi_huryeo_chagi, bandae_dollyo, mom_dollyo_chagi

Response as JSON only: { "kickType": "string", "confidence": number (0-1) }`;

  try {
    const result = await executeWithRetry(async () => {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      return await model.generateContent(prompt);
    });

    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      setCachedResponse(cacheKey, parsed);
      return parsed;
    }

    return { kickType: 'unknown', confidence: 0 };
  } catch (error) {
    console.error('Kick detection error:', error);
    return { kickType: 'unknown', confidence: 0 };
  }
}

export default {
  analyzeWithGemini,
  generateCoachingFeedback,
  detectKickType,
  getRateLimitStatus,
  clearCache
};
