import Hls from 'hls.js';

export interface AttachHlsOptions {
  autoPlay?: boolean;
  muted?: boolean;
  onError?: (err: unknown) => void;
  onManifestParsed?: () => void;
  onReady?: () => void;
}

/**
 * Checks whether a media URL is an HLS manifest or proxied HLS stream.
 */
export function isHlsStream(url?: string | null): boolean {
  if (!url) return false;
  const trimmed = String(url).trim().toLowerCase();
  return (
    trimmed.includes('.m3u8') ||
    trimmed.includes('stream.mux.com/') ||
    trimmed.startsWith('/api/membership/stream/')
  );
}

/**
 * Extracts a Mux playback ID from a standard `https://stream.mux.com/<id>.m3u8` URL.
 * Returns `null` for backend-proxied `/api/membership/stream/...` URLs so `<mux-video>`
 * does not attempt to hit `stream.mux.com` directly with a malformed ID.
 */
export function extractMuxPlaybackId(streamUrl?: string | null): string | null {
  if (!streamUrl) return null;
  const trimmed = String(streamUrl).trim();
  if (!trimmed || trimmed.startsWith('/api/')) return null;
  const match = trimmed.match(/stream\.mux\.com\/([a-zA-Z0-9_-]+)(?:\.m3u8)?/i);
  return match?.[1] || null;
}

function resolveTargetVideoElement(mediaEl: HTMLVideoElement | HTMLElement | null): HTMLVideoElement | null {
  if (!mediaEl) return null;
  if (mediaEl.tagName?.toLowerCase() === 'video') {
    return mediaEl as HTMLVideoElement;
  }
  const anyEl = mediaEl as any;
  if (anyEl.nativeEl && anyEl.nativeEl.tagName?.toLowerCase() === 'video') {
    return anyEl.nativeEl as HTMLVideoElement;
  }
  if (anyEl.shadowRoot) {
    const inner = anyEl.shadowRoot.querySelector('video');
    if (inner) return inner as HTMLVideoElement;
  }
  const nested = mediaEl.querySelector?.('video');
  if (nested) return nested as HTMLVideoElement;
  return mediaEl as HTMLVideoElement;
}

/**
 * Attaches an HLS `.m3u8` stream to an HTML5 `<video>` (or `<mux-video>` element)
 * with resilient long-form VOD buffering, automatic transient network retry with backoff,
 * media error recovery, and zero disruptive error popups on temporary blips.
 */
