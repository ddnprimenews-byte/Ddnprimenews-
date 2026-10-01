import React, { useState } from 'react';
import { ReporterApplication, BIHAR_DISTRICTS } from '../types';
import { ReporterIdCard } from './ReporterIdCard';
import { ReporterAuthorizationLetter } from './ReporterAuthorizationLetter';
import { CircularLogo } from './CircularLogo';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  CheckCircle, 
  Building, 
  UserPlus, 
  CreditCard, 
  FileText, 
  X, 
  Printer,
  Eye,
  Lock,
  Download
} from 'lucide-react';
import { LoginModal } from './LoginModal';

interface OurTeamProps {
  reporters: ReporterApplication[];
  onApplyClick: () => void;
  loggedInReporter?: ReporterApplication | null;
  isAdminLoggedIn?: boolean;
  onReporterLoginSuccess?: (reporter: ReporterApplication) => void;
  onAdminLoginSuccess?: () => void;
}

export const OurTeam: React.FC<OurTeamProps> = ({
  reporters,
  onApplyClick,
  loggedInReporter,
  isAdminLoggedIn = false,
  onReporterLoginSuccess,
  onAdminLoginSuccess,
}) => {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('सभी');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals for full ID Card or Authorization Letter view
  const [viewingIdCard, setViewingIdCard] = useState<ReporterApplication | null>(null);
  const [viewingAuthLetter, setViewingAuthLetter] = useState<ReporterApplication | null>(null);

  // Authentication guard modal state for download attempts
  const [showLoginGuardModal, setShowLoginGuardModal] = useState(false);
  const [loginGuardMessage, setLoginGuardMessage] = useState({
    title: 'संवाददाता डाउनलोड प्रमाणीकरण (Reporter Authentication Required)',
    desc: 'प्रेस आईडी कार्ड एवं आधिकारिक ऑथराइजेशन लेटर डाउनलोड करने के लिए कृपया अपने पंजीकृत क्रेडेंशियल से लॉगिन करें।'
  });

  const isAuthenticated = Boolean(isAdminLoggedIn || loggedInReporter);

  const handleTriggerLoginPrompt = (title?: string, desc?: string) => {
    if (title || desc) {
      setLoginGuardMessage({
        title: title || 'संवाददाता डाउनलोड प्रमाणीकरण (Reporter Authentication Required)',
        desc: desc || 'प्रेस आईडी कार्ड एवं आधिकारिक ऑथराइजेशन लेटर डाउनलोड करने के लिए कृपया अपने पंजीकृत क्रेडेंशियल से लॉगिन करें।'
      });
    }
    setShowLoginGuardModal(true);
  };

  const approvedReporters = reporters.filter((r) => r.status === 'approved');

  const filteredReporters = approvedReporters.filter((rep) => {
    const matchesDistrict =
      selectedDistrict === 'सभी' || rep.district?.includes(selectedDistrict);
    const matchesQuery =
      rep.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rep.district && rep.district.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (rep.block && rep.block.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (rep.designation && rep.designation.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesDistrict && matchesQuery;
  });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-800 via-red-700 to-red-900 rounded-2xl p-6 sm:p-10 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start space-x-4">
            <CircularLogo size={68} className="mt-1 hidden sm:flex" />
            <div>
              <div className="inline-flex items-center space-x-1.5 bg-red-950/60 px-3 py-1 rounded-full text-xs font-bold text-red-200 uppercase tracking-widest mb-3 border border-red-500/30">
                <ShieldCheck className="w-4 h-4 text-green-400" />
                <span>DDN Prime News Editorial & Field Bureau</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                हमारी अधिकृत टीम (Our Official Reporters)
              </h1>
              <p className="text-red-100 text-sm sm:text-base mt-2 max-w-2xl">
                डीडीएन प्राइम न्यूज़ के प्रत्येक जिले और प्रखंड में जमीनी हकीकत को निष्पक्षता से प्रस्तुत करने वाले समर्पित पत्रकार। सार्वजनिक रूप से केवल प्रीव्यू उपलब्ध है; कार्ड व लेटर डाउनलोड करने के लिए पंजीकृत क्रेडेंशियल अनिवार्य है।
              </p>
            </div>
          </div>

          <div className="flex-shrink-0">
            <button
              onClick={onApplyClick}
              className="flex items-center space-x-2 bg-yellow-400 hover:bg-yellow-300 text-gray-950 font-black px-6 py-3 rounded-xl shadow-lg transition active:scale-95"
            >
              <UserPlus className="w-5 h-5 text-gray-900" />
              <span>संवाददाता आईडी कार्ड के लिए आवेदन करें</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="नाम, जिला या प्रखंड से खोजें..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-600 focus:outline-none"
          />
        </div>

        {/* District Filter */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <span className="text-xs font-bold text-gray-600 whitespace-nowrap">
            जिला फिल्टर:
          </span>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-red-600 focus:outline-none"
          >
            <option value="सभी">सभी जिले (All Districts)</option>
            {BIHAR_DISTRICTS.filter((d) => !d.startsWith('सभी')).map((dist) => (
              <option key={dist} value={dist.split(' ')[0]}>
                {dist}
              </option>
            ))}
          </select>
          <div className="text-xs text-gray-500 font-semibold">
            कुल: <span className="text-red-700 font-bold">{filteredReporters.length}</span>
          </div>
        </div>
      </div>

      {/* Reporters Grid: Public View with Preview & Download Actions */}
      {filteredReporters.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-800">
            इस जिले में कोई अधिकृत संवाददाता नहीं मिला
          </h3>
          <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
            यदि आप इस क्षेत्र से पत्रकारिता करना चाहते हैं, तो आज ही डीडीएन प्राइम न्यूज़ प्रेस आईडी कार्ड के लिए आवेदन करें।
          </p>
          <button
            onClick={onApplyClick}
            className="mt-4 px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg text-sm shadow transition"
          >
            आवेदन फॉर्म भरें
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredReporters.map((reporter) => (
            <div
              key={reporter.id}
              className="bg-white rounded-2xl border-2 border-red-700 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
            >
              {/* Actual Embedded Digital ID Card Preview */}
              <div className="p-3 bg-gray-50 flex items-center justify-center border-b border-gray-200">
                <ReporterIdCard
                  reporter={reporter}
                  showPrintButton={false}
                  isAuthenticated={isAuthenticated}
                  onRequestLogin={() => handleTriggerLoginPrompt()}
                />
              </div>

              {/* Action Buttons: Strict Rule 2:
                  - Public view displays "View / Preview" buttons for viewing ID card and Auth Letter.
                  - Direct public download is disabled; attempting download prompts Login Modal.
              */}
              <div className="p-4 bg-white flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-gray-100">
                {/* 1. Preview / View ID Card Button */}
                <button
                  onClick={() => setViewingIdCard(reporter)}
                  className="w-full sm:w-auto flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-bold transition shadow-xs active:scale-95"
                  title="आईडी कार्ड देखें (Preview / View ID Card)"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>आईडी कार्ड देखें</span>
                </button>

                {/* 2. Preview / View Authorization Letter Button */}
                <button
                  onClick={() => setViewingAuthLetter(reporter)}
                  className="w-full sm:w-auto flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-gray-950 rounded-lg text-xs font-black transition shadow-xs active:scale-95"
                  title="ऑथराइजेशन लेटर देखें (Preview / View Auth Letter)"
                >
                  <FileText className="w-3.5 h-3.5 text-gray-950" />
                  <span>ऑथराइजेशन लेटर</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal 1: Full ID Card Preview & Authenticated Download Modal */}
      {viewingIdCard && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full relative">
            <button
              onClick={() => setViewingIdCard(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 rounded-full bg-gray-100 transition z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-4">
              <h3 className="font-bold text-gray-900 text-base">डिजिटल प्रेस पहचान पत्र (ID Card Preview)</h3>
              <p className="text-xs text-gray-500">
                {isAuthenticated
                  ? 'सत्यापित सत्र सक्रिय: नीचे से उच्च-गुणवत्ता पीडीएफ निर्यात करें'
                  : 'सार्वजनिक दृश्य: डाउनलोड केवल पंजीकृत क्रेडेंशियल से लॉगिन करने के बाद उपलब्ध है'}
              </p>
            </div>
            <ReporterIdCard
              reporter={viewingIdCard}
              showPrintButton={true}
              isAuthenticated={isAuthenticated}
              onRequestLogin={() => {
                setViewingIdCard(null);
                handleTriggerLoginPrompt(
                  'प्रेस आईडी कार्ड डाउनलोड प्रमाणीकरण',
                  'आईडी कार्ड को पीडीएफ फॉर्मेट में डाउनलोड करने के लिए कृपया अपनी पंजीकृत ईमेल व पासवर्ड से लॉगिन करें।'
                );
              }}
            />
          </div>
        </div>
      )}

      {/* Modal 2: Official Authorization Letter Preview & Authenticated Download Modal */}
      {viewingAuthLetter && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-4 sm:p-8 max-w-4xl w-full relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setViewingAuthLetter(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-2 rounded-full bg-gray-100 transition z-20 print:hidden"
            >
              <X className="w-5 h-5" />
            </button>
            <ReporterAuthorizationLetter
              reporter={viewingAuthLetter}
              showPrintButton={true}
              isAuthenticated={isAuthenticated}
              onRequestLogin={() => {
                setViewingAuthLetter(null);
                handleTriggerLoginPrompt(
                  'ऑथराइजेशन लेटर डाउनलोड प्रमाणीकरण',
                  'प्राधिकार पत्र को पीडीएफ फॉर्मेट में डाउनलोड करने के लिए कृपया अपनी पंजीकृत ईमेल व पासवर्ड से लॉगिन करें।'
                );
              }}
            />
          </div>
        </div>
      )}

      {/* Modal 3: Authentication Guard Login Modal (Triggered on unauthenticated download attempt) */}
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
              reporters={reporters}
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
    </div>
  );
};
