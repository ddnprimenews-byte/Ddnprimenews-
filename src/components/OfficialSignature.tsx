import React from 'react';
import { RAJESH_SIGNATURE_BASE64 } from '../assets/signatureBase64';

interface OfficialSignatureProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

/**
 * Authentic Authorized Signature of Chief Editor Rajesh Kumar Sahu
 * - Uses the user's authentic handwritten cursive signature in deep royal blue ink
 * - Transparent background, optimized for Press ID Card and Official Authorization Letterhead
 */
export const OfficialSignature: React.FC<OfficialSignatureProps> = ({
  className = '',
  width = 160,
  height = 55,
}) => {
  return (
    <div
      style={{ width, height }}
      className={`relative inline-flex items-center justify-center select-none overflow-visible ${className}`}
    >
      <img
        src={RAJESH_SIGNATURE_BASE64}
        alt="Rajesh Kumar Sahu Authorized Signature"
        className="w-full h-full object-contain pointer-events-none filter drop-shadow-sm"
        loading="eager"
      />
    </div>
  );
};