export function attachHlsStream(
  mediaEl: HTMLVideoElement | null,
  streamUrl: string,
  options: AttachHlsOptions = {}
): () => void {
  if (!mediaEl || !streamUrl) return () => {};

  const isProxied = streamUrl.startsWith('/api/');
  const isMuxCustomElement = mediaEl.tagName?.toLowerCase() === 'mux-video';
  const video = resolveTargetVideoElement(mediaEl);
  if (!video) return () => {};

  let destroyed = false;
  let hls: Hls | null = null;
  let networkRetryCount = 0;
  let mediaRecoveryAttempts = 0;
  let retryTimer: number | null = null;
  let stallCheckTimer: number | null = null;
  let lastPlayPosition = -1;
  let stagnantTicks = 0;

  const clearTimers = () => {
    if (retryTimer !== null) {
      window.clearTimeout(retryTimer);
      retryTimer = null;
    }
    if (stallCheckTimer !== null) {
      window.clearInterval(stallCheckTimer);
      stallCheckTimer = null;
    }
  };

  if (options.muted) {
    video.muted = true;
  }

  // If this is a direct (non-proxied) Mux URL on a <mux-video> element that already
  // natively manages its own playback-id & hls.js engine, avoid attaching a duplicate
  // competing Hls instance that causes mid-playback stalls/conflicts.
  if (isMuxCustomElement && !isProxied && extractMuxPlaybackId(streamUrl)) {
    const onNativeError = () => {
      if (destroyed) return;
      if (networkRetryCount < 5) {
        networkRetryCount += 1;
        const resumeAt = Number.isFinite(video.currentTime) ? video.currentTime : 0;
        const wasPlaying = !video.paused;
        retryTimer = window.setTimeout(() => {
          if (destroyed) return;
          try {
            video.load();
            if (resumeAt > 1) {
              const seekBack = () => {
                try {
                  video.currentTime = resumeAt;
                } catch {}
                if (wasPlaying) video.play().catch(() => {});
                video.removeEventListener('loadedmetadata', seekBack);
              };
              video.addEventListener('loadedmetadata', seekBack);
            } else if (wasPlaying) {
              video.play().catch(() => {});
            }
          } catch {}
        }, Math.min(8000, 1200 * networkRetryCount));
      } else {
        options.onError?.(video.error);
      }
    };
    const onMuxLoaded = () => {
      if (destroyed) return;
      options.onManifestParsed?.();
      options.onReady?.();
    };
    video.addEventListener('loadedmetadata', onMuxLoaded);
    video.addEventListener('error', onNativeError);
    if (options.autoPlay) {
      video.play().catch(() => {});
    }
    return () => {
      destroyed = true;
      clearTimers();
      video.removeEventListener('loadedmetadata', onMuxLoaded);
      video.removeEventListener('error', onNativeError);
    };
  }

  const canUseHlsJs = Hls.isSupported();
  const canUseNativeHls =
    !canUseHlsJs &&
    typeof video.canPlayType === 'function' &&
    Boolean(
      video.canPlayType('application/vnd.apple.mpegurl') ||
        video.canPlayType('application/x-mpegURL')
    );

  if (canUseHlsJs) {
    hls = new Hls({
      enableWorker: true,
      lowLatencyMode: false,
      startLevel: -1,
      capLevelToPlayerSize: false,
      maxBufferLength: 45,
      maxMaxBufferLength: 120,
      maxBufferSize: 90 * 1000 * 1000,
      backBufferLength: 30,
      maxBufferHole: 0.75,
      nudgeOffset: 0.2,
      nudgeMaxRetry: 8,
      manifestLoadingTimeOut: 25000,
      manifestLoadingMaxRetry: 8,
      manifestLoadingRetryDelay: 1200,
      manifestLoadingMaxRetryTimeout: 12000,
      levelLoadingTimeOut: 25000,
      levelLoadingMaxRetry: 8,
      levelLoadingRetryDelay: 1200,
      levelLoadingMaxRetryTimeout: 12000,
      fragLoadingTimeOut: 35000,
      fragLoadingMaxRetry: 10,
      fragLoadingRetryDelay: 1200,
      fragLoadingMaxRetryTimeout: 12000,
      xhrSetup: (xhr) => {
        xhr.withCredentials = isProxied;
      },
    });

    hls.attachMedia(video);

    hls.on(Hls.Events.MEDIA_ATTACHED, () => {
      if (destroyed || !hls) return;
      hls.loadSource(streamUrl);
    });

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      if (destroyed) return;
      networkRetryCount = 0;
      options.onManifestParsed?.();
      options.onReady?.();
      if (options.autoPlay) {
        video.play().catch(() => {});
      }
    });

    hls.on(Hls.Events.FRAG_LOADED, () => {
      networkRetryCount = 0;
      stagnantTicks = 0;
    });

    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (destroyed || !hls) return;
      if (!data.fatal) return;

      const httpCode = Number((data as any)?.response?.code || 0);

      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        // Explicit 401/403 indicates server revocation or expired session — stop retries
        if (httpCode === 401 || httpCode === 403) {
          options.onError?.(data);
          return;
        }
        if (networkRetryCount < 10) {
          networkRetryCount += 1;
          const delayMs = Math.min(10000, 900 * Math.pow(1.45, networkRetryCount - 1));
          const resumeTime = Number.isFinite(video.currentTime) ? video.currentTime : undefined;
          if (retryTimer !== null) window.clearTimeout(retryTimer);
          retryTimer = window.setTimeout(() => {
            if (destroyed || !hls) return;
            try {
              hls.startLoad(resumeTime !== undefined && resumeTime > 0 ? Math.max(0, resumeTime - 0.5) : -1);
            } catch {
              try {
                hls.startLoad();
              } catch {}
            }
          }, delayMs);
          return;
        }
        options.onError?.(data);
        return;
      }

      if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        mediaRecoveryAttempts += 1;
        if (mediaRecoveryAttempts === 1) {
          hls.recoverMediaError();
          return;
        }
        if (mediaRecoveryAttempts === 2) {
          try {
            hls.swapAudioCodec();
          } catch {}
          hls.recoverMediaError();
          return;
        }
        // Reset cleanly at current timestamp on repeated decode glitches
        const resumeAt = Number.isFinite(video.currentTime) ? video.currentTime : 0;
        const wasPlaying = !video.paused;
        mediaRecoveryAttempts = 0;
        try {
          hls.detachMedia();
          hls.attachMedia(video);
          hls.loadSource(streamUrl);
          if (resumeAt > 1) {
            const onReady = () => {
              try {
                video.currentTime = resumeAt;
              } catch {}
              if (wasPlaying) video.play().catch(() => {});
              video.removeEventListener('loadedmetadata', onReady);
            };
            video.addEventListener('loadedmetadata', onReady);
          }
        } catch {
          options.onError?.(data);
        }
        return;
      }

      // Unknown fatal error: attempt gentle reload once before reporting
      if (networkRetryCount < 3) {
        networkRetryCount += 1;
        retryTimer = window.setTimeout(() => {
          if (destroyed || !hls) return;
          try {
            hls.startLoad();
          } catch {}
        }, 1500);
        return;
      }
      options.onError?.(data);
    });

    // Gentle stall watchdog: if playing video freezes for >14s with no progress, nudge HLS loader
    stallCheckTimer = window.setInterval(() => {
      if (destroyed || !hls) return;
      if (video.paused || video.ended || video.readyState >= 3) {
        stagnantTicks = 0;
        lastPlayPosition = video.currentTime;
        return;
      }
      if (Math.abs(video.currentTime - lastPlayPosition) < 0.05) {
        stagnantTicks += 1;
        if (stagnantTicks >= 3) {
          stagnantTicks = 0;
          try {
            hls.startLoad(Math.max(0, video.currentTime));
          } catch {}
        }
      } else {
        stagnantTicks = 0;
        lastPlayPosition = video.currentTime;
      }
    }, 5000);
  } else if (canUseNativeHls) {
    video.src = streamUrl;
    const onLoaded = () => {
      if (destroyed) return;
      options.onManifestParsed?.();
      options.onReady?.();
      if (options.autoPlay) {
        video.play().catch(() => {});
      }
    };
    const onNativeError = () => {
      if (destroyed) return;
      if (networkRetryCount < 6) {
        networkRetryCount += 1;
        const resumeAt = Number.isFinite(video.currentTime) ? video.currentTime : 0;
        const wasPlaying = !video.paused;
        retryTimer = window.setTimeout(() => {
          if (destroyed) return;
          video.src = streamUrl;
          video.load();
          if (resumeAt > 1) {
            const seekBack = () => {
              try {
                video.currentTime = resumeAt;
              } catch {}
              if (wasPlaying) video.play().catch(() => {});
              video.removeEventListener('loadedmetadata', seekBack);
            };
            video.addEventListener('loadedmetadata', seekBack);
          } else if (wasPlaying) {
            video.play().catch(() => {});
          }
        }, Math.min(8000, 1200 * networkRetryCount));
      } else {
        options.onError?.(video.error);
      }
    };
    video.addEventListener('loadedmetadata', onLoaded);
    video.addEventListener('error', onNativeError);
    return () => {
      destroyed = true;
      clearTimers();
      video.removeEventListener('loadedmetadata', onLoaded);
      video.removeEventListener('error', onNativeError);
    };
  } else {
    video.src = streamUrl;
    if (options.autoPlay) {
      video.play().catch(() => {});
    }
  }

  return () => {
    destroyed = true;
    clearTimers();
    if (hls) {
      try {
        hls.destroy();
      } catch {}
      hls = null;
    }
  };
}
