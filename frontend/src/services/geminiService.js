import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = import.meta.env.VITE_GEMINI_API_KEY
  ? new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)
  : null;

// ============================================
// Model Configuration - using latest stable Gemini model
// ============================================
const MODEL_NAME = 'gemini-2.0-flash-001';

// ============================================
// Rate Limiting Configuration (Gemini 2.0 Flash has 15 RPM free tier)
// ============================================
const RATE_LIMIT = {
  maxRequestsPerMinute: 15, // Gemini 2.0 Flash free tier limit
  minIntervalMs: 4000, // 4 seconds between requests
  retryDelayMs: 60000, // Wait 60s on rate limit for quota reset
  maxRetries: 3 // More retries with longer delays
};

// Request timestamps
let requestTimestamps = [];

// ============================================
// Caching System (Longer cache to reduce API calls)
// ============================================
const CACHE_CONFIG = {
  maxAge: 30 * 60 * 1000, // 30 minutes cache (longer to reduce API calls)
  maxSize: 100 // Maximum cached responses
};

const responseCache = new Map();

function generateCacheKey(data) {
  return JSON.stringify(data).substring(0, 500);
}

function getCachedResponse(key) {
  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_CONFIG.maxAge) {
    console.log('📦 Using cached Gemini response');
    return cached.data;
  }
  if (cached) {
    responseCache.delete(key);
  }
  return null;
}

