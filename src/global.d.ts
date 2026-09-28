import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'video-player': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { class?: string; style?: React.CSSProperties }, HTMLElement>;
      'video-skin': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { class?: string; style?: React.CSSProperties }, HTMLElement>;
      'mux-video': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        src?: string;
        playsinline?: boolean | string;
        poster?: string;
        controls?: boolean;
        class?: string;
        style?: React.CSSProperties;
      }, HTMLElement>;
      'mux-data': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { class?: string; style?: React.CSSProperties }, HTMLElement>;
    }
  }
}
