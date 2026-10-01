import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Mic, Volume2, Flame, Zap, Heart } from 'lucide-react';
import { SessionState, VibeTheme, Language } from '../types';
import mahiAnimeAvatar from '../assets/images/mahi_anime_avatar_1790854883443.jpg';
import mahiSpeakingAvatar from '../assets/images/mahi_speaking_avatar_1790854899995.jpg';

interface FuturisticOrbProps {
  state: SessionState;
  audioLevel: number;
  isMuted: boolean;
  vibeTheme: VibeTheme;
  language: Language;
  currentMood: string;
  teaseRating: string;
  onOrbClick: () => void;
}

export const FuturisticOrb: React.FC<FuturisticOrbProps> = ({
  state,
  audioLevel,
  isMuted,
  vibeTheme,
  language,
  currentMood,
  teaseRating,
  onOrbClick,
}) => {
  const isDisconnected = state === 'disconnected';
  const isConnecting = state === 'connecting';
  const isListening = state === 'listening';
  const isSpeaking = state === 'speaking';

  // Dynamic audio-reactive scale and glow
  const scaleMultiplier = Math.min(1.25, 1 + audioLevel * 0.9);
  const glowOpacity = Math.min(0.95, 0.45 + audioLevel * 1.6);

  // Theme palettes
  const themeGradients: Record<VibeTheme, { primary: string; secondary: string; glow: string; border: string }> = {
    'cyber-pink': {
      primary: '#ec4899',
      secondary: '#9333ea',
      glow: 'rgba(236,72,153,',
      border: 'border-pink-500',
    },
    'electric-violet': {
      primary: '#8b5cf6',
      secondary: '#3b82f6',
      glow: 'rgba(139,92,246,',
      border: 'border-purple-500',
    },
    'neon-cyan': {
      primary: '#06b6d4',
      secondary: '#ec4899',
      glow: 'rgba(6,182,212,',
      border: 'border-cyan-400',
    },
    'sunset-gold': {
      primary: '#f59e0b',
      secondary: '#ef4444',
      glow: 'rgba(245,158,11,',
      border: 'border-amber-400',
    },
  };

  const currentTheme = themeGradients[vibeTheme] || themeGradients['cyber-pink'];

  // Current active avatar image
  const currentAvatarSrc = isSpeaking ? mahiSpeakingAvatar : mahiAnimeAvatar;

  return (
    <div className="relative flex flex-col items-center justify-center select-none w-full max-w-sm mx-auto">
      {/* Mood Badge Pill with Anime Accent */}
      <motion.div
        key={currentMood}
        initial={{ opacity: 0, y: -8, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/85 border border-pink-500/40 text-pink-300 shadow-[0_0_25px_rgba(236,72,153,0.3)] text-xs font-semibold tracking-wide backdrop-blur-xl mb-4"
      >
        <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
        <span>{currentMood}</span>
        <span className="w-1 h-1 rounded-full bg-pink-400/60" />
        <span className="text-orange-400 flex items-center gap-1 font-bold">
          <Flame className="w-3 h-3 text-orange-400" />
          {teaseRating}
        </span>
      </motion.div>

      {/* Sassy Anime Floating Expression Bubble */}
      <AnimatePresence>
        {isSpeaking && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.85 }}
            className="absolute -top-3 z-30 px-3 py-1 rounded-2xl bg-gradient-to-r from-pink-500/90 to-purple-600/90 text-white text-[11px] font-extrabold shadow-[0_0_20px_rgba(236,72,153,0.6)] flex items-center gap-1.5 border border-white/40"
          >
            <Heart className="w-3 h-3 text-pink-200 fill-pink-200 animate-ping" />
            <span>
              {language === 'hindi' ? 'सुनो ना मेरी जान...' : "Oh honey, listen..."}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Futuristic Anime Stage */}
      <div className="relative flex items-center justify-center w-68 h-68 sm:w-76 sm:h-76">
        {/* Pulsing Outer Rings */}
        {(isSpeaking || (isListening && !isMuted)) && (
          <>
            <motion.div
              className="absolute rounded-full border border-pink-500/50 pointer-events-none"
              animate={{
                width: ['70%', '135%'],
                height: ['70%', '135%'],
                opacity: [0.8, 0],
              }}
              transition={{
                duration: isSpeaking ? 1.4 : 2.2,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
            <motion.div
              className="absolute rounded-full border border-purple-500/40 pointer-events-none"
              animate={{
                width: ['60%', '120%'],
                height: ['60%', '120%'],
                opacity: [0.7, 0],
              }}
              transition={{
                duration: 1.7,
                delay: 0.4,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
          </>
        )}

        {/* Ambient Backing Glow Aura */}
        <div
          className="absolute w-60 h-60 rounded-full blur-3xl transition-all duration-300 pointer-events-none"
          style={{
            background: isSpeaking
              ? `radial-gradient(circle, ${currentTheme.glow}${glowOpacity}) 0%, rgba(168,85,247,0.4) 50%, transparent 75%)`
              : isListening
              ? `radial-gradient(circle, rgba(6,182,212,0.45) 0%, ${currentTheme.glow}0.35) 55%, transparent 80%)`
              : isConnecting
              ? `radial-gradient(circle, rgba(234,179,8,0.45) 0%, ${currentTheme.glow}0.3) 60%, transparent 80%)`
              : `radial-gradient(circle, ${currentTheme.glow}0.2) 0%, rgba(30,27,75,0.2) 60%, transparent 80%)`,
          }}
        />

        {/* Rotating Futuristic Tech HUD Ring */}
        <motion.div
          animate={{ rotate: isDisconnected ? 0 : 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-2 rounded-full border-2 border-dashed border-pink-500/30 pointer-events-none"
        />

        {/* Outer Hex/Glow Frame */}
        <div className="absolute inset-4 rounded-full border border-pink-400/20 pointer-events-none" />

        {/* Center Anime Girl Interactive Hologram */}
        <motion.div
          onClick={onOrbClick}
          animate={{
            scale: scaleMultiplier,
            y: isSpeaking ? [0, -3, 0] : isListening ? [0, 2, 0] : 0,
          }}
          transition={{
            scale: { duration: 0.1 },
            y: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
          }}
          className={`relative z-10 w-52 h-52 sm:w-60 sm:h-60 rounded-full overflow-hidden flex items-center justify-center cursor-pointer transition-all duration-300 p-1.5 shadow-2xl group ${
            isSpeaking
              ? 'ring-4 ring-pink-500/80 shadow-[0_0_60px_rgba(236,72,153,0.8),inset_0_0_30px_rgba(236,72,153,0.4)]'
              : isListening
              ? 'ring-4 ring-cyan-400/80 shadow-[0_0_50px_rgba(6,182,212,0.6),inset_0_0_20px_rgba(6,182,212,0.3)]'
              : isConnecting
              ? 'ring-4 ring-amber-400/80 shadow-[0_0_40px_rgba(234,179,8,0.5)]'
              : 'ring-2 ring-pink-500/30 shadow-[0_0_30px_rgba(236,72,153,0.25)] hover:ring-pink-500/60'
          }`}
          style={{
            background: isSpeaking
              ? 'linear-gradient(135deg, #ec4899 0%, #a855f7 50%, #6366f1 100%)'
              : isListening
              ? 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #ec4899 100%)'
              : 'linear-gradient(135deg, #2e1065 0%, #1e1b4b 60%, #500724 100%)',
          }}
        >
          {/* Anime Character Photo Container */}
          <div className="relative w-full h-full rounded-full overflow-hidden">
            <img
              src={currentAvatarSrc}
              alt="Mahi Anime Assistant"
              className={`w-full h-full object-cover transition-all duration-500 transform ${
                isSpeaking
                  ? 'scale-105 contrast-105 brightness-105'
                  : isListening
                  ? 'scale-100 brightness-100'
                  : 'scale-98 opacity-90 group-hover:scale-102 group-hover:opacity-100'
              }`}
            />

            {/* Futuristic Holographic Overlay Scanline */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-500/10 to-transparent pointer-events-none animate-pulse" />

            {/* Glowing Rim Light */}
            <div className="absolute inset-0 rounded-full border-2 border-white/20 pointer-events-none" />

            {/* Connecting Scanline Animation */}
            {isConnecting && (
              <motion.div
                className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-yellow-300 to-transparent pointer-events-none"
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
            )}

            {/* Interactive Status Overlay on Hover / Active */}
            <div className="absolute inset-x-0 bottom-0 py-2.5 px-2 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-transparent flex flex-col items-center justify-center">
              {isSpeaking ? (
                <div className="flex items-center gap-1.5 text-pink-300 font-extrabold text-[11px] drop-shadow">
                  <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                  <span>{language === 'hindi' ? 'माही बोल रही है' : 'Mahi Speaking'}</span>
                </div>
              ) : isListening ? (
                <div className="flex items-center gap-1.5 text-cyan-300 font-extrabold text-[11px] drop-shadow">
                  <Mic className={`w-3.5 h-3.5 ${!isMuted ? 'animate-pulse' : ''}`} />
                  <span>
                    {isMuted
                      ? (language === 'hindi' ? 'माइक बंद है' : 'Mic Muted')
                      : (language === 'hindi' ? 'सुन रही हूँ...' : 'Listening...')}
                  </span>
                </div>
              ) : isConnecting ? (
                <div className="flex items-center gap-1.5 text-amber-300 font-bold text-[11px]">
                  <div className="w-2.5 h-2.5 rounded-full border-2 border-amber-300 border-t-transparent animate-spin" />
                  <span>{language === 'hindi' ? 'जुड़ रही हूँ...' : 'Connecting...'}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-pink-300 font-bold text-[11px]">
                  <Zap className="w-3 h-3 text-pink-400" />
                  <span>{language === 'hindi' ? 'टैप करके बात करो' : 'Tap to Start'}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
