import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sliders,
  Sparkles,
  Flame,
  Radio,
  AlertCircle,
  Globe,
  Sparkle,
  Eye,
  Video as VideoIcon,
} from 'lucide-react';
import { LiveSession } from './services/LiveSession';
import { ScreenVisionStreamer, VisionMode } from './services/ScreenVisionStreamer';
import { RealisticLipSyncAvatar } from './components/RealisticLipSyncAvatar';
import { VisionControlBar } from './components/VisionControlBar';
import { VoiceChatBar } from './components/VoiceChatBar';
import { VideoCallView } from './components/VideoCallView';
import { WaveformVisualizer } from './components/WaveformVisualizer';
import { CentralControlButton } from './components/CentralControlButton';
import { ToolActionModal } from './components/ToolActionModal';
import { VibeSelector } from './components/VibeSelector';
import { AndroidAPKModal } from './components/AndroidAPKModal';
import { PWAInstallHeaderButton } from './components/PWAInstallHeaderButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  SessionState,
  SassLevel,
  VoiceName,
  VibeTheme,
  Language,
  AvatarStyle,
  ToolCallData,
} from './types';

import blueBoxClosed from './assets/images/blue_box_anime_closed_1790855812473.jpg';
import mahiRealisticClosed from './assets/images/mahi_realistic_closed_1790855052282.jpg';
import mahiAnimeAvatar from './assets/images/mahi_anime_avatar_1790854883443.jpg';

