import React, { useState, useEffect } from 'react';
import { 
  NewsItem, 
  ReporterApplication, 
  AdBanner, 
  UserProfile, 
  BIHAR_DISTRICTS, 
  CATEGORIES 
} from './types';
import { db } from './firebase';
import { collection, onSnapshot, query, orderBy, getDocs, updateDoc, doc } from 'firebase/firestore';
import { seedInitialFirestoreData, INITIAL_NEWS, INITIAL_REPORTERS, INITIAL_ADS } from './mockData';
import { ReporterApplicationForm } from './components/ReporterApplicationForm';
import { OurTeam } from './components/OurTeam';
import { ReporterDashboard } from './components/ReporterDashboard';
import { AdminPanel } from './components/AdminPanel';
import { LoginModal } from './components/LoginModal';
import { MediaEmbed } from './components/MediaEmbed';
import { WeatherWidget } from './components/WeatherWidget';
import { CategoryFilterWidget } from './components/CategoryFilterWidget';
import { DailyNewsletterWidget } from './components/DailyNewsletterWidget';
import { SocialHubWidget } from './components/SocialHubWidget';
import { ArticleCommentsSection } from './components/ArticleCommentsSection';
import { ArticleTTSPlayer } from './components/ArticleTTSPlayer';
import { WhatsAppShareFloatingButton } from './components/WhatsAppShareFloatingButton';
import { CircularLogo } from './components/CircularLogo';
import { AdPlacementSlot } from './components/AdPlacementSlot';
import { CricketScoreWidget } from './components/CricketScoreWidget';
import { StockMarketTicker } from './components/StockMarketTicker';
import { RashifalWidget } from './components/RashifalWidget';
import { LiveFMRadioPlayer } from './components/LiveFMRadioPlayer';
import { ReporterProfileBadge } from './components/ReporterProfileBadge';
import {
  Flame,
  Search,
  ChevronDown,
  MapPin,
  Calendar,
  Share2,
  Clock,
  Eye,
  TrendingUp,
  ShieldCheck,
  UserPlus,
  LogIn,
  Users,
  Video,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  Radio,
  BookOpen,
  Type,
  Mail,
  Phone,
  Building,
  Scale,
  Edit3,
  Printer,
  Tag,
  Hash
} from 'lucide-react';

