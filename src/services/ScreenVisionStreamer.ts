/**
 * ScreenVisionStreamer
 * Manages real-time screen capture & camera video streaming to Gemini Live.
 * Sends 1 JPEG frame per second at optimized resolution.
 */

export type VisionMode = 'off' | 'screen' | 'camera';

export class ScreenVisionStreamer {
  private mediaStream: MediaStream | null = null;
  private videoEl: HTMLVideoElement | null = null;
  private canvasEl: HTMLCanvasElement | null = null;
  private intervalId: number | null = null;
  private currentMode: VisionMode = 'off';
  private currentFacingMode: 'user' | 'environment' = 'user';
  private lastFrameBase64: string | null = null;
  private onFrameCallback?: (base64Jpeg: string) => void;
  private onStateChange?: (mode: VisionMode) => void;

  constructor(
    onFrame?: (base64Jpeg: string) => void,
    onStateChange?: (mode: VisionMode) => void
  ) {
    this.onFrameCallback = onFrame;
    this.onStateChange = onStateChange;
  }

  public getMode(): VisionMode {
    return this.currentMode;
  }

  public getMediaStream(): MediaStream | null {
    return this.mediaStream;
  }

  public getLatestFrameBase64(): string | null {
    return this.lastFrameBase64;
  }

  // Start Screen Sharing (with camera fallback for mobile browsers)
  public async startScreenVision(): Promise<VisionMode> {
    this.stop();

    let stream: MediaStream | null = null;
    let mode: VisionMode = 'screen';

    // Try Screen Sharing API first
    if (navigator.mediaDevices && 'getDisplayMedia' in navigator.mediaDevices) {
      try {
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            frameRate: { ideal: 5, max: 15 },
          },
          audio: false,
        });
      } catch (err: any) {
        console.warn('Screen share canceled or not supported on this device, falling back to camera:', err);
      }
    }

    // Fallback to camera if getDisplayMedia is rejected or unavailable
    if (!stream) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // Rear phone camera by default to see phone environment / docs
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        });
        mode = 'camera';
      } catch (err: any) {
        console.error('Camera access also failed:', err);
        throw new Error('Screen or camera permission denied.');
      }
    }

    this.mediaStream = stream;
    this.currentMode = mode;

    // Track end listener (e.g. user clicks "Stop sharing" in browser)
    stream.getVideoTracks().forEach((track) => {
      track.onended = () => {
        this.stop();
      };
    });

    this.setupVideoProcessing(stream);

    if (this.onStateChange) {
      this.onStateChange(mode);
    }

    return mode;
  }

  // Start Camera Vision directly (Front Selfie or Back Camera)
  public async startCameraVision(facingMode: 'user' | 'environment' = 'user'): Promise<VisionMode> {
    this.stop();
    this.currentFacingMode = facingMode;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: facingMode },
        width: { ideal: 640 },
        height: { ideal: 480 },
      },
      audio: false,
    });

    this.mediaStream = stream;
    this.currentMode = 'camera';

    stream.getVideoTracks().forEach((track) => {
      track.onended = () => {
        this.stop();
      };
    });

    this.setupVideoProcessing(stream);

    if (this.onStateChange) {
      this.onStateChange('camera');
    }

    return 'camera';
  }

  // Flip between front/selfie and back camera
  public async flipCamera(): Promise<VisionMode> {
    const nextMode = this.currentFacingMode === 'user' ? 'environment' : 'user';
    return this.startCameraVision(nextMode);
  }

  public getFacingMode(): 'user' | 'environment' {
    return this.currentFacingMode;
  }

  // Enable/disable user video track
  public toggleVideo(enabled: boolean): void {
    if (this.mediaStream) {
      this.mediaStream.getVideoTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }

  private setupVideoProcessing(stream: MediaStream): void {
    if (!this.videoEl) {
      this.videoEl = document.createElement('video');
      this.videoEl.autoplay = true;
      this.videoEl.muted = true;
      this.videoEl.playsInline = true;
    }

    this.videoEl.srcObject = stream;
    this.videoEl.play().catch(() => {});

    if (!this.canvasEl) {
      this.canvasEl = document.createElement('canvas');
    }

    // Capture 1 frame per second (1000ms interval as per Gemini Live API recommendations)
    this.intervalId = window.setInterval(() => {
      this.captureAndSendFrame();
    }, 1000);

    // Immediate first frame
    setTimeout(() => {
      this.captureAndSendFrame();
    }, 300);
  }

  private captureAndSendFrame(): void {
    if (!this.videoEl || !this.canvasEl || !this.mediaStream || this.currentMode === 'off') {
      return;
    }

    if (this.videoEl.readyState < 2) return;

    const videoWidth = this.videoEl.videoWidth || 640;
    const videoHeight = this.videoEl.videoHeight || 480;

    // Scale to max width 640 while maintaining aspect ratio
    const maxWidth = 640;
    const scale = Math.min(1, maxWidth / videoWidth);
    const targetWidth = Math.round(videoWidth * scale);
    const targetHeight = Math.round(videoHeight * scale);

    this.canvasEl.width = targetWidth;
    this.canvasEl.height = targetHeight;

    const ctx = this.canvasEl.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(this.videoEl, 0, 0, targetWidth, targetHeight);

    // Export as JPEG at 0.65 quality
    const dataUrl = this.canvasEl.toDataURL('image/jpeg', 0.65);
    const commaIndex = dataUrl.indexOf(',');
    if (commaIndex !== -1) {
      const base64Data = dataUrl.substring(commaIndex + 1);
      this.lastFrameBase64 = base64Data;
      if (this.onFrameCallback) {
        this.onFrameCallback(base64Data);
      }
    }
  }

  public stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.videoEl) {
      this.videoEl.srcObject = null;
    }

    if (this.currentMode !== 'off') {
      this.currentMode = 'off';
      if (this.onStateChange) {
        this.onStateChange('off');
      }
    }
  }
}
