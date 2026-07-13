import type { Page } from '@playwright/test';

export async function installMockMedia(page: Page) {
  await page.addInitScript(() => {
    class MockMediaRecorder extends EventTarget {
      static isTypeSupported() {
        return true;
      }

      state: RecordingState = 'inactive';
      ondataavailable: ((event: BlobEvent) => void) | null = null;
      onerror: ((event: Event) => void) | null = null;

      constructor(public stream: MediaStream) {
        super();
      }

      start() {
        this.state = 'recording';
      }

      stop() {
        this.state = 'inactive';
      }

      pause() {
        if (this.state === 'recording') this.state = 'paused';
      }

      resume() {
        if (this.state === 'paused') this.state = 'recording';
      }
    }

    Object.defineProperty(window, 'MediaRecorder', {
      configurable: true,
      value: MockMediaRecorder,
    });

    Object.defineProperty(HTMLMediaElement.prototype, 'play', {
      configurable: true,
      value: async () => undefined,
    });

    Object.defineProperty(HTMLVideoElement.prototype, 'videoWidth', {
      configurable: true,
      get: () => 640,
    });

    Object.defineProperty(HTMLVideoElement.prototype, 'videoHeight', {
      configurable: true,
      get: () => 480,
    });

    const mediaElementStreams = new WeakMap<HTMLMediaElement, MediaStream>();
    Object.defineProperty(HTMLMediaElement.prototype, 'srcObject', {
      configurable: true,
      get() {
        return mediaElementStreams.get(this) ?? null;
      },
      set(stream: MediaStream | null) {
        if (stream) {
          mediaElementStreams.set(this, stream);
        } else {
          mediaElementStreams.delete(this);
        }
      },
    });

    const originalDrawImage = CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.drawImage = function (...args) {
      try {
        return originalDrawImage.apply(this, args as Parameters<typeof originalDrawImage>);
      } catch {
        this.fillStyle = '#111827';
        this.fillRect(0, 0, 640, 480);
        return undefined;
      }
    } as typeof originalDrawImage;

    const createStream = () => {
      const createTrack = (kind: 'audio' | 'video') =>
        ({
          kind,
          id: `mock-${kind}`,
          label: `Mock ${kind}`,
          enabled: true,
          muted: false,
          readyState: 'live',
          stop() {
            this.readyState = 'ended';
          },
          clone() {
            return this;
          },
          getCapabilities: () => ({}),
          getConstraints: () => ({}),
          getSettings: () => ({}),
          addEventListener: () => undefined,
          removeEventListener: () => undefined,
          dispatchEvent: () => true,
        }) as MediaStreamTrack;
      const tracks = [createTrack('video'), createTrack('audio')];

      return {
        id: 'mock-media-stream',
        active: true,
        getTracks: () => tracks,
        getVideoTracks: () => tracks.filter((track) => track.kind === 'video'),
        getAudioTracks: () => tracks.filter((track) => track.kind === 'audio'),
        addTrack: () => undefined,
        removeTrack: () => undefined,
        clone: () => createStream(),
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        dispatchEvent: () => true,
      } as unknown as MediaStream;
    };

    const mockMediaDevices = {
      getUserMedia: async () => createStream(),
      enumerateDevices: async () => [
        { deviceId: 'mock-camera', kind: 'videoinput', label: 'Mock camera', groupId: 'e2e', toJSON: () => ({}) },
        { deviceId: 'mock-mic', kind: 'audioinput', label: 'Mock microphone', groupId: 'e2e', toJSON: () => ({}) },
      ],
      getSupportedConstraints: () => ({ video: true, audio: true }),
    };

    Object.defineProperty(Navigator.prototype, 'mediaDevices', {
      configurable: true,
      get: () => mockMediaDevices,
    });

    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: mockMediaDevices,
    });
  });
}

export async function triggerTabSwitchViolation(page: Page) {
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'hidden',
    });
    document.dispatchEvent(new Event('visibilitychange'));
  });
}

export async function restoreVisibleTab(page: Page) {
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'visible',
    });
    document.dispatchEvent(new Event('visibilitychange'));
  });
}
