// ============================================
// Video Format Validation and Conversion Hints
// ============================================

// Supported video formats by browser
export const SUPPORTED_FORMATS = {
  // Format: { mimeType, extensions, browserSupport }
  mp4: {
    mimeType: 'video/mp4',
    extensions: ['.mp4', '.m4v'],
    codecs: ['avc1', 'h264', 'mp4v'],
    browserSupport: {
      chrome: true,
      firefox: true,
      safari: true,
      edge: true
    }
  },
  webm: {
    mimeType: 'video/webm',
    extensions: ['.webm'],
    codecs: ['vp8', 'vp9', 'av1'],
    browserSupport: {
      chrome: true,
      firefox: true,
      safari: false, // Safari has limited WebM support
      edge: true
    }
  },
  ogg: {
    mimeType: 'video/ogg',
    extensions: ['.ogg', '.ogv'],
    codecs: ['theora'],
    browserSupport: {
      chrome: true,
      firefox: true,
      safari: false,
      edge: true
    }
  },
  mov: {
    mimeType: 'video/quicktime',
    extensions: ['.mov'],
    codecs: ['avc1', 'h264'],
    browserSupport: {
      chrome: false,
      firefox: false,
      safari: true,
      edge: false
    }
  },
  avi: {
    mimeType: 'video/x-msvideo',
    extensions: ['.avi'],
    codecs: [],
    browserSupport: {
      chrome: false,
      firefox: false,
      safari: false,
      edge: false
    }
  },
  mkv: {
    mimeType: 'video/x-matroska',
    extensions: ['.mkv'],
    codecs: ['vp8', 'vp9', 'h264'],
    browserSupport: {
      chrome: false,
      firefox: false,
      safari: false,
      edge: false
    }
  }
};

// Maximum file sizes (in MB)
export const FILE_SIZE_LIMITS = {
  recommended: 100, // 100MB recommended
  maximum: 500,     // 500MB maximum
  optimalForAnalysis: 50 // Best performance under 50MB
};

// Video dimension recommendations
export const VIDEO_DIMENSIONS = {
  minWidth: 480,
  minHeight: 360,
  recommendedWidth: 1280,
  recommendedHeight: 720,
  maxWidth: 1920,
  maxHeight: 1080
};

// Frame rate recommendations
export const FRAME_RATES = {
  minimum: 24,
  recommended: 30,
  optimal: 60 // Best for motion analysis
};

// ============================================
// Browser Detection
// ============================================
export function detectBrowser() {
  const ua = navigator.userAgent.toLowerCase();

  if (ua.includes('edg/')) return 'edge';
  if (ua.includes('chrome')) return 'chrome';
  if (ua.includes('safari') && !ua.includes('chrome')) return 'safari';
  if (ua.includes('firefox')) return 'firefox';

  return 'unknown';
}

// ============================================
// Check Video Format Support
// ============================================
export function isFormatSupported(file) {
  const browser = detectBrowser();
  const extension = getFileExtension(file.name);
  const mimeType = file.type;

  // Check by MIME type first
  for (const [format, config] of Object.entries(SUPPORTED_FORMATS)) {
    if (config.mimeType === mimeType || config.extensions.includes(extension)) {
      return {
        supported: config.browserSupport[browser] !== false,
        format,
        browser,
        browserSupport: config.browserSupport
      };
    }
  }

  return {
    supported: false,
    format: 'unknown',
    browser,
    browserSupport: {}
  };
}

// ============================================
// Validate Video File
// ============================================
export async function validateVideoFile(file) {
  const errors = [];
  const warnings = [];
  const info = [];

  // 1. Check file existence
  if (!file) {
    return { valid: false, errors: ['No file provided'], warnings: [], info: [] };
  }

  // 2. Check file type
  const formatCheck = isFormatSupported(file);
  if (!formatCheck.supported) {
    errors.push(`Format "${formatCheck.format}" is not supported in ${formatCheck.browser}. Convert to MP4 for best compatibility.`);
  } else {
    info.push(`Format: ${formatCheck.format.toUpperCase()} (supported)`);
  }

  // 3. Check file size
  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > FILE_SIZE_LIMITS.maximum) {
    errors.push(`File size (${sizeMB.toFixed(1)}MB) exceeds maximum (${FILE_SIZE_LIMITS.maximum}MB). Please compress the video.`);
  } else if (sizeMB > FILE_SIZE_LIMITS.recommended) {
    warnings.push(`Large file (${sizeMB.toFixed(1)}MB) may cause slow analysis. Consider compressing to under ${FILE_SIZE_LIMITS.recommended}MB.`);
  } else if (sizeMB < FILE_SIZE_LIMITS.optimalForAnalysis) {
    info.push(`File size: ${sizeMB.toFixed(1)}MB (optimal)`);
  } else {
    info.push(`File size: ${sizeMB.toFixed(1)}MB`);
  }

  // 4. Try to get video metadata
  try {
    const metadata = await getVideoMetadata(file);

    // Check dimensions
    if (metadata.width < VIDEO_DIMENSIONS.minWidth || metadata.height < VIDEO_DIMENSIONS.minHeight) {
      warnings.push(`Low resolution (${metadata.width}x${metadata.height}). Recommend at least ${VIDEO_DIMENSIONS.minWidth}x${VIDEO_DIMENSIONS.minHeight} for accurate pose detection.`);
    } else if (metadata.width >= VIDEO_DIMENSIONS.recommendedWidth) {
      info.push(`Resolution: ${metadata.width}x${metadata.height} (good)`);
    } else {
      info.push(`Resolution: ${metadata.width}x${metadata.height}`);
    }

    // Check duration
    if (metadata.duration > 300) {
      warnings.push(`Long video (${formatDuration(metadata.duration)}). Consider trimming to the kick sequences only.`);
    } else {
      info.push(`Duration: ${formatDuration(metadata.duration)}`);
    }

  } catch (err) {
    warnings.push('Could not read video metadata. Video may still work.');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    info,
    formatSupport: formatCheck
  };
}

