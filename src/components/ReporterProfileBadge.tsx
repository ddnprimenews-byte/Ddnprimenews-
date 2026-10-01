import React, { useState } from 'react';
import { ReporterApplication } from '../types';
import { CheckCircle2, ShieldCheck, MapPin, Award, Eye, FileText, ChevronRight, X, ExternalLink } from 'lucide-react';
import { ReporterIdCard } from './ReporterIdCard';
import { ReporterAuthorizationLetter } from './ReporterAuthorizationLetter';
import { LoginModal } from './LoginModal';

export interface ReporterProfileBadgeProps {
  reporter?: ReporterApplication | null;
  authorName: string;
  authorDistrict?: string;
  authorRole?: 'admin' | 'reporter' | 'ai';
  onViewOurTeam?: () => void;
  allReporters?: ReporterApplication[];
  isAdminLoggedIn?: boolean;
  loggedInReporter?: ReporterApplication | null;
  onReporterLoginSuccess?: (rep: ReporterApplication) => void;
  onAdminLoginSuccess?: () => void;
  className?: string;
}

export const ReporterProfileBadge: React.FC<ReporterProfileBadgeProps> = ({
  reporter,
  authorName,
  authorDistrict,
  authorRole = 'reporter',
  onViewOurTeam,
  allReporters = [],
  isAdminLoggedIn = false,
  loggedInReporter = null,
  onReporterLoginSuccess,
  onAdminLoginSuccess,
  className = '',
}) => {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'id_card' | 'auth_letter'>('id_card');

  // Login guard for downloads
  const [showLoginGuardModal, setShowLoginGuardModal] = useState(false);
  const [loginGuardMessage, setLoginGuardMessage] = useState({
    title: 'संवाददाता डाउनलोड प्रमाणीकरण',
    desc: 'प्रेस आईडी कार्ड एवं आधिकारिक ऑथराइजेशन लेटर डाउनलोड करने के लिए कृपया अपने पंजीकृत क्रेडेंशियल से लॉगिन करें।'
  });

  const isAuthenticated = Boolean(isAdminLoggedIn || loggedInReporter);

  // If this news isn't written by a human reporter or verified reporter
  if (authorRole === 'ai') {
    return (
      <div className={`p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center space-x-3.5 ${className}`}>
        <div className="w-11 h-11 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shadow-xs border border-indigo-200">
          AI
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-gray-900 text-sm truncate">डीडीएन एआई न्यूज़रूम (DDN AI Desk)</span>
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold rounded-full">
              Automated Fact-Checked
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            यह समाचार आधिकारिक स्रोतों, प्रेस विज्ञप्तियों एवं एआई एल्गोरिदम द्वारा संकलित किया गया है।
          </p>
        </div>
      </div>
    );
  }

  // Fallback photo or real reporter photo
  const photo =
    reporter?.photoUrl ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80';

  const designation = reporter?.designation || 'प्रमाणित जिला संवाददाता (District Correspondent)';
  const district = reporter?.district || authorDistrict || 'समस्त बिहार';
  const reporterId = reporter?.reporterId || 'DDN-REP-VERIFIED';

  return (
    <>
      {/* Enhanced Reporter Profile Badge Card */}
      <div
        className={`bg-gradient-to-r from-red-50/70 via-white to-amber-50/50 border-2 border-red-200/90 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden ${className}`}
      >
        {/* Subtle Watermark Accent */}
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-red-600/5 rounded-full blur-xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          {/* Reporter Details (Photo + Info + Badges) */}
          <div className="flex items-center space-x-3.5 min-w-0">
            {/* Avatar with Maroon & Gold Verified Rings */}
            <div className="relative flex-shrink-0">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full p-0.5 bg-gradient-to-tr from-[#8a0a14] via-amber-400 to-[#8a0a14] shadow-md">
                <img
                  src={photo}
                  alt={authorName}
                  className="w-full h-full rounded-full object-cover bg-white"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80';
                  }}
                />
              </div>
              <div
                className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-0.5 rounded-full shadow-sm border-2 border-white"
                title="अधिकृत एवं सत्यापित पत्रकार (100% Verified Press Reporter)"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Name, Designation & Meta */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                <h4 className="font-black text-gray-900 text-base sm:text-lg tracking-tight truncate">
                  {authorName}
                </h4>

                {/* Verified Reporter Badge (Links to full profile) */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('id_card');
                    setShowDetailModal(true);
                  }}
                  className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-2xs hover:shadow-xs transition-all active:scale-95 cursor-pointer"
                  title="सत्यापित संवाददाता: संपूर्ण प्रोफाइल व प्रेस पहचान पत्र देखने के लिए क्लिक करें"
                >
                  <ShieldCheck className="w-3 h-3 text-emerald-200" />
                  <span>सत्यापित संवाददाता (Verified Reporter)</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-80" />
                </button>
              </div>

              {/* Designation & Press ID */}
              <div className="flex flex-wrap items-center text-xs text-gray-600 gap-y-1 gap-x-2.5 font-medium">
                <span className="text-red-900 font-bold">{designation}</span>
                <span className="text-gray-300">•</span>
                <span className="flex items-center text-gray-600">
                  <MapPin className="w-3 h-3 text-red-600 mr-1" />
                  {district}
                </span>
                {reporter?.reporterId && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span className="font-mono text-gray-500 font-semibold text-[11px]">
                      ID: {reporterId}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action: Open Full Profile & Digital Press Credentials Modal */}
          <div className="flex items-center space-x-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-red-100">
            <button
              onClick={() => {
                setActiveTab('id_card');
                setShowDetailModal(true);
              }}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition shadow-xs hover:shadow active:scale-95 cursor-pointer"
              title="संवाददाता का डिजिटल प्रेस पहचान पत्र एवं प्राधिकार पत्र देखें"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>प्रेस पहचान देखें (View Profile)</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-80" />
            </button>

            {onViewOurTeam && (
              <button
                onClick={onViewOurTeam}
                className="inline-flex items-center justify-center p-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold transition shadow-2xs hover:shadow-xs active:scale-95"
                title="डीडीएन प्राइम न्यूज़ की पूरी टीम सूची देखें"
              >
                <Award className="w-3.5 h-3.5 text-amber-600" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Full Modal: Digital Press ID Card & Authorization Letter */}
      {showDetailModal && reporter && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto print:p-0">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-4 sm:p-7 relative max-h-[92vh] overflow-y-auto shadow-2xl border border-gray-200">
            {/* Modal Header & Close Button */}
            <button
              onClick={() => setShowDetailModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition z-20 print:hidden"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Reporter Header Info */}
            <div className="text-center mb-5 print:hidden">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold mb-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>प्रमाणित एवं अधिकृत संवाददाता • DDN Prime News</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                {authorName}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {designation} • {district}
              </p>
            </div>

            {/* Switch Tabs: ID Card vs Official Authorization Letter */}
            <div className="flex items-center justify-center space-x-2 border-b border-gray-200 pb-3 mb-6 print:hidden">
              <button
                onClick={() => setActiveTab('id_card')}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === 'id_card'
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>डिजिटल प्रेस आईडी कार्ड</span>
              </button>

              <button
                onClick={() => setActiveTab('auth_letter')}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === 'auth_letter'
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>प्राधिकार पत्र (Auth Letter)</span>
              </button>
            </div>

            {/* Content Display */}
            {activeTab === 'id_card' ? (
              <div className="flex flex-col items-center">
                <ReporterIdCard
                  reporter={reporter}
                  showPrintButton={true}
                  isAuthenticated={isAuthenticated}
                  onRequestLogin={() => {
                    setShowDetailModal(false);
                    setLoginGuardMessage({
                      title: 'प्रेस आईडी कार्ड डाउनलोड प्रमाणीकरण',
                      desc: 'प्रेस आईडी कार्ड को उच्च-गुणवत्ता पीडीएफ में डाउनलोड करने के लिए कृपया अपने पंजीकृत क्रेडेंशियल से लॉगिन करें।'
                    });
                    setShowLoginGuardModal(true);
                  }}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <ReporterAuthorizationLetter
                  reporter={reporter}
                  showPrintButton={true}
                  isAuthenticated={isAuthenticated}
                  onRequestLogin={() => {
                    setShowDetailModal(false);
                    setLoginGuardMessage({
                      title: 'ऑथराइजेशन लेटर डाउनलोड प्रमाणीकरण',
                      desc: 'आधिकारिक प्राधिकार पत्र को पीडीएफ में डाउनलोड करने के लिए कृपया अपने पंजीकृत क्रेडेंशियल से लॉगिन करें।'
                    });
                    setShowLoginGuardModal(true);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Login Guard Modal if unauthenticated user attempts download from badge modal */}
      {showLoginGuardModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-md w-full relative">
            <button
              onClick={() => setShowLoginGuardModal(false)}
              className="absolute top-3 right-3 text-white/80 hover:text-white p-2 rounded-full bg-black/50 transition z-30"
            >
              <X className="w-5 h-5" />
            </button>

            <LoginModal
              onBack={() => setShowLoginGuardModal(false)}
              reporters={allReporters}
              customTitle={loginGuardMessage.title}
              customDescription={loginGuardMessage.desc}
              onReporterLoginSuccess={(rep) => {
                setShowLoginGuardModal(false);
                if (onReporterLoginSuccess) onReporterLoginSuccess(rep);
              }}
              onAdminLoginSuccess={() => {
                setShowLoginGuardModal(false);
                if (onAdminLoginSuccess) onAdminLoginSuccess();
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};
