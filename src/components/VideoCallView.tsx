import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PhoneOff,
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  SwitchCamera,
  ScreenShare,
  Heart,
  Volume2,
  Sparkles,
  Maximize2,
  Minimize2,
  Smile,
  ShieldCheck,
} from 'lucide-react';
import { SessionState, VibeTheme, Language, AvatarStyle } from '../types';
import { VisionMode } from '../services/ScreenVisionStreamer';

import blueBoxClosed from '../assets/images/blue_box_anime_closed_1790855812473.jpg';
import blueBoxOpen from '../assets/images/blue_box_anime_open_1790855834167.jpg';
import mahiRealisticClosed from '../assets/images/mahi_realistic_closed_1790855052282.jpg';
import mahiRealisticOpen from '../assets/images/mahi_realistic_open_1790855072559.jpg';
import mahiAnimeAvatar from '../assets/images/mahi_anime_avatar_1790854883443.jpg';
import mahiAnimeOpen from '../assets/images/mahi_anime_open_1790855418191.jpg';

interface VideoCallViewProps {
  sessionState: SessionState;
  audioLevel: number;
  isMuted: boolean;
  vibeTheme: VibeTheme;
  language: Language;
  avatarStyle: AvatarStyle;
  visionMode: VisionMode;
  userVideoStream: MediaStream | null;
  lastSpokenText: string | null;
  onEndVideoCall: () => void;
  onToggleMute: () => void;
  onFlipCamera: () => void;
  onToggleVideo: (enabled: boolean) => void;
  onToggleScreenShare: () => void;
  onSendReactionMessage: (message: string) => void;
}

