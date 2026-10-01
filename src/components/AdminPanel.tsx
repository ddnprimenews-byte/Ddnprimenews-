import React, { useState } from 'react';
import { 
  NewsItem, 
  ReporterApplication, 
  AdBanner, 
  UserProfile, 
  BIHAR_DISTRICTS, 
  CATEGORIES,
  CommentItem,
  NewsletterSubscriber
} from '../types';
import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  onSnapshot
} from 'firebase/firestore';
import { ReporterIdCard } from './ReporterIdCard';
import { ReporterAuthorizationLetter } from './ReporterAuthorizationLetter';
import { CircularLogo } from './CircularLogo';
import { PhotoUploadHelper } from './PhotoUploadHelper';
import { MediaEmbed } from './MediaEmbed';
import {
  LayoutDashboard,
  Users,
  Sparkles,
  Edit3,
  CheckSquare,
  Megaphone,
  MessageSquare,
  Mail,
  LogOut,
  Check,
  X,
  Plus,
  Trash2,
  ExternalLink,
  Eye,
  FileCheck,
  Clock,
  TrendingUp,
  MapPin,
  Send,
  AlertCircle,
  Video,
  Image as ImageIcon
} from 'lucide-react';

interface AdminPanelProps {
  newsList: NewsItem[];
  reporters: ReporterApplication[];
  ads: AdBanner[];
  onLogout: () => void;
  onRefreshData: () => void;
  onSuccessToast?: (msg: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  newsList,
  reporters,
  ads,
  onLogout,
  onRefreshData,
  onSuccessToast,
}) => {
  const [activeTab, setActiveTab] = useState<
    'analytics' | 'reporters' | 'ai_news' | 'manual_news' | 'moderation' | 'ads' | 'comments' | 'subscribers'
  >('analytics');

  // All comments for admin moderation
  const [allComments, setAllComments] = useState<CommentItem[]>([]);

  // All newsletter subscribers
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [subscriberSearch, setSubscriberSearch] = useState('');

  // Listen to comments collection in Firestore
  React.useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'comments'), (snapshot) => {
        const loaded: CommentItem[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<CommentItem, 'id'>),
        }));
        loaded.sort((a, b) => b.createdAt - a.createdAt);
        setAllComments(loaded);
      });
      return () => unsub();
    } catch (err) {
      console.error('Error fetching admin comments:', err);
    }
  }, []);

  // Listen to newsletter_subscribers collection in Firestore
  React.useEffect(() => {
    try {
      const unsubSubscribers = onSnapshot(collection(db, 'newsletter_subscribers'), (snapshot) => {
        const loaded: NewsletterSubscriber[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<NewsletterSubscriber, 'id'>),
        }));
        // Sort descending by subscribedAt
        loaded.sort((a, b) => {
          const timeA = a.subscribedAt ? new Date(a.subscribedAt).getTime() : 0;
          const timeB = b.subscribedAt ? new Date(b.subscribedAt).getTime() : 0;
          return timeB - timeA;
        });
        setSubscribers(loaded);
      });
      return () => unsubSubscribers();
    } catch (err) {
      console.error('Error fetching subscribers:', err);
    }
  }, []);

  // Delete newsletter subscriber handler
  const handleAdminDeleteSubscriber = async (subscriberId?: string) => {
    if (!subscriberId) return;
    if (!confirm('क्या आप सचमुच इस ग्राहक को न्यूज़लेटर सूची से हटाना चाहते हैं?')) return;
    try {
      await deleteDoc(doc(db, 'newsletter_subscribers', subscriberId));
      if (onSuccessToast) onSuccessToast('ग्राहक सूची से हटा दिया गया।');
    } catch (err: any) {
      alert('हटाने में त्रुटि: ' + err.message);
    }
  };

  // Delete inappropriate comment handler
  const handleAdminDeleteComment = async (commentId: string) => {
    if (!confirm('क्या आप सचमुच इस टिप्पणी को हटाना चाहते हैं?')) return;
    try {
      await deleteDoc(doc(db, 'comments', commentId));
      if (onSuccessToast) onSuccessToast('टिप्पणी सफलतापूर्वक हटा दी गई।');
    } catch (err: any) {
      alert('हटाने में त्रुटि: ' + err.message);
    }
  };

  // Preview ID Card & Authorization Letter Modal State
  const [previewReporter, setPreviewReporter] = useState<ReporterApplication | null>(null);
  const [previewAuthLetter, setPreviewAuthLetter] = useState<ReporterApplication | null>(null);

  // AI News Generator State
  const [aiTopic, setAiTopic] = useState('');
  const [aiDistrict, setAiDistrict] = useState('पटना (Patna)');
  const [aiCategory, setAiCategory] = useState('बिहार एक्सप्रेस');
  const [aiCustomPhoto, setAiCustomPhoto] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiGeneratedStory, setAiGeneratedStory] = useState<any | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Manual News Post Form State
  const [manualHeadline, setManualHeadline] = useState('');
  const [manualSubHeadline, setManualSubHeadline] = useState('');
  const [manualSummary, setManualSummary] = useState('');
  const [manualContent, setManualContent] = useState('');
  const [manualCategory, setManualCategory] = useState<string>('बिहार एक्सप्रेस');
  const [manualDistrict, setManualDistrict] = useState<string>('पटना (Patna)');
  const [manualBlock, setManualBlock] = useState('');
  const [manualImageUrl, setManualImageUrl] = useState('');
  const [manualMediaUrl, setManualMediaUrl] = useState('');
  const [manualIsBreaking, setManualIsBreaking] = useState(false);
  const [manualSubmitting, setManualSubmitting] = useState(false);

  // Ad Banner Management State
  const [adTitle, setAdTitle] = useState('');
  const [adSponsor, setAdSponsor] = useState('');
  const [adImageUrl, setAdImageUrl] = useState('');
  const [adTargetUrl, setAdTargetUrl] = useState('');
  const [adPlacement, setAdPlacement] = useState<'header_top' | 'sidebar' | 'inline_content' | 'footer'>('header_top');
  const [adSubmitting, setAdSubmitting] = useState(false);

  // Admin Edit News State (User Requested: रिपोर्टर का लगाया हुआ न्यूज हो या एडमिन का, वो न्यूज एडिट करने का राइट एडमिन को रहना चाहिए)
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSubTitle, setEditSubTitle] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDistrict, setEditDistrict] = useState('');
  const [editBlock, setEditBlock] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editIsBreaking, setEditIsBreaking] = useState(false);
  const [editStatus, setEditStatus] = useState<'published' | 'pending' | 'rejected'>('published');
  const [savingEdit, setSavingEdit] = useState(false);

  const handleStartEditNews = (item: NewsItem) => {
    setEditingNews(item);
    setEditTitle(item.title || '');
    setEditSubTitle(item.subTitle || '');
    setEditSummary(item.summary || '');
    setEditContent(item.content || '');
    setEditCategory(item.category || 'बिहार एक्सप्रेस');
    setEditDistrict(item.district || 'पटना (Patna)');
    setEditBlock(item.block || '');
    setEditImageUrl(item.imageUrl || '');
    setEditIsBreaking(Boolean(item.isBreaking));
    setEditStatus(item.status || 'published');
  };

  const handleSaveEditNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNews || !editTitle.trim() || !editContent.trim()) {
      alert('शीर्षक और सामग्री अनिवार्य है');
      return;
    }
    setSavingEdit(true);
    try {
      await updateDoc(doc(db, 'news', editingNews.id), {
        title: editTitle.trim(),
        subTitle: editSubTitle.trim() || undefined,
        summary: editSummary.trim() || editTitle.trim(),
        content: editContent.trim(),
        category: editCategory,
        district: editDistrict,
        block: editBlock.trim() || undefined,
        imageUrl: editImageUrl.trim() || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1000&auto=format&fit=crop&q=80',
        isBreaking: editIsBreaking,
        status: editStatus,
        updatedAt: Date.now(),
      });
      if (onSuccessToast) onSuccessToast('समाचार सफलतापूर्वक अपडेट/संपादित कर दिया गया!');
      setEditingNews(null);
      onRefreshData();
    } catch (err: any) {
      alert('संपादित करने में त्रुटि: ' + err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  // Analytics Computation
  const totalNews = newsList.length;
  const publishedNews = newsList.filter((n) => n.status === 'published').length;
  const pendingNews = newsList.filter((n) => n.status === 'pending').length;
  const approvedReporters = reporters.filter((r) => r.status === 'approved').length;
  const pendingReporters = reporters.filter((r) => r.status === 'pending').length;
  const totalViews = newsList.reduce((acc, curr) => acc + (curr.views || 0), 0);

  // District wise count
  const districtWiseCount: Record<string, number> = {};
  newsList.forEach((n) => {
    const dist = n.district?.split(' ')[0] || 'अन्य';
    districtWiseCount[dist] = (districtWiseCount[dist] || 0) + 1;
  });

  // Action: Approve Reporter Application
  const handleApproveReporter = async (rep: ReporterApplication) => {
    try {
      const generatedId = `DDN-${rep.district?.slice(0, 3).toUpperCase() || 'BIH'}-${Math.floor(
        100 + Math.random() * 900
      )}`;
      const designation = 'अधिकृत जिला संवाददाता (Authorized Press Correspondent)';
      // Issue a formal password for the reporter
      const formalPassword = `DDN@${Math.floor(1000 + Math.random() * 9000)}`;

      // 1. Update reporter application in reporter_applications & pending_reporters
      await updateDoc(doc(db, 'reporter_applications', rep.id), {
        status: 'approved',
        reporterId: generatedId,
        designation,
        formalPassword,
        approvedAt: Date.now(),
      });

      // 2. Create official user profile in 'users' collection
      await setDoc(doc(db, 'users', rep.id), {
        uid: rep.id,
        email: rep.email,
        fullName: rep.fullName,
        role: 'reporter',
        reporterId: generatedId,
        designation,
        state: rep.state,
        district: rep.district,
        block: rep.block,
        photoUrl: rep.photoUrl,
        fatherName: rep.fatherName,
        formalPassword,
        createdAt: rep.appliedAt,
        active: true,
      } as UserProfile);

      if (onSuccessToast) {
        onSuccessToast(`पत्रकार ${rep.fullName} को स्वीकृत किया गया! आईडी: ${generatedId} | लॉगिन पासवर्ड: ${formalPassword}`);
      }
      onRefreshData();
    } catch (err: any) {
      alert('Error approving reporter: ' + err.message);
    }
  };

  // Action: Reject Reporter Application
  const handleRejectReporter = async (rep: ReporterApplication) => {
    if (!confirm(`क्या आप ${rep.fullName} का आवेदन अस्वीकृत करना चाहते हैं?`)) return;
    try {
      await updateDoc(doc(db, 'reporter_applications', rep.id), {
        status: 'rejected',
      });
      if (onSuccessToast) onSuccessToast('आवेदन अस्वीकृत कर दिया गया।');
      onRefreshData();
    } catch (err: any) {
      alert('Error rejecting application: ' + err.message);
    }
  };

  // AI News Generator via Gemini API
  const handleGenerateAiNews = async () => {
    if (!aiTopic.trim()) {
      setAiError('कृपया विषय या प्रश्न दर्ज करें (उदा. पटना में नए मेट्रो प्रोजेक्ट का अपडेट)');
      return;
    }
    setAiLoading(true);
    setAiError(null);
    setAiGeneratedStory(null);

    try {
      const response = await fetch('/api/gemini/generate-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiTopic,
          district: aiDistrict,
          category: aiCategory,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Gemini API call failed');
      }

      // If user uploaded/provided a custom photo, prioritize it; otherwise AI generated/default photo is used
      const storyData = data.data;
      if (aiCustomPhoto.trim()) {
        storyData.imageUrl = aiCustomPhoto.trim();
      }

      setAiGeneratedStory(storyData);
    } catch (err: any) {
      console.error('AI Generation error:', err);
      setAiError(err.message || 'AI समाचार तैयार करने में विफल रहा।');
    } finally {
      setAiLoading(false);
    }
  };

  // One-Click Publish AI News to Firestore
  const handlePublishAiNews = async () => {
    if (!aiGeneratedStory) return;
    try {
      const newDoc: Omit<NewsItem, 'id'> = {
        title: aiGeneratedStory.title,
        subTitle: aiGeneratedStory.subTitle,
        summary: aiGeneratedStory.summary,
        content: aiGeneratedStory.content,
        category: aiGeneratedStory.category || aiCategory,
        district: aiGeneratedStory.district || aiDistrict,
        imageUrl: aiGeneratedStory.imageUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1000&auto=format&fit=crop&q=80',
        imagePrompt: aiGeneratedStory.imagePrompt,
        suggestedTags: aiGeneratedStory.suggestedTags || [],
        authorName: 'DDN AI Bureau Editor',
        authorRole: 'ai',
        isBreaking: false,
        status: 'published',
        views: 120,
        createdAt: Date.now(),
      };

      await addDoc(collection(db, 'news'), newDoc);
      if (onSuccessToast) onSuccessToast('AI समाचार पोर्टल पर तुरंत लाइव प्रकाशित कर दिया गया!');
      setAiGeneratedStory(null);
      setAiTopic('');
      onRefreshData();
    } catch (err: any) {
      alert('Error publishing AI news: ' + err.message);
    }
  };

  // Manual News Submission with Rich Media Embeds
  const handleManualPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualHeadline.trim() || !manualContent.trim()) {
      alert('शीर्षक और सामग्री अनिवार्य है');
      return;
    }
    setManualSubmitting(true);

    try {
      const mediaEmbeds: string[] = [];
      if (manualMediaUrl.trim()) {
        mediaEmbeds.push(manualMediaUrl.trim());
      }

      const postPayload: Omit<NewsItem, 'id'> = {
        title: manualHeadline.trim(),
        subTitle: manualSubHeadline.trim() || undefined,
        summary: manualSummary.trim() || manualHeadline.trim(),
        content: manualContent.trim(),
        category: manualCategory,
        district: manualDistrict,
        block: manualBlock.trim() || undefined,
        imageUrl: manualImageUrl.trim() || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1000&auto=format&fit=crop&q=80',
        mediaEmbeds,
        authorName: 'एडमिनिस्ट्रेटर (मुख्य डेस्क)',
        authorRole: 'admin',
        isBreaking: manualIsBreaking,
        status: 'published',
        views: 240,
        createdAt: Date.now(),
      };

      await addDoc(collection(db, 'news'), postPayload);
      if (onSuccessToast) onSuccessToast('समाचार सफलतापूर्वक प्रकाशित किया गया!');

      // Reset
      setManualHeadline('');
      setManualSubHeadline('');
      setManualSummary('');
      setManualContent('');
      setManualImageUrl('');
      setManualMediaUrl('');
      setManualBlock('');
      setManualIsBreaking(false);
      onRefreshData();
    } catch (err: any) {
      alert('Error posting news: ' + err.message);
    } finally {
      setManualSubmitting(false);
    }
  };

  // Reporter News Moderation Actions
  const handleModerationPublish = async (newsId: string) => {
    try {
      await updateDoc(doc(db, 'news', newsId), { status: 'published' });
      if (onSuccessToast) onSuccessToast('समाचार प्रकाशित किया गया!');
      onRefreshData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleModerationDelete = async (newsId: string) => {
    if (!confirm('क्या आप इस समाचार को हटाना चाहते हैं?')) return;
    try {
      await deleteDoc(doc(db, 'news', newsId));
      if (onSuccessToast) onSuccessToast('समाचार हटा दिया गया।');
      onRefreshData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Add Advertisement
  const handleAddAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adTitle.trim() || !adImageUrl.trim()) {
      alert('विज्ञापन का शीर्षक और इमेज यूआरएल अनिवार्य हैं');
      return;
    }
    setAdSubmitting(true);
    try {
      await addDoc(collection(db, 'advertisements'), {
        title: adTitle.trim(),
        sponsorName: adSponsor.trim() || 'स्थानीय प्रायोजक',
        imageUrl: adImageUrl.trim(),
        targetUrl: adTargetUrl.trim() || 'https://bihar.gov.in',
        placement: adPlacement,
        active: true,
        createdAt: Date.now(),
      });
      if (onSuccessToast) onSuccessToast('विज्ञापन बैनर सफलतापूर्वक जोड़ा गया!');
      setAdTitle('');
      setAdSponsor('');
      setAdImageUrl('');
      setAdTargetUrl('');
      onRefreshData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAdSubmitting(false);
    }
  };

  const handleDeleteAd = async (adId: string) => {
    try {
      await deleteDoc(doc(db, 'advertisements', adId));
      if (onSuccessToast) onSuccessToast('विज्ञापन हटा दिया गया।');
      onRefreshData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      {/* Top Bar */}
      <div className="bg-gray-900 rounded-2xl p-6 text-white shadow-xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <CircularLogo size={58} />
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-red-400 uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>DDN Prime News Command & Moderation Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mt-1">एडमिन कंट्रोल पैनल (Admin Portal)</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              प्रबंधन, एआई पोस्ट जनरेटर, रिपोर्टर सत्यापन एवं विज्ञापन नियंत्रण
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Public Portal Live Link Copy & Open */}
          <button
            onClick={() => {
              const liveUrl = window.location.origin;
              navigator.clipboard.writeText(liveUrl);
              if (onSuccessToast) onSuccessToast('पब्लिक पोर्टल का लाइव लिंक कॉपी किया गया!');
            }}
            className="flex items-center space-x-1.5 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-yellow-300 rounded-lg text-xs font-bold transition border border-gray-700 shadow"
            title="लाइव पब्लिक पोर्टल लिंक कॉपी करें"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>पब्लिक लिंक कॉपी करें</span>
          </button>

          <button
            onClick={onLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-800 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition shadow"
          >
            <LogOut className="w-4 h-4" />
            <span>लॉगआउट</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-xl shadow-sm border border-gray-200">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-bold transition ${
            activeTab === 'analytics'
              ? 'bg-red-700 text-white shadow'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>डैशबोर्ड एनालिटिक्स (Analytics)</span>
        </button>

        <button
          onClick={() => setActiveTab('reporters')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-bold transition relative ${
            activeTab === 'reporters'
              ? 'bg-red-700 text-white shadow'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>संवाददाता अनुमोदन ({pendingReporters})</span>
          {pendingReporters > 0 && (
            <span className="ml-1 w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('ai_news')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-bold transition ${
            activeTab === 'ai_news'
              ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow'
              : 'text-purple-700 hover:bg-purple-50'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Gemini AI ऑटो न्यूज़</span>
        </button>

        <button
          onClick={() => setActiveTab('manual_news')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-bold transition ${
            activeTab === 'manual_news'
              ? 'bg-red-700 text-white shadow'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>मैनुअल समाचार पोस्ट (Rich Embed)</span>
        </button>

        <button
          onClick={() => setActiveTab('moderation')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-bold transition ${
            activeTab === 'moderation'
              ? 'bg-red-700 text-white shadow'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>रिपोर्टर न्यूज़ मॉडरेशन ({pendingNews})</span>
        </button>

        <button
          onClick={() => setActiveTab('ads')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-bold transition ${
            activeTab === 'ads'
              ? 'bg-red-700 text-white shadow'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>विज्ञापन बैनर ({ads.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('comments')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-bold transition ${
            activeTab === 'comments'
              ? 'bg-red-700 text-white shadow'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>टिप्पणी मॉडरेशन ({allComments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('subscribers')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-bold transition ${
            activeTab === 'subscribers'
              ? 'bg-red-700 text-white shadow'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>न्यूज़लेटर ग्राहक ({subscribers.length})</span>
        </button>
      </div>

      {/* TAB A: Dashboard Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">कुल प्रकाशित समाचार</p>
                <h3 className="text-2xl font-black text-gray-900 mt-1">{publishedNews}</h3>
                <span className="text-[11px] text-green-600 font-semibold flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-0.5" /> एक्टिव रीडरशिप
                </span>
              </div>
              <div className="p-3 bg-red-50 text-red-700 rounded-xl">
                <FileCheck className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">स्वीकृत पत्रकार</p>
                <h3 className="text-2xl font-black text-gray-900 mt-1">{approvedReporters}</h3>
                <span className="text-[11px] text-blue-600 font-semibold mt-1 block">
                  38 जिलों में सक्रिय
                </span>
              </div>
              <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">लंबित आईडी आवेदन</p>
                <h3 className="text-2xl font-black text-amber-600 mt-1">{pendingReporters}</h3>
                <span className="text-[11px] text-amber-700 font-semibold mt-1 block">
                  समीक्षा प्रतीक्षारत
                </span>
              </div>
              <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">कुल पाठक व्यूज (Traffic)</p>
                <h3 className="text-2xl font-black text-purple-700 mt-1">{totalViews.toLocaleString()}</h3>
                <span className="text-[11px] text-purple-600 font-semibold mt-1 block">
                  लाइव मॉनिटरिंग
                </span>
              </div>
              <div className="p-3 bg-purple-50 text-purple-700 rounded-xl">
                <Eye className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* District Wise Count & Recent Visitor Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-4 h-4 text-red-600 mr-2" />
                जिला-वार समाचार कवरेज (District-wise Coverage)
              </h3>
              <div className="space-y-3">
                {Object.entries(districtWiseCount).map(([dist, count]) => (
                  <div key={dist} className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-700">{dist}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-red-600 h-full rounded-full"
                          style={{ width: `${Math.min(100, (count / totalNews) * 100 * 2)}%` }}
                        />
                      </div>
                      <span className="font-bold text-gray-900 w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-2" />
                  वेबसाइट विज़िटर एनालिटिक्स संक्षेप (DDN Prime Live Metrics)
                </h3>
                <p className="text-xs text-gray-600 mb-4">
                  बिहार एक्सप्रेस और जिलेवार खबरों को सर्वाधिक पाठक पटना, मुजफ्फरपुर, गया और दरभंगा से प्राप्त हो रहे हैं।
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-gray-500">मोबाइल यूज़र्स</span>
                    <div className="text-lg font-bold text-gray-900 mt-0.5">86.4%</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-gray-500">डेस्कटॉप / टैबलेट</span>
                    <div className="text-lg font-bold text-gray-900 mt-0.5">13.6%</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-gray-500">औसत समय प्रति पाठक</span>
                    <div className="text-lg font-bold text-gray-900 mt-0.5">3 मिनट 42 सेकंड</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-gray-500">बिहार एक्सप्रेस पाठक</span>
                    <div className="text-lg font-bold text-red-700 mt-0.5">64.2%</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 text-[11px] text-gray-400">
                डीडीएन प्राइम न्यूज़ सुरक्षित रियल-टाइम क्लाउड नेटवर्क से जुड़ा हुआ है।
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB B: Reporter Management & ID Card Approval */}
      {activeTab === 'reporters' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                संवाददाता आवेदन एवं प्रेस आईडी कार्ड प्रबंधन
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                <strong>सख्त नियम:</strong> बिना एडमिन अनुमोदन के किसी भी पत्रकार को आईडी कार्ड अथवा समाचार पोस्टिंग का अधिकार नहीं मिलता।
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase border-b border-gray-200">
                <tr>
                  <th className="p-3">फोटो व नाम</th>
                  <th className="p-3">कार्य क्षेत्र (जिला/प्रखंड)</th>
                  <th className="p-3">माता/पिता का नाम</th>
                  <th className="p-3">संपर्क (एडमिन हेतु सुरक्षित)</th>
                  <th className="p-3">दस्तावेज</th>
                  <th className="p-3">स्थिति / आईडी</th>
                  <th className="p-3 text-right">कार्रवाई</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reporters.map((rep) => (
                  <tr key={rep.id} className="hover:bg-gray-50/70 transition">
                    <td className="p-3">
                      <div className="flex items-center space-x-3">
                        <img
                          src={rep.photoUrl}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover border border-gray-300"
                        />
                        <div>
                          <div className="font-bold text-gray-900">{rep.fullName}</div>
                          <div className="text-[10px] text-gray-500">
                            {new Date(rep.appliedAt).toLocaleDateString('hi-IN')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-gray-800">{rep.district}</div>
                      <div className="text-[11px] text-gray-500">{rep.block || 'सदर'}</div>
                    </td>
                    <td className="p-3 text-gray-700">
                      <div>पिता: {rep.fatherName}</div>
                      <div className="text-gray-500">माता: {rep.motherName}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-mono text-gray-800">{rep.mobileNumber}</div>
                      <div className="text-[10px] text-gray-500">{rep.email}</div>
                    </td>
                    <td className="p-3">
                      {rep.certificateUrl ? (
                        <a
                          href={rep.certificateUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 text-blue-600 hover:underline font-semibold"
                        >
                          <span>प्रमाण पत्र देखें</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-gray-400">उपलब्ध नहीं</span>
                      )}
                    </td>
                    <td className="p-3">
                      {rep.status === 'approved' ? (
                        <div>
                          <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-bold text-[10px]">
                            स्वीकृत (Approved)
                          </span>
                          <div className="font-mono font-bold text-red-700 mt-1">
                            {rep.reporterId}
                          </div>
                          {rep.formalPassword && (
                            <div className="text-[10px] text-gray-500 font-mono">
                              पासवर्ड: <span className="font-bold text-gray-700">{rep.formalPassword}</span>
                            </div>
                          )}
                        </div>
                      ) : rep.status === 'rejected' ? (
                        <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-bold text-[10px]">
                          अस्वीकृत
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold text-[10px]">
                          लंबित (Pending)
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5 flex-wrap gap-1">
                        {rep.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleApproveReporter(rep)}
                              className="px-2.5 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded font-bold text-xs flex items-center space-x-1"
                              title="अनुमोदित करें एवं आईडी कार्ड जनरेट करें"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>स्वीकृत करें</span>
                            </button>
                            <button
                              onClick={() => handleRejectReporter(rep)}
                              className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded font-bold text-xs flex items-center space-x-1"
                              title="आवेदन रद्द करें"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>रद्द</span>
                            </button>
                          </>
                        ) : rep.status === 'approved' ? (
                          <>
                            <button
                              onClick={() => setPreviewReporter(rep)}
                              className="px-2.5 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded font-bold text-xs flex items-center space-x-1"
                              title="डिजिटल प्रेस आईडी कार्ड देखें"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>आईडी कार्ड</span>
                            </button>
                            <button
                              onClick={() => setPreviewAuthLetter(rep)}
                              className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-gray-950 rounded font-black text-xs flex items-center space-x-1"
                              title="डिजिटल मोहरयुक्त ऑथराइजेशन लेटर देखें"
                            >
                              <FileCheck className="w-3.5 h-3.5" />
                              <span>ऑथराइजेशन</span>
                            </button>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB C: AI News Generator (Gemini API Integration) */}
      {activeTab === 'ai_news' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
          <div className="mb-6">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Google Gemini AI Automatic News Desk</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-gray-900">
              सिंगल-प्रॉम्प्ट एआई समाचार जनरेटर (Single-Prompt News Generator)
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              विषय या कीवर्ड दर्ज करें (उदा. "पटना में नई मेट्रो लाइन का उद्घाटन" या "Top 5 Bihar News Today"), जेमिनी मॉडल पूरी खबर, हेडिंग, सारांश और फोटो प्रॉम्प्ट तैयार कर देगा।
            </p>
          </div>

          {/* AI Generator Controls */}
          <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 mb-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                समाचार विषय या निर्देश (Topic / Query Prompt) *
              </label>
              <input
                type="text"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                placeholder="उदा. पटना में गंगा रिवर फ्रंट पर नए पर्यटन कॉरिडोर का निर्माण शुरू..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  लक्षित जिला (District Tag)
                </label>
                <select
                  value={aiDistrict}
                  onChange={(e) => setAiDistrict(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
                >
                  {BIHAR_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  श्रेणी (Category)
                </label>
                <select
                  value={aiCategory}
                  onChange={(e) => setAiCategory(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Custom Photo Upload for AI News (User Requested: एआई से जो न्यूज़ लिखा जा रहा है, वहां भी एक कॉलम फोटो अपलोड का दे दीजिए। अगर फोटो अपलोड नहीं करता है तो उस न्यूज़ के हिसाब से फोटो जनरेट करना एआई का काम रहेगा) */}
            <div className="bg-white p-3.5 rounded-xl border border-purple-200">
              <PhotoUploadHelper
                value={aiCustomPhoto}
                onChange={setAiCustomPhoto}
                topicOrCategory={`${aiTopic} ${aiCategory}`}
                label="फोटो अपलोड या ऑटो-लिंक (वैकल्पिक - यदि खाली छोड़ेंगे तो AI स्वतः प्रासंगिक फोटो जनरेट करेगा)"
                placeholder="फोटो लिंक (URL) डालें या 'फोटो चुनें' / 'फोटो फोल्डर' से लोड करें..."
                allowAiGeneration={true}
              />
            </div>

            {aiError && (
              <div className="p-3 bg-red-100 text-red-800 rounded-lg text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{aiError}</span>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={handleGenerateAiNews}
                disabled={aiLoading}
                className="px-6 py-3 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-bold rounded-xl shadow-md transition flex items-center space-x-2 disabled:opacity-50"
              >
                {aiLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Gemini AI समाचार तैयार कर रहा है...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>समाचार जनरेट करें (Generate Structured News)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI Result Preview & Direct One-Click Post */}
          {aiGeneratedStory && (
            <div className="border-2 border-purple-200 rounded-2xl p-6 bg-purple-50/30 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="bg-purple-700 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {aiGeneratedStory.category}
                  </span>
                  <span className="bg-white border border-gray-300 text-gray-800 text-xs font-bold px-3 py-1 rounded-full">
                    {aiGeneratedStory.district}
                  </span>
                </div>

                <button
                  onClick={handlePublishAiNews}
                  className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-black rounded-xl shadow transition flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>वन-क्लिक ऑटो पोस्ट (Publish to Firestore)</span>
                </button>
              </div>

              {/* Title & Content */}
              <h3 className="text-xl md:text-2xl font-black text-gray-900 leading-snug">
                {aiGeneratedStory.title}
              </h3>
              {aiGeneratedStory.subTitle && (
                <p className="text-sm font-semibold text-gray-600 mt-1">
                  {aiGeneratedStory.subTitle}
                </p>
              )}

              {/* Featured Image */}
              {aiGeneratedStory.imageUrl && (
                <div className="my-4 rounded-xl overflow-hidden border border-gray-200 shadow-sm max-h-72">
                  <img
                    src={aiGeneratedStory.imageUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Prompt Info */}
              {aiGeneratedStory.imagePrompt && (
                <div className="bg-white p-3 rounded-lg border border-purple-100 text-xs text-purple-900 mb-4">
                  <strong>AI Image Prompt:</strong> {aiGeneratedStory.imagePrompt}
                </div>
              )}

              {/* Summary */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 mb-4 text-sm font-medium text-gray-800 italic">
                {aiGeneratedStory.summary}
              </div>

              {/* Content */}
              <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed bg-white p-5 rounded-xl border border-gray-200">
                {aiGeneratedStory.content}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB D: Manual News Posting System with Rich Embeds */}
      {activeTab === 'manual_news' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              मैनुअल समाचार प्रकाशन (Rich Embed Support)
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              YouTube वीडियो, Facebook वीडियो या Instagram Reel का यूआरएल पेस्ट करने पर वह स्वतः वीडियो प्लेयर के रूप में एम्बेड हो जाएगा।
            </p>
          </div>

          <form onSubmit={handleManualPost} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                मुख्य समाचार शीर्षक (Headline) *
              </label>
              <input
                type="text"
                required
                value={manualHeadline}
                onChange={(e) => setManualHeadline(e.target.value)}
                placeholder="उदा. मुजफ्फरपुर में नए फ्लाईवओवर का निर्माण कार्य पूर्ण..."
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                उप-शीर्षक (Sub-headline)
              </label>
              <input
                type="text"
                value={manualSubHeadline}
                onChange={(e) => setManualSubHeadline(e.target.value)}
                placeholder="संदर्भ या विशेष टिप्पणी..."
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  श्रेणी (Category)
                </label>
                <select
                  value={manualCategory}
                  onChange={(e) => setManualCategory(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  जिला (District Tag)
                </label>
                <select
                  value={manualDistrict}
                  onChange={(e) => setManualDistrict(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white"
                >
                  {BIHAR_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  प्रखंड / ब्लॉक (Block)
                </label>
                <input
                  type="text"
                  value={manualBlock}
                  onChange={(e) => setManualBlock(e.target.value)}
                  placeholder="उदा. सदर / नगर"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>

            {/* Featured Image with Auto Link Generator & Folder Integration */}
            <PhotoUploadHelper
              value={manualImageUrl}
              onChange={setManualImageUrl}
              topicOrCategory={`${manualHeadline} ${manualCategory}`}
              label="मुख्य तस्वीर फोटो (Auto Link Generator / Upload from Device / Folder)"
              placeholder="फोटो लिंक (URL), या 'फोटो चुनें' / 'फोटो फोल्डर' से डायरेक्ट जोड़ें..."
              allowAiGeneration={true}
            />

            {/* Rich Media Embed Input */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                मीडिया एम्बेड (YouTube Video, Facebook Video, or Instagram Reel URL)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Video className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  value={manualMediaUrl}
                  onChange={(e) => setManualMediaUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... या FB/Instagram URL"
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              {manualMediaUrl && (
                <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                  <div className="text-[11px] font-bold text-gray-600 mb-1">लाइव एम्बेड पूर्वावलोकन:</div>
                  <MediaEmbed url={manualMediaUrl} />
                </div>
              )}
            </div>

            {/* Summary */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                संक्षिप्त सारांश (Short Summary)
              </label>
              <textarea
                rows={2}
                value={manualSummary}
                onChange={(e) => setManualSummary(e.target.value)}
                placeholder="2-3 पंक्तियों में हाइलाइट्स..."
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                विस्तृत समाचार रिपोर्ट (Detailed Content) *
              </label>
              <textarea
                rows={8}
                required
                value={manualContent}
                onChange={(e) => setManualContent(e.target.value)}
                placeholder="समाचार का पूर्ण विवरण लिखें..."
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center space-x-2 text-xs font-bold text-red-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={manualIsBreaking}
                  onChange={(e) => setManualIsBreaking(e.target.checked)}
                  className="rounded text-red-600"
                />
                <span>ब्रेकिंग न्यूज़ टिकर में दिखाएं (Breaking News Alert)</span>
              </label>

              <button
                type="submit"
                disabled={manualSubmitting}
                className="px-8 py-3 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl shadow transition"
              >
                {manualSubmitting ? 'प्रकाशित हो रहा है...' : 'समाचार लाइव प्रकाशित करें'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB E: Reporter News Moderation */}
      {activeTab === 'moderation' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            संवाददाताओं द्वारा प्रेषित समाचारों की समीक्षा (News Moderation)
          </h2>
          <p className="text-xs text-gray-500 mb-6">
            एडमिन के पास किसी भी समाचार को संशोधित करने, स्वीकृत कर लाइव करने अथवा हटाने का पूर्ण अधिकार है।
          </p>

          <div className="space-y-4">
            {newsList.map((item) => (
              <div
                key={item.id}
                className="p-5 border border-gray-200 rounded-2xl hover:border-gray-300 transition flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white"
              >
                <div className="flex items-start space-x-4">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                    />
                  )}
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-[11px] font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded">
                        {item.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {item.district || 'बिहार'}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        लेखक: <strong className="text-gray-800">{item.authorName}</strong> ({item.authorRole})
                      </span>
                    </div>

                    <h4 className="font-bold text-gray-900 text-base leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{item.summary}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end md:self-center flex-shrink-0">
                  <button
                    onClick={() => handleStartEditNews(item)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1 shadow-xs transition"
                    title="एडमिन द्वारा समाचार संपादित करें"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>एडिट करें (Edit)</span>
                  </button>

                  {item.status === 'pending' && (
                    <button
                      onClick={() => handleModerationPublish(item.id)}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1 shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>स्वीकृत व लाइव करें</span>
                    </button>
                  )}
                  {item.status === 'published' && (
                    <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-200">
                      लाइव (Published)
                    </span>
                  )}
                  <button
                    onClick={() => handleModerationDelete(item.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="समाचार हटाएं"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB F: Ad Banner Management System */}
      {activeTab === 'ads' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              निजी पोस्टर विज्ञापन प्रबंधन (Poster Ads Management)
            </h2>
            <p className="text-xs text-gray-500 mb-6">
              स्थानीय प्रायोजकों और सरकारी योजनाओं के पोस्टर विज्ञापन जोड़ें (हेडर, साइडबार, या लेखों के बीच में)।
            </p>

            <form onSubmit={handleAddAd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  विज्ञापन का शीर्षक (Campaign Title) *
                </label>
                <input
                  type="text"
                  required
                  value={adTitle}
                  onChange={(e) => setAdTitle(e.target.value)}
                  placeholder="उदा. बिहार मेगा जॉब फेयर 2026"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  प्रायोजक का नाम (Sponsor Name)
                </label>
                <input
                  type="text"
                  value={adSponsor}
                  onChange={(e) => setAdSponsor(e.target.value)}
                  placeholder="उदा. श्रम संसाधन विभाग, बिहार"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  बैनर इमेज URL *
                </label>
                <input
                  type="url"
                  required
                  value={adImageUrl}
                  onChange={(e) => setAdImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... बैनर यूआरएल"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  टारगेट लिंक (Click URL)
                </label>
                <input
                  type="url"
                  value={adTargetUrl}
                  onChange={(e) => setAdTargetUrl(e.target.value)}
                  placeholder="https://bihar.gov.in"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  स्थान (Placement Slot)
                </label>
                <select
                  value={adPlacement}
                  onChange={(e) => setAdPlacement(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                >
                  <option value="header_top">टॉप हेडर बैनर (Top Header Banner)</option>
                  <option value="sidebar">साइडबार पोस्टर (Sidebar Poster)</option>
                  <option value="inline_content">आर्टिकल के बीच (Between Articles)</option>
                  <option value="footer">फुटर बैनर (Footer)</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={adSubmitting}
                  className="w-full py-2.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg text-sm transition shadow"
                >
                  {adSubmitting ? 'जोड़ा जा रहा है...' : 'नया विज्ञापन जोड़ें'}
                </button>
              </div>
            </form>
          </div>

          {/* Active Ads List */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ads.map((ad) => (
              <div
                key={ad.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm p-4 relative group"
              >
                <div className="w-full h-32 rounded-lg overflow-hidden bg-gray-100 mb-3">
                  <img src={ad.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="text-xs font-bold text-red-700 uppercase tracking-wider">
                  स्लॉट: {ad.placement}
                </div>
                <h4 className="font-bold text-gray-900 text-sm mt-0.5">{ad.title}</h4>
                <p className="text-xs text-gray-500">{ad.sponsorName}</p>
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-100">
                  <a
                    href={ad.targetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-600 hover:underline flex items-center"
                  >
                    <span>लिंक खोलें</span>
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                  <button
                    onClick={() => handleDeleteAd(ad.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="हटाएं"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB G: Reader Comments Moderation */}
      {activeTab === 'comments' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-red-600" />
                <span>पाठक टिप्पणी मॉडरेशन (Comment Moderation)</span>
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                पोर्टल पर पाठकों और संवाददाताओं द्वारा पोस्ट की गई सभी टिप्पणियों की निगरानी करें एवं अनुचित सामग्री हटाएं।
              </p>
            </div>
            <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">
              कुल टिप्पणियां: <strong className="text-red-700">{allComments.length}</strong>
            </span>
          </div>

          {allComments.length === 0 ? (
            <div className="p-12 text-center text-gray-400 bg-gray-50 rounded-2xl border border-gray-200">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-600">कोई टिप्पणी उपलब्ध नहीं है।</p>
            </div>
          ) : (
            <div className="space-y-3">
              {allComments.map((com) => {
                const associatedArticle = newsList.find((n) => n.id === com.articleId);

                return (
                  <div
                    key={com.id}
                    className="p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-bold text-gray-900">{com.authorName}</span>
                        {com.authorRole === 'admin' ? (
                          <span className="bg-red-700 text-white text-[10px] font-bold px-2 py-0.2 rounded-full">
                            एडमिन
                          </span>
                        ) : com.authorRole === 'reporter' ? (
                          <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.2 rounded-full">
                            संवाददाता {com.authorDistrict ? `(${com.authorDistrict})` : ''}
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-700 text-[10px] font-semibold px-2 py-0.2 rounded-full">
                            पाठक
                          </span>
                        )}

                        <span className="text-gray-400 text-[11px]">
                          • {new Date(com.createdAt).toLocaleString('hi-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>

                        {com.parentId && (
                          <span className="bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.2 rounded border border-amber-200">
                            जवाब (Reply)
                          </span>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm text-gray-800 bg-gray-50/70 p-2.5 rounded-lg border border-gray-100 leading-relaxed">
                        {com.content}
                      </p>

                      <div className="text-[11px] text-gray-500 flex items-center space-x-2">
                        <span>खबर: <strong className="text-gray-700">{associatedArticle?.title || 'समाचार लेख'}</strong></span>
                        <span>•</span>
                        <span className="text-red-600 font-bold">{com.likes || 0} लाइक्स</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <button
                        onClick={() => handleAdminDeleteComment(com.id)}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold transition flex items-center space-x-1"
                        title="अनुचित टिप्पणी हटाएं"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>टिप्पणी हटाएं</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB H: Daily Newsletter Subscribers */}
      {activeTab === 'subscribers' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">
                    दैनिक न्यूज़लेटर ग्राहक (Daily Newsletter Subscribers)
                  </h3>
                  <p className="text-xs text-gray-500">
                    वे पाठक जिन्होंने सुबह 7 बजे दैनिक समाचार बुलेटिन के लिए अपना ईमेल पंजीकृत किया है।
                  </p>
                </div>
              </div>

              {/* Action & Export */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    if (subscribers.length === 0) {
                      alert('निर्यात के लिए कोई ग्राहक उपलब्ध नहीं है।');
                      return;
                    }
                    const csvRows = [
                      ['Email', 'Status', 'Frequency', 'District', 'SubscribedAt'],
                      ...subscribers.map((s) => [
                        s.email,
                        s.status,
                        s.frequency || 'दैनिक',
                        s.district || 'समस्त बिहार',
                        s.subscribedAt || ''
                      ])
                    ];
                    const csvContent =
                      'data:text/csv;charset=utf-8,' +
                      csvRows.map((e) => e.map((val) => `"${val}"`).join(',')).join('\n');
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement('a');
                    link.setAttribute('href', encodedUri);
                    link.setAttribute('download', `ddn_newsletter_subscribers_${new Date().toISOString().split('T')[0]}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="px-3.5 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-lg transition shadow-sm flex items-center space-x-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>CSV निर्यात (Export)</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5">
              <div className="bg-red-50/60 p-4 rounded-xl border border-red-100">
                <span className="text-xs font-bold text-red-700 uppercase">कुल पंजीकृत पाठक</span>
                <p className="text-2xl font-black text-gray-900 mt-1">{subscribers.length}</p>
                <span className="text-[10px] text-gray-500 font-medium">बुलेटिन प्राप्तकर्ता</span>
              </div>
              <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100">
                <span className="text-xs font-bold text-emerald-700 uppercase">सक्रिय सब्सक्रिप्शन</span>
                <p className="text-2xl font-black text-gray-900 mt-1">
                  {subscribers.filter((s) => s.status !== 'unsubscribed').length}
                </p>
                <span className="text-[10px] text-gray-500 font-medium">Active Status</span>
              </div>
              <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-100">
                <span className="text-xs font-bold text-amber-700 uppercase">डिलीवरी समय</span>
                <p className="text-lg font-black text-gray-900 mt-1">प्रातः 07:00 AM IST</p>
                <span className="text-[10px] text-gray-500 font-medium">दैनिक मॉर्निंग डाइजेस्ट</span>
              </div>
            </div>

            {/* Search Input */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="ईमेल या जिला द्वारा खोजें (Search by email or district)..."
                value={subscriberSearch}
                onChange={(e) => setSubscriberSearch(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 bg-gray-50"
              />
            </div>

            {/* Subscribers List */}
            {(() => {
              const filtered = subscribers.filter(
                (s) =>
                  s.email.toLowerCase().includes(subscriberSearch.toLowerCase()) ||
                  (s.district && s.district.toLowerCase().includes(subscriberSearch.toLowerCase()))
              );

              if (filtered.length === 0) {
                return (
                  <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <Mail className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-500 font-bold">
                      {subscriberSearch
                        ? 'कोई मेल खाते ग्राहक नहीं मिले।'
                        : 'अभी तक कोई न्यूज़लेटर ग्राहक पंजीकृत नहीं हैं।'}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      पोर्टल के साइडबार पर 'दैनिक समाचार बुलेटिन' फ़ॉर्म द्वारा पाठक सब्सक्राइब कर सकते हैं।
                    </p>
                  </div>
                );
              }

              return (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-700">
                    <thead className="bg-gray-100 text-gray-600 font-black uppercase text-[10px] tracking-wider border-b border-gray-200">
                      <tr>
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">ईमेल (Email)</th>
                        <th className="py-2.5 px-3">आवृत्ति (Frequency)</th>
                        <th className="py-2.5 px-3">पसंदीदा जिला (District)</th>
                        <th className="py-2.5 px-3">पंजीकरण तिथि (Date)</th>
                        <th className="py-2.5 px-3">स्थिति (Status)</th>
                        <th className="py-2.5 px-3 text-right">कार्रवाई</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filtered.map((sub, idx) => (
                        <tr key={sub.id || idx} className="hover:bg-gray-50/70 transition">
                          <td className="py-2.5 px-3 font-bold text-gray-400">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-bold text-gray-900 flex items-center space-x-1.5">
                            <Mail className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                            <span>{sub.email}</span>
                          </td>
                          <td className="py-2.5 px-3 text-gray-600">
                            {sub.frequency || 'दैनिक (7 AM)'}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
                              <MapPin className="w-3 h-3 text-red-600 mr-1" />
                              {sub.district || 'समस्त बिहार'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-gray-500 text-[11px]">
                            {sub.subscribedAt
                              ? new Date(sub.subscribedAt).toLocaleString('hi-IN', {
                                  dateStyle: 'medium',
                                  timeStyle: 'short',
                                })
                              : 'अज्ञात'}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                sub.status === 'unsubscribed'
                                  ? 'bg-gray-100 text-gray-600'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {sub.status === 'unsubscribed' ? 'निष्क्रिय' : 'सक्रिय (Active)'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => handleAdminDeleteSubscriber(sub.id)}
                              className="p-1.5 text-gray-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                              title="हटाएं (Delete)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ID Card Preview Modal */}
      {previewReporter && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full relative">
            <button
              onClick={() => setPreviewReporter(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1 rounded-full bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
            <ReporterIdCard reporter={previewReporter} showPrintButton={true} isAuthenticated={true} />
          </div>
        </div>
      )}

      {/* Authorization Letter Preview Modal */}
      {previewAuthLetter && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-4 sm:p-8 max-w-4xl w-full relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setPreviewAuthLetter(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-2 rounded-full bg-gray-100 print:hidden z-20"
            >
              <X className="w-5 h-5" />
            </button>
            <ReporterAuthorizationLetter reporter={previewAuthLetter} showPrintButton={true} isAuthenticated={true} />
          </div>
        </div>
      )}

      {/* Edit News Modal (User Requested: एडमिन को चाहे रिपोर्टर का लगाया हुआ न्यूज हो या एडमिन का स्वतः किया हुआ न्यूज हो, वो न्यूज एडिट करने का राइट एडमिन को रहना चाहिए) */}
      {editingNews && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-3xl w-full relative max-h-[90vh] overflow-y-auto border border-gray-200 shadow-2xl">
            <button
              onClick={() => setEditingNews(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-2 rounded-full bg-gray-100 transition z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5 pb-3 border-b border-gray-200">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 mb-2">
                <Edit3 className="w-3.5 h-3.5" />
                <span>एडमिन स्पेशल एडिटिंग राइट्स (Admin News Editor)</span>
              </div>
              <h2 className="text-xl font-black text-gray-900">समाचार संपादित करें</h2>
              <p className="text-xs text-gray-500">
                मूल लेखक: <strong>{editingNews.authorName}</strong> ({editingNews.authorRole}) • आईडी: {editingNews.id}
              </p>
            </div>

            <form onSubmit={handleSaveEditNews} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  मुख्य शीर्षक (Headline) *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  उप-शीर्षक (Sub-headline)
                </label>
                <input
                  type="text"
                  value={editSubTitle}
                  onChange={(e) => setEditSubTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    श्रेणी (Category)
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    जिला (District)
                  </label>
                  <select
                    value={editDistrict}
                    onChange={(e) => setEditDistrict(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white"
                  >
                    {BIHAR_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    प्रखंड (Block)
                  </label>
                  <input
                    type="text"
                    value={editBlock}
                    onChange={(e) => setEditBlock(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                    placeholder="उदा. सदर"
                  />
                </div>
              </div>

              {/* Photo Upload & Auto Link Helper */}
              <PhotoUploadHelper
                value={editImageUrl}
                onChange={setEditImageUrl}
                topicOrCategory={`${editTitle} ${editCategory}`}
                label="फोटो लिंक व फोल्डर (Auto Link / Replace Image)"
                placeholder="फोटो लिंक (URL) डालें या 'फोटो चुनें' / 'फोटो फोल्डर' से लोड करें..."
                allowAiGeneration={true}
              />

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  संक्षिप्त सारांश (Summary)
                </label>
                <textarea
                  rows={2}
                  value={editSummary}
                  onChange={(e) => setEditSummary(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  विस्तृत समाचार सामग्री (Content) *
                </label>
                <textarea
                  rows={7}
                  required
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    प्रकाशन स्थिति (Status)
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white font-bold"
                  >
                    <option value="published">लाइव प्रकाशित (Published)</option>
                    <option value="pending">समीक्षाधीन (Pending Review)</option>
                    <option value="rejected">अस्वीकृत (Rejected)</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center space-x-2 text-xs font-bold text-red-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editIsBreaking}
                      onChange={(e) => setEditIsBreaking(e.target.checked)}
                      className="rounded text-red-600"
                    />
                    <span>ब्रेकिंग न्यूज़ टिकर में दिखाएं</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setEditingNews(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-100"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md transition disabled:opacity-50"
                >
                  {savingEdit ? 'अपडेट हो रहा है...' : 'परिवर्तन सेव करें (Save Changes)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
