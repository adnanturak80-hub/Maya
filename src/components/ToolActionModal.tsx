import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, X, Sparkles, ExternalLink, CheckCircle2, Clock, Palette } from 'lucide-react';
import { ToolCallData } from '../types';

interface ToolActionModalProps {
  toolCall: ToolCallData | null;
  onClose: () => void;
}

export const ToolActionModal: React.FC<ToolActionModalProps> = ({ toolCall, onClose }) => {
  if (!toolCall) return null;

  const isWebsite = toolCall.name === 'openWebsite';
  const isMood = toolCall.name === 'changeMood';
  const isTime = toolCall.name === 'getDeviceTime';
  const isTheme = toolCall.name === 'setVibeTheme';

  return (
    <AnimatePresence>
      <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          className="pointer-events-auto w-full max-w-md bg-slate-900/95 border border-pink-500/40 rounded-3xl p-4 shadow-[0_0_40px_rgba(236,72,153,0.35)] backdrop-blur-2xl text-slate-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30">
                {isWebsite ? (
                  <Globe className="w-4 h-4" />
                ) : isMood ? (
                  <Sparkles className="w-4 h-4" />
                ) : isTime ? (
                  <Clock className="w-4 h-4" />
                ) : (
                  <Palette className="w-4 h-4" />
                )}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400 block">
                  Mahi Action Executed
                </span>
                <h4 className="font-display font-bold text-sm text-white capitalize">
                  {toolCall.name}
                </h4>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action Details Body */}
          <div className="pt-3">
            {isWebsite && (
              <div className="space-y-2">
                <p className="text-xs text-slate-300">
                  Mahi opened this website for you:
                </p>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                  <div className="truncate mr-2">
                    <span className="text-xs font-semibold text-pink-300 block truncate">
                      {toolCall.args.title || 'Web Link'}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate block">
                      {toolCall.args.url}
                    </span>
                  </div>
                  <a
                    href={toolCall.args.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/40 shrink-0 flex items-center gap-1 text-xs font-medium"
                  >
                    <span>Visit</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}

            {isMood && (
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-xs text-pink-200">
                <CheckCircle2 className="w-4 h-4 text-pink-400 shrink-0" />
                <span>
                  Mood aura updated to <strong>{toolCall.args.mood}</strong> ({toolCall.args.teaseRating || 'High'} Tease)!
                </span>
              </div>
            )}

            {isTime && (
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-200">
                <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Synchronized device local time for Mahi.</span>
              </div>
            )}

            {isTheme && (
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200">
                <Palette className="w-4 h-4 text-purple-400 shrink-0" />
                <span>
                  Ambient vibe updated to <strong>{toolCall.args.theme}</strong>!
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