export const VideoCallView: React.FC<VideoCallViewProps> = ({
  sessionState,
  audioLevel,
  isMuted,
  vibeTheme,
  language,
  avatarStyle,
  visionMode,
  userVideoStream,
  lastSpokenText,
  onEndVideoCall,
  onToggleMute,
  onFlipCamera,
  onToggleVideo,
  onToggleScreenShare,
  onSendReactionMessage,
}) => {
  const [callDuration, setCallDuration] = useState(0);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number }[]>([]);
  const userVideoRef = useRef<HTMLVideoElement | null>(null);

  // Lip-sync values
  const [mouthOpenness, setMouthOpenness] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);

  // Call timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Attach user camera stream to selfie PIP
  useEffect(() => {
    if (userVideoRef.current && userVideoStream) {
      userVideoRef.current.srcObject = userVideoStream;
    }
  }, [userVideoStream, visionMode]);

  // Lip-sync smoothing loop
  useEffect(() => {
    const isSpeaking = sessionState === 'speaking';
    if (!isSpeaking) {
      setMouthOpenness(0);
      return;
    }

    // Audio level drives mouth openness smoothly
    const target = Math.min(1, Math.max(0, (audioLevel - 0.04) * 2.2));
    setMouthOpenness(target);
  }, [audioLevel, sessionState]);

  // Periodic natural blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 140);
    }, 3800 + Math.random() * 2200);

    return () => clearInterval(blinkInterval);
  }, []);

  // Floating heart reaction
  const triggerHeartReaction = () => {
    const newHeart = { id: Date.now(), x: 20 + Math.random() * 60 };
    setFloatingHearts((prev) => [...prev, newHeart]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 1800);
    onSendReactionMessage('Aww, tum bohot pyari lag rahi ho!');
  };

  const handleToggleVideo = () => {
    const next = !isVideoEnabled;
    setIsVideoEnabled(next);
    onToggleVideo(next);
  };

  const mainAvatarClosed =
    avatarStyle === 'bluebox'
      ? blueBoxClosed
      : avatarStyle === 'realistic'
      ? mahiRealisticClosed
      : mahiAnimeAvatar;

  const mainAvatarOpen =
    avatarStyle === 'bluebox'
      ? blueBoxOpen
      : avatarStyle === 'realistic'
      ? mahiRealisticOpen
      : mahiAnimeOpen;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 bg-[#06070e] flex flex-col justify-between overflow-hidden select-none"
    >
      {/* Dynamic Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-950/20 via-black to-slate-950/60 pointer-events-none" />

      {/* Floating Hearts Animation */}
      <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
        {floatingHearts.map((h) => (
          <motion.div
            key={h.id}
            initial={{ opacity: 1, y: '80vh', scale: 0.6 }}
            animate={{ opacity: 0, y: '20vh', scale: 1.5 }}
            transition={{ duration: 1.8, ease: 'easeOut' }}
            style={{ left: `${h.x}%` }}
            className="absolute text-pink-400 drop-shadow-[0_0_15px_rgba(244,114,182,0.8)]"
          >
            <Heart className="w-8 h-8 fill-pink-500" />
          </motion.div>
        ))}
      </div>

      {/* TOP BAR: FaceTime / Video Call Header HUD */}
      <div className="relative z-30 px-4 py-3 sm:px-6 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-sm tracking-wide">
                {language === 'hindi' ? 'माही के साथ वीडियो कॉल' : 'FaceTime with Mahi'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-sky-500/20 text-sky-300 border border-sky-400/30">
                1080p HD
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
              <span>{formatDuration(callDuration)}</span>
              <span>&bull;</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>End-to-End Live</span>
              </span>
            </div>
          </div>
        </div>

        {/* Quick Reaction Pill */}
        <button
          onClick={triggerHeartReaction}
          className="p-2.5 rounded-full bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/40 text-pink-300 shadow-[0_0_15px_rgba(236,72,153,0.3)] transition-all cursor-pointer flex items-center gap-1.5"
          title="Send Love Heart"
        >
          <Heart className="w-4 h-4 fill-pink-500 text-pink-400 animate-bounce" />
          <span className="text-xs font-bold hidden sm:inline">React</span>
        </button>
      </div>

      {/* CENTER: Main Mahi Video Stream & Self Camera PIP */}
      <div className="relative flex-1 flex items-center justify-center p-3 sm:p-6 overflow-hidden">
        {/* Main Stage: Mahi Video Feed */}
        <div className="relative w-full max-w-md aspect-[4/5] sm:aspect-square rounded-3xl overflow-hidden border-2 border-sky-400/30 shadow-[0_0_50px_rgba(56,189,248,0.25)] bg-slate-950 flex items-center justify-center">
          {/* Animated Aura Ring */}
          <div
            className={`absolute inset-0 rounded-3xl pointer-events-none transition-opacity duration-300 ${
              sessionState === 'speaking'
                ? 'opacity-100 shadow-[inset_0_0_40px_rgba(56,189,248,0.4)]'
                : 'opacity-0'
            }`}
          />

          {/* DUAL LAYER LIP-SYNC ENGINE */}
          <div className="relative w-full h-full">
            {/* Base Layer: Closed mouth natural anime portrait */}
            <img
              src={mainAvatarClosed}
              alt="Mahi Video Feed"
              className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
            />

            {/* Top Layer: Open mouth speaking portrait with real-time audio opacity */}
            <img
              src={mainAvatarOpen}
              alt="Mahi Speaking Lip Sync"
              className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
              style={{
                opacity: mouthOpenness,
                transition: 'opacity 0.05s linear',
              }}
            />

            {/* Natural Blinking Overlay */}
            {isBlinking && (
              <div className="absolute inset-0 bg-slate-950/30 pointer-events-none backdrop-blur-[1px] transition-opacity duration-75" />
            )}
          </div>

          {/* Audio Waveform Pulse at Bottom of Mahi's video */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/70 backdrop-blur-md border border-sky-400/30 text-sky-300 text-xs font-bold">
              <span
                className={`w-2 h-2 rounded-full ${
                  sessionState === 'speaking'
                    ? 'bg-pink-400 animate-ping'
                    : 'bg-emerald-400 animate-pulse'
                }`}
              />
              <span>
                {sessionState === 'speaking'
                  ? (language === 'hindi' ? 'माही बोल रही है' : 'Mahi Speaking')
                  : (language === 'hindi' ? 'माही आपको देख रही है' : 'Mahi Watching You')}
              </span>
            </div>

            <div className="px-2.5 py-1 rounded-full bg-slate-950/70 backdrop-blur-md border border-slate-700 text-slate-300 text-[10px] font-mono">
              1080p • 60 FPS
            </div>
          </div>
        </div>

        {/* FLOATING SELF CAMERA PIP (User's Front Camera) */}
        <motion.div
          drag
          dragConstraints={{ left: -140, right: 140, top: -200, bottom: 200 }}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 w-28 h-40 sm:w-36 sm:h-48 rounded-2xl overflow-hidden border-2 border-emerald-400/70 shadow-[0_0_30px_rgba(16,185,129,0.35)] bg-black cursor-grab active:cursor-grabbing z-30"
        >
          {isVideoEnabled && userVideoStream ? (
            <video
              ref={userVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400 p-2 text-center">
              <VideoOff className="w-6 h-6 mb-1 text-slate-500" />
              <span className="text-[10px] font-bold">Camera Off</span>
            </div>
          )}

          {/* Self PIP Tag */}
          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[9px] font-bold text-emerald-300 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>YOU</span>
          </div>

          {/* Flip Camera Button on PIP */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFlipCamera();
            }}
            className="absolute bottom-1.5 right-1.5 p-1.5 rounded-lg bg-black/70 hover:bg-black text-white backdrop-blur-sm cursor-pointer border border-white/20 transition-all"
            title="Flip Camera"
          >
            <SwitchCamera className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      </div>

      {/* LIVE SUBTITLES HUD BANNER */}
      {lastSpokenText && (
        <div className="relative z-30 px-4 max-w-md mx-auto w-full mb-1">
          <div className="px-4 py-2 rounded-2xl bg-black/75 border border-sky-400/40 text-slate-100 shadow-[0_0_20px_rgba(56,189,248,0.25)] backdrop-blur-xl text-center">
            <p className="text-xs font-medium text-slate-200 leading-snug">
              &ldquo;{lastSpokenText}&rdquo;
            </p>
          </div>
        </div>
      )}

      {/* QUICK IN-CALL TOPIC SUGGESTIONS */}
      <div className="relative z-30 px-4 max-w-md mx-auto w-full mb-2">
        <div className="flex items-center justify-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
          <button
            onClick={() => onSendReactionMessage('कैसी लग रही हूँ/रहा हूँ? बताओ ना!')}
            className="whitespace-nowrap px-3 py-1 rounded-full bg-slate-900/80 hover:bg-sky-500/20 border border-slate-700 hover:border-sky-400 text-[11px] font-bold text-slate-200 transition-all cursor-pointer"
          >
            ✨ कैसी लग रही हूँ?
          </button>
          <button
            onClick={() => onSendReactionMessage('चलो एक साथ सेल्फी क्लिक करते हैं!')}
            className="whitespace-nowrap px-3 py-1 rounded-full bg-slate-900/80 hover:bg-pink-500/20 border border-slate-700 hover:border-pink-400 text-[11px] font-bold text-slate-200 transition-all cursor-pointer"
          >
            📸 सेल्फी टाइम
          </button>
          <button
            onClick={() => onSendReactionMessage('मुझे कोई रोमांटिक या मजेदार बात सुनाओ')}
            className="whitespace-nowrap px-3 py-1 rounded-full bg-slate-900/80 hover:bg-purple-500/20 border border-slate-700 hover:border-purple-400 text-[11px] font-bold text-slate-200 transition-all cursor-pointer"
          >
            💖 मजेदार बात
          </button>
        </div>
      </div>

      {/* BOTTOM CONTROL DOCK: FaceTime Calling Bar */}
      <div className="relative z-30 px-4 py-4 sm:py-5 bg-gradient-to-t from-black via-black/80 to-transparent backdrop-blur-xl border-t border-slate-800/60">
        <div className="max-w-md mx-auto flex items-center justify-around gap-2">
          {/* Mute Mic Toggle */}
          <button
            onClick={onToggleMute}
            className={`w-12 h-12 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer border ${
              isMuted
                ? 'bg-rose-500/20 border-rose-500/60 text-rose-300'
                : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-white'
            }`}
            title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Camera Video Toggle */}
          <button
            onClick={handleToggleVideo}
            className={`w-12 h-12 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer border ${
              !isVideoEnabled
                ? 'bg-rose-500/20 border-rose-500/60 text-rose-300'
                : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-white'
            }`}
            title={isVideoEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
          >
            {isVideoEnabled ? <VideoIcon className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          {/* Flip Camera Button */}
          <button
            onClick={onFlipCamera}
            className="w-12 h-12 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-white flex flex-col items-center justify-center transition-all cursor-pointer"
            title="Flip Camera (Front/Rear)"
          >
            <SwitchCamera className="w-5 h-5 text-sky-400" />
          </button>

          {/* Share Screen Button */}
          <button
            onClick={onToggleScreenShare}
            className={`w-12 h-12 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer border ${
              visionMode === 'screen'
                ? 'bg-sky-500/20 border-sky-400 text-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-white'
            }`}
            title="Share Screen"
          >
            <ScreenShare className="w-5 h-5 text-cyan-400" />
          </button>

          {/* END VIDEO CALL BUTTON */}
          <button
            onClick={onEndVideoCall}
            className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-[0_0_30px_rgba(225,29,72,0.5)] transition-all cursor-pointer scale-105 active:scale-95"
            title="End Video Call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
