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

  const isHls = isHlsStream(src);

  if (isHls) {
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
      });

      hls.loadSource(src);
      hls.attachMedia(videoElement);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        options.onReady?.();
        if (options.autoPlay) {
          videoElement.play().catch(() => {
            // Handled (autoplay policy)
          });
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
              hls.destroy();
              options.onError?.(data);
              break;
          }
        }
      });

      return () => {
        try {
          hls.destroy();
        } catch {
          // Handled
        }
      };
    } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      // Native Apple HLS (Safari, iOS)
      videoElement.src = src;
      const handleLoaded = () => {
        options.onReady?.();
        if (options.autoPlay) {
          videoElement.play().catch(() => {});
        }
      };
      videoElement.addEventListener('loadedmetadata', handleLoaded);
      return () => {
        videoElement.removeEventListener('loadedmetadata', handleLoaded);
      };
    }
  }

  // Standard progressive MP4 / WebM fallback
  videoElement.src = src;
  return undefined;
}
