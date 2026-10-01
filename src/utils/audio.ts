/**
 * Audio processing utilities for real-time voice streaming with Gemini
 */

// Convert Float32Array from AudioContext to 16kHz 16-bit mono PCM base64
export function floatTo16BitPCM(
  inputData: Float32Array,
  sourceSampleRate: number,
  targetSampleRate: number = 16000
): string {
  let samples: Float32Array;

  if (sourceSampleRate === targetSampleRate) {
    samples = inputData;
  } else {
    // Resample down/up to targetSampleRate (typically 16000Hz)
    const ratio = sourceSampleRate / targetSampleRate;
    const newLength = Math.round(inputData.length / ratio);
    samples = new Float32Array(newLength);
    for (let i = 0; i < newLength; i++) {
      const originalIndex = Math.min(Math.round(i * ratio), inputData.length - 1);
      samples[i] = inputData[originalIndex];
    }
  }

  // Convert to Int16 Little Endian
  const buffer = new ArrayBuffer(samples.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < samples.length; i++) {
    // Clamp to -1.0 to 1.0
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  // Convert buffer to Base64
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert base64 PCM string (24kHz 16-bit mono) into AudioBuffer for gapless playback
export function pcmBase64ToAudioBuffer(
  base64Data: string,
  audioCtx: AudioContext,
  sampleRate: number = 24000
): AudioBuffer {
  const binaryString = atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // 16-bit Little Endian PCM -> 2 bytes per sample
  const numSamples = Math.floor(len / 2);
  const dataView = new DataView(bytes.buffer);
  const float32Data = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const int16 = dataView.getInt16(i * 2, true);
    // Convert to float in range -1.0 to 1.0
    float32Data[i] = int16 < 0 ? int16 / 0x8000 : int16 / 0x7fff;
  }

  const audioBuffer = audioCtx.createBuffer(1, numSamples, sampleRate);
  audioBuffer.copyToChannel(float32Data, 0);
  return audioBuffer;
}

// Web Audio sound effects synthesizer for UI feedback
export class SoundEffects {
  private static ctx: AudioContext | null = null;

  private static getContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Playful chime when voice mode starts
  static playStartChime() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
      osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.28); // D6

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {
      // Audio might be blocked before user interaction
    }
  }

  // Sassy pop when Roxy starts speaking or responds
  static playPop() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(740, now + 0.08);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {
      // ignore
    }
  }

  // Soft click/toggle sound
  static playToggle() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.05);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch (e) {
      // ignore
    }
  }
}
