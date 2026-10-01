/**
 * AudioStreamer
 * Manages Web Audio API input (PCM16 16kHz mic capture)
 * and output (24kHz gapless PCM playback & visualizer analysers).
 */

export class AudioStreamer {
  private inputAudioCtx: AudioContext | null = null;
  private outputAudioCtx: AudioContext | null = null;
  private micStream: MediaStream | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;

  // Analysers
  private micAnalyser: AnalyserNode | null = null;
  private speakerAnalyser: AnalyserNode | null = null;

  // Playback Queue (24kHz PCM)
  private playbackQueue: AudioBuffer[] = [];
  private isPlaying: boolean = false;
  private nextPlayTime: number = 0;
  private activeSources: AudioBufferSourceNode[] = [];

  // Mute state
  private isMuted: boolean = false;

  // Callbacks
  private onAudioChunkCallback?: (base64Chunk: string) => void;
  private onPlaybackStateChange?: (isPlaying: boolean) => void;

  constructor(
    onAudioChunk?: (base64Chunk: string) => void,
    onPlaybackStateChange?: (isPlaying: boolean) => void
  ) {
    this.onAudioChunkCallback = onAudioChunk;
    this.onPlaybackStateChange = onPlaybackStateChange;
  }

  // Initialize output context with robust browser fallback
  public getOutputContext(): AudioContext {
    if (!this.outputAudioCtx || this.outputAudioCtx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      try {
        this.outputAudioCtx = new AudioCtx({ sampleRate: 24000 });
      } catch {
        // Fallback to native hardware sample rate if 24000 is not supported
        this.outputAudioCtx = new AudioCtx();
      }

      // Speaker analyser for visualizer
      this.speakerAnalyser = this.outputAudioCtx.createAnalyser();
      this.speakerAnalyser.fftSize = 64;
      this.speakerAnalyser.smoothingTimeConstant = 0.8;
      this.speakerAnalyser.connect(this.outputAudioCtx.destination);
    }

    if (this.outputAudioCtx.state === 'suspended') {
      this.outputAudioCtx.resume().catch(() => {});
    }

    return this.outputAudioCtx;
  }

  // Start microphone capture & 16kHz PCM streaming
  public async startMicrophone(): Promise<void> {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    this.inputAudioCtx = new AudioCtx();

    // Ensure user interaction resumes context
    if (this.inputAudioCtx.state === 'suspended') {
      await this.inputAudioCtx.resume().catch(() => {});
    }

    // Ensure output audio context is also warmed up
    this.getOutputContext();

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    this.micStream = stream;

    this.micSource = this.inputAudioCtx.createMediaStreamSource(stream);

    // Mic analyser for visualizer
    this.micAnalyser = this.inputAudioCtx.createAnalyser();
    this.micAnalyser.fftSize = 64;
    this.micAnalyser.smoothingTimeConstant = 0.8;
    this.micSource.connect(this.micAnalyser);

    // Buffer size 2048 or 4096
    const bufferSize = 4096;
    this.scriptProcessor = this.inputAudioCtx.createScriptProcessor(bufferSize, 1, 1);

    this.scriptProcessor.onaudioprocess = (e) => {
      if (this.isMuted) return;
      const channelData = e.inputBuffer.getChannelData(0);
      const base64PCM = this.downsampleTo16BitPCM(
        channelData,
        this.inputAudioCtx!.sampleRate,
        16000
      );
      if (this.onAudioChunkCallback) {
        this.onAudioChunkCallback(base64PCM);
      }
    };

    this.micSource.connect(this.scriptProcessor);

    // Route processor to silent gain node so user doesn't hear microphone loopback echo
    const silenceGain = this.inputAudioCtx.createGain();
    silenceGain.gain.value = 0;
    this.scriptProcessor.connect(silenceGain);
    silenceGain.connect(this.inputAudioCtx.destination);
  }

