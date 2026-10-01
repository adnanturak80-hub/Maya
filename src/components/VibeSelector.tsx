import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Sliders, Flame, Palette, Volume2, Check, Globe, UserCheck } from 'lucide-react';
import { SassLevel, VoiceName, VibeTheme, Language, AvatarStyle } from '../types';

interface VibeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  sassLevel: SassLevel;
  onSelectSassLevel: (level: SassLevel) => void;
  voiceName: VoiceName;
  onSelectVoiceName: (voice: VoiceName) => void;
  vibeTheme: VibeTheme;
  onSelectVibeTheme: (theme: VibeTheme) => void;
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  avatarStyle: AvatarStyle;
  onSelectAvatarStyle: (style: AvatarStyle) => void;
}

export const VibeSelector: React.FC<VibeSelectorProps> = ({
  isOpen,
  onClose,
  sassLevel,
  onSelectSassLevel,
  voiceName,
  onSelectVoiceName,
  vibeTheme,
  onSelectVibeTheme,
  language,
  onSelectLanguage,
  avatarStyle,
  onSelectAvatarStyle,
}) => {
  if (!isOpen) return null;

  const SASS_OPTIONS: Array<{
    id: SassLevel;
    title: string;
    description: string;
    flames: number;
  }> = [
    {
      id: 'mild',
      title: 'Sweet & Flirty',
      description: 'Gentle teasing, warm compliments, and sweet bestie energy.',
      flames: 1,
    },
    {
      id: 'sassy',
      title: 'Signature Sassy',
      description: 'Quick wit, playful sarcasm, charming banter, and reality checks.',
      flames: 2,
    },
    {
      id: 'unfiltered',
      title: 'Roast Diva',
      description: 'Savage one-liners, dramatic gasps, and unfiltered honesty (100% clean).',
      flames: 3,
    },
  ];

  const VOICE_OPTIONS: Array<{
    id: VoiceName;
    name: string;
    vibe: string;
  }> = [
    { id: 'Kore', name: 'Kore', vibe: 'Warm, sassy, natural female' },
    { id: 'Aoede', name: 'Aoede', vibe: 'Bright, energetic, confident' },
    { id: 'Zephyr', name: 'Zephyr', vibe: 'Crisp, modern, relaxed' },
    { id: 'Puck', name: 'Puck', vibe: 'Spirited & cheeky' },
  ];

  const THEME_OPTIONS: Array<{
    id: VibeTheme;
    name: string;
    color: string;
  }> = [
    { id: 'cyber-pink', name: 'Cyber Pink', color: 'bg-pink-500' },
    { id: 'electric-violet', name: 'Electric Violet', color: 'bg-purple-500' },
    { id: 'neon-cyan', name: 'Neon Cyan', color: 'bg-cyan-500' },
    { id: 'sunset-gold', name: 'Sunset Gold', color: 'bg-amber-500' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="w-full max-w-lg bg-[#0a0c16] border-t sm:border border-slate-800 sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-slate-100 text-base">
                Mahi Vibe Settings
              </h3>
              <p className="text-xs text-pink-400/80">Customize persona attitude & tone</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-6">
          {/* Spoken Language */}
          <div>
            <label className="text-xs font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1.5 mb-2.5">
              <Globe className="w-3.5 h-3.5 text-pink-400" />
              Spoken Language (बातचीत की भाषा)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onSelectLanguage('hindi')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  language === 'hindi'
                    ? 'bg-pink-500/20 border-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.25)]'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs flex items-center gap-1">
                    <span>🇮🇳</span> हिंदी / Hinglish
                  </span>
                  {language === 'hindi' && <Check className="w-3.5 h-3.5 text-pink-400" />}
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Desi Bollywood & Gen-Z Sassy Hindi
                </p>
              </button>

              <button
                onClick={() => onSelectLanguage('english')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  language === 'english'
                    ? 'bg-pink-500/20 border-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.25)]'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs flex items-center gap-1">
                    <span>🇬🇧</span> English
                  </span>
                  {language === 'english' && <Check className="w-3.5 h-3.5 text-pink-400" />}
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Casual witty English banter
                </p>
              </button>
            </div>
          </div>

          {/* Avatar Visual Style */}
          <div>
            <label className="text-xs font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1.5 mb-2.5">
              <UserCheck className="w-3.5 h-3.5 text-pink-400" />
              Avatar Visual Style (चेहरे का स्टाइल)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() => onSelectAvatarStyle('bluebox')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  avatarStyle === 'bluebox'
                    ? 'bg-sky-500/20 border-sky-400 text-white shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs flex items-center gap-1">
                    <span>🏸</span> Blue Box Anime
                  </span>
                  {avatarStyle === 'bluebox' && <Check className="w-3.5 h-3.5 text-sky-400" />}
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Ao no Hako Chinatsu aesthetic with lip-sync
                </p>
              </button>

              <button
                onClick={() => onSelectAvatarStyle('realistic')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  avatarStyle === 'realistic'
                    ? 'bg-pink-500/20 border-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.25)]'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs flex items-center gap-1">
                    <span>✨</span> Realistic AI Girl
                  </span>
                  {avatarStyle === 'realistic' && <Check className="w-3.5 h-3.5 text-pink-400" />}
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  8K Cinematic Indian girl lip-sync
                </p>
              </button>

              <button
                onClick={() => onSelectAvatarStyle('anime')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  avatarStyle === 'anime'
                    ? 'bg-pink-500/20 border-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.25)]'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs flex items-center gap-1">
                    <span>🎀</span> Cyberpunk Anime
                  </span>
                  {avatarStyle === 'anime' && <Check className="w-3.5 h-3.5 text-pink-400" />}
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Futuristic neon anime style
                </p>
              </button>
            </div>
          </div>

          {/* Sass Level */}
          <div>
            <label className="text-xs font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1.5 mb-2.5">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              Sass & Tease Intensity
            </label>
            <div className="space-y-2">
              {SASS_OPTIONS.map((opt) => {
                const isSelected = sassLevel === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => onSelectSassLevel(opt.id)}
                    className={`w-full p-3 rounded-2xl border text-left flex items-start justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-pink-500/15 border-pink-500/60 shadow-[0_0_15px_rgba(236,72,153,0.15)] text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-sm mb-0.5">{opt.title}</div>
                      <div className="text-xs text-slate-400">{opt.description}</div>
                    </div>
                    <div className="flex items-center gap-0.5 pt-1 shrink-0">
                      {Array.from({ length: opt.flames }).map((_, i) => (
                        <Flame
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            isSelected ? 'text-orange-400 fill-orange-400' : 'text-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Voice Tone */}
          <div>
            <label className="text-xs font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1.5 mb-2.5">
              <Volume2 className="w-3.5 h-3.5 text-pink-400" />
              Gemini Voice Engine
            </label>
            <div className="grid grid-cols-2 gap-2">
              {VOICE_OPTIONS.map((v) => {
                const isSelected = voiceName === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => onSelectVoiceName(v.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs">{v.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-pink-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">{v.vibe}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Futuristic Theme Glow */}
          <div>
            <label className="text-xs font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1.5 mb-2.5">
              <Palette className="w-3.5 h-3.5 text-cyan-400" />
              Futuristic Aura Glow
            </label>
            <div className="grid grid-cols-2 gap-2">
              {THEME_OPTIONS.map((t) => {
                const isSelected = vibeTheme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => onSelectVibeTheme(t.id)}
                    className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-pink-500 bg-pink-500/10 text-white'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded-full ${t.color}`} />
                    <span className="text-xs font-medium">{t.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-sm shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:opacity-90 transition-opacity cursor-pointer"
          >
            Apply Vibe
          </button>
        </div>
      </motion.div>
    </div>
  );
};
