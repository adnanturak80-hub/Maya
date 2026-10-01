import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScreenShare, Camera, StopCircle, Eye, Sparkles } from 'lucide-react';
import { VisionMode } from '../services/ScreenVisionStreamer';
import { Language, SessionState } from '../types';

interface VisionControlBarProps {
  visionMode: VisionMode;
  sessionState: SessionState;
  language: Language;
  videoStream: MediaStream | null;
  onStartScreenVision: () => void;
  onStartCameraVision: () => void;
  onStopVision: () => void;
}

export const VisionControlBar: React.FC<VisionControlBarProps> = ({
  visionMode,
  sessionState,
  language,
  videoStream,
  onStartScreenVision,
  onStartCameraVision,
  onStopVision,
}) => {
  const isCallActive = sessionState === 'listening' || sessionState === 'speaking';
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  React.useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
    }
  }, [videoStream, visionMode]);

  return (
    <div className="w-full max-w-sm mx-auto my-2">
      <AnimatePresence mode="wait">
        {visionMode !== 'off' ? (
          /* ACTIVE VISION HUD CARD WITH MINI PIP PREVIEW */
          <motion.div
            key="active-vision"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="relative overflow-hidden rounded-2xl border border-emerald-500/50 bg-slate-950/85 backdrop-blur-xl p-3 shadow-[0_0_30px_rgba(16,185,129,0.25)]"
          >
            <div className="flex items-center justify-between gap-3">
              {/* Mini PIP Video Window */}
              <div className="relative w-20 h-14 rounded-xl overflow-hidden bg-black border border-emerald-500/40 shrink-0 shadow-inner">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-1 left-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>

              {/* Status info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-emerald-400 font-extrabold text-xs">
                  <Eye className="w-3.5 h-3.5 animate-pulse" />
                  <span className="truncate">
                    {visionMode === 'screen'
                      ? (language === 'hindi' ? 'फोन स्क्रीन विज़न चालू' : 'Screen Vision Active')
                      : (language === 'hindi' ? 'कैमरा विज़न चालू' : 'Camera Vision Active')}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium truncate mt-0.5">
                  {language === 'hindi'
                    ? 'माही आपकी स्क्रीन देख रही है...'
                    : 'Mahi is observing your screen live...'}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-emerald-300/80 font-mono mt-0.5">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>1 FPS Real-time Vision</span>
                </div>
              </div>

              {/* Stop Vision Button */}
              <button
                onClick={onStopVision}
                className="p-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-300 transition-all cursor-pointer flex flex-col items-center justify-center shrink-0"
                title="Stop Vision"
              >
                <StopCircle className="w-4 h-4 text-rose-400" />
                <span className="text-[9px] font-bold uppercase mt-0.5">
                  {language === 'hindi' ? 'रोकें' : 'Stop'}
                </span>
              </button>
            </div>
          </motion.div>
        ) : (
          /* VISION ACTIVATION BUTTONS */
          <motion.div
            key="inactive-vision"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex items-center justify-center gap-2"
          >
            {/* Screen Vision Button */}
            <button
              onClick={onStartScreenVision}
              className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg ${
                isCallActive
                  ? 'bg-gradient-to-r from-cyan-600/30 via-blue-600/30 to-purple-600/30 border-cyan-500/50 text-cyan-200 hover:border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
              }`}
              title="Share phone screen with Mahi"
            >
              <ScreenShare className="w-4 h-4 text-cyan-400" />
              <div className="flex flex-col text-left">
                <span className="text-[11px] leading-tight font-extrabold text-cyan-200">
                  {language === 'hindi' ? '📱 फोन स्क्रीन दिखाओ' : '📱 Share Phone Screen'}
                </span>
                <span className="text-[9px] text-cyan-300/70 font-normal leading-none">
                  {language === 'hindi' ? 'माही स्क्रीन देखकर मदद करेगी' : 'Mahi will guide your screen'}
                </span>
              </div>
            </button>

            {/* Camera Vision Button */}
            <button
              onClick={onStartCameraVision}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg ${
                isCallActive
                  ? 'bg-purple-600/20 border-purple-500/50 text-purple-200 hover:border-purple-400'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
              title="Show camera to Mahi"
            >
              <Camera className="w-4 h-4 text-purple-400" />
              <span className="text-[11px] font-bold hidden sm:inline">
                {language === 'hindi' ? 'कैमरा' : 'Camera'}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
