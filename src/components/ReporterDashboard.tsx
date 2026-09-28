import React, { useState } from 'react';
import { ReporterApplication, NewsItem, BIHAR_DISTRICTS, CATEGORIES } from '../types';
import { ReporterIdCard } from './ReporterIdCard';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { 
  FileText, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  CreditCard, 
  LogOut, 
  PlusCircle, 
  MapPin, 
  Building,
  Image as ImageIcon,
  Eye,
  Video
} from 'lucide-react';

interface ReporterDashboardProps {
  currentReporter: ReporterApplication;
  reporterNews: NewsItem[];
  onLogout: () => void;
  onRefreshData: () => void;
  onSuccessToast?: (msg: string) => void;
}

export const ReporterDashboard: React.FC<ReporterDashboardProps> = ({
  currentReporter,
  reporterNews,
  onLogout,
  onRefreshData,
  onSuccessToast,
}) => {
  const [activeTab, setActiveTab] = useState<'submit' | 'my_news' | 'id_card'>('submit');

  // Submit News Form State
  const [title, setTitle] = useState('');
  const [subTitle, setSubTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<string>('बिहार एक्सप्रेस');
  const [district, setDistrict] = useState(currentReporter.district || 'पटना (Patna)');
  const [block, setBlock] = useState(currentReporter.block || '');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmitNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setErrorMsg('कृपया समाचार का शीर्षक और विस्तृत विवरण अवश्य दर्ज करें।');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const mediaEmbeds: string[] = [];
      if (videoUrl.trim()) {
        mediaEmbeds.push(videoUrl.trim());
      }

      const newsPayload: Omit<NewsItem, 'id'> = {
        title: title.trim(),
        subTitle: subTitle.trim() || undefined,
        summary: summary.trim() || title.trim(),
        content: content.trim(),
        category,
        district,
        block: block.trim() || undefined,
        imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1000&auto=format&fit=crop&q=80',
        mediaEmbeds,
        authorId: currentReporter.id,
        authorName: currentReporter.fullName,
        authorRole: 'reporter',
        authorDistrict: currentReporter.district,
        isBreaking: false,
        status: 'pending', // Sent for Admin Moderation
        views: 0,
        createdAt: Date.now(),
      };

      await addDoc(collection(db, 'news'), newsPayload);

      setSuccessMsg('समाचार सफलतापूर्वक सबमिट हो गया! एडमिन अनुमोदन के पश्चात यह पोर्टल पर लाइव हो जाएगा।');
      if (onSuccessToast) {
        onSuccessToast('समाचार अनुमोदन हेतु सबमिट कर दिया गया है।');
      }

      // Reset form
      setTitle('');
      setSubTitle('');
      setSummary('');
      setContent('');
      setImageUrl('');
      setVideoUrl('');
      onRefreshData();
    } catch (err: any) {
      console.error('Error submitting reporter news:', err);
      setErrorMsg('समाचार प्रेषित करने में त्रुटि: ' + (err.message || 'पुनः प्रयास करें'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
      {/* Reporter Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-red-700 shadow bg-gray-100 flex-shrink-0">
            <img
              src={
                currentReporter.photoUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
              }
              alt={currentReporter.fullName}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-gray-900">{currentReporter.fullName}</h1>
              <span className="bg-green-100 text-green-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center">
                <CheckCircle2 className="w-3 h-3 mr-1" /> अधिकृत संवाददाता
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-0.5 flex flex-wrap items-center gap-x-3">
              <span>आईडी: <strong className="text-gray-800">{currentReporter.reporterId || 'DDN-REP-ONLINE'}</strong></span>
              <span>•</span>
              <span className="flex items-center">
                <MapPin className="w-3 h-3 text-red-600 mr-1" />
                {currentReporter.district} {currentReporter.block ? `(${currentReporter.block})` : ''}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onLogout}
            className="flex items-center space-x-1.5 px-4 py-2 bg-gray-100 hover:bg-red-50 hover:text-red-700 text-gray-700 rounded-lg text-xs font-bold transition"
          >
            <LogOut className="w-4 h-4" />
            <span>लॉगआउट (Logout)</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t-xl px-4 pt-2">
        <button
          onClick={() => setActiveTab('submit')}
          className={`flex items-center space-x-2 px-5 py-3 font-bold text-sm border-b-2 transition ${
            activeTab === 'submit'
              ? 'border-red-700 text-red-700'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>नया समाचार भेजें (Submit News)</span>
        </button>

        <button
          onClick={() => setActiveTab('my_news')}
          className={`flex items-center space-x-2 px-5 py-3 font-bold text-sm border-b-2 transition ${
            activeTab === 'my_news'
              ? 'border-red-700 text-red-700'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>मेरे भेजे गए समाचार ({reporterNews.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('id_card')}
          className={`flex items-center space-x-2 px-5 py-3 font-bold text-sm border-b-2 transition ${
            activeTab === 'id_card'
              ? 'border-red-700 text-red-700'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>डिजिटल प्रेस आईडी कार्ड</span>
        </button>
      </div>

      {/* Tab 1: Submit News */}
      {activeTab === 'submit' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              समाचार पोस्ट करें (Send Ground Report)
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              आपके द्वारा पोस्ट किया गया समाचार एडमिन द्वारा समीक्षा के उपरांत मुख्य पोर्टल पर प्रकाशित होगा।
            </p>
          </div>

          {successMsg && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-sm flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-green-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmitNews} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                समाचार का मुख्य शीर्षक (Headline) *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="सटीक और आकर्षक शीर्षक लिखें..."
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-600 focus:outline-none"
              />
            </div>

            {/* Sub-headline */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                उप-शीर्षक (Sub-headline / Tagline)
              </label>
              <input
                type="text"
                value={subTitle}
                onChange={(e) => setSubTitle(e.target.value)}
                placeholder="एक पंक्ति में मुख्य संदर्भ..."
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  श्रेणी (Category)
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-red-600 focus:outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* District */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  जिला (District)
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-red-600 focus:outline-none"
                >
                  {BIHAR_DISTRICTS.filter((d) => !d.startsWith('सभी')).map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Block */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  प्रखंड / गांव (Block / Village)
                </label>
                <input
                  type="text"
                  value={block}
                  onChange={(e) => setBlock(e.target.value)}
                  placeholder="उदा. सदर या स्थानीय क्षेत्र"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                मुख्य तस्वीर URL (Featured Image Link)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... या फोटो लिंक"
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Video / Embed Link */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                वीडियो लिंक (YouTube, Facebook Video, or Instagram Reel)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Video className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=... या FB/Reel लिंक"
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Short Summary */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                संक्षिप्त सारांश (Short Summary)
              </label>
              <textarea
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="2-3 पंक्तियों में मुख्य सार लिखें..."
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-600 focus:outline-none"
              />
            </div>

            {/* Detailed Body */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                विस्तृत समाचार सामग्री (Detailed News Content) *
              </label>
              <textarea
                rows={7}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="पूरी खबर विस्तार से लिखें (प्रशासनिक बयान, घटना स्थल विवरण, स्थानीय लोगों की प्रतिक्रिया आदि)..."
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-600 focus:outline-none leading-relaxed"
              />
            </div>

            {/* Action */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl shadow-md transition flex items-center space-x-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>भेजा जा रहा है...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>एडमिन अनुमोदन हेतु सबमिट करें</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: My News Status */}
      {activeTab === 'my_news' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            मेरे द्वारा प्रेषित समाचारों की स्थिति
          </h2>

          {reporterNews.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p>आपने अभी तक कोई समाचार सबमिट नहीं किया है।</p>
              <button
                onClick={() => setActiveTab('submit')}
                className="mt-3 px-4 py-2 bg-red-700 text-white text-xs font-bold rounded-lg"
              >
                समाचार लिखें
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {reporterNews.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-xl p-4 hover:border-red-300 transition flex flex-col md:flex-row gap-4 items-start md:items-center justify-between"
                >
                  <div className="flex items-start space-x-3">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt=""
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded">
                          {item.category}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(item.createdAt).toLocaleDateString('hi-IN')}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
                      <div className="text-xs text-gray-500 mt-1 flex items-center space-x-3">
                        <span>जिला: {item.district || 'बिहार'}</span>
                        <span>•</span>
                        <span className="flex items-center">
                          <Eye className="w-3 h-3 mr-1" /> {item.views} व्यूज
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {item.status === 'published' ? (
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full inline-flex items-center">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> प्रकाशित (Live)
                      </span>
                    ) : item.status === 'pending' ? (
                      <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full inline-flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1" /> समीक्षाधीन (Pending)
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full inline-flex items-center">
                        <AlertCircle className="w-3.5 h-3.5 mr-1" /> अस्वीकृत (Rejected)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Digital Press ID Card */}
      {activeTab === 'id_card' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-10 flex flex-col items-center">
          <div className="text-center max-w-md mb-6">
            <h2 className="text-2xl font-black text-gray-900">आपका डिजिटल प्रेस आईडी कार्ड</h2>
            <p className="text-xs text-gray-500 mt-1">
              यह कार्ड केवल अधिकृत एडमिन अनुमोदन के पश्चात ही मान्य होता है। आप इसे प्रिंट कर लैमिनेट करा सकते हैं।
            </p>
          </div>

          <ReporterIdCard reporter={currentReporter} showPrintButton={true} />
        </div>
      )}
    </div>
  );
};