function setCachedResponse(key, data) {
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
                               error.message?.includes('rate') ||
                               error.message?.includes('exceeded');

      if (isRateLimitError && attempt < retries) {
        const delay = RATE_LIMIT.retryDelayMs * attempt;
        console.warn(`⚠️ Rate limit hit. Retry ${attempt}/${retries} in ${delay/1000}s`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      if (attempt === retries) {
        console.error('❌ Max retries exceeded for Gemini API');
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
    cacheMaxSize: CACHE_CONFIG.maxSize,
    isConfigured: genAI !== null
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
// Fallback Analysis (when API fails or not configured)
// ============================================
function generateFallbackAnalysis(landmarks, kickType) {
  console.log('📊 Using local fallback analysis (API unavailable)');

  const landmarkSummary = summarizeLandmarks(landmarks);

  // Calculate scores based on biomechanical principles
  const kneeAngle = Math.max(landmarkSummary.rightKneeAngle, landmarkSummary.leftKneeAngle);
  const hipAngle = Math.max(landmarkSummary.rightHipAngle, landmarkSummary.leftHipAngle);
  const kickHeight = Math.max(landmarkSummary.rightKickHeight, landmarkSummary.leftKickHeight);

  // Score calculations based on ideal ranges
  const kneeScore = kneeAngle >= 90 && kneeAngle <= 120 ? 85 :
                    kneeAngle >= 80 && kneeAngle <= 130 ? 75 : 65;
  const hipScore = hipAngle >= 80 && hipAngle <= 100 ? 85 :
                   hipAngle >= 70 && hipAngle <= 110 ? 75 : 65;
  const heightScore = kickHeight >= 60 ? 90 : kickHeight >= 40 ? 75 : 60;

  const formScore = Math.round((kneeScore + hipScore) / 2);
  const powerScore = Math.round((hipScore + heightScore) / 2);
  const balanceScore = landmarkSummary.averageVisibility > 0.7 ? 85 : 70;
  const overallScore = Math.round((formScore + powerScore + balanceScore) / 3);

  const recommendations = [];

  if (kneeAngle < 90) {
    recommendations.push({
      type: 'improvement',
      message: 'Increase knee chamber angle for more power generation'
    });
  } else {
    recommendations.push({
      type: 'good',
      message: 'Good knee chamber angle for kick execution'
    });
  }

  if (kickHeight < 50) {
    recommendations.push({
      type: 'improvement',
      message: 'Work on hip flexibility to increase kick height'
    });
  } else {
    recommendations.push({
      type: 'good',
      message: 'Excellent kick height achieved'
    });
  }

  if (landmarkSummary.averageVisibility < 0.7) {
    recommendations.push({
      type: 'warning',
      message: 'Ensure full body is visible in frame for accurate analysis'
    });
  }

  return {
    metrics: {
      kneeAngle: { avg: kneeAngle, min: Math.min(landmarkSummary.rightKneeAngle, landmarkSummary.leftKneeAngle), max: kneeAngle },
      hipFlexion: { avg: hipAngle, min: Math.min(landmarkSummary.rightHipAngle, landmarkSummary.leftHipAngle), max: hipAngle },
      kickHeight: { avg: kickHeight, min: 0, max: kickHeight },
      chamberTime: 0.2,
      extensionTime: 0.15,
      retractionTime: 0.2,
      totalTime: 0.55,
      peakVelocity: 12.5,
      balanceScore,
      formScore,
      powerScore,
      overallScore
    },
    recommendations,
    technicalNotes: `Local analysis for ${kickType}. Knee angle: ${kneeAngle}°, Hip angle: ${hipAngle}°, Kick height: ${kickHeight}%`,
    confidenceLevel: 'medium',
    isLocalFallback: true
  };
}

function generateFallbackCoaching(analysisData) {
  const recommendations = [];
  const metrics = analysisData?.metrics || {};

  if (metrics.formScore < 80) {
    recommendations.push({
      priority: 'high',
      area: 'Form',
      recommendation: 'Focus on proper chamber position before kick extension',
      drill: 'Slow-motion chamber holds - 10 reps each leg'
    });
  }

  if (metrics.powerScore < 80) {
    recommendations.push({
      priority: 'high',
      area: 'Power',
      recommendation: 'Increase hip rotation speed for more power generation',
      drill: 'Hip rotation drills with resistance band - 3 sets of 15'
    });
  }

  if (metrics.balanceScore < 80) {
    recommendations.push({
      priority: 'medium',
      area: 'Balance',
      recommendation: 'Strengthen core and support leg stability',
      drill: 'Single-leg balance holds - 30 seconds each leg, 3 sets'
    });
  }

  recommendations.push({
    priority: 'medium',
    area: 'Flexibility',
    recommendation: 'Daily stretching routine for hip flexors and hamstrings',
    drill: 'Dynamic stretching - 10 minutes pre-training'
  });

  return recommendations;
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
// Main Analysis Function (with caching, rate limiting, and fallback)
// ============================================
export async function analyzeWithGemini(landmarks, kickType, frameCount, fps) {
  // Generate cache key
  const cacheKey = generateCacheKey({ landmarks: landmarks?.slice(0, 5), kickType, frameCount });

  // Check cache first
  const cached = getCachedResponse(cacheKey);
  if (cached) {
    return cached;
  }

  // If Gemini not configured, use fallback
  if (!genAI) {
    console.warn('⚠️ Gemini API not configured, using local analysis');
    const fallback = generateFallbackAnalysis(landmarks, kickType);
    setCachedResponse(cacheKey, fallback);
    return fallback;
  }

  const landmarkSummary = summarizeLandmarks(landmarks);

  const prompt = `${TAEKWONDO_ANALYSIS_PROMPT}

POSE DATA:
- Kick Type: ${kickType}
- Frame Count: ${frameCount}
- FPS: ${fps}
- Landmark Summary: ${JSON.stringify(landmarkSummary, null, 2)}

Analyze this technique and provide your assessment as JSON only (no markdown, no explanation):`;

  try {
    const result = await executeWithRetry(async () => {
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });
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
  } catch (error) {
    console.error('Gemini API error, using fallback:', error.message);
    const fallback = generateFallbackAnalysis(landmarks, kickType);
    setCachedResponse(cacheKey, fallback);
    return fallback;
  }
}

// ============================================
// Coaching Feedback (with caching, rate limiting, and fallback)
// ============================================
export async function generateCoachingFeedback(analysisData, athleteHistory) {
  const cacheKey = generateCacheKey({ type: 'coaching', analysisData });

  const cached = getCachedResponse(cacheKey);
  if (cached) {
    return cached;
  }

  // If Gemini not configured or analysis was local, use fallback
  if (!genAI || analysisData?.isLocalFallback) {
    const fallback = generateFallbackCoaching(analysisData);
    setCachedResponse(cacheKey, fallback);
    return fallback;
  }

  const prompt = `As a World Taekwondo certified coach, provide 3-5 specific coaching recommendations based on this analysis:

Current Analysis:
${JSON.stringify(analysisData, null, 2)}

${athleteHistory ? `Athlete History: ${JSON.stringify(athleteHistory, null, 2)}` : ''}

Provide actionable, specific feedback for Olympic-level training. Response as JSON array:
[{ "priority": "high|medium|low", "area": "string", "recommendation": "string", "drill": "string" }]`;

  try {
    const result = await executeWithRetry(async () => {
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });
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

    return generateFallbackCoaching(analysisData);
  } catch (error) {
    console.error('Coaching feedback error, using fallback:', error.message);
    const fallback = generateFallbackCoaching(analysisData);
    setCachedResponse(cacheKey, fallback);
    return fallback;
  }
}

// ============================================
// Landmark Summary Helper
// ============================================
function summarizeLandmarks(landmarks) {
  if (!landmarks || landmarks.length === 0) {
    return {
      status: 'no_landmarks',
      message: 'No pose data available',
      rightKneeAngle: 90,
      leftKneeAngle: 90,
      rightHipAngle: 85,
      leftHipAngle: 85,
      rightKickHeight: 50,
      leftKickHeight: 50,
      averageVisibility: 0.5
    };
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
    rightKneeAngle: rightKneeAngle || 90,
    leftKneeAngle: leftKneeAngle || 90,
    rightHipAngle: rightHipAngle || 85,
    leftHipAngle: leftHipAngle || 85,
    rightKickHeight: Math.round(rightKickHeight) || 50,
    leftKickHeight: Math.round(leftKickHeight) || 50,
    averageVisibility: landmarks.reduce((acc, l) => acc + (l?.visibility || 0), 0) / landmarks.length || 0.5
  };
}

// ============================================
// Kick Type Detection (with fallback)
// ============================================
export async function detectKickType(landmarks) {
  const cacheKey = generateCacheKey({ type: 'kickDetect', landmarks: landmarks?.slice(0, 10) });

  const cached = getCachedResponse(cacheKey);
  if (cached) {
    return cached;
  }

  // If Gemini not configured, return unknown
  if (!genAI) {
    return { kickType: 'unknown', confidence: 0 };
  }

  const landmarkSummary = summarizeLandmarks(landmarks);

  const prompt = `Based on these Taekwondo pose landmarks, identify the most likely kick type being performed:

Landmark Data: ${JSON.stringify(landmarkSummary)}

Possible kicks: dollyo_chagi, yeop_chagi, ap_chagi, dwi_chagi, naeryo_chagi, dwi_huryeo_chagi, bandae_dollyo, mom_dollyo_chagi

Response as JSON only: { "kickType": "string", "confidence": number (0-1) }`;

  try {
    const result = await executeWithRetry(async () => {
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });
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
    console.error('Kick detection error:', error.message);
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
