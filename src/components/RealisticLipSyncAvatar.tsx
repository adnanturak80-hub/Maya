import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Mic, Volume2, Flame, Zap, Heart } from 'lucide-react';
import { SessionState, VibeTheme, Language, AvatarStyle } from '../types';

import blueBoxClosed from '../assets/images/blue_box_anime_closed_1790855812473.jpg';
import blueBoxOpen from '../assets/images/blue_box_anime_open_1790855834167.jpg';
import mahiRealisticClosed from '../assets/images/mahi_realistic_closed_1790855052282.jpg';
import mahiRealisticOpen from '../assets/images/mahi_realistic_open_1790855072559.jpg';
import mahiAnimeAvatar from '../assets/images/mahi_anime_avatar_1790854883443.jpg';
import mahiAnimeOpen from '../assets/images/mahi_anime_open_1790855418191.jpg';
import mahiSpeakingAvatar from '../assets/images/mahi_speaking_avatar_1790854899995.jpg';

interface RealisticLipSyncAvatarProps {
  state: SessionState;
  audioLevel: number;
  isMuted: boolean;
  vibeTheme: VibeTheme;
  language: Language;
  avatarStyle: AvatarStyle;
  currentMood: string;
  teaseRating: string;
  onAvatarClick: () => void;
}

