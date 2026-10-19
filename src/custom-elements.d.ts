import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'video-player': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        'data-vast-endpoint'?: string;
        'data-vast-url'?: string;
        'data-ad-src'?: string;
      }, HTMLElement>;
      'video-skin': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        style?: React.CSSProperties;
      }, HTMLElement>;
      'mux-video': React.DetailedHTMLProps<React.VideoHTMLAttributes<HTMLVideoElement> & {
        src?: string;
        'playback-id'?: string;
        crossorigin?: string;
        playsinline?: boolean | string;
        'playsInline'?: boolean;
        controls?: boolean;
        poster?: string;
        autoplay?: boolean;
      }, HTMLVideoElement>;
      'mux-data': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        'env-key'?: string;
        'metadata-video-title'?: string;
      }, HTMLElement>;
    }
  }
}
