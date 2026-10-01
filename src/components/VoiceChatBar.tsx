import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, MessageCircle, Mic, Volume2 } from 'lucide-react';
import { Language } from '../types';

interface VoiceChatBarProps {
  language: Language;
  isSpeaking: boolean;
  isLoading: boolean;
  lastSpokenText: string | null;
  onSendMessage: (message: string) => void;
  hasScreenVision: boolean;
}

export const VoiceChatBar: React.FC<VoiceChatBarProps> = ({
  language,
  isSpeaking,
  isLoading,
  lastSpokenText,
  onSendMessage,
  hasScreenVision,
}) => {
  const [inputText, setInputText] = useState('');

  const quickPills = hasScreenVision
    ? [
        { label: '📱 स्क्रीन देखकर बताओ', msg: 'मेरी फोन स्क्रीन को देखो और बताओ कि इस पर क्या चल रहा है और मुझे क्या करना चाहिए?' },
        { label: '👀 ये क्या लिखा है?', msg: 'मेरी स्क्रीन पर जो टेक्स्ट या मैसेज दिख रहा है, उसे पढ़कर समझाओ!' },
        { label: '✨ स्क्रीन पर कुछ खास?', msg: 'मेरी स्क्रीन पर जो दिख रहा है, उस पर कोई मजेदार और सैसी कमेंट्री करो!' },
      ]
    : [
        { label: '💬 अरे माही, कैसी हो?', msg: 'अरे माही, कैसी हो? आज का दिन कैसा चल रहा है?' },
        { label: '🏸 ब्लू बॉक्स ऐनिमे बताओ', msg: 'ब्लू बॉक्स (Ao no Hako) ऐनिमे के बारे में कुछ खास बताओ!' },
        { label: '💖 मजेदार जोक सुनाओ', msg: 'कोई मजेदार बॉलीवुड स्टाइल जोक या शायरी सुनाओ!' },
        { label: '🔥 मुझे रोस्ट करो', msg: 'मुझे प्यार से थोड़ा रोस्ट करो और मजे लो!' },
      ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handlePillClick = (msg: string) => {
    if (isLoading) return;
    onSendMessage(msg);
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col gap-2 mt-2 select-none">
      {/* Live Speech Subtitle Bubble */}
      <AnimatePresence>
        {lastSpokenText && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            className="px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-sky-400/40 text-slate-100 shadow-[0_0_20px_rgba(56,189,248,0.2)] backdrop-blur-md"
          >
            <div className="flex items-center gap-1.5 text-sky-400 text-[10px] font-extrabold uppercase tracking-wider mb-0.5">
              <Volume2 className={`w-3 h-3 ${isSpeaking ? 'animate-bounce text-pink-400' : ''}`} />
              <span>{isSpeaking ? 'माही बोल रही है (लाइव लिप-सिंक)' : 'माही ने कहा:'}</span>
            </div>
            <p className="text-xs font-medium text-slate-200 leading-snug">
              &ldquo;{lastSpokenText}&rdquo;
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Topic Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
        {quickPills.map((pill, idx) => (
          <button
            key={idx}
            onClick={() => handlePillClick(pill.msg)}
            disabled={isLoading}
            className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-900/80 hover:bg-sky-500/20 border border-slate-800 hover:border-sky-400/60 text-[11px] font-bold text-slate-300 hover:text-sky-200 transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Voice / Text Send Bar */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 focus-within:border-sky-400/60 shadow-lg backdrop-blur-md transition-all"
      >
        <div className="pl-2.5 text-slate-500">
          <MessageCircle className="w-4 h-4" />
        </div>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            language === 'hindi'
              ? 'माही से कुछ भी पूछो या बात करो...'
              : 'Ask Mahi anything or talk...'
          }
          disabled={isLoading}
          className="flex-1 bg-transparent border-none text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-0 px-1 py-1"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
            inputText.trim() && !isLoading
              ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-[0_0_15px_rgba(56,189,248,0.4)]'
              : 'bg-slate-800/60 text-slate-500 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
          ) : (
            <>
              <span>बोलो</span>
              <Send className="w-3 h-3" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
