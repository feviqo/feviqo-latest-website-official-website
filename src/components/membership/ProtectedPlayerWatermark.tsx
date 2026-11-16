import React, { useEffect, useState } from 'react';
import { WatermarkInfo } from '../../services/membershipService';

interface ProtectedPlayerWatermarkProps {
  watermark?: WatermarkInfo;
}

const POSITIONS = [
  'top-4 right-4 text-right',
  'bottom-14 left-4 text-left',
  'top-4 left-4 text-left',
  'bottom-14 right-4 text-right',
];

export const ProtectedPlayerWatermark: React.FC<ProtectedPlayerWatermarkProps> = ({
  watermark,
}) => {
  const [slotIndex, setSlotIndex] = useState(0);

  useEffect(() => {
    if (!watermark) return;
    const interval = window.setInterval(() => {
      setSlotIndex((prev) => (prev + 1) % POSITIONS.length);
    }, 12000);
    return () => window.clearInterval(interval);
  }, [watermark]);

  if (!watermark) return null;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none select-none absolute z-20 ${POSITIONS[slotIndex]} transition-all duration-700`}
    >
      <div className="px-2.5 py-1 rounded bg-black/35 border border-white/10 backdrop-blur-[1px]">
        <div className="text-[10px] sm:text-[11px] font-mono font-semibold text-white/45 tracking-wide leading-tight">
          {watermark.text}
        </div>
        {watermark.subtext && (
          <div className="text-[9px] font-mono text-white/30 tracking-wider leading-tight mt-0.5">
            {watermark.subtext}
          </div>
        )}
      </div>
    </div>
  );
};
