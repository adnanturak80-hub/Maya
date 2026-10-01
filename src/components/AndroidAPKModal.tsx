import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Smartphone,
  Download,
  CheckCircle2,
  ExternalLink,
  X,
  Share2,
  Copy,
  Sparkles,
  Shield,
  Layers,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Language } from '../types';

interface AndroidAPKModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const AndroidAPKModal: React.FC<AndroidAPKModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentAppUrl = window.location.href.split('?')[0];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentAppUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      // Guide user to use browser's menu
      handleCopyLink();
    }
  };

  const pwaBuilderUrl = `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(
    currentAppUrl
  )}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-slate-900 border border-sky-400/40 rounded-3xl p-6 shadow-[0_0_50px_rgba(56,189,248,0.25)] text-slate-100 overflow-hidden"
        >
          {/* Neon Top Edge Accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-blue-500 to-pink-500" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/30">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg text-white">
                  {language === 'hindi' ? 'Android APK / ऐप इंस्टॉल करें' : 'Install Android APK / App'}
                </h3>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {language === 'hindi'
                  ? 'अपने फ़ोन में नेटिव ऐप की तरह चलाएं'
                  : 'Run as a native app on your phone'}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          {isInstalled ? (
            <div className="mb-4 px-3.5 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold">
                {language === 'hindi'
                  ? 'यह ऐप आपके डिवाइस पर पहले से इंस्टॉल है!'
                  : 'This app is already installed on your device!'}
              </span>
            </div>
          ) : null}

          {/* PRIMARY METHOD: Direct One-Tap Install */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-300">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>{language === 'hindi' ? 'विधि 1: 1-टैप डायरेक्ट इंस्टॉल (WebAPK)' : 'Method 1: Direct 1-Tap Install'}</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Fastest
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-3 leading-relaxed">
              {language === 'hindi'
                ? 'गूगल क्रोम इसे सीधे आपके एंड्रॉयड फ़ोन पर असली ऐप आइकन के साथ इंस्टॉल कर देगा।'
                : 'Chrome installs this directly on your Android phone with a home screen app icon.'}
            </p>

            <button
              onClick={handleInstallClick}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>
                {isInstallable
                  ? (language === 'hindi' ? 'अभी फ़ोन में इंस्टॉल करें' : 'Install to Phone Now')
                  : (language === 'hindi' ? 'लिंक कॉपी करें और क्रोम में खोलें' : 'Copy Link & Open in Chrome')}
              </span>
            </button>
          </div>

          {/* MANUAL STEPS FOR ANDROID & CHROME */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 mb-4 text-xs text-slate-300">
            <div className="font-bold text-slate-200 mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-pink-400" />
              <span>{language === 'hindi' ? 'क्रोम ब्राउज़र से सीधे इंस्टॉल करने के 3 आसान स्टेप्स:' : 'Easy 3 Steps to Install:'}</span>
            </div>
            <ol className="space-y-1.5 list-decimal list-inside text-slate-300">
              <li>
                {language === 'hindi'
                  ? 'ऊपर दाईं तरफ दिए गए 3 डॉट्स (⋮) मेन्यू पर टैप करें।'
                  : 'Tap the 3 dots (⋮) menu in the top right of Chrome.'}
              </li>
              <li>
                {language === 'hindi'
                  ? '"Add to Home screen" या "Install app" (ऐप इंस्टॉल करें) चुनें।'
                  : 'Select "Add to Home screen" or "Install app".'}
              </li>
              <li>
                {language === 'hindi'
                  ? 'माही का ऐप आपके फ़ोन की होम स्क्रीन पर आ जाएगा!'
                  : 'Mahi will appear on your phone home screen as an app!'}
              </li>
            </ol>
          </div>

          {/* METHOD 2: Official APK Generator (PWABuilder / TWA) */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-950/40 to-slate-950 border border-purple-500/30 mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                <span>{language === 'hindi' ? 'विधि 2: स्टैंडअलोन .APK फ़ाइल डाउनलोड करें' : 'Method 2: Standalone .APK File'}</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
              {language === 'hindi'
                ? 'माइक्रोसॉफ्ट और गूगल के आधिकारिक PWABuilder टूल से आप 1-क्लिक में हस्ताक्षरित (Signed) .APK और .AAB डाउनलोड कर सकते हैं।'
                : 'Generate a standalone signed .apk file using official PWABuilder.'}
            </p>
            <a
              href={pwaBuilderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-sky-300 underline"
            >
              <span>{language === 'hindi' ? 'PWABuilder पर .APK तैयार करें' : 'Build .APK on PWABuilder'}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Copy URL Bar */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800">
            <input
              type="text"
              readOnly
              value={currentAppUrl}
              className="flex-1 bg-transparent border-none text-[11px] text-slate-400 px-1 focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1 transition-all cursor-pointer"
            >
              {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
