import React from 'react';

interface OfficialDigitalStampProps {
  className?: string;
  size?: number | string;
}

/**
 * Official Blue Circular Digital Stamp for DDN PRIME NEWS (Darbhanga Digital Network)
 * Matches the user's authentic blue seal stamp with:
 * - Concentric blue ring borders
 * - Curvature text: DARBHANGA DIGITAL NETWORK
 * - Side stars ★ ★
 * - Central news microphone & 3D DDN PRIME NEWS emblem
 * - Semi-transparent ink imprint effect
 */
export const OfficialDigitalStamp: React.FC<OfficialDigitalStampProps> = ({
  className = '',
  size = 110,
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative rounded-full flex items-center justify-center select-none overflow-hidden ${className}`}
      title="DDN Prime News - Official Digital Seal & Stamp"
    >
      <svg
        viewBox="0 0 300 300"
        className="w-full h-full transform -rotate-6 transition-transform hover:rotate-0"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Path for curved circular top text */}
          <path
            id="stampCircleTop"
            d="M 40,150 A 110,110 0 1,1 260,150"
            fill="none"
          />
          {/* Path for curved circular bottom text */}
          <path
            id="stampCircleBottom"
            d="M 260,150 A 110,110 0 0,1 40,150"
            fill="none"
          />
        </defs>

        {/* Outer Heavy Circular Border */}
        <circle
          cx="150"
          cy="150"
          r="142"
          stroke="#0022cc"
          strokeWidth="6"
          fill="none"
        />

        {/* Outer Thin Concentric Ring */}
        <circle
          cx="150"
          cy="150"
          r="134"
          stroke="#0022cc"
          strokeWidth="2"
          fill="none"
        />

        {/* Inner Solid Border Ring */}
        <circle
          cx="150"
          cy="150"
          r="92"
          stroke="#0022cc"
          strokeWidth="3.5"
          fill="none"
        />

        {/* Inner Thin Border Ring */}
        <circle
          cx="150"
          cy="150"
          r="86"
          stroke="#0022cc"
          strokeWidth="1.5"
          fill="none"
        />

        {/* Circular Curved Text: DARBHANGA DIGITAL NETWORK */}
        <text
          fill="#0022cc"
          fontSize="21"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="2.5"
        >
          <textPath href="#stampCircleTop" startOffset="50%" textAnchor="middle">
            DARBHANGA DIGITAL NETWORK
          </textPath>
        </text>

        {/* Stars on Left and Right */}
        <text
          x="35"
          y="160"
          fill="#0022cc"
          fontSize="24"
          fontWeight="900"
          textAnchor="middle"
        >
          ★
        </text>
        <text
          x="265"
          y="160"
          fill="#0022cc"
          fontSize="24"
          fontWeight="900"
          textAnchor="middle"
        >
          ★
        </text>

        {/* Bottom Curved Subtitle: GOVT REGD MEDIA */}
        <text
          fill="#0022cc"
          fontSize="15"
          fontWeight="800"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="4"
        >
          <textPath href="#stampCircleBottom" startOffset="50%" textAnchor="middle">
            OFFICIAL DIGITAL VERIFIED
          </textPath>
        </text>

        {/* Central Graphic: News Microphone */}
        <g transform="translate(150, 102)">
          {/* Mic Grille */}
          <ellipse cx="0" cy="0" rx="14" ry="17" fill="#0022cc" />
          <line x1="-12" y1="-5" x2="12" y2="-5" stroke="#ffffff" strokeWidth="1" />
          <line x1="-14" y1="0" x2="14" y2="0" stroke="#ffffff" strokeWidth="1" />
          <line x1="-12" y1="5" x2="12" y2="5" stroke="#ffffff" strokeWidth="1" />
          <line x1="-5" y1="-14" x2="-5" y2="14" stroke="#ffffff" strokeWidth="1" />
          <line x1="0" y1="-16" x2="0" y2="16" stroke="#ffffff" strokeWidth="1" />
          <line x1="5" y1="-14" x2="5" y2="14" stroke="#ffffff" strokeWidth="1" />

          {/* DDN Box */}
          <rect
            x="-22"
            y="16"
            width="44"
            height="22"
            rx="3"
            fill="#0022cc"
            stroke="#ffffff"
            strokeWidth="1.5"
          />
          <text
            x="0"
            y="32"
            fill="#ffffff"
            fontSize="13"
            fontWeight="900"
            fontFamily="Arial Black, Impact, sans-serif"
            textAnchor="middle"
          >
            DDN
          </text>

          {/* Mic handle */}
          <path d="M -5 38 L -3 52 L 3 52 L 5 38 Z" fill="#0022cc" />
        </g>

        {/* Banner: PRIME NEWS */}
        <g transform="translate(150, 185)">
          {/* Angled background banner */}
          <path
            d="M -75 -18 L 75 -24 L 70 8 L -80 14 Z"
            fill="#0022cc"
          />
          <text
            x="0"
            y="2"
            fill="#ffffff"
            fontSize="24"
            fontWeight="900"
            fontStyle="italic"
            fontFamily="Arial Black, Impact, sans-serif"
            letterSpacing="1"
            textAnchor="middle"
          >
            PRIME
          </text>
        </g>

        {/* Bottom Tag Box: NEWS */}
        <g transform="translate(150, 222)">
          <rect
            x="-42"
            y="-12"
            width="84"
            height="20"
            rx="4"
            fill="#ffffff"
            stroke="#0022cc"
            strokeWidth="3.5"
          />
          <text
            x="0"
            y="3"
            fill="#0022cc"
            fontSize="16"
            fontWeight="900"
            fontFamily="Arial Black, Impact, sans-serif"
            letterSpacing="2"
            textAnchor="middle"
          >
            NEWS
          </text>
        </g>

        {/* Stamp Ink Texture Overlay */}
        <circle cx="95" cy="80" r="1.5" fill="#0022cc" opacity="0.4" />
        <circle cx="210" cy="110" r="2" fill="#0022cc" opacity="0.3" />
        <circle cx="80" cy="220" r="1.5" fill="#0022cc" opacity="0.5" />
        <circle cx="225" cy="205" r="2.5" fill="#0022cc" opacity="0.4" />
      </svg>
    </div>
  );
};