export const RealisticLipSyncAvatar: React.FC<RealisticLipSyncAvatarProps> = ({
  state,
  audioLevel,
  isMuted,
  vibeTheme,
  language,
  avatarStyle,
  currentMood,
  teaseRating,
  onAvatarClick,
}) => {
  const isDisconnected = state === 'disconnected';
  const isConnecting = state === 'connecting';
  const isListening = state === 'listening';
  const isSpeaking = state === 'speaking';

  // Real-time smoothed lip sync calculation
  const [smoothedLevel, setSmoothedLevel] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);
  const blinkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Smooth out audio level with phoneme articulation
  useEffect(() => {
    let animId: number;
    const updateLipSync = () => {
      if (isSpeaking) {
        setSmoothedLevel((prev) => {
          // Responsive attack, gentle decay
          const target = Math.min(1, Math.max(0, audioLevel * 2.8));
          const step = target > prev ? 0.35 : 0.18;
          return prev + (target - prev) * step;
        });
      } else {
        setSmoothedLevel((prev) => Math.max(0, prev * 0.7));
      }
      animId = requestAnimationFrame(updateLipSync);
    };

    animId = requestAnimationFrame(updateLipSync);
    return () => cancelAnimationFrame(animId);
  }, [isSpeaking, audioLevel]);

  // Natural human blinking simulation (every 3.5 - 5.5 seconds)
  useEffect(() => {
    const triggerBlink = () => {
      setIsBlinking(true);
      setTimeout(() => {
        setIsBlinking(false);
        const nextBlinkDelay = 3500 + Math.random() * 2500;
        blinkTimeoutRef.current = setTimeout(triggerBlink, nextBlinkDelay);
      }, 120);
    };

    blinkTimeoutRef.current = setTimeout(triggerBlink, 3000);

    return () => {
      if (blinkTimeoutRef.current) clearTimeout(blinkTimeoutRef.current);
    };
  }, []);

  // Theme palettes
  const themeGradients: Record<VibeTheme, { glow: string; border: string }> = {
    'cyber-pink': {
      glow: 'rgba(236,72,153,',
      border: 'border-pink-500',
    },
    'electric-violet': {
      glow: 'rgba(139,92,246,',
      border: 'border-purple-500',
    },
    'neon-cyan': {
      glow: 'rgba(6,182,212,',
      border: 'border-cyan-400',
    },
    'sunset-gold': {
      glow: 'rgba(245,158,11,',
      border: 'border-amber-400',
    },
  };

  const currentTheme = themeGradients[vibeTheme] || themeGradients['cyber-pink'];
  const glowIntensity = Math.min(0.95, 0.45 + audioLevel * 1.5);
  const scaleMultiplier = Math.min(1.15, 1 + audioLevel * 0.35);

  // Dynamic Lip-Sync Openness (0.0 to 1.0)
  const mouthOpenness = isSpeaking
    ? Math.min(1, Math.max(0, (smoothedLevel - 0.05) * 1.4))
    : 0;

  // Mouth vertical stretch for phoneme articulation
  const mouthScaleY = 1 + mouthOpenness * 0.04;

  return (
    <div className="relative flex flex-col items-center justify-center select-none w-full max-w-sm mx-auto">
      {/* Mood Badge Pill with Anime/Realistic Accent */}
      <motion.div
        key={currentMood}
        initial={{ opacity: 0, y: -8, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-pink-500/40 text-pink-300 shadow-[0_0_25px_rgba(236,72,153,0.3)] text-xs font-semibold tracking-wide backdrop-blur-xl mb-4"
      >
        <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
        <span>{currentMood}</span>
        <span className="w-1 h-1 rounded-full bg-pink-400/60" />
        <span className="text-orange-400 flex items-center gap-1 font-bold">
          <Flame className="w-3 h-3 text-orange-400" />
          {teaseRating}
        </span>
      </motion.div>

      {/* Sassy Realistic Speech Bubble */}
      <AnimatePresence>
        {isSpeaking && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.85 }}
            className="absolute -top-3 z-30 px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-pink-500/90 to-purple-600/90 text-white text-[11px] font-extrabold shadow-[0_0_25px_rgba(236,72,153,0.6)] flex items-center gap-1.5 border border-white/40 backdrop-blur-md"
          >
            <Heart className="w-3 h-3 text-pink-200 fill-pink-200 animate-ping" />
            <span>
              {language === 'hindi' ? 'सुनो ना मेरी जान...' : 'Listen up, honey...'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Avatar Stage Container */}
      <div className="relative flex items-center justify-center w-72 h-72 sm:w-80 sm:h-80">
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
                duration: isSpeaking ? 1.3 : 2.2,
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
                duration: 1.6,
                delay: 0.35,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
          </>
        )}

        {/* Ambient Backing Glow Aura */}
        <div
          className="absolute w-64 h-64 rounded-full blur-3xl transition-all duration-300 pointer-events-none"
          style={{
            background: isSpeaking
              ? `radial-gradient(circle, ${currentTheme.glow}${glowIntensity}) 0%, rgba(168,85,247,0.45) 50%, transparent 75%)`
              : isListening
              ? `radial-gradient(circle, rgba(6,182,212,0.45) 0%, ${currentTheme.glow}0.35) 55%, transparent 80%)`
              : isConnecting
              ? `radial-gradient(circle, rgba(234,179,8,0.45) 0%, ${currentTheme.glow}0.3) 60%, transparent 80%)`
              : `radial-gradient(circle, ${currentTheme.glow}0.2) 0%, rgba(30,27,75,0.2) 60%, transparent 80%)`,
          }}
        />

        {/* Tech Ring Overlay */}
        <motion.div
          animate={{ rotate: isDisconnected ? 0 : 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-2 rounded-full border-2 border-dashed border-pink-500/25 pointer-events-none"
        />

        {/* Main Avatar Frame */}
        <motion.div
          onClick={onAvatarClick}
          animate={{
            scale: scaleMultiplier,
            y: isSpeaking ? [0, -2, 0] : isListening ? [0, 1.5, 0] : 0,
          }}
          transition={{
            scale: { duration: 0.1 },
            y: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' },
          }}
          className={`relative z-10 w-56 h-56 sm:w-64 sm:h-64 rounded-full overflow-hidden flex items-center justify-center cursor-pointer transition-all duration-300 p-1.5 shadow-2xl group ${
            isSpeaking
              ? 'ring-4 ring-pink-500 shadow-[0_0_60px_rgba(236,72,153,0.85),inset_0_0_30px_rgba(236,72,153,0.4)]'
              : isListening
              ? 'ring-4 ring-cyan-400 shadow-[0_0_50px_rgba(6,182,212,0.65),inset_0_0_20px_rgba(6,182,212,0.3)]'
              : isConnecting
              ? 'ring-4 ring-amber-400 shadow-[0_0_40px_rgba(234,179,8,0.5)]'
              : 'ring-2 ring-pink-500/40 shadow-[0_0_30px_rgba(236,72,153,0.3)] hover:ring-pink-500/70'
          }`}
          style={{
            background: isSpeaking
              ? 'linear-gradient(135deg, #ec4899 0%, #a855f7 50%, #6366f1 100%)'
              : isListening
              ? 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #ec4899 100%)'
              : 'linear-gradient(135deg, #2e1065 0%, #1e1b4b 60%, #500724 100%)',
          }}
        >
          {/* Avatar Photo Frame Container */}
          <div className="relative w-full h-full rounded-full overflow-hidden bg-slate-950">
            {avatarStyle === 'bluebox' ? (
              /* BLUE BOX (AO NO HAKO) ANIME LIP-SYNC ENGINE */
              <div
                className="relative w-full h-full"
                style={{
                  transform: `scaleY(${mouthScaleY})`,
                  transformOrigin: '50% 68%',
                  transition: 'transform 0.05s ease-out',
                }}
              >
                {/* Base Layer: Closed mouth sweet smile Blue Box anime portrait */}
                <img
                  src={blueBoxClosed}
                  alt="Blue Box Anime Idle"
                  className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                />

                {/* Top Layer: Open mouth Blue Box anime speaking portrait with real-time audio-synced opacity */}
                <img
                  src={blueBoxOpen}
                  alt="Blue Box Anime Speaking Lip Sync"
                  className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                  style={{
                    opacity: mouthOpenness,
                    transition: 'opacity 0.06s linear',
                  }}
                />

                {/* Anime Eyelid Blink Simulation */}
                {isBlinking && (
                  <div className="absolute inset-0 bg-slate-950/35 pointer-events-none backdrop-blur-[1px] transition-opacity duration-75" />
                )}
              </div>
            ) : avatarStyle === 'realistic' ? (
              /* REALISTIC LIP-SYNC DUAL-LAYER ENGINE */
              <div
                className="relative w-full h-full"
                style={{
                  transform: `scaleY(${mouthScaleY})`,
                  transformOrigin: '50% 70%',
                  transition: 'transform 0.05s ease-out',
                }}
              >
                {/* Base Layer: Closed mouth realistic portrait */}
                <img
                  src={mahiRealisticClosed}
                  alt="Mahi Realistic Closed Mouth"
                  className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                />

                {/* Top Layer: Open mouth speaking portrait with real-time audio-synced opacity */}
                <img
                  src={mahiRealisticOpen}
                  alt="Mahi Realistic Speaking Lip Sync"
                  className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                  style={{
                    opacity: mouthOpenness,
                    transition: 'opacity 0.06s linear',
                  }}
                />

                {/* Natural Eyelid Blink Simulation */}
                {isBlinking && (
                  <div className="absolute inset-0 bg-black/40 pointer-events-none backdrop-blur-[1px] transition-opacity duration-75" />
                )}
              </div>
            ) : (
              /* ANIME STYLE LIP-SYNC ENGINE */
              <div
                className="relative w-full h-full"
                style={{
                  transform: `scaleY(${mouthScaleY})`,
                  transformOrigin: '50% 68%',
                  transition: 'transform 0.05s ease-out',
                }}
              >
                {/* Base Layer: Closed mouth winking anime portrait */}
                <img
                  src={mahiAnimeAvatar}
                  alt="Mahi Anime Idle"
                  className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                />

                {/* Top Layer: Open mouth anime speaking portrait with real-time audio-synced opacity */}
                <img
                  src={mahiAnimeOpen}
                  alt="Mahi Anime Speaking Lip Sync"
                  className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                  style={{
                    opacity: mouthOpenness,
                    transition: 'opacity 0.06s linear',
                  }}
                />

                {/* Anime Eyelid Blink Simulation */}
                {isBlinking && (
                  <div className="absolute inset-0 bg-pink-950/30 pointer-events-none backdrop-blur-[1px] transition-opacity duration-75" />
                )}
              </div>
            )}

            {/* Glowing Cyber Rim Light */}
            <div className="absolute inset-0 rounded-full border border-white/20 pointer-events-none" />

            {/* Connecting Scanline Animation */}
            {isConnecting && (
              <motion.div
                className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-yellow-300 to-transparent pointer-events-none"
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
              />
            )}

            {/* Realistic Audio-Synchronized LipSync Indicator Bar */}
            {isSpeaking && (
              <div className="absolute top-3 inset-x-12 flex items-center justify-center gap-1 py-1 px-2.5 rounded-full bg-black/55 backdrop-blur-md border border-pink-500/40 pointer-events-none">
                <div
                  className="h-1 rounded-full bg-pink-400 shadow-[0_0_8px_rgba(236,72,153,0.8)] transition-all duration-75"
                  style={{ width: `${Math.max(15, mouthOpenness * 100)}%` }}
                />
                <span className="text-[9px] font-black uppercase tracking-wider text-pink-300">
                  Lip-Sync Live
                </span>
              </div>
            )}

            {/* Interactive Status Overlay at bottom */}
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
                      ? (language === 'hindi' ? 'माइक म्यूट है' : 'Mic Muted')
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
