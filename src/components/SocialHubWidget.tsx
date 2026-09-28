import React, { useState } from 'react';
import { 
  Share2, 
  ExternalLink, 
  Heart, 
  Repeat2, 
  MessageCircle, 
  CheckCircle2, 
  Sparkles, 
  RefreshCw,
  ThumbsUp
} from 'lucide-react';

interface SocialPost {
  id: string;
  platform: 'facebook' | 'twitter';
  authorName: string;
  handle: string;
  authorAvatar: string;
  isVerified: boolean;
  timestamp: string;
  content: string;
  mediaUrl?: string;
  likes: number;
  shares: number;
  comments: number;
  postUrl: string;
}

export const SocialHubWidget: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'twitter' | 'facebook'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});

  // Official DDN Prime News social posts
  const posts: SocialPost[] = [
    {
      id: 'tw-1',
      platform: 'twitter',
      authorName: 'DDN Prime News',
      handle: '@DDNPrimeNews',
      authorAvatar: '/ddn_logo.png',
      isVerified: true,
      timestamp: '25 मिनट पहले',
      content: '🚨 #BreakingNews: दरभंगा व मुजफ्फरपुर समेत उत्तर बिहार के अस्पतालों में विशेष टेली-मेडिसिन और निशुल्क स्वास्थ्य जांच शिविर का विस्तार। स्वास्थ्य विभाग ने जारी किए महत्वपूर्ण दिशा-निर्देश। पूरी रिपोर्ट पढ़ें: #DDNPrime #BiharNews',
      mediaUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop&q=80',
      likes: 184,
      shares: 42,
      comments: 19,
      postUrl: 'https://twitter.com/intent/tweet?text=DDN%20Prime%20News%20Update'
    },
    {
      id: 'fb-1',
      platform: 'facebook',
      authorName: 'DDN Prime News - Official',
      handle: 'ddnprimenewsofficial',
      authorAvatar: '/ddn_logo.png',
      isVerified: true,
      timestamp: '1 घंटे पहले',
      content: '📢 बड़ी खबर: बिहार विधानसभा चुनाव और उप-चुनाव की तैयारियों पर चुनाव आयोग की सर्वदलीय बैठक में बड़ा निर्णय। राज्य भर के संवेदनशील मतदान केंद्रों पर वेबकास्टिंग अनिवार्य। निष्पक्ष पत्रकारिता के लिए DDN Prime News से जुड़े रहें। #DDNPrimeNews #BiharElections',
      mediaUrl: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800&auto=format&fit=crop&q=80',
      likes: 356,
      shares: 68,
      comments: 47,
      postUrl: 'https://www.facebook.com/sharer/sharer.php?u=https://ddnprimenews.in'
    },
    {
      id: 'tw-2',
      platform: 'twitter',
      authorName: 'DDN Prime News',
      handle: '@DDNPrimeNews',
      authorAvatar: '/ddn_logo.png',
      isVerified: true,
      timestamp: '3 घंटे पहले',
      content: '🔴 एक्सक्लूसिव: गयाजी विष्णुपद कॉरिडोर और फल्गु नदी तट के कायाकल्प का मास्टर प्लान तैयार। देश-विदेश के श्रद्धालुओं के लिए आधुनिक सुविधाएं। विस्तृत ग्राउंड रिपोर्ट DDN Prime पर लाइव। #GayaCorridor #BiharExpress',
      likes: 219,
      shares: 53,
      comments: 24,
      postUrl: 'https://twitter.com/intent/tweet?text=DDN%20Prime%20Exclusive'
    },
    {
      id: 'fb-2',
      platform: 'facebook',
      authorName: 'DDN Prime News - Official',
      handle: 'ddnprimenewsofficial',
      authorAvatar: '/ddn_logo.png',
      isVerified: true,
      timestamp: '5 घंटे पहले',
      content: '🎙️ पत्रकारिता के क्षेत्र में अपना भविष्य बनाएं! DDN Prime News में जिला व प्रखंड स्तर पर संवाददाताओं (Reporters) हेतु ऑनलाइन आवेदन आमंत्रित हैं। आधिकारिक प्रेस आईडी कार्ड व निष्पक्ष मंच। अभी आवेदन करें! #MediaJobs #BiharJournalism',
      likes: 412,
      shares: 110,
      comments: 63,
      postUrl: 'https://www.facebook.com'
    }
  ];

  const filteredPosts = activeTab === 'all' 
    ? posts 
    : posts.filter(p => p.platform === activeTab);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const handleToggleLike = (postId: string, initialLikes: number) => {
    const isLiked = likedPosts[postId];
    const currentLikes = likeCounts[postId] ?? initialLikes;

    setLikedPosts(prev => ({ ...prev, [postId]: !isLiked }));
    setLikeCounts(prev => ({
      ...prev,
      [postId]: isLiked ? currentLikes - 1 : currentLikes + 1
    }));
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Widget Header */}
      <div className="bg-gradient-to-r from-gray-900 via-neutral-900 to-black text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-400 to-red-600 flex items-center justify-center shadow-md">
              <Share2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-black text-sm uppercase tracking-wide flex items-center space-x-1.5">
                <span>सोशल हब (Social Hub)</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </h3>
              <p className="text-[10px] text-gray-300">
                ऑफिशियल Facebook & X / Twitter अपडेट्स
              </p>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            title="रिफ्रेश करें"
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>

        {/* Platform Quick Badges & Follow Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-800 text-[11px]">
          {/* X / Twitter Button */}
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center space-x-1.5 py-1.5 px-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition font-bold border border-white/10"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <span>Follow @DDN</span>
          </a>

          {/* Facebook Button */}
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center space-x-1.5 py-1.5 px-2 bg-blue-600/30 hover:bg-blue-600 text-blue-200 hover:text-white rounded-lg transition font-bold border border-blue-500/30"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span>Like DDN Prime</span>
          </a>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex border-b border-gray-100 bg-gray-50/70 p-1">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
            activeTab === 'all'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          सभी पोस्ट ({posts.length})
        </button>
        <button
          onClick={() => setActiveTab('twitter')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center space-x-1 ${
            activeTab === 'twitter'
              ? 'bg-black text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          <span>X / Twitter</span>
        </button>
        <button
          onClick={() => setActiveTab('facebook')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center space-x-1 ${
            activeTab === 'facebook'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <span>Facebook</span>
        </button>
      </div>

      {/* Social Posts Feed */}
      <div className="divide-y divide-gray-100 max-h-[460px] overflow-y-auto">
        {filteredPosts.map((post) => {
          const isLiked = likedPosts[post.id];
          const displayLikes = likeCounts[post.id] ?? post.likes;

          return (
            <div key={post.id} className="p-3.5 hover:bg-gray-50/70 transition">
              {/* Post Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-amber-400 bg-black flex-shrink-0">
                    <img
                      src={post.authorAvatar}
                      alt={post.authorName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/ddn_logo.jpg';
                      }}
                    />
                  </div>
                  <div>
                    <div className="flex items-center space-x-1">
                      <span className="font-extrabold text-xs text-gray-900 leading-none">
                        {post.authorName}
                      </span>
                      {post.isVerified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-blue-50" />
                      )}
                    </div>
                    <div className="flex items-center space-x-1 text-[10px] text-gray-400 mt-0.5">
                      <span>{post.handle}</span>
                      <span>•</span>
                      <span>{post.timestamp}</span>
                    </div>
                  </div>
                </div>

                {/* Platform Badge */}
                {post.platform === 'twitter' ? (
                  <span className="p-1 rounded bg-black text-white" title="X / Twitter Post">
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </span>
                ) : (
                  <span className="p-1 rounded bg-blue-600 text-white" title="Facebook Post">
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </span>
                )}
              </div>

              {/* Post Content */}
              <p className="mt-2 text-xs text-gray-800 leading-relaxed font-normal whitespace-pre-line">
                {post.content}
              </p>

              {/* Optional Post Media */}
              {post.mediaUrl && (
                <div className="mt-2.5 rounded-xl overflow-hidden border border-gray-200 aspect-video relative group">
                  <img
                    src={post.mediaUrl}
                    alt="Social media post"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-2">
                    <span className="text-[10px] text-white font-medium flex items-center space-x-1">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>DDN Prime Verified Update</span>
                    </span>
                  </div>
                </div>
              )}

              {/* Engagement Bar */}
              <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-gray-500 text-[11px]">
                {/* Like Button */}
                <button
                  onClick={() => handleToggleLike(post.id, post.likes)}
                  className={`flex items-center space-x-1.5 transition ${
                    isLiked
                      ? 'text-red-600 font-bold'
                      : 'hover:text-red-600'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-red-600 text-red-600' : ''}`} />
                  <span>{displayLikes}</span>
                </button>

                {/* Comments Count */}
                <div className="flex items-center space-x-1 hover:text-blue-600 transition">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>{post.comments}</span>
                </div>

                {/* Repost / Shares */}
                <div className="flex items-center space-x-1 hover:text-green-600 transition">
                  <Repeat2 className="w-3.5 h-3.5" />
                  <span>{post.shares}</span>
                </div>

                {/* External Link */}
                <a
                  href={post.postUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1 text-gray-400 hover:text-gray-900 transition"
                  title="मूल पोस्ट देखें (View original post)"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Widget Footer */}
      <div className="bg-gray-50 p-2.5 border-t border-gray-100 text-center text-[11px]">
        <span className="text-gray-500">सोशल मीडिया पर जुड़े: </span>
        <span className="font-extrabold text-red-700">#DDNPrimeNews</span>
      </div>
    </div>
  );
};
