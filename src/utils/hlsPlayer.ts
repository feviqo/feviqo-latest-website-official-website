import Hls from 'hls.js';

/**
 * Detects if a URL is an HLS .m3u8 stream (e.g. Mux, Cloudflare Stream, AWS MediaConvert)
 */
export function isHlsStream(url?: string | null): boolean {
  if (!url) return false;
  const clean = url.trim().toLowerCase();
  return clean.includes('.m3u8') || clean.includes('stream.mux.com');
}

/**
 * Extracts Mux playback ID from a stream URL
 * e.g. https://stream.mux.com/1SOwsPef4cWsfimczylaL5ulTCrpulBV1QG7KAmK77M.m3u8
 */
export function extractMuxPlaybackId(url?: string | null): string | null {
  if (!url) return null;
  const match = url.match(/stream\.mux\.com\/([a-zA-Z0-9_-]+)(?:\.m3u8)?/i);
  if (match && match[1]) return match[1];
  return null;
}

/**
 * Gets a high-res thumbnail URL for Mux streams
 */
export function getMuxThumbnail(urlOrId?: string | null, timeInSeconds: number = 1): string | null {
  if (!urlOrId) return null;
  const playbackId = extractMuxPlaybackId(urlOrId) || (urlOrId.length >= 25 && !urlOrId.includes('/') ? urlOrId : null);
  if (!playbackId) return null;
  return `https://image.mux.com/${playbackId}/thumbnail.jpg?time=${timeInSeconds}`;
}

/**
 * Attaches Hls.js or native Safari HLS to an HTML5 video element.
 * Returns a cleanup callback function.
 */
export function attachHlsStream(
  videoElement: HTMLVideoElement | null,
  src: string | undefined | null,
  options: {
    autoPlay?: boolean;
    onReady?: () => void;
    onError?: (error: any) => void;
  } = {}
): (() => void) | undefined {
  if (!videoElement || !src) return;

  // If element is <mux-video> custom element, it natively handles HLS streaming via its own engine
  if (videoElement.tagName === 'MUX-VIDEO') {
    if (videoElement.getAttribute('src') !== src) {
      videoElement.setAttribute('src', src);
    }
    options.onReady?.();
    if (options.autoPlay) {
      videoElement.play().catch(() => {});
    }
    return undefined;
  }

  const isHls = isHlsStream(src);

  if (isHls) {
    const canPlayNativeHls = Boolean(
      videoElement.canPlayType('application/vnd.apple.mpegurl') || 
      videoElement.canPlayType('application/x-mpegURL')
    );

    // If native HLS is supported (Safari/iOS) AND Hls.js is not supported or native is preferred
    if (canPlayNativeHls && !Hls.isSupported()) {
      if (videoElement.src !== src) {
        videoElement.src = src;
      }

      const handleLoaded = () => {
        options.onReady?.();
        if (options.autoPlay) {
          videoElement.muted = true;
          videoElement.play().catch(() => {});
        }
      };

      if (videoElement.readyState >= 1) {
        handleLoaded();
        return undefined;
      }

      videoElement.addEventListener('loadedmetadata', handleLoaded, { once: true });
      videoElement.addEventListener('canplay', handleLoaded, { once: true });
      return () => {
        videoElement.removeEventListener('loadedmetadata', handleLoaded);
        videoElement.removeEventListener('canplay', handleLoaded);
      };
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 30,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        capLevelToPlayerSize: true,
        startLevel: -1,
      });

      hls.loadSource(src);
      hls.attachMedia(videoElement);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        options.onReady?.();
        if (options.autoPlay) {
          videoElement.muted = true;
          videoElement.play().catch(() => {});
        }
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              if (canPlayNativeHls) {
                hls.destroy();
                videoElement.src = src;
                videoElement.load();
                if (options.autoPlay) {
                  videoElement.muted = true;
                  videoElement.play().catch(() => {});
                }
              } else {
                hls.destroy();
                options.onError?.(data);
              }
              break;
          }
        }
      });

      return () => {
        try {
          hls.destroy();
        } catch {}
      };
    } else if (canPlayNativeHls) {
      if (videoElement.src !== src) {
        videoElement.src = src;
      }
      const handleLoaded = () => {
        options.onReady?.();
        if (options.autoPlay) {
          videoElement.muted = true;
          videoElement.play().catch(() => {});
        }
      };
      if (videoElement.readyState >= 1) {
        handleLoaded();
        return undefined;
      }
      videoElement.addEventListener('loadedmetadata', handleLoaded, { once: true });
      return () => {
        videoElement.removeEventListener('loadedmetadata', handleLoaded);
      };
    }
  }

  // Progressive MP4 / WebM fallback
  if (videoElement.src !== src) {
    videoElement.src = src;
  }
  options.onReady?.();
  if (options.autoPlay) {
    videoElement.muted = true;
    videoElement.play().catch(() => {});
  }
  return undefined;
}
