import React from 'react';
import { motion } from 'motion/react';
import { Mic, MicOff, Power, Zap, PhoneOff } from 'lucide-react';
import { SessionState, VibeTheme } from '../types';

interface CentralControlButtonProps {
  state: SessionState;
  isMuted: boolean;
  vibeTheme: VibeTheme;
  onPowerToggle: () => void;
  onMuteToggle: () => void;
  onInterrupt: () => void;
}

export const CentralControlButton: React.FC<CentralControlButtonProps> = ({
  state,
  isMuted,
  onPowerToggle,
  onMuteToggle,
  onInterrupt,
}) => {
  const isDisconnected = state === 'disconnected';
  const isConnecting = state === 'connecting';
  const isSpeaking = state === 'speaking';
  const isListening = state === 'listening';

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-4 select-none">
      {isDisconnected ? (
        /* Large Central Power / Connect Button */
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onPowerToggle}
          className="group relative flex items-center justify-center gap-3 px-8 py-4 sm:px-10 sm:py-5 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white font-extrabold text-base sm:text-lg shadow-[0_0_40px_rgba(236,72,153,0.5)] hover:shadow-[0_0_60px_rgba(236,72,153,0.8)] transition-all cursor-pointer"
        >
          {/* Outer Ripple */}
          <div className="absolute inset-0 rounded-full bg-pink-400/30 animate-ping pointer-events-none" />

          <Power className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-12 transition-transform" />
          <span>Connect Voice</span>
        </motion.button>
      ) : isConnecting ? (
        <div className="flex items-center gap-3 px-8 py-4 rounded-full bg-slate-900/90 border border-yellow-500/40 text-yellow-300 font-bold shadow-xl">
          <div className="w-4 h-4 rounded-full border-2 border-yellow-400 border-t-transparent animate-spin" />
          <span className="text-sm">Connecting to Mahi...</span>
        </div>
      ) : (
        /* Connected Central Control Dock */
        <div className="flex items-center gap-3 p-2 rounded-full bg-slate-950/80 border border-slate-800/80 backdrop-blur-2xl shadow-2xl">
          {/* Mute Button */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={onMuteToggle}
            className={`p-4 rounded-full transition-all cursor-pointer ${
              isMuted
                ? 'bg-rose-500/25 border border-rose-500/50 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800'
            }`}
            title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </motion.button>

          {/* Interrupt Button (Visible/Highlighted when Mahi is Speaking) */}
          {isSpeaking && (
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onInterrupt}
              className="px-5 py-4 rounded-full bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/40 text-purple-200 text-xs font-bold tracking-wider uppercase transition-all cursor-pointer flex items-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.3)]"
            >
              <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              <span>Interrupt</span>
            </motion.button>
          )}

          {/* End Call / Power Off Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onPowerToggle}
            className="flex items-center gap-2 px-6 py-4 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-[0_0_25px_rgba(225,29,72,0.4)] transition-all cursor-pointer"
          >
            <PhoneOff className="w-4 h-4" />
            <span>End Call</span>
          </motion.button>
        </div>
      )}
    </div>
  );
};
