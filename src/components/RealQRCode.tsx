import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface RealQRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

/**
 * Real scannable high-resolution QR code generator
 * Generates an authentic QR matrix image from dynamic verification data
 */
export const RealQRCode: React.FC<RealQRCodeProps> = ({
  value,
  size = 54,
  className = '',
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(value, {
      width: size * 2, // High DPI
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url: string) => {
        if (isMounted) setQrDataUrl(url);
      })
      .catch((err: Error) => {
        console.error('Failed to generate real QR code:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [value, size]);

  if (!qrDataUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`bg-white border border-gray-300 rounded flex items-center justify-center p-1 ${className}`}
      >
        <span className="text-[7px] text-gray-400 font-mono">QR...</span>
      </div>
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className={`bg-white rounded p-0.5 border border-gray-300 flex items-center justify-center shadow-xs flex-shrink-0 ${className}`}
    >
      <img
        src={qrDataUrl}
        alt="Official Digital QR Verification Code"
        className="w-full h-full object-contain pointer-events-none"
      />
    </div>
  );
};
