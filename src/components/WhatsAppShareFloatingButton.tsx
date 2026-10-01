import React, { useState } from 'react';
import { Share2, Check, Sparkles } from 'lucide-react';

interface WhatsAppShareFloatingButtonProps {
  title: string;
  summary?: string;
  category?: string;
  district?: string;
  articleId?: string;
}

export const WhatsAppShareFloatingButton: React.FC<WhatsAppShareFloatingButtonProps> = ({
  title,
  summary,
  category,
  district,
  articleId,
}) => {
  const [copied, setCopied] = useState(false);

  // Generate formatted WhatsApp message text with direct workable link
  const getWhatsAppShareUrl = () => {
    // Determine public canonical URL: prefer origin + article query param or hash so recipient opens directly
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    const directUrl = articleId 
      ? `${origin}${pathname}#article-${articleId}`
      : window.location.href;

    const districtText = district ? `[${district}] ` : '';
    const categoryText = category ? `[${category}] ` : '';
    
    // Short summary snippet
    const summarySnippet = summary
      ? `\n\n${summary.slice(0, 160)}${summary.length > 160 ? '...' : ''}`
      : '';

    const message = 
      `🔴 *DDN PRIME NEWS*\n` +
      `📰 *${districtText}${categoryText}${title}*` +
      summarySnippet +
      `\n\n👉 पूरी खबर पढ़ने के लिए इस लिंक पर क्लिक करें:\n${directUrl}\n\n` +
      `📲 निष्पक्ष व सटीक पत्रकारिता के लिए DDN Prime News से जुड़े रहें।`;

    return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
  };

  const handleShareClick = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center group">
      {/* Floating Action Button */}
      <a
        href={getWhatsAppShareUrl()}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleShareClick}
        title="व्हाट्सएप पर शेयर करें (Share to WhatsApp)"
        aria-label="Share to WhatsApp"
        className="flex items-center space-x-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-4 py-3 rounded-full shadow-2xl hover:shadow-[0_10px_25px_rgba(37,211,102,0.5)] transition-all duration-300 transform hover:scale-105 active:scale-95 border-2 border-white/80"
      >
        {/* WhatsApp Brand SVG Icon */}
        <span className="relative flex items-center justify-center">
          <svg
            className="w-6 h-6 fill-current text-white flex-shrink-0 drop-shadow-sm"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12.031 2C6.495 2 2 6.495 2 12.031c0 1.947.558 3.847 1.619 5.485L2 22l4.636-1.579a9.98 9.98 0 0 0 5.395 1.611h.004c5.536 0 10.031-4.495 10.031-10.031 0-2.68-1.043-5.2-2.937-7.094A9.972 9.972 0 0 0 12.031 2zm5.845 14.168c-.244.686-1.42 1.309-1.968 1.365-.512.052-1.18.075-1.914-.16a15.7 15.7 0 0 1-5.753-3.626 12.77 12.77 0 0 1-2.484-3.66c-.66-1.144-.07-1.764.22-2.046.26-.253.58-.328.774-.328.193 0 .387.002.556.01.18.01.42-.068.658.502.245.587.838 2.053.913 2.203.075.15.125.328.025.526-.1.2-.15.328-.3.502-.15.174-.316.388-.45.52-.15.15-.306.313-.131.613.175.3.778 1.284 1.668 2.077 1.145 1.021 2.11 1.336 2.41 1.486.3.15.476.125.651-.075.175-.2.75-.875.95-1.175.2-.3.4-.25.676-.15.275.1.175.676 1.75.926.275.125.45.2.525.325.075.125.075.725-.169 1.411z" />
          </svg>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full animate-ping opacity-75 pointer-events-none" />
        </span>

        {/* Text Label */}
        <span className="font-black text-xs tracking-wide pr-1 flex items-center space-x-1">
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>शेयर हो रहा है...</span>
            </>
          ) : (
            <>
              <span>व्हाट्सएप पर शेयर करें</span>
              <Share2 className="w-3 h-3 opacity-90 hidden sm:inline" />
            </>
          )}
        </span>
      </a>
    </div>
  );
};
