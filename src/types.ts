export type SessionState = 'disconnected' | 'connecting' | 'listening' | 'speaking';

export type SassLevel = 'mild' | 'sassy' | 'unfiltered';

export type VoiceName = 'Kore' | 'Aoede' | 'Zephyr' | 'Puck';

export type VibeTheme = 'cyber-pink' | 'electric-violet' | 'neon-cyan' | 'sunset-gold';

export type Language = 'hindi' | 'english';

export type AvatarStyle = 'bluebox' | 'realistic' | 'anime';

export interface ToolCallData {
  id: string;
  name: string;
  args: Record<string, any>;
  timestamp: string;
}

export interface MahiPersonality {
  sassLevel: SassLevel;
  voiceName: VoiceName;
  vibeTheme: VibeTheme;
  language: Language;
}
