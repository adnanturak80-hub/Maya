/**
 * LiveSession
 * Manages WebSocket connection to Gemini Live API and orchestrates AudioStreamer
 */

import { AudioStreamer } from './AudioStreamer';
import { SessionState, SassLevel, VoiceName, Language, ToolCallData } from '../types';

export interface LiveSessionCallbacks {
  onStateChange: (state: SessionState) => void;
  onToolCall: (toolCall: ToolCallData) => void;
  onError: (error: string) => void;
  onMuteChange: (isMuted: boolean) => void;
}

export class LiveSession {
  private ws: WebSocket | null = null;
  private audioStreamer: AudioStreamer;
  private state: SessionState = 'disconnected';
  private callbacks: LiveSessionCallbacks;

  private sassLevel: SassLevel;
  private voiceName: VoiceName;
  private language: Language;

  constructor(
    sassLevel: SassLevel = 'sassy',
    voiceName: VoiceName = 'Kore',
    language: Language = 'hindi',
    callbacks: LiveSessionCallbacks
  ) {
    this.sassLevel = sassLevel;
    this.voiceName = voiceName;
    this.language = language;
    this.callbacks = callbacks;

    this.audioStreamer = new AudioStreamer(
      (base64Chunk) => this.sendAudioChunk(base64Chunk),
      (isPlaying) => {
        if (this.state === 'listening' && isPlaying) {
          this.setState('speaking');
        } else if (this.state === 'speaking' && !isPlaying) {
          this.setState('listening');
        }
      }
    );
  }

  public updateConfig(
    sassLevel: SassLevel,
    voiceName: VoiceName,
    language: Language = 'hindi'
  ): void {
    this.sassLevel = sassLevel;
    this.voiceName = voiceName;
    this.language = language;
    if (this.state === 'listening' || this.state === 'speaking') {
      // Reconnect with new settings
      this.disconnect();
      this.connect();
    }
  }

  public getState(): SessionState {
    return this.state;
  }

  public isMuted(): boolean {
    return this.audioStreamer.getMuted();
  }

  public getAudioLevel(): number {
    return this.audioStreamer.getAudioLevel(this.state === 'speaking');
  }

  public getFrequencyData(array: Uint8Array): void {
    this.audioStreamer.getFrequencyData(array, this.state === 'speaking');
  }

  private setState(newState: SessionState): void {
    this.state = newState;
    this.callbacks.onStateChange(newState);
  }

  // Connect to Gemini Live
  public async connect(): Promise<void> {
    if (this.state === 'connecting' || this.state === 'listening') return;

    try {
      this.setState('connecting');

      // Initialize microphone stream
      await this.audioStreamer.startMicrophone();

      // Establish WebSocket connection
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/live-ws?sass=${this.sassLevel}&voice=${this.voiceName}&lang=${this.language}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        // Connected to server, awaiting Live API ready handshake
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === 'ready') {
            this.setState('listening');
          } else if (msg.type === 'audio' && msg.audio) {
            this.audioStreamer.queueAudioChunk(msg.audio);
          } else if (msg.type === 'interrupted') {
            // Instant stop and queue flush
            this.audioStreamer.stopPlayback();
            this.setState('listening');
          } else if (msg.type === 'turnComplete') {
            // Model turn completed
            setTimeout(() => {
              if (this.state === 'speaking') {
                this.setState('listening');
              }
            }, 100);
          } else if (msg.type === 'tool_call' && msg.call) {
            this.callbacks.onToolCall({
              id: msg.call.id,
              name: msg.call.name,
              args: msg.call.args || {},
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            });
          } else if (msg.type === 'error') {
            this.callbacks.onError(msg.message || 'Live session error');
          }
        } catch (e) {
          console.error('Failed to parse WS message:', e);
        }
      };

      this.ws.onerror = (err) => {
        console.error('LiveSession WebSocket error:', err);
        this.callbacks.onError('WebSocket connection error.');
        this.setState('disconnected');
      };

      this.ws.onclose = () => {
        this.setState('disconnected');
        this.audioStreamer.cleanup();
      };
    } catch (err: any) {
      console.error('Failed to connect LiveSession:', err);
      this.callbacks.onError(err?.message || 'Could not access microphone');
      this.setState('disconnected');
    }
  }

  // Send PCM audio chunk to Gemini Live
  private sendAudioChunk(base64PCM: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN && !this.audioStreamer.getMuted()) {
      this.ws.send(JSON.stringify({ type: 'audio', data: base64PCM }));
    }
  }

  // Send Video Frame (Screen or Camera) to Gemini Live
  public sendVideoFrame(base64Jpeg: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'video_frame', data: base64Jpeg }));
    }
  }

  // Send tool response to Gemini Live
  public sendToolResponse(id: string, name: string, output: Record<string, any>): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'tool_response',
          response: {
            id,
            name,
            response: { output },
          },
        })
      );
    }
  }

  // Toggle Mute
  public toggleMute(): void {
    const nextMuted = !this.audioStreamer.getMuted();
    this.audioStreamer.setMuted(nextMuted);
    this.callbacks.onMuteChange(nextMuted);
  }

  // User manually interrupts Mahi
  public interrupt(): void {
    this.audioStreamer.stopPlayback();
    this.setState('listening');
  }

  // Trigger high-quality speech response with live lip sync
  public async speakMessage(
    userMessage?: string,
    screenFrame?: string
  ): Promise<{ text: string; success: boolean }> {
    try {
      this.setState('speaking');

      const res = await fetch('/api/chat-speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          sassLevel: this.sassLevel,
          lang: this.language,
          voice: this.voiceName,
          screenFrame,
        }),
      });

      const data = await res.json();
      if (data.audio) {
        await this.audioStreamer.playWavAudio(data.audio);
      } else {
        // Fallback: brief delay before returning to listening
        setTimeout(() => {
          this.setState('listening');
        }, 2000);
      }

      return { text: data.text || '', success: true };
    } catch (err: any) {
      console.error('speakMessage error:', err);
      this.setState('listening');
      return { text: '', success: false };
    }
  }

  // Disconnect session
  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.audioStreamer.cleanup();
    this.setState('disconnected');
  }
}