// ============================================
// Get Video Metadata
// ============================================
export function getVideoMetadata(file) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      resolve({
        width: video.videoWidth,
        height: video.videoHeight,
        duration: video.duration,
        aspectRatio: video.videoWidth / video.videoHeight
      });
      URL.revokeObjectURL(video.src);
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Could not load video metadata'));
    };

    video.src = URL.createObjectURL(file);
  });
}

// ============================================
// Get Conversion Hints
// ============================================
export function getConversionHints(file) {
  const extension = getFileExtension(file.name);
  const formatCheck = isFormatSupported(file);

  if (formatCheck.supported) {
    return null;
  }

  const hints = {
    message: `Your ${extension.toUpperCase()} file may not play correctly in ${formatCheck.browser}.`,
    recommendations: [],
    tools: []
  };

  // Specific recommendations by format
  switch (formatCheck.format) {
    case 'mov':
      hints.recommendations.push('Convert to MP4 using H.264 codec for best compatibility.');
      hints.tools.push(
        { name: 'HandBrake', url: 'https://handbrake.fr/', description: 'Free video converter' },
        { name: 'FFmpeg', url: 'https://ffmpeg.org/', command: 'ffmpeg -i input.mov -c:v libx264 -c:a aac output.mp4' }
      );
      break;

    case 'avi':
    case 'mkv':
      hints.recommendations.push('Convert to MP4 (H.264) or WebM (VP9) for web playback.');
      hints.tools.push(
        { name: 'CloudConvert', url: 'https://cloudconvert.com/', description: 'Online converter' },
        { name: 'VLC', url: 'https://www.videolan.org/', description: 'Free media player with conversion' }
      );
      break;

    default:
      hints.recommendations.push('Convert to MP4 format for universal browser support.');
  }

  // Browser-specific hints
  if (formatCheck.browser === 'safari' && formatCheck.format === 'webm') {
    hints.message = 'Safari has limited WebM support. Consider using MP4 instead.';
  }

  return hints;
}

// ============================================
// Browser Compatibility Check
// ============================================
export function checkBrowserCompatibility() {
  const browser = detectBrowser();
  const compatibility = {
    browser,
    features: {},
    warnings: []
  };

  // Check MediaPipe support
  compatibility.features.mediaPipe = {
    supported: 'MediaPipe' in window || true, // MediaPipe loads dynamically
    note: 'MediaPipe Pose detection for biomechanical analysis'
  };

  // Check Web Workers
  compatibility.features.webWorkers = {
    supported: typeof Worker !== 'undefined',
    note: 'Background processing for UI responsiveness'
  };

  // Check Canvas
  compatibility.features.canvas = {
    supported: !!document.createElement('canvas').getContext('2d'),
    note: 'Video frame processing and pose overlay'
  };

  // Check OffscreenCanvas (for web workers)
  compatibility.features.offscreenCanvas = {
    supported: typeof OffscreenCanvas !== 'undefined',
    note: 'Efficient frame processing in web workers'
  };

  // Check Video element
  compatibility.features.video = {
    supported: !!document.createElement('video').canPlayType,
    note: 'Video playback capability'
  };

  // Check WebGL (for MediaPipe)
  compatibility.features.webgl = {
    supported: (() => {
      try {
        const canvas = document.createElement('canvas');
        return !!(canvas.getContext('webgl') || canvas.getContext('webgl2'));
      } catch (e) {
        return false;
      }
    })(),
    note: 'GPU acceleration for pose detection'
  };

  // Check IndexedDB (for caching)
  compatibility.features.indexedDB = {
    supported: 'indexedDB' in window,
    note: 'Local data storage for session history'
  };

  // Generate warnings
  if (!compatibility.features.webgl.supported) {
    compatibility.warnings.push('WebGL not available. Pose detection may be slower.');
  }

  if (!compatibility.features.offscreenCanvas.supported) {
    compatibility.warnings.push('OffscreenCanvas not supported. Using fallback processing.');
  }

  if (browser === 'safari') {
    compatibility.warnings.push('Safari detected. Some WebM videos may not play. Use MP4 format.');
  }

  return compatibility;
}

// ============================================
// Utility Functions
// ============================================
function getFileExtension(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  return '.' + ext;
}

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ============================================
// Optimal Settings Recommendation
// ============================================
export function getOptimalVideoSettings() {
  return {
    format: 'MP4 (H.264 codec)',
    resolution: '1280x720 (720p) or 1920x1080 (1080p)',
    frameRate: '30fps or 60fps for best motion analysis',
    bitrate: '5-10 Mbps',
    duration: 'Under 2 minutes per kick sequence',
    fileSize: 'Under 50MB for optimal performance',
    tips: [
      'Ensure good lighting - natural light or bright indoor lighting',
      'Film from the side to capture full kick extension',
      'Keep the athlete fully in frame throughout the kick',
      'Use a tripod or stable surface to avoid camera shake',
      'Film in slow motion (120fps+) if your camera supports it'
    ]
  };
}

export default {
  validateVideoFile,
  isFormatSupported,
  getConversionHints,
  checkBrowserCompatibility,
  getOptimalVideoSettings,
  getVideoMetadata,
  detectBrowser,
  SUPPORTED_FORMATS,
  FILE_SIZE_LIMITS,
  VIDEO_DIMENSIONS,
  FRAME_RATES
};
