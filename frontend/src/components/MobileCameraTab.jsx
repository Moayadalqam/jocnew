import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Video, StopCircle, RefreshCw, Download, Smartphone, Wifi, WifiOff, AlertCircle } from 'lucide-react';

const MobileCameraTab = ({ setAnalysisData }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraFacing, setCameraFacing] = useState('environment');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const startCamera = async (facing = cameraFacing) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Unable to access camera. Please ensure camera permissions are granted.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  };

  const switchCamera = async () => {
    stopCamera();
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
    setTimeout(() => startCamera(nextFacing), 100);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL('image/png');
      setCapturedImage(imageData);
    }
  };

  const startRecording = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const options = { mimeType: 'video/webm;codecs=vp9' };

      try {
        mediaRecorderRef.current = new MediaRecorder(stream, options);
      } catch (e) {
        mediaRecorderRef.current = new MediaRecorder(stream);
      }

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks(prev => [...prev, event.data]);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const downloadRecording = () => {
    if (recordedChunks.length > 0) {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `taekwondo_${Date.now()}.webm`;
      a.click();
      URL.revokeObjectURL(url);
      setRecordedChunks([]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Camera className="text-joc-gold" size={28} />
          <h2 className="text-2xl font-bold text-white">Mobile Camera</h2>
        </div>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <span className="flex items-center gap-2 text-green-400 text-sm">
              <Wifi size={16} />
              Online
            </span>
          ) : (
            <span className="flex items-center gap-2 text-red-400 text-sm">
              <WifiOff size={16} />
              Offline
            </span>
          )}
        </div>
      </div>

      {/* Instructions for Mobile */}
      <div className="glass-card p-4 bg-blue-500/10 border border-blue-500/30">
        <div className="flex items-start gap-3">
          <Smartphone size={24} className="text-blue-400 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-400">Mobile Capture</h3>
            <p className="text-sm text-gray-300 mt-1">
              Use your device's camera to capture technique images or record short videos.
              Download recordings and upload them in the Video Analyzer tab for full analysis.
            </p>
          </div>
        </div>
      </div>

      {/* Info about analysis */}
      <div className="glass-card p-4 bg-yellow-500/10 border border-yellow-500/30">
        <div className="flex items-start gap-3">
          <AlertCircle size={24} className="text-yellow-400 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-yellow-400">Analysis Note</h3>
            <p className="text-sm text-gray-300 mt-1">
              For full biomechanical analysis, record your video here, download it, then upload it in the Video Analyzer tab.
              Single frame captures provide limited analysis data.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Camera Preview */}
        <div className="glass-card p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Camera Preview</h3>
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />

            {!isStreaming && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                <Camera size={48} className="mb-4 opacity-50" />
                <p>Camera not active</p>
              </div>
            )}

            {isRecording && (
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 bg-red-500 rounded-full text-white text-sm">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                Recording
              </div>
            )}
          </div>

          {/* Camera Controls */}
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {!isStreaming ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => startCamera()}
                className="btn-gold flex items-center gap-2"
              >
                <Camera size={20} />
                Start Camera
              </motion.button>
            ) : (
              <>
                <button
                  onClick={stopCamera}
                  className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors flex items-center gap-2"
                >
                  <StopCircle size={20} />
                  Stop
                </button>
                <button
                  onClick={switchCamera}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <RefreshCw size={20} />
                  Switch
                </button>
                <button
                  onClick={captureImage}
                  className="btn-gold flex items-center gap-2"
                >
                  <Camera size={20} />
                  Capture
                </button>
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white flex items-center gap-2 transition-colors"
                  >
                    <Video size={20} />
                    Record
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white flex items-center gap-2 animate-pulse transition-colors"
                  >
                    <StopCircle size={20} />
                    Stop Recording
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Captured Image */}
        <div className="glass-card p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Captured Image</h3>
          <div className="aspect-video bg-black/30 rounded-lg overflow-hidden">
            {capturedImage ? (
              <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <Camera size={48} className="mb-4 opacity-50" />
                <p>No image captured</p>
                <p className="text-sm text-gray-500">Use the Capture button</p>
              </div>
            )}
          </div>

          {capturedImage && (
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              <button
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = capturedImage;
                  a.download = `capture_${Date.now()}.png`;
                  a.click();
                }}
                className="btn-gold flex items-center gap-2"
              >
                <Download size={20} />
                Download Image
              </button>
              <button
                onClick={() => setCapturedImage(null)}
                className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recorded Video */}
      {recordedChunks.length > 0 && (
        <div className="glass-card p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Recorded Video</h3>
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div className="flex items-center gap-4">
              <Video size={24} className="text-joc-gold" />
              <div>
                <p className="font-medium">Video Recording Ready</p>
                <p className="text-sm text-gray-400">{recordedChunks.length} chunks recorded</p>
              </div>
            </div>
            <button
              onClick={downloadRecording}
              className="btn-gold flex items-center gap-2"
            >
              <Download size={20} />
              Download Video
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            Download the video and upload it in the Video Analyzer tab for full biomechanical analysis.
          </p>
        </div>
      )}

      {/* Tips */}
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold text-joc-gold mb-4">Tips for Best Results</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
          <div className="flex items-start gap-3">
            <span className="text-joc-gold">1.</span>
            <p>Use good lighting - avoid backlit situations</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-joc-gold">2.</span>
            <p>Position camera 3-5 meters from the athlete</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-joc-gold">3.</span>
            <p>Use landscape orientation for full body capture</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-joc-gold">4.</span>
            <p>Ensure the full kick motion is visible in frame</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-joc-gold">5.</span>
            <p>Wear contrasting clothing against background</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-joc-gold">6.</span>
            <p>Keep camera steady - use a tripod if possible</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileCameraTab;
