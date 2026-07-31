import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  X, 
  RefreshCw, 
  Check, 
  AlertCircle, 
  Upload, 
  RotateCw, 
  Sparkles,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface InstantCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Image: string) => void;
}

export default function InstantCameraModal({
  isOpen,
  onClose,
  onCapture
}: InstantCameraModalProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isStartingCamera, setIsStartingCamera] = useState<boolean>(false);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fallbackInputRef = useRef<HTMLInputElement>(null);

  // Initialize or stop camera stream when modal opens/closes or facingMode changes
  useEffect(() => {
    if (!isOpen) {
      stopCameraStream();
      setCapturedImage(null);
      setCameraError(null);
      return;
    }

    startCamera();

    return () => {
      stopCameraStream();
    };
  }, [isOpen, facingMode]);

  const stopCameraStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const startCamera = async () => {
    stopCameraStream();
    setCameraError(null);
    setIsStartingCamera(true);

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 960 }
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play().catch(err => {
          console.warn('Video play deferred or blocked:', err);
        });
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      let errMsg = 'Unable to access live camera stream.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errMsg = 'Camera permission was denied. Please allow camera access in browser permissions or use file capture below.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errMsg = 'No camera hardware detected on this device.';
      }
      setCameraError(errMsg);
    } finally {
      setIsStartingCamera(false);
    }
  };

  const handleToggleFacingMode = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleTakeSnapshot = () => {
    if (!videoRef.current || !stream) return;

    // Trigger flash animation
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');

    // Scale canvas to reasonable max dimension for fast local storage
    const maxDim = 1024;
    let width = video.videoWidth || 800;
    let height = video.videoHeight || 600;

    if (width > maxDim || height > maxDim) {
      if (width > height) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
    }

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // If using user/front camera, flip horizontally for mirror preview
    if (facingMode === 'user') {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, width, height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(dataUrl);
    stopCameraStream();
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleConfirmUsePhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  const handleFallbackFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      onCapture(reader.result as string);
      onClose();
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-[60]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-zinc-950 border border-zinc-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        >
          {/* Modal Header */}
          <div className="p-5 border-b border-zinc-900 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#FF3B3B]/10 border border-[#FF3B3B]/20 flex items-center justify-center text-[#FF3B3B]">
                <Camera size={16} />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-sm tracking-tight">Instant Garment Camera</h3>
                <p className="text-[10px] text-zinc-500 font-semibold">Snap clothing photo in real-time</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white bg-black border border-zinc-900 hover:border-zinc-800 transition-all cursor-pointer"
              id="instant-camera-close-btn"
            >
              <X size={16} />
            </button>
          </div>

          {/* Camera Viewfinder Area */}
          <div className="p-5 flex-1 flex flex-col justify-center items-center relative overflow-hidden bg-black min-h-[320px]">
            {/* Flashing overlay for shutter effect */}
            {isFlashing && (
              <div className="absolute inset-0 bg-white z-20 transition-opacity duration-150" />
            )}

            {capturedImage ? (
              /* Preview Mode */
              <div className="relative w-full h-full flex flex-col items-center justify-center space-y-4">
                <div className="relative w-full max-h-[380px] aspect-[4/3] rounded-2xl overflow-hidden border border-zinc-800 shadow-xl bg-zinc-950">
                  <img
                    src={capturedImage}
                    alt="Captured Garment"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                    <Check size={11} />
                    <span>Photo Captured</span>
                  </div>
                </div>

                {/* Retake or Accept buttons */}
                <div className="flex items-center gap-3 w-full pt-2">
                  <button
                    type="button"
                    onClick={handleRetake}
                    className="flex-1 bg-zinc-900 hover:bg-zinc-850 text-zinc-200 border border-zinc-800 font-bold text-xs py-3.5 px-4 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                    id="instant-camera-retake-btn"
                  >
                    <RotateCw size={14} />
                    <span>Retake Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmUsePhoto}
                    className="flex-1 bg-[#FF3B3B] hover:bg-[#FF1A1A] text-white font-extrabold text-xs py-3.5 px-4 rounded-2xl transition-all shadow-md shadow-[#FF3B3B]/15 flex items-center justify-center gap-2 cursor-pointer"
                    id="instant-camera-use-btn"
                  >
                    <Check size={15} />
                    <span>Use This Photo</span>
                  </button>
                </div>
              </div>
            ) : cameraError ? (
              /* Error / Fallback Mode */
              <div className="text-center p-6 space-y-4 max-w-sm">
                <div className="w-12 h-12 rounded-2xl bg-amber-950/30 border border-amber-900/40 text-amber-400 flex items-center justify-center mx-auto">
                  <AlertCircle size={22} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-200 mb-1">Camera Stream Unavailable</h4>
                  <p className="text-[11px] text-zinc-500 leading-relaxed font-semibold">{cameraError}</p>
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    onClick={() => fallbackInputRef.current?.click()}
                    className="w-full bg-[#FF3B3B] hover:bg-[#FF1A1A] text-white font-bold text-xs py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                    id="instant-camera-fallback-btn"
                  >
                    <Upload size={14} />
                    <span>Take Photo / Select from Files</span>
                  </button>
                  <input
                    type="file"
                    ref={fallbackInputRef}
                    onChange={handleFallbackFileChange}
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={startCamera}
                    className="text-[10px] text-zinc-500 hover:text-zinc-300 font-semibold underline underline-offset-2 cursor-pointer"
                  >
                    Retry Live Camera Stream
                  </button>
                </div>
              </div>
            ) : (
              /* Live Camera Stream Viewfinder */
              <div className="relative w-full aspect-[4/3] max-h-[380px] rounded-2xl overflow-hidden border border-zinc-850 bg-zinc-950 flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                />

                <canvas ref={canvasRef} className="hidden" />

                {/* Viewfinder Alignment Reticle Overlay */}
                <div className="absolute inset-6 border border-white/20 rounded-xl pointer-events-none flex flex-col justify-between p-3">
                  <div className="flex justify-between">
                    <div className="w-4 h-4 border-t-2 border-l-2 border-[#FF3B3B]" />
                    <div className="w-4 h-4 border-t-2 border-r-2 border-[#FF3B3B]" />
                  </div>
                  <div className="text-center">
                    <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-bold text-white/80 border border-white/10 uppercase tracking-widest">
                      Align Garment
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <div className="w-4 h-4 border-b-2 border-l-2 border-[#FF3B3B]" />
                    <div className="w-4 h-4 border-b-2 border-r-2 border-[#FF3B3B]" />
                  </div>
                </div>

                {/* Floating Flip Camera Toggle */}
                <button
                  type="button"
                  onClick={handleToggleFacingMode}
                  className="absolute top-3 right-3 p-2.5 rounded-full bg-black/70 hover:bg-black text-white/90 hover:text-white border border-white/10 backdrop-blur-md transition-all cursor-pointer"
                  title="Flip camera"
                  id="instant-camera-flip-btn"
                >
                  <RotateCw size={15} />
                </button>

                {/* Shutter Button */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center pointer-events-auto">
                  <button
                    type="button"
                    onClick={handleTakeSnapshot}
                    disabled={isStartingCamera || !stream}
                    className="w-16 h-16 rounded-full border-4 border-white bg-black/40 hover:bg-black/60 backdrop-blur-md p-1 flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-2xl"
                    id="instant-camera-shutter-btn"
                    title="Snap photo"
                  >
                    <div className="w-full h-full rounded-full bg-[#FF3B3B] hover:bg-[#FF1A1A] transition-colors" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
