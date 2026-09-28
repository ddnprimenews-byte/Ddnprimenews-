import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, RefreshCw, BarChart2, ShieldAlert } from 'lucide-react';

interface MarketIndex {
  name: string;
  hindiName: string;
  value: string;
  change: string;
  changePercent: string;
  isPositive: boolean;
  high?: string;
  low?: string;
}

export const StockMarketTicker: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('लाइव (Live)');

  const indices: MarketIndex[] = [
    {
      name: 'NIFTY 50',
      hindiName: 'निफ्टी 50',
      value: '25,418.90',
      change: '+142.30',
      changePercent: '+0.56%',
      isPositive: true,
      high: '25,460.10',
      low: '25,290.40',
    },
    {
      name: 'BSE SENSEX',
      hindiName: 'सेंसेक्स',
      value: '83,184.80',
      change: '+468.25',
      changePercent: '+0.57%',
      isPositive: true,
      high: '83,310.50',
      low: '82,850.10',
    },
    {
      name: 'BANK NIFTY',
      hindiName: 'बैंक निफ्टी',
      value: '53,240.15',
      change: '+290.40',
      changePercent: '+0.55%',
      isPositive: true,
      high: '53,380.00',
      low: '52,990.20',
    },
    {
      name: 'GOLD 24K (10g)',
      hindiName: 'सोना 24K (पटना/बिहार)',
      value: '₹76,450',
      change: '+320.00',
      changePercent: '+0.42%',
      isPositive: true,
      high: '₹76,600',
      low: '₹76,100',
    },
    {
      name: 'SILVER 1KG',
      hindiName: 'चांदी (प्रति किग्रा)',
      value: '₹91,200',
      change: '-150.00',
      changePercent: '-0.16%',
      isPositive: false,
      high: '₹91,800',
      low: '₹90,900',
    },
    {
      name: 'USD / INR',
      hindiName: 'डॉलर vs रुपया',
      value: '₹84.12',
      change: '-0.04',
      changePercent: '-0.05%',
      isPositive: true,
      high: '₹84.18',
      low: '₹84.08',
    },
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdated(new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }));
    }, 500);
  };

  return (
    <div className="bg-slate-900 text-white border-y border-slate-800 shadow-inner">
      {/* Ticker Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2 flex-shrink-0 pr-3 border-r border-slate-700">
          <div className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <BarChart2 className="w-3.5 h-3.5" />
          </div>
          <span className="font-black text-[11px] text-gray-200 uppercase tracking-wider flex items-center space-x-1">
            <span>मार्केट अपडेट</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping hidden sm:inline" />
          </span>
        </div>

        {/* Scrollable / Strip Indices */}
        <div className="flex-1 flex items-center space-x-4 sm:space-x-6 overflow-x-auto px-3 scrollbar-none text-xs">
          {indices.map((idx) => (
            <div key={idx.name} className="flex items-center space-x-2 flex-shrink-0">
              <span className="font-bold text-gray-300 text-[11px]">{idx.name}:</span>
              <span className="font-extrabold text-white">{idx.value}</span>
              <span
                className={`flex items-center font-bold text-[10px] px-1.5 py-0.5 rounded ${
                  idx.isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                {idx.isPositive ? (
                  <TrendingUp className="w-2.5 h-2.5 mr-0.5 inline" />
                ) : (
                  <TrendingDown className="w-2.5 h-2.5 mr-0.5 inline" />
                )}
                <span>{idx.changePercent}</span>
              </span>
            </div>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 flex-shrink-0 pl-3 border-l border-slate-700 text-[11px]">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-gray-300 hover:text-white font-bold transition underline hover:no-underline hidden md:inline"
          >
            {showDetails ? 'संक्षिप्त करें' : 'विस्तृत देखें'}
          </button>
          <button
            onClick={handleRefresh}
            title="मार्केट डेटा रिफ्रेश करें"
            className="p-1 rounded text-gray-400 hover:text-white hover:bg-slate-800 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Expandable Market Grid Details */}
      {showDetails && (
        <div className="bg-slate-950/80 border-t border-slate-800 px-4 py-3">
          <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {indices.map((idx) => (
              <div
                key={idx.name}
                className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-gray-400">{idx.name}</span>
                  <span
                    className={`font-bold text-[10px] flex items-center ${
                      idx.isPositive ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {idx.isPositive ? '+' : ''}{idx.change}
                  </span>
                </div>
                <div className="text-sm font-black text-white mt-0.5">{idx.value}</div>
                <div className="text-[10px] text-gray-400 mt-1 flex justify-between">
                  <span>लो: {idx.low}</span>
                  <span>हाई: {idx.high}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="max-w-7xl mx-auto pt-2 text-[10px] text-gray-500 text-right">
            * सराफा व वित्तीय दरें सांकेतिक हैं • स्रोत: एनएसई/बीएसई/एमसीएक्स
          </div>
        </div>
      )}
    </div>
  );
};
