import React from 'react';
import { Megaphone, ExternalLink, PhoneCall, Sparkles } from 'lucide-react';
import { AdBanner } from '../types';

interface AdPlacementSlotProps {
  placementKey: 'header' | 'sidebar' | 'inline' | 'article_top' | 'article_bottom' | 'feed_native' | 'district_local';
  adList?: AdBanner[];
  className?: string;
  customTitle?: string;
  onBookAdClick?: () => void;
}

export const AdPlacementSlot: React.FC<AdPlacementSlotProps> = ({
  placementKey,
  adList = [],
  className = '',
  customTitle,
  onBookAdClick,
}) => {
  // Try to find matching ad from the uploaded ads list
  const matchingAd = adList.find((a) => {
    if (!a.active) return false;
    const aPlacement = (a.placement || (a as any).position || '').toLowerCase();
    const key = placementKey.toLowerCase();

    if (aPlacement === key) return true;
    if (key === 'header' && (aPlacement === 'header_top' || aPlacement === 'header')) return true;
    if (key === 'inline' && (aPlacement === 'inline_content' || aPlacement === 'inline')) return true;
    if (key.startsWith('article_') && (aPlacement === 'inline_content' || aPlacement === 'inline' || aPlacement === key)) return true;
    if (key === 'feed_native' && (aPlacement === 'inline_content' || aPlacement === 'feed')) return true;
    if (key === 'district_local' && (aPlacement === 'sidebar' || aPlacement === 'district')) return true;

    return false;
  });

  if (matchingAd && matchingAd.imageUrl) {
    return (
      <div className={`my-4 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 text-center shadow-xs transition hover:shadow-sm ${className}`}>
        <div className="flex items-center justify-between px-3 py-1 bg-gray-100 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
          <span className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
            <span>विज्ञापन • {matchingAd.sponsorName || matchingAd.title}</span>
          </span>
          <a
            href={matchingAd.targetUrl || '#'}
            target="_blank"
            rel="noreferrer"
            className="text-red-700 hover:underline flex items-center space-x-0.5"
          >
            <span>विस्तार से देखें</span>
            <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
          </a>
        </div>
        <a
          href={matchingAd.targetUrl || '#'}
          target="_blank"
          rel="noreferrer"
          className="block group overflow-hidden"
        >
          <img
            src={matchingAd.imageUrl}
            alt={matchingAd.title}
            className="w-full max-h-56 object-cover group-hover:scale-101 transition duration-300 mx-auto"
          />
        </a>
      </div>
    );
  }

  // Self-Serve / Placeholder Ad Slot with high aesthetic styling
  const getSlotDetails = () => {
    switch (placementKey) {
      case 'header':
        return {
          title: 'डीडीएन प्राइम राष्ट्रीय विज्ञापन स्लॉट (Leaderboard Banner)',
          sub: 'लाखों सक्रिय पाठकों तक अपने ब्रांड, व्यापार या चुनावी प्रचार को पहुंचाएं',
          size: '728 × 90 px / Responsive',
          bg: 'from-amber-500/10 via-red-500/10 to-rose-500/10',
          border: 'border-amber-200',
        };
      case 'article_top':
        return {
          title: 'प्रीमियम न्यूज़ स्पॉन्सरशिप स्लॉट (Top Article Ad)',
          sub: 'हर खबर खुलने पर सबसे पहले पाठकों को आपका विज्ञापन दिखेगा',
          size: 'Full Width Premium Banner',
          bg: 'from-red-500/10 via-rose-500/10 to-orange-500/10',
          border: 'border-red-200',
        };
      case 'article_bottom':
        return {
          title: 'न्यूज़ एंड-आर्टिकल प्रमोशन स्लॉट (Bottom Article Ad)',
          sub: 'पूरी खबर पढ़ने के बाद पाठकों का सीधा ध्यान आपके उत्पाद पर',
          size: 'Responsive Banner',
          bg: 'from-blue-500/10 via-indigo-500/10 to-purple-500/10',
          border: 'border-blue-200',
        };
      case 'inline':
        return {
          title: 'समाचार इन-लाइन विज्ञापन स्लॉट (Article In-Text Ad)',
          sub: 'खबर के मुख्य विवरण के बीच सर्वाधिक ध्यान आकर्षित करने वाला विज्ञापन स्थान',
          size: 'In-Article Responsive Ad',
          bg: 'from-orange-500/10 via-amber-500/10 to-yellow-500/10',
          border: 'border-orange-200',
        };
      case 'feed_native':
        return {
          title: 'डीडीएन प्राइम होम / राज्य फीड विज्ञापन (In-Feed Sponsor)',
          sub: 'ताज़ा खबरों के बीच सहज रूप से प्रदर्शित प्रायोजित बैनर',
          size: 'Native Feed Ad Slot',
          bg: 'from-emerald-500/10 via-teal-500/10 to-cyan-500/10',
          border: 'border-emerald-200',
        };
      case 'district_local':
        return {
          title: 'जिला व स्थानीय व्यापार विज्ञापन (Local District Ad)',
          sub: 'अपने जिले, शहर या प्रखंड के ग्राहकों तक तुरंत पहुंचे',
          size: 'District Sponsored Slot',
          bg: 'from-purple-500/10 via-pink-500/10 to-rose-500/10',
          border: 'border-purple-200',
        };
      default:
        return {
          title: 'यहाँ अपना विज्ञापन लगाएं (Sponsored Ad Space)',
          sub: 'बिहार और देश भर में अपने व्यवसाय का तेजी से प्रचार करें',
          size: 'Standard Ad Unit',
          bg: 'from-gray-100 via-gray-50 to-gray-100',
          border: 'border-gray-200',
        };
    }
  };

  const details = getSlotDetails();

  return (
    <div
      className={`my-4 relative overflow-hidden rounded-xl border border-dashed ${details.border} bg-gradient-to-r ${details.bg} p-3.5 sm:p-4 text-center transition hover:border-solid hover:shadow-md ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-3 text-left">
          <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-200 flex items-center justify-center text-red-600 flex-shrink-0">
            <Megaphone className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-red-700 text-white tracking-wider">
                विज्ञापन स्लॉट
              </span>
              <span className="text-[10px] font-bold text-gray-500">{details.size}</span>
            </div>
            <h4 className="font-extrabold text-xs sm:text-sm text-gray-900 mt-0.5">
              {customTitle || details.title}
            </h4>
            <p className="text-[11px] text-gray-600 font-medium hidden sm:block">
              {details.sub}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          <a
            href="tel:+919341050287"
            className="flex items-center space-x-1 px-3 py-1.5 bg-white border border-gray-300 hover:border-gray-400 text-gray-800 rounded-lg text-xs font-bold transition shadow-xs"
            title="विज्ञापन विभाग से कॉल पर बात करें"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">कॉल: +91 9341050287</span>
            <span className="sm:hidden">कॉल करें</span>
          </a>

          <a
            href="mailto:ddnprimenews@gmail.com?subject=Advertisement%20Enquiry%20DDN%20Prime%20News"
            onClick={(e) => {
              if (onBookAdClick) {
                e.preventDefault();
                onBookAdClick();
              }
            }}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-gradient-to-r from-red-700 to-rose-800 hover:from-red-800 hover:to-rose-900 text-white rounded-lg text-xs font-black shadow-sm transition active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>विज्ञापन बुक करें</span>
          </a>
        </div>
      </div>
    </div>
  );
};
