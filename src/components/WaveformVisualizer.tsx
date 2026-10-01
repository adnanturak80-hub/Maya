import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { SessionState, VibeTheme } from '../types';

interface WaveformVisualizerProps {
  state: SessionState;
  audioLevel: number;
  isMuted: boolean;
  vibeTheme: VibeTheme;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  state,
  audioLevel,
  isMuted,
  vibeTheme,
}) => {
  const barsCount = 28;
  const isSpeaking = state === 'speaking';
  const isListening = state === 'listening' && !isMuted;
  const isActive = isSpeaking || isListening;

  const [tick, setTick] = useState(0);

  useEffect(() => {
    let animId: number;
    const loop = () => {
      setTick((t) => (t + 1) % 1000);
      animId = requestAnimationFrame(loop);
    };
    if (isActive) {
      animId = requestAnimationFrame(loop);
    }
    return () => cancelAnimationFrame(animId);
  }, [isActive]);

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-1.5 h-14 px-6 py-2 rounded-2xl bg-slate-950/60 border border-slate-800/80 backdrop-blur-xl shadow-inner max-w-sm w-full mx-auto">
      {Array.from({ length: barsCount }).map((_, i) => {
        // Curve shape towards middle
        const distFromCenter = Math.abs(i - barsCount / 2) / (barsCount / 2);
        const weight = 1 - distFromCenter * 0.55;

        const base = isActive ? Math.max(5, (audioLevel * 50 + 4) * weight) : 4;
        const wave = isActive ? Math.sin((i * 0.4) + (tick * 0.15)) * 6 : 0;
        const finalH = Math.min(48, Math.max(4, base + wave));

        return (
          <motion.div
            key={i}
            animate={{
              height: `${finalH}px`,
            }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 28,
            }}
            className={`w-1 rounded-full transition-colors duration-200 ${
              isSpeaking
                ? 'bg-gradient-to-t from-purple-500 via-pink-500 to-rose-400 shadow-[0_0_8px_rgba(236,72,153,0.6)]'
                : isListening
                ? 'bg-gradient-to-t from-teal-500 via-cyan-400 to-blue-400 shadow-[0_0_8px_rgba(6,182,212,0.5)]'
                : 'bg-slate-800/60'
            }`}
          />
        );
      })}
    </div>
  );
};
