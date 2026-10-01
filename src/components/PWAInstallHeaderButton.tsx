import React from 'react';
import { Smartphone, Download } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Language } from '../types';

interface PWAInstallHeaderButtonProps {
  onOpenModal: () => void;
  language: Language;
}

export const PWAInstallHeaderButton: React.FC<PWAInstallHeaderButtonProps> = ({
  onOpenModal,
  language,
}) => {
  const { isInstalled } = usePWAInstall();

  // If already installed and running standalone, still allow opening APK modal if user taps
  return (
    <button
      onClick={onOpenModal}
      className="px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-sky-500/20 hover:from-emerald-500/30 hover:to-sky-500/30 border border-emerald-400/50 text-emerald-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.25)]"
      title="Install Android App / Download APK"
    >
      <Smartphone className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
      <span>{language === 'hindi' ? 'APK इंस्टॉल' : 'Get APK'}</span>
    </button>
  );
};