  // Downsample Float32Array to 16kHz 16-bit PCM little endian base64
  private downsampleTo16BitPCM(
    inputData: Float32Array,
    sourceSampleRate: number,
    targetSampleRate: number = 16000
  ): string {
    if (sourceSampleRate === targetSampleRate) {
      return this.floatTo16BitPCMBase64(inputData);
    }

    const compression = sourceSampleRate / targetSampleRate;
    const length = Math.floor(inputData.length / compression);
    const result = new Int16Array(length);

    let offsetResult = 0;
    let offsetBuffer = 0;

    while (offsetResult < length) {
      const nextOffsetBuffer = Math.round((offsetResult + 1) * compression);
      let accum = 0;
      let count = 0;

      for (let i = offsetBuffer; i < nextOffsetBuffer && i < inputData.length; i++) {
        accum += inputData[i];
        count++;
      }

      const sample = count > 0 ? accum / count : 0;
      // Clamp [-1, 1] to Int16 [-32768, 32767]
      const clamped = Math.max(-1, Math.min(1, sample));
      result[offsetResult] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;

      offsetResult++;
      offsetBuffer = nextOffsetBuffer;
    }

    // Convert Int16Array to binary string
    const bytes = new Uint8Array(result.buffer);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private floatTo16BitPCMBase64(inputData: Float32Array): string {
    const length = inputData.length;
    const result = new Int16Array(length);
    for (let i = 0; i < length; i++) {
      const s = Math.max(-1, Math.min(1, inputData[i]));
      result[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    const bytes = new Uint8Array(result.buffer);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  // Queue and schedule incoming 24kHz PCM chunk gaplessly
  public queueAudioChunk(base64Data: string): void {
    const ctx = this.getOutputContext();
    try {
      const audioBuffer = this.pcmBase64ToAudioBuffer(base64Data, ctx, 24000);
      this.playbackQueue.push(audioBuffer);

      while (this.playbackQueue.length > 0) {
        this.scheduleNextChunk();
      }
    } catch (err) {
      console.error('Failed to parse audio chunk:', err);
    }
  }

  // Play full WAV audio buffer with live real-time visualizer & lip-sync connection
  public async playWavAudio(base64Wav: string): Promise<void> {
    const ctx = this.getOutputContext();
    if (ctx.state === 'suspended') {
      await ctx.resume().catch(() => {});
    }

    this.stopPlayback();

    const binary = atob(base64Wav);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    try {
      const audioBuffer = await ctx.decodeAudioData(bytes.buffer.slice(0));
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;

      if (this.speakerAnalyser) {
        source.connect(this.speakerAnalyser);
      } else {
        source.connect(ctx.destination);
      }

      this.isPlaying = true;
      if (this.onPlaybackStateChange) {
        this.onPlaybackStateChange(true);
      }

      source.start(0);
      this.activeSources.push(source);

      source.onended = () => {
        this.activeSources = this.activeSources.filter((s) => s !== source);
        if (this.activeSources.length === 0) {
          this.isPlaying = false;
          if (this.onPlaybackStateChange) {
            this.onPlaybackStateChange(false);
          }
        }
      };
    } catch (e) {
      console.error('Failed to decode and play WAV audio:', e);
    }
  }

  private pcmBase64ToAudioBuffer(
    base64Data: string,
    audioCtx: AudioContext,
    sampleRate: number = 24000
  ): AudioBuffer {
    const binary = atob(base64Data);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    const numSamples = Math.floor(len / 2);
    const view = new DataView(bytes.buffer);
    const float32Data = new Float32Array(numSamples);

    for (let i = 0; i < numSamples; i++) {
      const int16 = view.getInt16(i * 2, true);
      float32Data[i] = int16 < 0 ? int16 / 0x8000 : int16 / 0x7fff;
    }

    const buffer = audioCtx.createBuffer(1, numSamples, sampleRate);
    buffer.copyToChannel(float32Data, 0);
    return buffer;
  }

  private scheduleNextChunk(): void {
    if (!this.outputAudioCtx || this.playbackQueue.length === 0) return;

    if (!this.isPlaying) {
      this.isPlaying = true;
      if (this.onPlaybackStateChange) {
        this.onPlaybackStateChange(true);
      }
    }

    const buffer = this.playbackQueue.shift()!;
    const source = this.outputAudioCtx.createBufferSource();
    source.buffer = buffer;

    if (this.speakerAnalyser) {
      source.connect(this.speakerAnalyser);
    } else {
      source.connect(this.outputAudioCtx.destination);
    }

    const now = this.outputAudioCtx.currentTime;
    const startTime = Math.max(now + 0.005, this.nextPlayTime);
    source.start(startTime);
    this.nextPlayTime = startTime + buffer.duration;

    this.activeSources.push(source);

    source.onended = () => {
      this.activeSources = this.activeSources.filter((s) => s !== source);
      if (this.activeSources.length === 0 && this.playbackQueue.length === 0) {
        this.isPlaying = false;
        if (this.onPlaybackStateChange) {
          this.onPlaybackStateChange(false);
        }
      }
    };
  }

  // Interruption: instantly stop all playing audio and flush queue
  public stopPlayback(): void {
    this.activeSources.forEach((src) => {
      try {
        src.stop();
        src.disconnect();
      } catch (e) {
        // ignore already stopped
      }
    });
    this.activeSources = [];
    this.playbackQueue = [];
    this.isPlaying = false;
    if (this.outputAudioCtx) {
      this.nextPlayTime = this.outputAudioCtx.currentTime;
    }
    if (this.onPlaybackStateChange) {
      this.onPlaybackStateChange(false);
    }
  }

  // Toggle Mute
  public setMuted(muted: boolean): void {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Get active audio levels (0 to 1) for visualizer
  public getAudioLevel(isSpeaking: boolean): number {
    const analyser = isSpeaking ? this.speakerAnalyser : this.micAnalyser;
    if (!analyser) return 0;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    const avg = sum / dataArray.length;
    return Math.min(1, avg / 128);
  }

  // Get raw frequency data for visualizer
  public getFrequencyData(array: Uint8Array, isSpeaking: boolean): void {
    const analyser = isSpeaking ? this.speakerAnalyser : this.micAnalyser;
    if (analyser) {
      analyser.getByteFrequencyData(array as any);
    }
  }

  // Cleanup
  public close(): void {
    this.stopPlayback();

    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
      this.scriptProcessor.onaudioprocess = null;
      this.scriptProcessor = null;
    }

    if (this.micSource) {
      this.micSource.disconnect();
      this.micSource = null;
    }

    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
      this.micStream = null;
    }

    if (this.inputAudioCtx && this.inputAudioCtx.state !== 'closed') {
      this.inputAudioCtx.close().catch(() => {});
      this.inputAudioCtx = null;
    }

    if (this.outputAudioCtx && this.outputAudioCtx.state !== 'closed') {
      this.outputAudioCtx.close().catch(() => {});
      this.outputAudioCtx = null;
    }
  }

  public cleanup(): void {
    this.close();
  }
}