export default function App() {
  const [sessionState, setSessionState] = useState<SessionState>('disconnected');
  const [isMuted, setIsMuted] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  // Persona & Vibe Customization
  const [sassLevel, setSassLevel] = useState<SassLevel>('sassy');
  const [voiceName, setVoiceName] = useState<VoiceName>('Kore');
  const [vibeTheme, setVibeTheme] = useState<VibeTheme>('cyber-pink');
  const [language, setLanguage] = useState<Language>('hindi');
  // Default to Blue Box anime girl aesthetic
  const [avatarStyle, setAvatarStyle] = useState<AvatarStyle>('bluebox');
  const [currentMood, setCurrentMood] = useState<string>('Blue Box Bestie');
  const [teaseRating, setTeaseRating] = useState<string>('High');

  // Real-time Phone Screen / Camera Vision
  const [visionMode, setVisionMode] = useState<VisionMode>('off');
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);

  // Spoken text & chat state
  const [lastSpokenText, setLastSpokenText] = useState<string | null>(
    'अरे सुनो ना! मैं माही हूँ — तुम्हारी ब्लू बॉक्स ऐनिमे बेस्टी! कहो, आज क्या नया ड्रामा चल रहा है तेरी लाइफ में?'
  );
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Tool Call Active Modal
  const [activeToolCall, setActiveToolCall] = useState<ToolCallData | null>(null);

  // Settings Sheet & APK Modal
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAPKModalOpen, setIsAPKModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // References
  const liveSessionRef = useRef<LiveSession | null>(null);
  const visionStreamerRef = useRef<ScreenVisionStreamer | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Initialize ScreenVisionStreamer
  useEffect(() => {
    visionStreamerRef.current = new ScreenVisionStreamer(
      (base64Frame) => {
        if (liveSessionRef.current) {
          liveSessionRef.current.sendVideoFrame(base64Frame);
        }
      },
      (mode) => {
        setVisionMode(mode);
        setVideoStream(visionStreamerRef.current?.getMediaStream() || null);
      }
    );

    return () => {
      visionStreamerRef.current?.stop();
    };
  }, []);

  // Initialize LiveSession
  useEffect(() => {
    const session = new LiveSession(sassLevel, voiceName, language, {
      onStateChange: (newState) => {
        setSessionState(newState);
        if (newState === 'listening') {
          setErrorMessage(null);
        }
      },
      onToolCall: (call) => {
        setActiveToolCall(call);

        // Apply visual updates from tool calls if applicable
        if (call.name === 'changeMood') {
          if (call.args?.mood) setCurrentMood(call.args.mood);
          if (call.args?.teaseRating) setTeaseRating(call.args.teaseRating);
        } else if (call.name === 'setVibeTheme') {
          if (call.args?.theme) {
            const validThemes: VibeTheme[] = [
              'cyber-pink',
              'electric-violet',
              'neon-cyan',
              'sunset-gold',
            ];
            if (validThemes.includes(call.args.theme as VibeTheme)) {
              setVibeTheme(call.args.theme as VibeTheme);
            }
          }
        }
      },
      onError: (err) => {
        setErrorMessage(err);
      },
      onMuteChange: (muted) => {
        setIsMuted(muted);
      },
    });

    liveSessionRef.current = session;

    return () => {
      session.disconnect();
    };
  }, []);

  // Update session configuration on settings change
  useEffect(() => {
    if (liveSessionRef.current) {
      liveSessionRef.current.updateConfig(sassLevel, voiceName, language);
    }
  }, [sassLevel, voiceName, language]);

  // Audio level monitoring loop for reactive visual animations & lip-sync
  useEffect(() => {
    const updateLevel = () => {
      if (liveSessionRef.current) {
        const lvl = liveSessionRef.current.getAudioLevel();
        setAudioLevel(lvl);
      }
      animFrameRef.current = requestAnimationFrame(updateLevel);
    };

    animFrameRef.current = requestAnimationFrame(updateLevel);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // Connect or disconnect toggle
  const handlePowerToggle = async () => {
    if (!liveSessionRef.current) return;

    if (sessionState === 'disconnected') {
      setErrorMessage(null);
      await liveSessionRef.current.connect();
      // Greet user with speech and live lip sync
      setTimeout(() => {
        handleSendMessage('Hello Mahi! Greet me warmly and ask me what is up!');
      }, 300);
    } else {
      if (visionStreamerRef.current) {
        visionStreamerRef.current.stop();
      }
      setVisionMode('off');
      setVideoStream(null);
      liveSessionRef.current.disconnect();
    }
  };

  const handleSendMessage = async (msg: string) => {
    setIsChatLoading(true);
    setErrorMessage(null);
    try {
      const screenFrame = visionStreamerRef.current?.getLatestFrameBase64() || undefined;
      if (liveSessionRef.current) {
        const result = await liveSessionRef.current.speakMessage(msg, screenFrame);
        if (result.text) {
          setLastSpokenText(result.text);
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Could not speak with Mahi.');
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleMuteToggle = () => {
    if (liveSessionRef.current) {
      liveSessionRef.current.toggleMute();
    }
  };

  const handleInterrupt = () => {
    if (liveSessionRef.current) {
      liveSessionRef.current.interrupt();
    }
  };

  const handleOrbClick = () => {
    if (sessionState === 'disconnected') {
      handlePowerToggle();
    } else if (sessionState === 'speaking') {
      handleInterrupt();
    }
  };

  const toggleLanguage = () => {
    const nextLang = language === 'hindi' ? 'english' : 'hindi';
    setLanguage(nextLang);
    if (nextLang === 'hindi') {
      setCurrentMood('Blue Box Bestie');
    } else {
      setCurrentMood('Ready to Chat');
    }
  };

  const cycleAvatarStyle = () => {
    setAvatarStyle((prev) => {
      if (prev === 'bluebox') return 'realistic';
      if (prev === 'realistic') return 'anime';
      return 'bluebox';
    });
  };

  // Vision handlers
  const handleStartScreenVision = async () => {
    if (sessionState === 'disconnected') {
      await handlePowerToggle();
    }
    try {
      if (visionStreamerRef.current) {
        await visionStreamerRef.current.startScreenVision();
        setVideoStream(visionStreamerRef.current.getMediaStream());
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Could not access screen or camera.');
    }
  };

  const handleStartCameraVision = async () => {
    if (sessionState === 'disconnected') {
      await handlePowerToggle();
    }
    try {
      if (visionStreamerRef.current) {
        await visionStreamerRef.current.startCameraVision();
        setVideoStream(visionStreamerRef.current.getMediaStream());
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Could not access camera.');
    }
  };

  const handleStopVision = () => {
    if (visionStreamerRef.current) {
      visionStreamerRef.current.stop();
    }
    setVisionMode('off');
    setVideoStream(null);
  };

  // Video Call Action Handlers
  const handleStartVideoCall = async () => {
    setIsVideoCallActive(true);
    setErrorMessage(null);

    // If call session not active, start session
    if (sessionState === 'disconnected' && liveSessionRef.current) {
      await liveSessionRef.current.connect();
    }

    // Start user front camera
    try {
      if (visionStreamerRef.current) {
        await visionStreamerRef.current.startCameraVision('user');
        setVideoStream(visionStreamerRef.current.getMediaStream());
      }
    } catch (e: any) {
      console.warn('Camera failed, video call continues:', e);
    }

    // Greet user on video call
    setTimeout(() => {
      handleSendMessage('Hey Mahi! We are now on a live FaceTime Video Call! Greet me looking right at me in Hindi!');
    }, 400);
  };

  const handleEndVideoCall = () => {
    setIsVideoCallActive(false);
    if (visionStreamerRef.current) {
      visionStreamerRef.current.stop();
    }
    setVisionMode('off');
    setVideoStream(null);
  };

  const handleFlipCamera = async () => {
    if (visionStreamerRef.current) {
      await visionStreamerRef.current.flipCamera();
      setVideoStream(visionStreamerRef.current.getMediaStream());
    }
  };

  const handleToggleVideoInCall = (enabled: boolean) => {
    if (visionStreamerRef.current) {
      visionStreamerRef.current.toggleVideo(enabled);
    }
  };

  const handleToggleScreenShareInVideoCall = async () => {
    if (visionStreamerRef.current) {
      if (visionMode === 'screen') {
        await visionStreamerRef.current.startCameraVision('user');
      } else {
        await visionStreamerRef.current.startScreenVision();
      }
      setVideoStream(visionStreamerRef.current.getMediaStream());
    }
  };

  // Background gradient glow based on Vibe Theme
  const themeBgGlows: Record<VibeTheme, string> = {
    'cyber-pink': 'from-sky-600/15 via-blue-600/10 to-indigo-950/20',
    'electric-violet': 'from-purple-600/15 via-blue-600/10 to-slate-950/20',
    'neon-cyan': 'from-cyan-600/15 via-teal-600/10 to-pink-950/20',
    'sunset-gold': 'from-amber-600/15 via-rose-600/10 to-slate-950/20',
  };

  const headerAvatarSrc =
    avatarStyle === 'bluebox'
      ? blueBoxClosed
      : avatarStyle === 'realistic'
      ? mahiRealisticClosed
      : mahiAnimeAvatar;

  const avatarStyleLabel =
    avatarStyle === 'bluebox'
      ? 'Blue Box'
      : avatarStyle === 'realistic'
      ? 'Realistic'
      : 'Anime';

  const avatarStyleIcon =
    avatarStyle === 'bluebox' ? '🏸' : avatarStyle === 'realistic' ? '✨' : '🎀';

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#070810] text-slate-100 flex flex-col justify-between selection:bg-pink-500/30 selection:text-pink-200 font-sans">
      {/* Dynamic Ambient Neon Backdrop */}
      <div
        className={`absolute inset-0 bg-gradient-to-tr ${themeBgGlows[vibeTheme]} pointer-events-none transition-all duration-700`}
      />
      <div className="absolute -top-32 -left-32 w-80 h-80 sm:w-96 sm:h-96 bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 sm:w-96 sm:h-96 bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Futuristic Header */}
      <header className="relative z-30 px-4 py-3 sm:px-8 flex items-center justify-between border-b border-slate-800/60 bg-slate-950/50 backdrop-blur-xl">
        {/* Brand & Persona Identifier */}
        <div className="flex items-center gap-3">
          <div className="relative cursor-pointer" onClick={cycleAvatarStyle} title="Tap to switch style">
            <div className="w-10 h-10 rounded-2xl overflow-hidden border-2 border-sky-400/80 shadow-[0_0_20px_rgba(56,189,248,0.5)] bg-slate-900">
              <img
                src={headerAvatarSrc}
                alt="Mahi Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            {sessionState === 'listening' || sessionState === 'speaking' ? (
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#070810] animate-pulse" />
            ) : null}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                <span>Mahi</span>
                <span className="text-sky-400 text-xs font-semibold">青の匣</span>
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-sky-500/20 text-sky-300 border border-sky-400/30">
                {language === 'hindi' ? 'हिंदी LIVE' : 'Voice-to-Voice'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              {avatarStyle === 'bluebox'
                ? (language === 'hindi' ? 'ब्लू बॉक्स ऐनिमे बेस्टी' : 'Blue Box Anime Heroine')
                : avatarStyle === 'realistic'
                ? (language === 'hindi' ? 'यथार्थवादी लिप-सिंक' : 'Realistic Lip-Sync')
                : (language === 'hindi' ? 'साइबरपंक ऐनिमे' : 'Cyberpunk Anime')}
            </p>
          </div>
        </div>

        {/* Live Status Pill & Quick Language Toggle & Settings Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Android APK / App Install Button */}
          <PWAInstallHeaderButton
            onOpenModal={() => setIsAPKModalOpen(true)}
            language={language}
          />

          {/* Video Call Button */}
          <button
            onClick={handleStartVideoCall}
            className="px-3 py-1.5 rounded-full bg-gradient-to-r from-rose-500/25 via-pink-500/20 to-purple-500/25 hover:from-rose-500/35 hover:to-purple-500/35 border border-pink-400/60 text-pink-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(236,72,153,0.35)]"
            title="Start Live FaceTime Video Call with Mahi"
          >
            <VideoIcon className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
            <span>{language === 'hindi' ? 'वीडियो कॉल' : 'Video Call'}</span>
          </button>

          {/* Quick Avatar Style Toggle */}
          <button
            onClick={cycleAvatarStyle}
            className={`px-2.5 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              avatarStyle === 'bluebox'
                ? 'bg-sky-500/20 border-sky-400/70 text-sky-200 shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Cycle Avatar Style (Blue Box / Realistic / Anime)"
          >
            <span>{avatarStyleIcon}</span>
            <span className="hidden sm:inline">{avatarStyleLabel}</span>
          </button>

          {/* Quick Hindi Toggle Button */}
          <button
            onClick={toggleLanguage}
            className={`px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              language === 'hindi'
                ? 'bg-pink-500/20 border-pink-500/60 text-pink-300 shadow-[0_0_15px_rgba(236,72,153,0.25)]'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Hindi/English Language"
          >
            <span>{language === 'hindi' ? '🇮🇳' : '🇬🇧'}</span>
            <span>{language === 'hindi' ? 'हिंदी' : 'EN'}</span>
          </button>

          {/* Connection Status Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs">
            {sessionState === 'listening' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-cyan-300 font-semibold text-[11px]">
                  {language === 'hindi' ? 'सुन रही हूँ' : 'Listening'}
                </span>
              </>
            ) : sessionState === 'speaking' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" />
                <span className="text-pink-300 font-semibold text-[11px]">
                  {language === 'hindi' ? 'बोल रही हूँ' : 'Speaking'}
                </span>
              </>
            ) : sessionState === 'connecting' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-amber-300 font-semibold text-[11px]">
                  {language === 'hindi' ? 'जुड़ रही हूँ...' : 'Connecting'}
                </span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-slate-600" />
                <span className="text-slate-400 font-medium text-[11px]">
                  {language === 'hindi' ? 'तैयार' : 'Standby'}
                </span>
              </>
            )}
          </div>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm"
            title="Mahi Personality Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Fullscreen Voice & Vision Stage */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-2 max-w-lg mx-auto w-full">
        {/* Error notification banner if any */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-2 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 max-w-sm text-center shadow-lg"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Central Blue Box Anime Lip-Sync Voice Stage */}
        <RealisticLipSyncAvatar
          state={sessionState}
          audioLevel={audioLevel}
          isMuted={isMuted}
          vibeTheme={vibeTheme}
          language={language}
          avatarStyle={avatarStyle}
          currentMood={currentMood}
          teaseRating={teaseRating}
          onAvatarClick={handleOrbClick}
        />

        {/* Live Phone Screen / Camera Vision Control Bar */}
        <VisionControlBar
          visionMode={visionMode}
          sessionState={sessionState}
          language={language}
          videoStream={videoStream}
          onStartScreenVision={handleStartScreenVision}
          onStartCameraVision={handleStartCameraVision}
          onStopVision={handleStopVision}
        />

        {/* Real-time Waveform Spectrum */}
        <div className="mt-1 mb-1 w-full">
          <WaveformVisualizer
            state={sessionState}
            audioLevel={audioLevel}
            isMuted={isMuted}
            vibeTheme={vibeTheme}
          />
        </div>

        {/* Interactive Voice Chat Bar with Quick Topic Pills & Subtitles */}
        <VoiceChatBar
          language={language}
          isSpeaking={sessionState === 'speaking'}
          isLoading={isChatLoading}
          lastSpokenText={lastSpokenText}
          onSendMessage={handleSendMessage}
          hasScreenVision={visionMode !== 'off'}
        />

        {/* Persona Quick Guide / Hint */}
        <div className="text-center my-2 select-none">
          {sessionState === 'disconnected' ? (
            <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-xs">
              {language === 'hindi'
                ? 'ब्लू बॉक्स ऐनिमे माही से बात करने या स्क्रीन शेयर करने के लिए नीचे टैप करो!'
                : 'Tap the button below to start your continuous voice call with Mahi.'}
            </p>
          ) : sessionState === 'listening' ? (
            <p className="text-xs text-cyan-300/90 font-medium animate-pulse">
              {visionMode !== 'off'
                ? (language === 'hindi'
                    ? 'माही आपकी स्क्रीन देख रही है — जो भी पूछना है पूछो!'
                    : 'Mahi can see your screen live — ask anything!')
                : (language === 'hindi'
                    ? 'माही सुन रही है — बिंदास हिंदी या हिंग्लिश में बोलो!'
                    : 'Mahi is listening — speak naturally at any time.')}
            </p>
          ) : sessionState === 'speaking' ? (
            <p className="text-xs text-pink-300 font-medium">
              {language === 'hindi'
                ? 'माही बोल रही है (लाइव लिप-सिंक) • बीच में टोकने के लिए टैप करो।'
                : 'Mahi is speaking with live lip-sync • Tap anywhere to interrupt.'}
            </p>
          ) : (
            <p className="text-xs text-yellow-300/80 font-medium">
              {language === 'hindi'
                ? 'माही से वॉइस कनेक्शन बन रहा है...'
                : 'Establishing audio stream...'}
            </p>
          )}
        </div>

        {/* Central Power / Mic Action Control */}
        <CentralControlButton
          state={sessionState}
          isMuted={isMuted}
          vibeTheme={vibeTheme}
          onPowerToggle={handlePowerToggle}
          onMuteToggle={handleMuteToggle}
          onInterrupt={handleInterrupt}
        />
      </main>

      {/* Subtle Mobile-First Footer HUD */}
      <footer className="relative z-30 py-2.5 px-6 text-center border-t border-slate-900/80 bg-slate-950/60 backdrop-blur-md">
        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <Eye className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
          <span>
            {language === 'hindi'
              ? 'ब्लू बॉक्स ऐनिमे • लाइव स्क्रीन विज़न'
              : 'Blue Box Anime • Real-time Phone Screen Vision'}
          </span>
          <span className="text-slate-600">&bull;</span>
          <span className="text-slate-400">
            {language === 'hindi' ? '100% आवाज़ + विज़न' : 'Voice + Vision'}
          </span>
        </div>
      </footer>

      {/* Tool Action Holographic HUD Card */}
      <ToolActionModal
        toolCall={activeToolCall}
        onClose={() => setActiveToolCall(null)}
      />

      {/* Vibe / Personality Settings Sheet */}
      <VibeSelector
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        sassLevel={sassLevel}
        onSelectSassLevel={setSassLevel}
        voiceName={voiceName}
        onSelectVoiceName={setVoiceName}
        vibeTheme={vibeTheme}
        onSelectVibeTheme={setVibeTheme}
        language={language}
        onSelectLanguage={setLanguage}
        avatarStyle={avatarStyle}
        onSelectAvatarStyle={setAvatarStyle}
      />

      {/* Fullscreen FaceTime Video Call View */}
      <AnimatePresence>
        {isVideoCallActive && (
          <VideoCallView
            sessionState={sessionState}
            audioLevel={audioLevel}
            isMuted={isMuted}
            vibeTheme={vibeTheme}
            language={language}
            avatarStyle={avatarStyle}
            visionMode={visionMode}
            userVideoStream={videoStream}
            lastSpokenText={lastSpokenText}
            onEndVideoCall={handleEndVideoCall}
            onToggleMute={handleMuteToggle}
            onFlipCamera={handleFlipCamera}
            onToggleVideo={handleToggleVideoInCall}
            onToggleScreenShare={handleToggleScreenShareInVideoCall}
            onSendReactionMessage={handleSendMessage}
          />
        )}
      </AnimatePresence>

      {/* Android APK & PWA Install Modal */}
      <AndroidAPKModal
        isOpen={isAPKModalOpen}
        onClose={() => setIsAPKModalOpen(false)}
        language={language}
      />

      {/* Offline Connectivity Toast */}
      <OfflineIndicator />
    </div>
  );
}
