import React, { useState } from 'react';
import { ReporterApplication, UserProfile } from '../types';
import { Printer, Download, ArrowLeft, ShieldCheck, CheckCircle2, Building, Calendar, Phone, Mail, FileText, Loader2, Lock } from 'lucide-react';
import { CircularLogo } from './CircularLogo';
import { OfficialDigitalStamp } from './OfficialDigitalStamp';
import { OfficialSignature } from './OfficialSignature';
import { RealQRCode } from './RealQRCode';
import { exportElementToPdf } from '../utils/pdfExport';
import { DDN_LOGO_BASE64 } from '../assets/logoBase64';

interface ReporterAuthorizationLetterProps {
  reporter: ReporterApplication | UserProfile;
  onBack?: () => void;
  showPrintButton?: boolean;
  isAuthenticated?: boolean;
  onRequestLogin?: () => void;
}

export const ReporterAuthorizationLetter: React.FC<ReporterAuthorizationLetterProps> = ({
  reporter,
  onBack,
  showPrintButton = true,
  isAuthenticated = false,
  onRequestLogin,
}) => {
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handlePrint = () => {
    if (!isAuthenticated && onRequestLogin) {
      onRequestLogin();
      return;
    }
    window.print();
  };

  const handleExportPdf = async () => {
    if (!isAuthenticated && onRequestLogin) {
      onRequestLogin();
      return;
    }

    const filename = `DDN_Auth_Letter_${reporter.fullName.replace(/\s+/g, '_')}_${reporterId}`;
    await exportElementToPdf({
      elementId: 'printable-auth-letter',
      filename,
      format: 'a4',
      onStart: () => setIsExportingPdf(true),
      onFinish: () => setIsExportingPdf(false),
      onError: (err) => {
        console.error('PDF Export Error:', err);
        alert('ऑथराइजेशन लेटर पीडीएफ निर्यात में त्रुटि हुई। कृपया दोबारा प्रयास करें।');
      }
    });
  };

  const reporterId =
    reporter.reporterId ||
    ('id' in reporter ? `DDN-${reporter.id.slice(0, 6).toUpperCase()}` : 'DDN-REP-001');

  const designation = reporter.designation || 'अधिकृत जिला संवाददाता (Authorized Press Correspondent)';
  const issueDate = 'appliedAt' in reporter && reporter.appliedAt 
    ? new Date(reporter.appliedAt).toLocaleDateString('hi-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('hi-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  const verificationData = JSON.stringify({
    document: 'OFFICIAL_APPOINTMENT_LETTER',
    org: 'DDN PRIME NEWS (DARBHANGA DIGITAL NETWORK)',
    reporterId: reporterId,
    name: reporter.fullName,
    role: designation,
    district: reporter.district || 'समस्त बिहार',
    validity: '2026-2028',
    chiefEditor: 'Rajesh Kumar Sahu',
    status: 'AUTHENTIC_VERIFIED'
  });

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto py-6 px-4">
      {onBack && (
        <div className="w-full flex items-center justify-between mb-4 print:hidden">
          <button
            onClick={onBack}
            className="flex items-center space-x-1.5 text-xs font-bold text-gray-600 hover:text-red-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>वापस जाएं</span>
          </button>
        </div>
      )}

      {/* Printable Letterhead Paper Container */}
      <div
        id="printable-auth-letter"
        className="w-full bg-white border-2 border-red-800 rounded-2xl shadow-2xl p-6 sm:p-10 font-serif relative overflow-hidden text-gray-900 leading-relaxed"
      >
        {/* Subtle Authentic DDN Prime News Logo Security Watermark */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0"
          style={{ opacity: 0.05 }}
          aria-hidden="true"
        >
          <img
            src={DDN_LOGO_BASE64}
            alt=""
            className="w-[420px] h-[420px] sm:w-[480px] sm:h-[480px] object-contain filter grayscale"
          />
        </div>

        {/* Tricolor Border Top */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 via-white to-green-600 z-10" />

        {/* DDN Prime Official Letterhead Header */}
        <div className="border-b-2 border-red-800 pb-5 mb-6 text-center relative z-10">
          <div className="flex items-center justify-between">
            <CircularLogo size={75} />
            
            <div className="flex-1 px-4">
              <span className="text-xs tracking-widest text-red-700 font-black uppercase font-sans">
                DARBHANGA DIGITAL NETWORK • GOVT. REGD. MEDIA
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-red-900 tracking-tight mt-0.5 drop-shadow-sm font-sans">
                DDN PRIME NEWS
              </h1>
              <p className="text-xs sm:text-sm text-gray-800 font-bold font-sans mt-0.5">
                डी डी एन प्राइम न्यूज़ • निष्पक्ष, निर्भीक एवं सटीक पत्रकारिता
              </p>
              <div className="text-[11px] text-gray-600 font-sans mt-1">
                प्रधान कार्यालय: बोरिंग रोड, पटना, बिहार - 800001 • ईमेल: ddnprimenews@gmail.com • संपर्क: +91 9341050287
              </div>
            </div>

            <div className="w-18 h-22 rounded-xl border-2 border-red-800 overflow-hidden shadow-sm hidden sm:block">
              <img
                src={reporter.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
                alt={reporter.fullName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80';
                }}
              />
            </div>
          </div>
        </div>

        {/* Letter Metadata Bar */}
        <div className="flex flex-wrap items-center justify-between text-xs font-sans border-b border-gray-200 pb-3 mb-6 gap-2">
          <div>
            <strong>पत्रांक संख्या (Ref No):</strong>{' '}
            <span className="font-mono text-red-700 font-bold">DDN/AUTH/{reporterId}/2026</span>
          </div>
          <div>
            <strong>दिनांक (Date of Issue):</strong> <span className="font-semibold">{issueDate}</span>
          </div>
        </div>

        {/* Letter Title Banner */}
        <div className="text-center mb-6">
          <span className="inline-block bg-red-900 text-white px-6 py-1.5 rounded-full text-sm sm:text-base font-bold tracking-wide uppercase font-sans shadow-sm">
            प्राधिकार पत्र / नियुक्ति प्रमाण (OFFICIAL AUTHORIZATION LETTER)
          </span>
          <p className="text-xs text-gray-500 font-sans mt-1">
            (प्रेस एवं मीडिया कवरेज अधिकार पत्र - वैध 2026 से 2028 तक)
          </p>
        </div>

        {/* Recipient Greeting */}
        <div className="mb-4 text-sm font-sans">
          <p className="font-bold text-gray-900">सेवा में,</p>
          <p className="font-semibold text-gray-800">समस्त प्रशासनिक पदाधिकारी, पुलिस अधीक्षक, अनुमंडल पदाधिकारी एवं थाना प्रभारी महोदय,</p>
          <p className="text-gray-700">बिहार सरकार एवं समस्त संबंधित विभाग।</p>
        </div>

        {/* Main Body Content */}
        <div className="space-y-4 text-sm sm:text-base text-gray-800 text-justify">
          <p>
            <strong>महोदय,</strong>
          </p>
          <p>
            प्रमाणित किया जाता है कि <strong>{reporter.fullName}</strong>
            {'fatherName' in reporter && reporter.fatherName ? (
              <span> (आत्मज/आत्मजा श्री {reporter.fatherName})</span>
            ) : null}
            , 'डीडीएन प्राइम न्यूज़' (DDN Prime News) के अधिकृत <strong>{designation}</strong> के पद पर नियुक्त किए गए हैं। इनका आधिकारिक प्रेस पहचान पत्र क्रमांक (Press ID No) <strong className="font-mono text-red-800">{reporterId}</strong> है।
          </p>

          <p>
            इन्हें <strong>जिला: {reporter.district || 'बिहार (Bihar)'}</strong>
            {reporter.block ? <span> एवं <strong>प्रखंड: {reporter.block}</strong></span> : null} के क्षेत्राधिकार में जनहित से जुड़े समाचारों के संकलन, प्रशासनिक प्रेस वार्ताओं, घटना स्थल कवरेज एवं विशेष ग्राउंड रिपोर्टिंग हेतु अधिकृत किया जाता है।
          </p>

          <p>
            डीडीएन प्राइम न्यूज़ भारतीय प्रेस परिषद (Press Council of India) के नैतिक एवं विधि-सम्मत पत्रकारिता मानकों के प्रति पूर्णतः प्रतिबद्ध है। उक्त संवाददाता को निष्पक्ष एवं निर्भीक पत्रकारिता का पूर्ण अधिकार प्रदान किया जाता है।
          </p>

          <div className="bg-red-50/70 border border-red-200 p-4 rounded-xl text-xs sm:text-sm font-sans space-y-1">
            <div className="font-bold text-red-900 flex items-center">
              <ShieldCheck className="w-4 h-4 text-red-700 mr-1.5" />
              विशेष प्रशासनिक अनुरोध:
            </div>
            <p className="text-gray-700">
              अतः सभी माननीय प्रशासनिक, पुलिस एवं स्वास्थ्य अधिकारियों से विनम्र अनुरोध है कि उक्त संवाददाता को विधि-व्यवस्था के अंतर्गत समाचार संकलन व साक्षात्कार में आवश्यक सहयोग प्रदान करने की कृपा करें।
            </p>
          </div>
        </div>

        {/* Credentials / Details Summary Grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans bg-gray-50 border border-gray-200 rounded-xl p-4">
          <div>
            <span className="text-gray-500">संवाददाता का नाम:</span>{' '}
            <strong className="text-gray-900">{reporter.fullName}</strong>
          </div>
          <div>
            <span className="text-gray-500">प्रेस आईडी क्रमांक:</span>{' '}
            <strong className="font-mono text-red-700">{reporterId}</strong>
          </div>
          <div>
            <span className="text-gray-500">आवंटित क्षेत्र (District):</span>{' '}
            <strong className="text-gray-900">{reporter.district || 'समस्त बिहार'}</strong>
          </div>
          <div>
            <span className="text-gray-500">वैधता अवधि (Validity):</span>{' '}
            <strong className="text-green-700">2026 से 2028 (सक्रिय/Active)</strong>
          </div>
        </div>

        {/* Seal and Signatures Footer */}
        <div className="mt-8 pt-6 border-t-2 border-gray-300 flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Digital QR Code & Verification */}
          <div className="flex items-center space-x-3">
            <RealQRCode value={verificationData} size={62} />
            <div className="text-[10px] font-sans text-gray-500 leading-tight">
              <div className="font-bold text-gray-800">QR Digital Verification</div>
              <div>सुरक्षित डिजिटल सत्यापन कोड</div>
              <div className="text-green-600 font-semibold">स्थिति: अधिकृत (Verified)</div>
            </div>
          </div>

          {/* Official Round Seal (User Requested: डिजिटल मोहर) */}
          <div className="relative flex items-center justify-center -my-2">
            <OfficialDigitalStamp size={118} className="opacity-95" />
          </div>

          {/* Chief Editor Sign (User Requested: डिजिटल हस्ताक्षर) */}
          <div className="text-center sm:text-right font-sans flex flex-col items-center sm:items-end">
            <div className="h-14 flex items-center justify-end">
              <OfficialSignature width={190} height={56} />
            </div>
            <div className="text-xs font-bold text-gray-900 border-t border-gray-400 mt-1 pt-0.5">
              राजेश कुमार साहू (प्रधान संपादक)
            </div>
            <div className="text-[10px] text-gray-600 font-medium">चीफ एडिटर एवं पब्लिशर, DDN Prime News</div>
          </div>
        </div>

        {/* Footer Helpline */}
        <div className="mt-6 pt-3 border-t border-dashed border-gray-300 text-[10px] font-sans text-gray-500 text-center">
          सत्यापन एवं प्रशासनिक पूछताछ हेतु संपर्क करें: ddnprimenews@gmail.com | हेल्पलाइन: +91 9341050287
        </div>
      </div>

      {showPrintButton && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 print:hidden">
          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 text-sm disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isExportingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>लेटर पीडीएफ तैयार हो रही है... (Generating PDF)</span>
              </>
            ) : !isAuthenticated ? (
              <>
                <Lock className="w-4 h-4 text-amber-300" />
                <span>लॉगिन कर डाउनलोड करें (Download Letter PDF)</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Export to PDF (ऑथराइजेशन लेटर डाउनलोड)</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold shadow-md transition-all active:scale-95 text-sm"
          >
            {!isAuthenticated ? <Lock className="w-4 h-4 text-amber-300" /> : <Printer className="w-4 h-4" />}
            <span>प्रिंट (Print Letter)</span>
          </button>
        </div>
      )}
    </div>
  );
};
