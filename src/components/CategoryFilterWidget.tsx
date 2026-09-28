import React from 'react';
import { CATEGORIES, NewsItem } from '../types';
import { 
  Layers, 
  Flame, 
  Globe, 
  Landmark, 
  ShieldAlert, 
  Film, 
  Trophy, 
  TrendingUp, 
  Video, 
  Check, 
  X,
  Filter,
  HeartPulse
} from 'lucide-react';

interface CategoryFilterWidgetProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  publishedNews: NewsItem[];
}

export const CategoryFilterWidget: React.FC<CategoryFilterWidgetProps> = ({
  activeCategory,
  onSelectCategory,
  publishedNews,
}) => {
  // Compute article counts per category
  const getCategoryCount = (cat: string) => {
    if (cat === 'सभी') return publishedNews.length;
    if (cat === 'बिहार एक्सप्रेस') {
      return publishedNews.filter((n) => n.category === 'बिहार एक्सप्रेस' || !!n.district).length;
    }
    return publishedNews.filter((n) => n.category === cat).length;
  };

  const getCategoryIcon = (cat: string, isActive: boolean) => {
    const iconClass = `w-4 h-4 flex-shrink-0 transition-transform ${
      isActive ? 'scale-110 text-white' : 'text-gray-500 group-hover:text-red-600'
    }`;

    switch (cat) {
      case 'सभी':
        return <Layers className={iconClass} />;
      case 'बिहार एक्सप्रेस':
        return <Flame className={`${iconClass} ${isActive ? 'text-yellow-300 fill-yellow-300' : 'text-orange-500 fill-orange-500'}`} />;
      case 'देश':
        return <Globe className={iconClass} />;
      case 'राजनीति':
        return <Landmark className={iconClass} />;
      case 'क्राइम':
        return <ShieldAlert className={iconClass} />;
      case 'मनोरंजन':
        return <Film className={iconClass} />;
      case 'स्पोर्ट्स':
        return <Trophy className={iconClass} />;
      case 'कारोबार':
        return <TrendingUp className={iconClass} />;
      case 'वीडियो':
        return <Video className={iconClass} />;
      case 'हेल्थ':
        return <HeartPulse className={`${iconClass} ${isActive ? 'text-white' : 'text-emerald-500'}`} />;
      default:
        return <Filter className={iconClass} />;
    }
  };

  const categoryList = ['सभी', ...CATEGORIES];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b-2 border-red-700 mb-3.5">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-red-50 text-red-700 rounded-lg">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-black text-gray-900 text-sm uppercase tracking-wide">
              श्रेणी फिल्टर (Category Filter)
            </h3>
            <p className="text-[10px] text-gray-400 font-medium">विषय अनुसार समाचार चुनें</p>
          </div>
        </div>

        {activeCategory !== 'सभी' && (
          <button
            onClick={() => onSelectCategory('सभी')}
            className="flex items-center space-x-1 text-[11px] font-bold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-md transition"
            title="सभी श्रेणियां दिखाएं"
          >
            <X className="w-3 h-3" />
            <span>हटाएं</span>
          </button>
        )}
      </div>

      {/* Categories List */}
      <div className="space-y-1.5">
        {categoryList.map((cat) => {
          const isActive = activeCategory === cat;
          const count = getCategoryCount(cat);

          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition group select-none text-left ${
                isActive
                  ? 'bg-gradient-to-r from-red-800 via-red-700 to-red-800 text-white shadow-md'
                  : 'hover:bg-red-50 text-gray-700 hover:text-red-700'
              }`}
            >
              <div className="flex items-center space-x-2.5 truncate">
                {getCategoryIcon(cat, isActive)}
                <span className="truncate">
                  {cat === 'सभी' ? 'सभी श्रेणियां (All News)' : cat}
                </span>
                {isActive && (
                  <Check className="w-3.5 h-3.5 text-yellow-300 ml-1 flex-shrink-0" />
                )}
              </div>

              {/* Badge Count */}
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold flex-shrink-0 ml-2 transition ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-500 group-hover:bg-red-100 group-hover:text-red-700'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Footer hint */}
      <div className="mt-3 pt-2.5 border-t border-gray-100 text-[10px] text-gray-400 text-center flex items-center justify-center space-x-1">
        <span>क्लिक करके फीड को तुरंत फ़िल्टर करें</span>
      </div>
    </div>
  );
};
