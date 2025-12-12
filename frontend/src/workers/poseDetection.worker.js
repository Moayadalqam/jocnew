// MediaPipe Pose Detection Web Worker
// Runs pose detection in a separate thread to prevent UI blocking

let pose = null;
let isInitialized = false;

// Initialize MediaPipe Pose
async function initializePose() {
  if (isInitialized) return true;

  try {
    // Import MediaPipe dynamically
    importScripts('https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/pose.js');

    pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`
    });

    pose.setOptions({
      modelComplexity: 2, // Highest accuracy for Olympic-level analysis
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7
    });

    pose.onResults((results) => {
      if (results.poseLandmarks) {
        self.postMessage({
          type: 'POSE_RESULTS',
          landmarks: results.poseLandmarks,
          timestamp: Date.now()
        });
      } else {
        self.postMessage({
          type: 'NO_POSE_DETECTED',
          timestamp: Date.now()
        });
      }
    });

    isInitialized = true;
    self.postMessage({ type: 'INITIALIZED', success: true });
    return true;
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      error: `Failed to initialize MediaPipe: ${error.message}`
    });
    return false;
  }
}

// Process video frame
async function processFrame(imageData) {
  if (!isInitialized || !pose) {
    self.postMessage({
      type: 'ERROR',
      error: 'MediaPipe not initialized'
    });
    return;
  }

  try {
    // Create ImageBitmap from transferred data
    const imageBitmap = await createImageBitmap(imageData);

    // Create offscreen canvas
    const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imageBitmap, 0, 0);

    // Process with MediaPipe
    await pose.send({ image: canvas });

    imageBitmap.close();
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      error: `Frame processing error: ${error.message}`
    });
  }
}

// Handle messages from main thread
self.onmessage = async (event) => {
  const { type, data } = event.data;

  switch (type) {
    case 'INITIALIZE':
      await initializePose();
      break;

    case 'PROCESS_FRAME':
      await processFrame(data.imageData);
      break;

    case 'TERMINATE':
      if (pose) {
        pose.close();
        pose = null;
      }
      isInitialized = false;
      self.close();
      break;

    default:
      self.postMessage({
        type: 'ERROR',
        error: `Unknown message type: ${type}`
      });
  }
};

// Signal worker is ready
self.postMessage({ type: 'WORKER_READY' });