export default function App() {
  // Navigation View State
  const [currentView, setCurrentView] = useState<
    'home' | 'our_team' | 'apply_id' | 'login' | 'reporter_dashboard' | 'admin_panel' | 'article_detail'
  >('home');

  // Selected Article Detail
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);

  // Article Reader Text Size State ('sm' | 'base' | 'lg')
  const [articleTextSize, setArticleTextSize] = useState<'sm' | 'base' | 'lg'>('base');

  // Active Category & District Filter
  const [activeCategory, setActiveCategory] = useState<string>('सभी');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('सभी जिले (All Districts)');
  const [districtDropdownOpen, setDistrictDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auth Session State
  const [loggedInReporter, setLoggedInReporter] = useState<ReporterApplication | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Firestore Live State
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [reporters, setReporters] = useState<ReporterApplication[]>([]);
  const [ads, setAds] = useState<AdBanner[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Smooth Reading Progress Bar State (User Requested: Fills up as user scrolls down article detail page)
  const [readingProgress, setReadingProgress] = useState(0);

  // Track scroll position to update reading progress when reading an article
  useEffect(() => {
    if (currentView !== 'article_detail') {
      setReadingProgress(0);
      return;
    }

    const handleScroll = () => {
      const articleEl = document.getElementById('printable-article');
      if (!articleEl) return;

      const rect = articleEl.getBoundingClientRect();
      const articleTop = rect.top + window.scrollY;
      const articleHeight = rect.height;
      const windowHeight = window.innerHeight;
      const currentScroll = window.scrollY;

      // Calculate progress starting when article top enters viewport up to the bottom of the article
      const totalScrollableDistance = articleHeight - windowHeight + 120;
      if (totalScrollableDistance <= 0) {
        setReadingProgress(100);
        return;
      }

      const scrolledInsideArticle = currentScroll - articleTop;
      const progressPercent = Math.min(
        100,
        Math.max(0, Math.round((scrolledInsideArticle / totalScrollableDistance) * 100))
      );

      setReadingProgress(progressPercent);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [currentView, selectedArticle]);

  // Handle URL Hash-based and Query-Param Direct Links
  // Ensures links shared publicly on WhatsApp, Facebook, SMS, or direct browser entry
  // immediately load the target news article or view even before Firestore initial loading completes
  useEffect(() => {
    const handleUrlRouting = () => {
      const hash = window.location.hash;
      const searchParams = new URLSearchParams(window.location.search);
      const queryArticleId = searchParams.get('article') || searchParams.get('newsId') || searchParams.get('id');
      const queryView = searchParams.get('view');

      // Determine target article ID either from ?article=ID or from #article-ID
      let targetArticleId: string | null = null;
      if (queryArticleId) {
        targetArticleId = queryArticleId;
      } else if (hash && hash.startsWith('#article-')) {
        targetArticleId = hash.replace('#article-', '');
      }

      if (targetArticleId) {
        const found = newsList.find((n) => n.id === targetArticleId);
        if (found) {
          setSelectedArticle(found);
          setCurrentView('article_detail');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        return;
      }

      // Check view routing
      const targetView = queryView || (hash ? hash.replace('#', '') : null);
      if (targetView === 'apply_id') {
        setCurrentView('apply_id');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (targetView === 'our_team') {
        setCurrentView('our_team');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (targetView === 'login') {
        setCurrentView('login');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (targetView === 'home') {
        setCurrentView('home');
      }
    };

    handleUrlRouting();

    window.addEventListener('hashchange', handleUrlRouting);
    window.addEventListener('popstate', handleUrlRouting);
    return () => {
      window.removeEventListener('hashchange', handleUrlRouting);
      window.removeEventListener('popstate', handleUrlRouting);
    };
  }, [newsList]);

  // 1. Initial Firestore Setup & Real-time Listeners
  useEffect(() => {
    // Seed initial data if Firestore collections are empty
    seedInitialFirestoreData();

    // Listen to 'news' collection with safe fallback
    const newsUnsub = onSnapshot(
      collection(db, 'news'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: NewsItem[] = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          })) as NewsItem[];
          // Sort by createdAt descending
          loaded.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          setNewsList(loaded);
        } else {
          // Fallback to initial local items while seeding completes
          setNewsList(INITIAL_NEWS.map((n, idx) => ({ id: `local-news-${idx}`, ...n })));
        }
      },
      (error) => {
        console.warn('News snapshot listener handled:', error.message);
        setNewsList(INITIAL_NEWS.map((n, idx) => ({ id: `local-news-${idx}`, ...n })));
      }
    );

    // Listen to 'reporter_applications' collection safely
    const repUnsub = onSnapshot(
      collection(db, 'reporter_applications'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: ReporterApplication[] = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          })) as ReporterApplication[];
          setReporters(loaded);
        } else {
          setReporters(INITIAL_REPORTERS);
        }
      },
      (error) => {
        // Fallback gracefully for guests/readers without permission
        console.warn('Reporter applications listener restricted for guest:', error.message);
        setReporters(INITIAL_REPORTERS);
      }
    );

    // Listen to 'advertisements' collection safely
    const adUnsub = onSnapshot(
      collection(db, 'advertisements'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: AdBanner[] = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          })) as AdBanner[];
          setAds(loaded);
        } else {
          setAds(INITIAL_ADS);
        }
      },
      (error) => {
        console.warn('Advertisements listener handled:', error.message);
        setAds(INITIAL_ADS);
      }
    );

    return () => {
      newsUnsub();
      repUnsub();
      adUnsub();
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Smooth navigation to widget sections
  const scrollToSection = (sectionId: string) => {
    if (currentView !== 'home') {
      setCurrentView('home');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Filter News
  const publishedNews = newsList.filter((n) => n.status === 'published');
  
  // Breaking news items
  const breakingNews = publishedNews.filter((n) => n.isBreaking);

  // Filter based on activeCategory & selectedDistrict & search
  const filteredNews = publishedNews.filter((item) => {
    // Category match
    const matchesCategory =
      activeCategory === 'सभी' ||
      item.category === activeCategory ||
      (activeCategory === 'बिहार एक्सप्रेस' && item.district);

    // District match
    const matchesDistrict =
      selectedDistrict === 'सभी जिले (All Districts)' ||
      item.district?.includes(selectedDistrict.split(' ')[0]);

    // Search query match
    const matchesSearch =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.district && item.district.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.suggestedTags && item.suggestedTags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    return matchesCategory && matchesDistrict && matchesSearch;
  });

  // Top header ad
  const topAd = ads.find((a) => a.placement === 'header_top' && a.active);
  const sidebarAd = ads.find((a) => a.placement === 'sidebar' && a.active);
  const inlineAd = ads.find((a) => a.placement === 'inline_content' && a.active);

  // Handle article click
  const handleOpenArticle = async (article: NewsItem) => {
    setSelectedArticle(article);
    setCurrentView('article_detail');
    window.location.hash = `article-${article.id}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Increment view count in Firestore
    try {
      if (article.id && !article.id.startsWith('local-')) {
        await updateDoc(doc(db, 'news', article.id), {
          views: (article.views || 0) + 1,
        });
      }
    } catch (err) {
      // non-fatal view update
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8f9] text-[#1c1d1f] flex flex-col font-sans selection:bg-red-700 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl border-l-4 border-red-500 text-xs sm:text-sm font-semibold flex items-center space-x-2 animate-in slide-in-from-bottom duration-300">
          <ShieldCheck className="w-5 h-5 text-green-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOPMOST BAR: Date, Weather, Social & Direct Access Links */}
      <div className="bg-[#1f242e] text-gray-300 text-xs py-1.5 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-2">
          {/* Date & Location & Live Weather */}
          <div className="flex items-center space-x-3 text-[11px]">
            <span className="flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1 text-red-400" />
              {new Date().toLocaleDateString('hi-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            <span className="hidden sm:inline text-gray-600">|</span>
            <span className="hidden md:flex items-center">
              <MapPin className="w-3 h-3 mr-1 text-red-400" />
              बिहार एवं राष्ट्रीय संस्करण
            </span>
            <span className="hidden sm:inline text-gray-600">|</span>
            {/* Real-time Weather Badge */}
            <WeatherWidget
              selectedDistrict={selectedDistrict}
              variant="compact"
              onDistrictClick={() => {
                setDistrictDropdownOpen(true);
                window.scrollTo({ top: 100, behavior: 'smooth' });
              }}
            />
          </div>

          {/* Top Quick Links per brief: 'Our Team', 'Reporter Login', 'Apply for Reporter ID Card' */}
          <div className="flex items-center space-x-4 text-[11px] font-bold">
            <button
              onClick={() => {
                setCurrentView('our_team');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`hover:text-white transition flex items-center space-x-1 ${
                currentView === 'our_team' ? 'text-red-400 underline font-black' : ''
              }`}
            >
              <Users className="w-3.5 h-3.5 text-red-400" />
              <span>Our Team (हमारी टीम)</span>
            </button>

            <button
              onClick={() => {
                setCurrentView('apply_id');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`hover:text-yellow-300 transition text-yellow-400 flex items-center space-x-1 ${
                currentView === 'apply_id' ? 'font-black underline' : ''
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Apply for Reporter ID Card</span>
            </button>

            <button
              onClick={() => {
                if (isAdminLoggedIn) {
                  setCurrentView('admin_panel');
                } else if (loggedInReporter) {
                  setCurrentView('reporter_dashboard');
                } else {
                  setCurrentView('login');
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="bg-red-700 hover:bg-red-600 text-white px-2.5 py-0.5 rounded transition flex items-center space-x-1 shadow-sm"
            >
              <LogIn className="w-3 h-3" />
              <span>
                {isAdminLoggedIn
                  ? 'Admin Portal'
                  : loggedInReporter
                  ? 'Reporter Dashboard'
                  : 'Reporter Login'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* TOP HEADER AD BANNER (Sponsored Header Ad Slot) */}
      {topAd && (
        <div className="bg-gray-200/80 border-b border-gray-300 py-1 text-center">
          <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
            <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-0.5">
              Advertisement • प्रायोजित
            </span>
            <a
              href={topAd.targetUrl}
              target="_blank"
              rel="noreferrer"
              className="block overflow-hidden rounded shadow-sm hover:opacity-95 transition max-h-24 w-full"
            >
              <img
                src={topAd.imageUrl}
                alt={topAd.title}
                className="w-full h-16 sm:h-20 object-cover"
              />
            </a>
          </div>
        </div>
      )}

      {/* MAIN HEADER & BRANDING */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between py-2 sm:py-3.5 gap-2 sm:gap-4">
            {/* Brand Logo & Professional Typography with Red & Gold Gradient Style */}
            <div
              onClick={() => {
                setCurrentView('home');
                setSelectedDistrict('सभी जिले (All Districts)');
                setActiveCategory('सभी');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="cursor-pointer flex items-center justify-start space-x-2.5 sm:space-x-4 select-none group min-w-0 flex-1 md:flex-initial"
            >
              {/* Pure Circular Official Logo */}
              <div className="group-hover:scale-105 transition-transform duration-300 flex-shrink-0 drop-shadow-md">
                <div className="hidden sm:block">
                  <CircularLogo size={78} />
                </div>
                <div className="block sm:hidden">
                  <CircularLogo size={58} />
                </div>
              </div>

              {/* Ultra-Bold, Creative, High-Impact Red and Gold Gradient Masthead Title */}
              <div className="flex flex-col items-start text-left flex-1 min-w-0">
                <div className="flex items-center space-x-1.5 sm:space-x-2.5 flex-wrap">
                  {/* DDN in Deep Metallic Red Gradient with Crisp Shadow */}
                  <span className="font-serif font-black text-3xl sm:text-5xl lg:text-6xl tracking-tight bg-gradient-to-r from-red-950 via-red-700 to-red-800 bg-clip-text text-transparent drop-shadow-sm leading-none">
                    DDN
                  </span>
                  {/* PRIME in Bold Rich Black */}
                  <span className="font-sans font-black text-2xl sm:text-4xl lg:text-5xl tracking-tight text-gray-950 uppercase drop-shadow-sm leading-none">
                    PRIME
                  </span>
                  {/* NEWS in Luxurious Gold Gradient Badge */}
                  <span className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-white font-black text-xs sm:text-base lg:text-lg px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg tracking-wider sm:tracking-widest uppercase shadow-md border border-amber-300/80 leading-tight">
                    NEWS
                  </span>
                </div>

                {/* Subtitle with Live Pulse Indicator */}
                <div className="flex items-center space-x-1.5 sm:space-x-2 mt-1 sm:mt-1.5 max-w-full overflow-hidden">
                  <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5 flex-shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-red-600"></span>
                  </span>
                  <span className="text-[10px] sm:text-xs text-gray-800 font-extrabold tracking-tight sm:tracking-wider uppercase truncate">
                    DARBHANGA DIGITAL NETWORK • सच्ची, निर्भीक और निष्पक्ष पत्रकारिता
                  </span>
                </div>
              </div>
            </div>

            {/* Header Right: Search & Mobile Menu Button */}
            <div className="flex items-center space-x-3 self-center">
              {/* Search Bar */}
              <div className="relative hidden md:block w-56 lg:w-72">
                <input
                  type="text"
                  placeholder="खबरें, जिला या विषय खोजें..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-full text-xs focus:ring-2 focus:ring-red-600 focus:outline-none bg-gray-50/70"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              </div>

              {/* Mobile Menu Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-700 hover:text-red-700"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* PRIMARY NAVIGATION BAR (Signature DDN Prime Navigation with 'Bihar Express' Mega Tab) */}
        <div className="bg-gradient-to-r from-red-800 via-red-700 to-red-800 text-white shadow-inner">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-3">
            <nav className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-1 text-sm font-bold flex-grow mr-2">
              {/* Home Link */}
              <button
                onClick={() => {
                  setCurrentView('home');
                  setActiveCategory('सभी');
                  setSelectedDistrict('सभी जिले (All Districts)');
                }}
                className={`px-3.5 py-2 rounded transition whitespace-nowrap ${
                  currentView === 'home' && activeCategory === 'सभी' && selectedDistrict.startsWith('सभी')
                    ? 'bg-red-950 text-white shadow-inner'
                    : 'hover:bg-red-800/80'
                }`}
              >
                होम
              </button>

              {/* PRIMARY SECTION: "Bihar Express" Mega Category with Full District Selector */}
              <div className="relative group">
                <button
                  onClick={() => {
                    setCurrentView('home');
                    setActiveCategory('बिहार एक्सप्रेस');
                    setDistrictDropdownOpen(!districtDropdownOpen);
                  }}
                  className={`px-3.5 py-2 rounded transition whitespace-nowrap flex items-center space-x-1.5 ${
                    activeCategory === 'बिहार एक्सप्रेस'
                      ? 'bg-yellow-400 text-gray-950 font-black shadow'
                      : 'bg-red-900/80 hover:bg-yellow-400 hover:text-gray-950 text-yellow-300'
                  }`}
                >
                  <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                  <span>बिहार एक्सप्रेस (Bihar Express)</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {/* District Mega Dropdown */}
                {districtDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-[320px] sm:w-[540px] md:w-[680px] bg-white text-gray-900 rounded-xl shadow-2xl border-2 border-red-700 z-50 p-4 max-h-[460px] overflow-y-auto">
                    <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-200">
                      <div className="flex items-center space-x-2 text-xs font-black text-red-700 uppercase tracking-wider">
                        <MapPin className="w-4 h-4 text-red-700" />
                        <span>बिहार के सभी 38 जिले (All 38 Bihar Districts)</span>
                      </div>
                      <button
                        onClick={() => setDistrictDropdownOpen(false)}
                        className="text-xs text-gray-400 hover:text-gray-800 font-bold p-1"
                      >
                        ✕ बंद करें
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs">
                      {BIHAR_DISTRICTS.map((district) => (
                        <button
                          key={district}
                          onClick={() => {
                            setSelectedDistrict(district);
                            setActiveCategory('बिहार एक्सप्रेस');
                            setCurrentView('home');
                            setDistrictDropdownOpen(false);
                          }}
                          className={`text-left px-2.5 py-2 rounded-lg transition font-medium truncate ${
                            selectedDistrict === district
                              ? 'bg-red-700 text-white font-bold shadow-sm'
                              : 'hover:bg-red-50 hover:text-red-700 text-gray-700'
                          }`}
                        >
                          {district}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Other News Categories */}
              {CATEGORIES.filter((c) => c !== 'बिहार एक्सप्रेस').map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setCurrentView('home');
                    setActiveCategory(cat);
                  }}
                  className={`px-3 py-2 rounded transition whitespace-nowrap ${
                    currentView === 'home' && activeCategory === cat
                      ? 'bg-red-950 text-white shadow-inner font-extrabold'
                      : 'hover:bg-red-800/80 text-white/90'
                  }`}
                >
                  {cat}
                </button>
              ))}

              {/* Special Live Feature Tabs (User Requested: Cricket, Rashifal, FM Radio) */}
              <button
                onClick={() => scrollToSection('cricket-section')}
                className="px-2.5 py-1 rounded transition whitespace-nowrap flex items-center space-x-1 text-emerald-300 hover:bg-emerald-950 font-bold text-xs bg-emerald-950/40 border border-emerald-400/50 shadow-xs"
                title="लाइव क्रिकेट स्कोर देखें"
              >
                <span>🏏 लाइव क्रिकेट</span>
              </button>

              <button
                onClick={() => scrollToSection('rashifal-section')}
                className="px-2.5 py-1 rounded transition whitespace-nowrap flex items-center space-x-1 text-amber-300 hover:bg-amber-950 font-bold text-xs bg-amber-950/40 border border-amber-400/50 shadow-xs"
                title="दैनिक राशिफल देखें"
              >
                <span>🔮 राशिफल</span>
              </button>

              <button
                onClick={() => scrollToSection('fm-section')}
                className="px-2.5 py-1 rounded transition whitespace-nowrap flex items-center space-x-1 text-rose-300 hover:bg-rose-950 font-bold text-xs bg-rose-950/40 border border-rose-400/50 shadow-xs"
                title="लाइव रेडियो व एफएम सुनें"
              >
                <span>📻 लाइव रेडियो/FM</span>
              </button>
            </nav>

            {/* Real-time District Weather in Header Navigation Bar */}
            <div className="flex-shrink-0 py-1 hidden lg:block">
              <WeatherWidget
                selectedDistrict={selectedDistrict}
                variant="navbar"
                onDistrictClick={() => setDistrictDropdownOpen(!districtDropdownOpen)}
              />
            </div>
          </div>
        </div>

        {/* BREAKING NEWS TICKER / LIVE UPDATES BAR */}
        <div className="bg-yellow-400 border-b border-yellow-500 text-gray-950 py-1.5 px-4 overflow-hidden flex items-center shadow-sm">
          <div className="max-w-7xl mx-auto w-full flex items-center">
            <div className="flex items-center space-x-1.5 bg-red-700 text-white px-2.5 py-0.5 rounded font-black text-xs uppercase tracking-wider flex-shrink-0 mr-3 shadow-sm animate-pulse">
              <Radio className="w-3.5 h-3.5 text-white" />
              <span>ब्रेकिंग न्यूज़</span>
            </div>

            <div className="relative w-full overflow-hidden whitespace-nowrap text-xs font-bold text-gray-900">
              <div className="animate-marquee inline-block space-x-8">
                {breakingNews.length > 0 ? (
                  breakingNews.map((bn) => (
                    <span
                      key={bn.id}
                      onClick={() => handleOpenArticle(bn)}
                      className="cursor-pointer hover:underline inline-flex items-center space-x-2"
                    >
                      <span className="w-2 h-2 rounded-full bg-red-600 inline-block mr-1"></span>
                      <span>{bn.title}</span>
                    </span>
                  ))
                ) : (
                  <span>
                    • पटना में नए मेट्रो कॉरिडोर को मंजूरी • मुजफ्फरपुर में लीची अनुसंधान की नई प्रजाति • गयाजी विष्णुपद मंदिर कॉरिडोर का मास्टर प्लान तैयार • डीडीएन प्राइम न्यूज़ पर लगातार बने रहें
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* READING PROGRESS BAR AT TOP OF STICKY HEADER (User Requested: Smooth reading progress bar that fills up as user scrolls down article) */}
        {currentView === 'article_detail' && (
          <div className="w-full h-1.5 bg-gray-200/80 overflow-hidden print:hidden relative">
            <div
              className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 transition-all duration-150 ease-out shadow-sm"
              style={{ width: `${readingProgress}%` }}
              role="progressbar"
              aria-valuenow={readingProgress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        )}
      </header>

      {/* 4. STOCK MARKET REAL-TIME TICKER (Requested: Nifty 50, Sensex, Gold, Silver Updates) */}
      <StockMarketTicker />

      {/* MOBILE MENU ACCORDION */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 p-4 space-y-3 shadow-lg">
          <div className="relative mb-3">
            <input
              type="text"
              placeholder="सर्च करें..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>

          {/* Quick Mobile Feature Shortcuts */}
          <div className="grid grid-cols-3 gap-1.5 text-center text-xs font-bold pb-2 border-b border-gray-100">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                scrollToSection('cricket-section');
              }}
              className="p-2 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200"
            >
              🏏 क्रिकेट स्कोर
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                scrollToSection('rashifal-section');
              }}
              className="p-2 bg-amber-50 text-amber-800 rounded-lg border border-amber-200"
            >
              🔮 राशिफल
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                scrollToSection('fm-section');
              }}
              className="p-2 bg-rose-50 text-rose-800 rounded-lg border border-rose-200"
            >
              📻 रेडियो / FM
            </button>
          </div>

          {/* Mobile News Categories Grid */}
          <div className="pt-2 border-t border-gray-100">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
              समाचार श्रेणियां (Categories)
            </span>
            <div className="flex flex-wrap gap-1.5 text-xs">
              <button
                onClick={() => {
                  setCurrentView('home');
                  setActiveCategory('सभी');
                  setSelectedDistrict('सभी जिले (All Districts)');
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  activeCategory === 'सभी' ? 'bg-red-700 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                सभी खबरें
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setCurrentView('home');
                    setActiveCategory(c);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold transition ${
                    activeCategory === c ? 'bg-red-700 text-white' : 'bg-gray-100 hover:bg-red-50 text-gray-700'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            <button
              onClick={() => {
                setCurrentView('our_team');
                setMobileMenuOpen(false);
              }}
              className="p-2.5 bg-gray-50 border rounded-lg text-gray-800 flex items-center space-x-2"
            >
              <Users className="w-4 h-4 text-red-600" />
              <span>हमारी टीम (Our Team)</span>
            </button>
            <button
              onClick={() => {
                setCurrentView('apply_id');
                setMobileMenuOpen(false);
              }}
              className="p-2.5 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 flex items-center space-x-2"
            >
              <UserPlus className="w-4 h-4 text-yellow-600" />
              <span>आईडी कार्ड आवेदन</span>
            </button>
          </div>

          {/* Mobile Real-time Weather Info */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
            <WeatherWidget
              selectedDistrict={selectedDistrict}
              variant="navbar"
              onDistrictClick={() => {
                setMobileMenuOpen(false);
                setDistrictDropdownOpen(true);
              }}
            />
          </div>
        </div>
      )}

      {/* ACTIVE DISTRICT FILTER NOTICE BANNER */}
      {selectedDistrict !== 'सभी जिले (All Districts)' && currentView === 'home' && (
        <div className="bg-red-50 border-b border-red-200 py-2.5 px-4 text-xs font-semibold text-red-900">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>
                  वर्तमान में <strong>{selectedDistrict}</strong> की विशेष खबरें प्रदर्शित हो रही हैं।
                </span>
              </div>
              <div className="hidden sm:block">
                <WeatherWidget selectedDistrict={selectedDistrict} variant="compact" />
              </div>
            </div>
            <button
              onClick={() => setSelectedDistrict('सभी जिले (All Districts)')}
              className="text-red-700 hover:underline font-bold"
            >
              सभी जिले देखें ✕
            </button>
          </div>
        </div>
      )}

      {/* 2. DISTRICT LEVEL ADVERTISEMENT SLOT (डिस्ट्रिक्ट पेज विज्ञापन) */}
      {selectedDistrict !== 'सभी जिले (All Districts)' && currentView === 'home' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3">
          <AdPlacementSlot
            placementKey="district_local"
            customTitle={`${selectedDistrict} स्थानीय व्यापार व प्रायोजित विज्ञापन स्लॉट`}
            adList={ads}
            onBookAdClick={() => showToast('जिला विज्ञापन बुकिंग हेतु संपर्क करें: +91 9341050287')}
          />
        </div>
      )}

      {/* 2. STATE LEVEL ADVERTISEMENT SLOT (राज्य पेज विज्ञापन) */}
      {activeCategory === 'बिहार एक्सप्रेस' && currentView === 'home' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3">
          <AdPlacementSlot
            placementKey="feed_native"
            customTitle="बिहार राज्य विशेष प्रायोजित विज्ञापन स्लॉट (State Sponsored Slot)"
            adList={ads}
            onBookAdClick={() => showToast('राज्य विज्ञापन बुकिंग हेतु संपर्क करें: +91 9341050287')}
          />
        </div>
      )}

      {/* MAIN VIEW CONTROLLER */}
      <main className="flex-grow">
        {/* VIEW 1: OUR TEAM PAGE */}
        {currentView === 'our_team' && (
          <OurTeam
            reporters={reporters}
            loggedInReporter={loggedInReporter}
            isAdminLoggedIn={isAdminLoggedIn}
            onReporterLoginSuccess={(reporter) => {
              setLoggedInReporter(reporter);
              setIsAdminLoggedIn(false);
              showToast(`स्वागत है ${reporter.fullName}! अब आप अपना पहचान पत्र व लेटर डाउनलोड कर सकते हैं।`);
            }}
            onAdminLoginSuccess={() => {
              setIsAdminLoggedIn(true);
              setLoggedInReporter(null);
              showToast('एडमिन सत्यापन सफल! डाउनलोड अनुमतियां सक्रिय हैं।');
            }}
            onApplyClick={() => {
              setCurrentView('apply_id');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* VIEW 2: APPLY FOR REPORTER ID CARD */}
        {currentView === 'apply_id' && (
          <ReporterApplicationForm
            onBack={() => setCurrentView('home')}
            onSuccessToast={showToast}
          />
        )}

        {/* VIEW 3: LOGIN MODAL (Reporter & Admin) */}
        {currentView === 'login' && (
          <LoginModal
            onBack={() => setCurrentView('home')}
            reporters={reporters}
            onReporterLoginSuccess={(reporter) => {
              setLoggedInReporter(reporter);
              setIsAdminLoggedIn(false);
              setCurrentView('reporter_dashboard');
              showToast(`स्वागत है ${reporter.fullName}!`);
            }}
            onAdminLoginSuccess={() => {
              setIsAdminLoggedIn(true);
              setLoggedInReporter(null);
              setCurrentView('admin_panel');
              showToast('एडमिन कंट्रोल पैनल में आपका स्वागत है!');
            }}
          />
        )}

        {/* VIEW 4: REPORTER DASHBOARD */}
        {currentView === 'reporter_dashboard' && loggedInReporter && (
          <ReporterDashboard
            currentReporter={loggedInReporter}
            reporterNews={newsList.filter((n) => n.authorId === loggedInReporter.id || n.authorName === loggedInReporter.fullName)}
            onLogout={() => {
              setLoggedInReporter(null);
              setCurrentView('home');
              showToast('सफलतापूर्वक लॉगआउट किया गया।');
            }}
            onRefreshData={() => {}}
            onSuccessToast={showToast}
          />
        )}

        {/* VIEW 5: ADMIN PANEL */}
        {currentView === 'admin_panel' && (
          <AdminPanel
            newsList={newsList}
            reporters={reporters}
            ads={ads}
            onLogout={() => {
              setIsAdminLoggedIn(false);
              setCurrentView('home');
              showToast('एडमिन सत्र समाप्त हुआ।');
            }}
            onRefreshData={() => {}}
            onSuccessToast={showToast}
          />
        )}

        {/* VIEW 6: ARTICLE FULL DETAIL VIEW */}
        {currentView === 'article_detail' && selectedArticle && (
          <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
            <div className="flex items-center justify-between mb-4 print:hidden">
              <button
                onClick={() => {
                  window.history.pushState(null, '', window.location.pathname);
                  setCurrentView('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-xs font-bold text-gray-500 hover:text-red-700 flex items-center space-x-1"
              >
                <span>← मुख्य समाचार सूची पर वापस जाएं</span>
              </button>

              {/* Reading Progress Indicator Badge */}
              <div className="flex items-center space-x-2 text-xs font-bold text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-2xs">
                <BookOpen className="w-3.5 h-3.5 text-red-600" />
                <span>रीडिंग प्रोग्रेस:</span>
                <span className="text-red-700 font-black">{readingProgress}%</span>
              </div>
            </div>

            <article
              id="printable-article"
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden p-6 sm:p-10 relative"
            >
              {/* Top Article Card Reading Progress Strip */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100 print:hidden overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 transition-all duration-150 ease-out"
                  style={{ width: `${readingProgress}%` }}
                />
              </div>

              {/* Printable-only DDN Prime News Letterhead Header (Appears only on printed paper/PDF) */}
              <div className="hidden print:block border-b-2 border-red-800 pb-4 mb-6 text-center">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-xs tracking-widest text-red-700 font-bold uppercase font-sans">
                      Government Registered Digital News & Media Network
                    </span>
                    <h1 className="text-3xl font-black text-red-900 tracking-tight">
                      DDN PRIME NEWS
                    </h1>
                    <p className="text-xs text-gray-700 font-semibold mt-0.5">
                      डी डी एन प्राइम न्यूज़ • निष्पक्ष, निर्भीक एवं सटीक पत्रकारिता
                    </p>
                  </div>
                  <div className="text-right text-[10px] text-gray-500">
                    <div>पोर्टल: ddnprimenews.in</div>
                    <div>दिनांक: {new Date().toLocaleDateString('hi-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                  </div>
                </div>
              </div>

              {/* Category & District Tags */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="bg-red-700 text-white font-bold text-xs px-3 py-1 rounded-full uppercase">
                  {selectedArticle.category}
                </span>
                {selectedArticle.district && (
                  <span className="bg-gray-100 text-gray-800 font-semibold text-xs px-3 py-1 rounded-full flex items-center">
                    <MapPin className="w-3 h-3 text-red-600 mr-1" />
                    {selectedArticle.district}
                  </span>
                )}
                {selectedArticle.isBreaking && (
                  <span className="bg-yellow-400 text-gray-950 font-black text-xs px-2.5 py-1 rounded-full animate-pulse print:hidden">
                    BREAKING NEWS
                  </span>
                )}
              </div>

              {/* 1. TOP OF ARTICLE ADVERTISEMENT SLOT (हर न्यूज़ के पास विज्ञापन लगाने की जगह - hidden during print) */}
              <div className="print:hidden">
                <AdPlacementSlot
                  placementKey="article_top"
                  customTitle="खबर मुख्य प्रायोजक विज्ञापन स्लॉट (Article Top Ad Space)"
                  adList={ads}
                  onBookAdClick={() => showToast('विज्ञापन बुकिंग हेतु संपर्क करें: +91 9341050287')}
                />
              </div>

              {/* Title & Subtitle */}
              <h1 className="text-2xl sm:text-4xl font-black text-gray-900 leading-tight mb-3">
                {selectedArticle.title}
              </h1>
              {selectedArticle.subTitle && (
                <p className="text-base sm:text-lg font-semibold text-gray-600 mb-4 leading-snug">
                  {selectedArticle.subTitle}
                </p>
              )}

              {/* Author & Timestamp Bar */}
              <div className="flex flex-wrap items-center justify-between py-3 border-y border-gray-100 mb-6 text-xs text-gray-500 gap-2">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold">
                    {selectedArticle.authorName.charAt(0)}
                  </div>
                  <div>
                    <span className="font-bold text-gray-800">{selectedArticle.authorName}</span>
                    <span className="text-gray-400 mx-1.5">•</span>
                    <span>
                      {new Date(selectedArticle.createdAt).toLocaleString('hi-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5 text-gray-500 print:hidden">
                  {/* Print this news button (User Requested: triggers window.print(), hides ads/nav, clean printout) */}
                  <button
                    onClick={() => window.print()}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-900 hover:bg-black text-white rounded-lg font-bold text-xs shadow-xs transition active:scale-95"
                    title="यह समाचार प्रिंट करें अथवा PDF में सुरक्षित करें"
                  >
                    <Printer className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Print this news (प्रिंट करें)</span>
                  </button>

                  {/* Admin Direct Edit Action */}
                  {isAdminLoggedIn && (
                    <button
                      onClick={() => {
                        setCurrentView('admin_panel');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        showToast(`एडमिन पैनल में 'रिपोर्टर न्यूज़ मॉडरेशन' पर जाकर "${selectedArticle.title.slice(0, 30)}..." एडिट करें`);
                      }}
                      className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-xs transition"
                      title="एडमिन द्वारा यह समाचार संपादित करें"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>खबर एडिट करें</span>
                    </button>
                  )}

                  {/* WhatsApp Quick Share Header Button */}
                  {(() => {
                    const origin = window.location.origin;
                    const directUrl = `${origin}/#article-${selectedArticle.id}`;
                    return (
                      <a
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                          `🔴 *DDN PRIME NEWS*\n📰 *${selectedArticle.district ? `[${selectedArticle.district}] ` : ''}${selectedArticle.title}*\n\n👉 पूरी खबर पढ़ें:\n${directUrl}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 px-3 py-1 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-lg font-bold text-xs shadow-xs transition active:scale-95"
                        title="व्हाट्सएप पर शेयर करें"
                      >
                        <span>शेयर WhatsApp</span>
                      </a>
                    );
                  })()}

                  {/* Text Size Control */}
                  <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg border border-gray-200">
                    <span className="text-[10px] font-bold text-gray-500 px-1 hidden sm:inline flex items-center">
                      <Type className="w-3 h-3 mr-0.5 inline" /> फ़ॉन्ट:
                    </span>
                    <button
                      type="button"
                      onClick={() => setArticleTextSize('sm')}
                      title="छोटा अक्षर (Small Font)"
                      className={`px-2 py-0.5 text-xs font-bold rounded transition ${
                        articleTextSize === 'sm'
                          ? 'bg-red-700 text-white shadow-sm'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      A-
                    </button>
                    <button
                      type="button"
                      onClick={() => setArticleTextSize('base')}
                      title="सामान्य अक्षर (Medium Font)"
                      className={`px-2 py-0.5 text-xs font-bold rounded transition ${
                        articleTextSize === 'base'
                          ? 'bg-red-700 text-white shadow-sm'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      A
                    </button>
                    <button
                      type="button"
                      onClick={() => setArticleTextSize('lg')}
                      title="बड़ा अक्षर (Large Font)"
                      className={`px-2 py-0.5 text-xs font-bold rounded transition ${
                        articleTextSize === 'lg'
                          ? 'bg-red-700 text-white shadow-sm'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      A+
                    </button>
                  </div>

                  <span className="flex items-center text-gray-400">
                    <Eye className="w-3.5 h-3.5 mr-1" /> {selectedArticle.views} व्यूज
                  </span>
                </div>
              </div>

              {/* Verified Reporter Profile Badge (Top placement for immediate author authenticity & press credentials) */}
              {(() => {
                const matchedReporter = reporters.find(
                  (r) =>
                    (selectedArticle.authorId && r.id === selectedArticle.authorId) ||
                    (r.fullName && r.fullName.trim().toLowerCase() === selectedArticle.authorName.trim().toLowerCase())
                );

                return (
                  <div className="mb-6 print:hidden">
                    <ReporterProfileBadge
                      reporter={matchedReporter}
                      authorName={selectedArticle.authorName}
                      authorDistrict={selectedArticle.district || selectedArticle.authorDistrict}
                      authorRole={selectedArticle.authorRole}
                      allReporters={reporters}
                      isAdminLoggedIn={isAdminLoggedIn}
                      loggedInReporter={loggedInReporter}
                      onReporterLoginSuccess={(rep) => {
                        setLoggedInReporter(rep);
                        setIsAdminLoggedIn(false);
                        showToast(`स्वागत है ${rep.fullName}! अब आप अपना पहचान पत्र व लेटर डाउनलोड कर सकते हैं।`);
                      }}
                      onAdminLoginSuccess={() => {
                        setIsAdminLoggedIn(true);
                        setLoggedInReporter(null);
                        showToast('एडमिन सत्यापन सफल! डाउनलोड अनुमतियां सक्रिय हैं।');
                      }}
                      onViewOurTeam={() => {
                        setCurrentView('our_team');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    />
                  </div>
                );
              })()}

              {/* Text-to-Speech (TTS) Audio Player (Hidden during print) */}
              <div className="print:hidden">
                <ArticleTTSPlayer
                  title={selectedArticle.title}
                  summary={selectedArticle.summary}
                  content={selectedArticle.content}
                />
              </div>

              {/* Featured Image */}
              {selectedArticle.imageUrl && (
                <div className="rounded-xl overflow-hidden mb-6 shadow-sm border border-gray-200">
                  <img
                    src={selectedArticle.imageUrl}
                    alt={selectedArticle.title}
                    className="w-full max-h-[480px] object-cover"
                  />
                  <div className="p-2 text-[11px] text-gray-500 bg-gray-50 italic">
                    फोटो: डीडीएन प्राइम न्यूज़ ब्यूरो / विशेष संवाददाता
                  </div>
                </div>
              )}

              {/* Media Embeds (YouTube, FB, Insta - Hidden during print) */}
              {selectedArticle.mediaEmbeds && selectedArticle.mediaEmbeds.length > 0 && (
                <div className="mb-6 print:hidden">
                  {selectedArticle.mediaEmbeds.map((url, idx) => (
                    <MediaEmbed key={idx} url={url} />
                  ))}
                </div>
              )}

              {/* Summary Highlight Box */}
              <div
                className={`bg-red-50/60 border-l-4 border-red-700 p-4 rounded-r-xl mb-6 font-semibold text-gray-800 transition-all ${
                  articleTextSize === 'sm'
                    ? 'text-xs leading-normal'
                    : articleTextSize === 'lg'
                    ? 'text-base sm:text-lg leading-relaxed'
                    : 'text-sm leading-relaxed'
                }`}
              >
                {selectedArticle.summary}
              </div>

              {/* 2. MID-ARTICLE / INLINE ADVERTISEMENT SLOT (Hidden during print) */}
              <div className="print:hidden">
                <AdPlacementSlot
                  placementKey="inline"
                  customTitle="समाचार इन-लाइन विज्ञापन स्लॉट (In-Article Ad Space)"
                  adList={ads}
                  onBookAdClick={() => showToast('विज्ञापन बुकिंग हेतु संपर्क करें: +91 9341050287')}
                />
              </div>

              {/* Detailed Content */}
              <div
                className={`text-gray-800 space-y-4 whitespace-pre-line font-normal transition-all ${
                  articleTextSize === 'sm'
                    ? 'text-sm leading-normal'
                    : articleTextSize === 'lg'
                    ? 'text-lg sm:text-xl leading-loose font-normal'
                    : 'text-base leading-relaxed'
                }`}
              >
                {selectedArticle.content}
              </div>

              {/* Inline Content Custom Banner if present (Hidden during print) */}
              {inlineAd && (
                <div className="my-8 p-4 bg-gray-50 rounded-xl border border-gray-200 text-center print:hidden">
                  <span className="text-[10px] uppercase text-gray-400 font-bold block mb-1">
                    विज्ञापन • {inlineAd.sponsorName}
                  </span>
                  <a href={inlineAd.targetUrl} target="_blank" rel="noreferrer" className="block">
                    <img
                      src={inlineAd.imageUrl}
                      alt={inlineAd.title}
                      className="w-full max-h-48 object-cover rounded-lg"
                    />
                  </a>
                </div>
              )}

              {/* Tag Cloud Section (User Requested: Add a tag cloud section at the bottom of the article detail page displaying suggestedTags, making each tag clickable to filter news by that specific topic) */}
              {(() => {
                // Get suggestedTags from article or generate contextually from category & district & title
                const rawTags = selectedArticle.suggestedTags && selectedArticle.suggestedTags.length > 0
                  ? selectedArticle.suggestedTags
                  : [
                      selectedArticle.category,
                      selectedArticle.district ? selectedArticle.district.split(' ')[0] : 'बिहार',
                      'ताजा खबर',
                      'डीडीएन प्राइम न्यूज़',
                      'ब्रेकिंग न्यूज़',
                    ].filter(Boolean);

                // Deduplicate tags
                const tags = Array.from(new Set(rawTags));

                return (
                  <div className="my-8 p-5 bg-gradient-to-r from-gray-50 via-red-50/20 to-gray-50 rounded-2xl border border-gray-200">
                    <div className="flex items-center space-x-2 text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                      <Tag className="w-3.5 h-3.5 text-red-600" />
                      <span>ट्रेंडिंग विषय व टैग्स (Related Topics & Tags):</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSearchQuery(tag);
                            setCurrentView('home');
                            window.scrollTo({ top: 400, behavior: 'smooth' });
                            showToast(`विषय "${tag}" से संबंधित समाचार फ़िल्टर किए गए`);
                          }}
                          className="group inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-red-700 text-gray-700 hover:text-white rounded-xl text-xs font-bold border border-gray-200 hover:border-red-700 shadow-2xs hover:shadow-sm transition-all duration-200 cursor-pointer active:scale-95"
                          title={`क्लिक करें: "${tag}" विषय पर सभी समाचार देखें`}
                        >
                          <Hash className="w-3 h-3 text-red-500 group-hover:text-yellow-300 transition-colors" />
                          <span>{tag}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* 3. BOTTOM OF ARTICLE ADVERTISEMENT SLOT (Hidden during print) */}
              <div className="print:hidden">
                <AdPlacementSlot
                  placementKey="article_bottom"
                  customTitle="न्यूज़ एंड-आर्टिकल प्रमोशन स्लॉट (Article End Ad Space)"
                  adList={ads}
                  onBookAdClick={() => showToast('विज्ञापन बुकिंग हेतु संपर्क करें: +91 9341050287')}
                />
              </div>

              {/* Print Footer Disclaimer & Copyright (Only on print) */}
              <div className="hidden print:block mt-8 pt-4 border-t border-gray-300 text-[10px] text-gray-600 text-center">
                © {new Date().getFullYear()} DDN Prime News Network • निष्पक्ष, निर्भीक एवं सटीक पत्रकारिता • ddnprimenews.in
              </div>

              {/* Related News Section (Hidden during print) */}
              <div className="print:hidden">
                {(() => {
                  const relatedItems = publishedNews
                    .filter(
                      (item) =>
                        item.id !== selectedArticle.id &&
                        (item.category === selectedArticle.category ||
                          (selectedArticle.district && item.district === selectedArticle.district))
                    )
                    .slice(0, 4);

                  if (relatedItems.length === 0) return null;

                  return (
                    <div className="mt-10 pt-8 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center space-x-2">
                          <div className="w-2.5 h-6 bg-red-700 rounded-sm" />
                          <h3 className="text-xl font-black text-gray-900">
                            संबंधित खबरें (Related News)
                          </h3>
                        </div>
                        <span className="text-xs text-gray-500 font-semibold">
                          {selectedArticle.category} {selectedArticle.district ? `• ${selectedArticle.district}` : ''}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {relatedItems.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => handleOpenArticle(item)}
                            className="group border border-gray-200 hover:border-red-500 rounded-xl p-3.5 bg-gray-50/50 hover:bg-white transition cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-md"
                          >
                            <div>
                              <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-gray-100 mb-2.5">
                                {item.imageUrl ? (
                                  <img
                                    src={item.imageUrl}
                                    alt={item.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                                    DDN Prime
                                  </div>
                                )}
                                <span className="absolute top-2 left-2 bg-red-700 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                                  {item.category}
                                </span>
                              </div>

                              <h4 className="font-bold text-sm text-gray-900 group-hover:text-red-700 transition line-clamp-2 leading-snug">
                                {item.title}
                              </h4>

                              {item.summary && (
                                <p className="text-xs text-gray-600 line-clamp-2 mt-1.5 leading-relaxed">
                                  {item.summary}
                                </p>
                              )}
                            </div>

                            <div className="mt-3 pt-2.5 border-t border-gray-200/80 flex items-center justify-between text-[11px] text-gray-500">
                              <span className="flex items-center text-gray-700 font-medium">
                                <MapPin className="w-3 h-3 text-red-600 mr-1" />
                                {item.district || 'बिहार'}
                              </span>
                              <span className="flex items-center text-red-700 font-bold group-hover:underline">
                                पढ़ें <ChevronRight className="w-3 h-3 ml-0.5" />
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Interactive Reader Comments & Community Discussions */}
                <ArticleCommentsSection
                  articleId={selectedArticle.id}
                  articleTitle={selectedArticle.title}
                  loggedInReporter={loggedInReporter}
                  isAdminLoggedIn={isAdminLoggedIn}
                  onNavigateLogin={() => {
                    setCurrentView('login');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onSuccessToast={showToast}
                />

                {/* Footer Share & Back */}
                <div className="mt-8 pt-6 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => setCurrentView('home')}
                    className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-lg transition"
                  >
                    ← अन्य खबरें पढ़ें
                  </button>

                  <div className="flex items-center space-x-2">
                    {/* Dedicated WhatsApp Share Button */}
                    {(() => {
                      const origin = window.location.origin;
                      const directUrl = `${origin}/#article-${selectedArticle.id}`;
                      return (
                        <a
                          href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                            `🔴 *DDN PRIME NEWS*\n📰 *${selectedArticle.district ? `[${selectedArticle.district}] ` : ''}${selectedArticle.title}*\n\n👉 पूरी खबर पढ़ें:\n${directUrl}\n\n📲 निष्पक्ष व सटीक पत्रकारिता के लिए DDN Prime News से जुड़े रहें।`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1.5 px-4 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold rounded-lg shadow-sm transition active:scale-95"
                          title="व्हाट्सएप पर शेयर करें"
                        >
                          <span>व्हाट्सएप शेयर</span>
                        </a>
                      );
                    })()}

                    <button
                      onClick={() => {
                        const directUrl = `${window.location.origin}/#article-${selectedArticle.id}`;
                        navigator.clipboard.writeText(directUrl);
                        showToast('समाचार का डायरेक्ट लिंक कॉपी किया गया!');
                      }}
                      className="flex items-center space-x-1 px-4 py-2 bg-red-50 text-red-700 text-xs font-bold rounded-lg border border-red-200 hover:bg-red-100 transition"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>लिंक कॉपी करें</span>
                    </button>
                  </div>
                </div>
              </div>
            </article>

            {/* FLOATING WHATSAPP SHARE BUTTON (Requested: Quick Social Spread) */}
            <WhatsAppShareFloatingButton
              title={selectedArticle.title}
              summary={selectedArticle.summary}
              category={selectedArticle.category}
              district={selectedArticle.district}
              articleId={selectedArticle.id}
            />
          </div>
        )}

        {/* VIEW 7: PORTAL HOMEPAGE (DDN Prime Broadcast Layout) */}
        {currentView === 'home' && (
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6">
            {/* 1. HOMEPAGE TOP LEADERBOARD ADVERTISEMENT (होम पेज पर विज्ञापन लगाने की जगह) */}
            <AdPlacementSlot
              placementKey="header"
              customTitle="डीडीएन प्राइम मुख्य बैनर विज्ञापन (Homepage Leaderboard Ad)"
              adList={ads}
              onBookAdClick={() => showToast('विज्ञापन बुकिंग हेतु संपर्क करें: +91 9341050287')}
            />

            {/* Lead Layout: Big Featured Headline (Left 8 cols) + Top Stories Sidebar (Right 4 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
              {/* Main Featured Hero Story (8 cols) */}
              <div className="lg:col-span-8 flex flex-col space-y-6">
                {filteredNews.length > 0 ? (
                  (() => {
                    const heroNews = filteredNews[0];
                    return (
                      <div
                        onClick={() => handleOpenArticle(heroNews)}
                        className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col"
                      >
                        <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-900">
                          <img
                            src={heroNews.imageUrl}
                            alt={heroNews.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          <div className="absolute bottom-4 left-4 right-4 text-white">
                            <span className="bg-red-700 text-white text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider inline-block mb-2">
                              {heroNews.category} {heroNews.district ? `• ${heroNews.district}` : ''}
                            </span>
                            <h2 className="text-xl sm:text-3xl font-black leading-tight group-hover:text-yellow-300 transition line-clamp-3">
                              {heroNews.title}
                            </h2>
                          </div>
                        </div>

                        <div className="p-5 flex-grow flex flex-col justify-between">
                          <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed mb-4">
                            {heroNews.summary}
                          </p>

                          <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-gray-800">{heroNews.authorName}</span>
                              <span>•</span>
                              <span>{new Date(heroNews.createdAt).toLocaleDateString('hi-IN')}</span>
                            </div>
                            <span className="text-red-700 font-bold group-hover:underline flex items-center">
                              पूरी खबर पढ़ें <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <h3 className="text-lg font-bold text-gray-700">कोई समाचार उपलब्ध नहीं</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      इस श्रेणी अथवा जिले के लिए कोई खबर नहीं मिली। कृपया दूसरा जिला चुनें।
                    </p>
                  </div>
                )}

                {/* 2. LIVE CRICKET SCORECARD (लाइव क्रिकेट स्कोर) */}
                <div id="cricket-section" className="scroll-mt-24">
                  <CricketScoreWidget />
                </div>

                {/* Sub-lead 2-Column Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredNews.slice(1, 5).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleOpenArticle(item)}
                      className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer flex flex-col group p-3.5"
                    >
                      <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-gray-100 mb-3">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <span className="absolute top-2 left-2 bg-red-700 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                          {item.category}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-gray-900 group-hover:text-red-700 transition line-clamp-2 leading-snug">
                        {item.title}
                      </h3>
                      <div className="mt-auto pt-2 flex items-center justify-between text-[11px] text-gray-400">
                        <span>{item.district || 'बिहार'}</span>
                        <span className="flex items-center">
                          <Eye className="w-3 h-3 mr-1" /> {item.views}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 3. IN-FEED NATIVE ADVERTISEMENT SLOT (खबरों के बीच प्रायोजित विज्ञापन) */}
                <AdPlacementSlot
                  placementKey="feed_native"
                  customTitle="होम समाचार इन-फीड प्रायोजित विज्ञापन (In-Feed Sponsor Slot)"
                  adList={ads}
                  onBookAdClick={() => showToast('विज्ञापन बुकिंग हेतु संपर्क करें: +91 9341050287')}
                />
              </div>

              {/* Sidebar Right (4 cols): DDN Prime Fast News Updates & Sponsor Ads */}
              <div className="lg:col-span-4 space-y-6">
                {/* Category Filter Widget */}
                <CategoryFilterWidget
                  activeCategory={activeCategory}
                  onSelectCategory={(cat) => {
                    setActiveCategory(cat);
                  }}
                  publishedNews={publishedNews}
                />

                {/* Live Fast News List (बड़ी खबरें) */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b-2 border-red-700 mb-4">
                    <h3 className="font-black text-gray-900 text-base uppercase flex items-center">
                      <Flame className="w-4 h-4 text-red-600 mr-1.5" />
                      बिहार बड़ी खबरें (Trending)
                    </h3>
                    <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
                      लाइव
                    </span>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {filteredNews.slice(0, 7).map((item, idx) => (
                      <div
                        key={item.id}
                        onClick={() => handleOpenArticle(item)}
                        className="py-3 cursor-pointer group flex items-start space-x-3"
                      >
                        <span className="text-sm font-black text-red-700/60 font-mono flex-shrink-0">
                          0{idx + 1}
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-gray-800 group-hover:text-red-700 transition leading-snug">
                            {item.title}
                          </h4>
                          <span className="text-[10px] text-gray-400 mt-0.5 block">
                            {item.district || 'बिहार'} • {new Date(item.createdAt).toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sidebar Ad Placement Slot (हर समय विज्ञापन का स्थान) */}
                <AdPlacementSlot
                  placementKey="sidebar"
                  customTitle="प्रायोजित साइडबार विज्ञापन (Sidebar Sponsor)"
                  adList={ads}
                  onBookAdClick={() => showToast('विज्ञापन बुकिंग हेतु संपर्क करें: +91 9341050287')}
                />

                {/* Daily Newsletter Subscription Form Widget */}
                <DailyNewsletterWidget />

                {/* Social Hub Widget (Official Facebook & X / Twitter Feeds) */}
                <SocialHubWidget />

                {/* Quick District Grid Widget (DDN Prime District Desk) */}
                <div className="bg-gradient-to-br from-red-900 to-red-950 text-white rounded-2xl p-5 shadow-md">
                  <h4 className="font-black text-sm uppercase tracking-wider mb-2 flex items-center">
                    <MapPin className="w-4 h-4 text-yellow-400 mr-1.5" />
                    जिलेवार खबरें (District Desk)
                  </h4>
                  <p className="text-[11px] text-red-200 mb-3">
                    अपने जिले का चुनाव करें और पाएं सबसे सटीक स्थानीय समाचार:
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    {['पटना (Patna)', 'मुजफ्फरपुर (Muzaffarpur)', 'गया (Gaya)', 'भागलपुर (Bhagalpur)', 'दरभंगा (Darbhanga)', 'पूर्णिया (Purnia)'].map(
                      (d) => (
                        <button
                          key={d}
                          onClick={() => {
                            setSelectedDistrict(d);
                            setActiveCategory('बिहार एक्सप्रेस');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="bg-white/10 hover:bg-yellow-400 hover:text-gray-950 p-2 rounded text-left font-semibold text-[11px] transition truncate"
                        >
                          {d.split(' ')[0]}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 4. DAILY RASHIFAL WIDGET (दैनिक राशिफल - 12 राशियां) */}
            <div id="rashifal-section" className="scroll-mt-24 mb-10">
              <RashifalWidget />
            </div>

            {/* 5. LIVE FM RADIO PLAYER (लाइव एफएम व रेडियो स्टेशन) */}
            <div id="fm-section" className="scroll-mt-24 mb-10">
              <LiveFMRadioPlayer />
            </div>

            {/* SPECIAL VIDEO SECTION (ब्रीफ के अनुसार विशेष वीडियो सेक्शन) */}
            <div className="my-10 bg-gray-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-gray-800 mb-6">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
                    <Video className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                      डीडीएन विशेष वीडियो बुलेटिन (DDN Prime Video Hub)
                    </h3>
                    <p className="text-xs text-gray-400">
                      YouTube, Facebook और Instagram Reels पर प्रसारित एक्सक्लूसिव ग्राउंड रिपोर्ट्स
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 p-4">
                  <div className="text-xs font-bold text-red-400 mb-2">पटना मेट्रो ट्रायल रन एक्सक्लूसिव रिपोर्ट</div>
                  <MediaEmbed url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" />
                  <p className="text-xs text-gray-300 mt-2">
                    पटना में पहले भूमिगत मेट्रो स्टेशन का निर्माण कार्य संपन्न, देखिए ग्राउंड रिपोर्ट।
                  </p>
                </div>

                <div className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 p-4">
                  <div className="text-xs font-bold text-yellow-400 mb-2">शाही लीची बागानों से सीधी कवरेज</div>
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-black flex items-center justify-center">
                    <img
                      src="https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&fit=crop&q=80"
                      alt=""
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute w-12 h-12 rounded-full bg-red-600/90 flex items-center justify-center text-white shadow-lg">
                      ▶
                    </div>
                  </div>
                  <p className="text-xs text-gray-300 mt-2">
                    मुजफ्फरपुर के लीची किसानों के लिए नई तकनीक से बढ़ी शेल्फ लाइफ।
                  </p>
                </div>

                <div className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 p-4">
                  <div className="text-xs font-bold text-blue-400 mb-2">विष्णुपद कॉरिडोर मास्टर प्लान वॉकथ्रू</div>
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-black flex items-center justify-center">
                    <img
                      src="https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=600&auto=format&fit=crop&q=80"
                      alt=""
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute w-12 h-12 rounded-full bg-red-600/90 flex items-center justify-center text-white shadow-lg">
                      ▶
                    </div>
                  </div>
                  <p className="text-xs text-gray-300 mt-2">
                    गयाजी में फल्गु नदी तट और घाटों के विस्तार का 3डी मॉडल।
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-[#12161f] text-gray-300 pt-12 pb-8 border-t-2 border-red-700 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Top Section: Brand + Leadership & Official Addresses + Contact */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10 border-b border-gray-800">
            {/* Column 1 (4 cols): Brand & Official Editorial / Registered Address */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center space-x-3">
                <CircularLogo size={56} />
                <div>
                  <div className="flex items-baseline space-x-1.5">
                    <span className="font-serif font-black text-2xl text-red-500">DDN</span>
                    <span className="font-black text-lg text-white">PRIME</span>
                    <span className="bg-amber-500 text-black text-[10px] font-black px-1.5 py-0.2 rounded uppercase">
                      NEWS
                    </span>
                  </div>
                  <div className="text-[11px] text-amber-400 font-bold">
                    प्रधान संपादक: राजेश कुमार साहू
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2 text-gray-300 text-xs leading-relaxed">
                {/* Editorial Office */}
                <div className="bg-white/5 p-3 rounded-xl border border-gray-800">
                  <div className="text-[11px] font-bold text-red-400 uppercase tracking-wider flex items-center space-x-1.5 mb-1">
                    <Building className="w-3.5 h-3.5 text-red-500" />
                    <span>संपादक कार्यालय (Editorial Office):</span>
                  </div>
                  <p className="text-gray-200 font-medium">
                    <strong className="text-white">DDN Prime News</strong>, पैगंबरपुर, पोस्ट-दरभंगा, पीएस-केवटी, डिस्ट्रिक्ट-दरभंगा, बिहार, 847121
                  </p>
                </div>

                {/* Registered Office */}
                <div className="bg-white/5 p-3 rounded-xl border border-gray-800">
                  <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5 mb-1">
                    <Building className="w-3.5 h-3.5 text-amber-500" />
                    <span>रजिस्टर्ड कार्यालय (Registered Office):</span>
                  </div>
                  <p className="text-gray-200 font-medium">
                    <strong className="text-amber-400">दरभंगा डिजिटल नेटवर्क</strong>, वार्ड नंबर 9, पैगंबरपुर, पोस्ट-दरभंगा, पीएस-केवटी, डिस्ट्रिक्ट-दरभंगा, बिहार, 847121
                  </p>
                </div>
              </div>
            </div>

            {/* Column 2 (2 cols): News Sections */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-white font-bold uppercase tracking-wider text-xs border-b border-gray-800 pb-2 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-red-600 inline-block" />
                <span>प्रमुख श्रेणियां</span>
              </h4>
              <ul className="space-y-2 text-xs">
                {CATEGORIES.map((c) => (
                  <li key={c}>
                    <button
                      onClick={() => {
                        setCurrentView('home');
                        setActiveCategory(c);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="hover:text-red-400 transition flex items-center space-x-1 text-gray-400 hover:translate-x-1 duration-150"
                    >
                      <span>›</span>
                      <span>{c}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3 (3 cols): Contact & Support */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="text-white font-bold uppercase tracking-wider text-xs border-b border-gray-800 pb-2 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                <span>संपर्क एवं शिकायत निवारण (Contact)</span>
              </h4>

              <div className="space-y-3">
                <div className="bg-white/5 p-3 rounded-xl border border-gray-800 space-y-2">
                  <div className="flex items-start space-x-2 text-xs">
                    <Mail className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-gray-400 block font-bold">आधिकारिक ई-मेल:</span>
                      <a
                        href="mailto:ddnprimenews@gmail.com"
                        className="text-amber-400 font-bold hover:underline break-all"
                      >
                        ddnprimenews@gmail.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2 text-xs pt-1 border-t border-gray-800/80">
                    <Phone className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-gray-400 block font-bold">मोबाइल / हेल्पलाइन नंबर:</span>
                      <a
                        href="tel:9341050287"
                        className="text-white font-black text-sm hover:text-green-400"
                      >
                        +91 9341050287
                      </a>
                    </div>
                  </div>
                </div>

                {/* Social Connect Links */}
                <div className="flex items-center space-x-2 pt-1">
                  <span className="text-[11px] text-gray-400 font-bold">सोशल मीडिया:</span>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-black hover:bg-neutral-800 text-white border border-gray-700 transition"
                    title="X / Twitter"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition"
                    title="Facebook"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white transition"
                    title="YouTube"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                </div>

                {/* Quick Portals */}
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setCurrentView('apply_id');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full text-left p-2.5 bg-yellow-500/10 text-yellow-300 rounded-xl border border-yellow-500/20 hover:bg-yellow-500/20 transition font-bold flex items-center justify-between"
                  >
                    <span>पत्रकार पहचान पत्र (ID Card) आवेदन</span>
                    <span>→</span>
                  </button>
                  <button
                    onClick={() => {
                      setCurrentView('login');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full text-left p-2.5 bg-red-950/80 text-red-200 rounded-xl hover:bg-red-900 border border-red-800 transition font-bold flex items-center justify-between"
                  >
                    <span>संवाददाता / एडमिन पोर्टल</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Column 4 (3 cols): Press Council Code of Ethics */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="text-white font-bold uppercase tracking-wider text-xs border-b border-gray-800 pb-2 flex items-center space-x-1.5">
                <Scale className="w-3.5 h-3.5 text-yellow-400" />
                <span>भारतीय प्रेस संहिता आचार नियम</span>
              </h4>

              <div className="bg-white/5 p-3 rounded-xl border border-gray-800 space-y-2 text-[11px] leading-relaxed text-gray-300">
                <p>
                  <strong>भारतीय प्रेस परिषद (Press Council of India)</strong> एवं डिजिटल मीडिया आचार संहिता 2021 के अनुपालन में:
                </p>
                <ul className="list-disc pl-4 space-y-1 text-gray-400 text-[11px]">
                  <li>सत्यता, निष्पक्षता एवं जनहित को सर्वोपरि प्राथमिकता।</li>
                  <li>अपराध, हिंसा या भड़काऊ अफवाहों का पूर्ण खंडन व संयमित प्रस्तुति।</li>
                  <li>व्यक्तिगत गोपनीयता व संवैधानिक गरिमा का पूर्ण सम्मान।</li>
                  <li>खबरों की तथ्य-जांच (Fact-Check) व स्रोत की प्रमाणिकता।</li>
                </ul>
                <div className="pt-1.5 text-[10px] text-gray-400 border-t border-gray-800">
                  किसी भी समाचार संबंधी आपत्ति या सुधार हेतु संपादक कार्यालय से तुरंत संपर्क करें।
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Copyright & Legal Links */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-gray-500 text-[11px] gap-2">
            <div>
              © {new Date().getFullYear()} DDN Prime News Network • प्रधान संपादक: राजेश कुमार साहू • सर्वाधिकार सुरक्षित।
            </div>
            <div className="flex space-x-4">
              <span
                onClick={() => {
                  scrollToSection('cricket-section');
                  showToast('भारतीय प्रेस परिषद (PCI) डिजिटल मीडिया आचार संहिता 2021 का अनुपालन सक्रिय है');
                }}
                className="hover:text-gray-300 cursor-pointer"
              >
                भारतीय प्रेस संहिता
              </span>
              <span
                onClick={() => showToast('डीडीएन प्राइम न्यूज़: सभी नियम व शर्तें पोर्टल पर लागू हैं')}
                className="hover:text-gray-300 cursor-pointer"
              >
                नियम व शर्तें
              </span>
              <span
                onClick={() => showToast('गोपनीयता नीति: उपयोगकर्ता डेटा पूर्णतः सुरक्षित एवं एन्क्रिप्टेड है')}
                className="hover:text-gray-300 cursor-pointer"
              >
                गोपनीयता नीति
              </span>
              <span
                onClick={() => showToast('अस्वीकरण: पोर्टल पर प्रकाशित समाचार संबंधित संवाददाताओं व स्रोतों के आधार पर सत्यापित हैं')}
                className="hover:text-gray-300 cursor-pointer"
              >
                अस्वीकरण (Disclaimer)
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
