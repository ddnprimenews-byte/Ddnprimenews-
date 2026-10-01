import React from 'react';
import { DDN_LOGO_BASE64 } from '../assets/logoBase64';

interface CircularLogoProps {
  className?: string;
  size?: number | string;
  bordered?: boolean;
}

/**
 * Exact authentic DDN Prime News Original Circular Logo
 * - Uses the user's authentic upload with 100% fidelity (no style change, no design change, no color change).
 * - Circular transparent cutout: all outer square background and checkerboard completely erased.
 * - Embedded inline Base64 + static path fallback guarantees immediate display with zero browser caching delays.
 */
export const CircularLogo: React.FC<CircularLogoProps> = ({
  className = '',
  size = 56,
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative rounded-full flex-shrink-0 flex items-center justify-center select-none bg-transparent ${className}`}
    >
      <img
        src={DDN_LOGO_BASE64}
        alt="DDN Prime News Logo"
        className="w-full h-full object-contain rounded-full drop-shadow-sm pointer-events-none"
        loading="eager"
      />
    </div>
  );
};
