import React, { useState } from 'react';
import { ReporterApplication, UserProfile } from '../types';
import { Printer, MapPin, Calendar, CheckCircle2, Download, Loader2, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { CircularLogo } from './CircularLogo';
import { OfficialDigitalStamp } from './OfficialDigitalStamp';
import { OfficialSignature } from './OfficialSignature';
import { RealQRCode } from './RealQRCode';
import { exportElementToPdf } from '../utils/pdfExport';
import { DDN_LOGO_BASE64 } from '../assets/logoBase64';

interface ReporterIdCardProps {
  reporter: ReporterApplication | UserProfile;
  showPrintButton?: boolean;
  isAuthenticated?: boolean;
  onRequestLogin?: () => void;
}

export const ReporterIdCard: React.FC<ReporterIdCardProps> = ({
  reporter,
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

    const filename = `DDN_Press_ID_${reporter.fullName.replace(/\s+/g, '_')}_${reporterId}`;
    await exportElementToPdf({
      elementId: 'printable-id-card',
      filename,
      format: 'id_card',
      onStart: () => setIsExportingPdf(true),
      onFinish: () => setIsExportingPdf(false),
      onError: (err) => {
        console.error('PDF Export Error:', err);
        alert('पीडीएफ निर्यात में त्रुटि हुई। कृपया दोबारा प्रयास करें।');
      },
    });
  };

  const reporterId = reporter.reporterId || ('id' in reporter ? `DDN-${reporter.id.slice(0, 6).toUpperCase()}` : 'DDN-REP-001');
  const designation = reporter.designation || 'वरिष्ठ ब्यूरो प्रमुख (Senior Bureau Chief)';
  const photo = reporter.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80';

  // Dynamic real verification QR Payload
  const verificationData = JSON.stringify({
    org: 'DDN PRIME NEWS',
    network: 'DARBHANGA DIGITAL NETWORK',
    reporterId: reporterId,
    name: reporter.fullName,
    role: designation,
    district: reporter.district || 'पटना (Patna)',
    validity: '2026-2028',
    chiefEditor: 'Rajesh Kumar Sahu',
    status: 'ACTIVE_GOVT_REGD_MEDIA'
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: 0.45,
        ease: [0.16, 1, 0.3, 1], // Custom smooth cubic-bezier spring-like feel
      }}
      className="flex flex-col items-center w-full"
    >
      {/* Front & Back Card View Container - exact proportions and rounded styling matching reference */}
      <div
        id="printable-id-card"
        className="w-full max-w-[390px] bg-white rounded-3xl shadow-2xl overflow-hidden border border-red-900/30 font-sans relative"
      >
        {/* ========================================================================= */}
        {/* EXACT REFERENCE HEADER (ऊपर का हिस्सा)                                     */}
        {/* Deep maroon background, top left circular logo, massive white bold PRESS, */}
        {/* DDN PRIME NEWS serif, DARBHANGA DIGITAL NETWORK, pill official badge      */}
        {/* ========================================================================= */}
        <div className="bg-[#5a050d] text-white pt-5 pb-5 px-4 text-center relative select-none">
          {/* Top Row: Left Side Circular Logo + Massive Bold White 'PRESS' Text */}
          <div className="flex items-center justify-between px-1 mb-2.5">
            {/* Upper Side Logo (Gold border authentic circular seal) */}
            <div className="flex-shrink-0">
              <CircularLogo size={80} className="drop-shadow-md" />
            </div>

            {/* Massive Bold White 'PRESS' */}
            <div className="flex-1 text-center pl-1 pr-2">
              <h1 className="font-sans font-black text-5xl sm:text-[58px] tracking-[0.06em] text-white leading-none uppercase select-none drop-shadow-sm">
                PRESS
              </h1>
            </div>
          </div>

          {/* DDN PRIME NEWS (Serif Title) */}
          <h2 className="font-serif font-black text-2xl sm:text-[27px] tracking-wide text-white uppercase leading-tight drop-shadow-sm mt-1">
            DDN PRIME NEWS
          </h2>

          {/* DARBHANGA DIGITAL NETWORK • REGD. MEDIA */}
          <p className="text-[10px] text-red-100 font-bold tracking-widest uppercase mt-0.5 opacity-90">
            DARBHANGA DIGITAL NETWORK • REGD. MEDIA
          </p>

          {/* White Pill Badge: OFFICIAL PRESS ID CARD */}
          <div className="mt-2.5 flex justify-center">
            <span className="bg-white text-[#660000] font-black text-[12px] sm:text-xs px-6 py-1 rounded-full uppercase tracking-wider shadow-md inline-block">
              OFFICIAL PRESS ID CARD
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CARD BODY                                                                 */}
        {/* ========================================================================= */}
        <div className="pt-6 pb-4 px-5 bg-gradient-to-b from-white via-gray-50/40 to-white flex flex-col items-center relative overflow-hidden">
          {/* Subtle Authentic DDN Prime News Logo Security Watermark */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0"
            style={{ opacity: 0.08 }}
            aria-hidden="true"
          >
            <img
              src={DDN_LOGO_BASE64}
              alt=""
              className="w-56 h-56 object-contain filter grayscale"
            />
          </div>

          {/* Photo with Maroon Border & Green Verified Check Badge */}
          <div className="relative mb-3 z-10">
            <div className="w-28 h-36 rounded-2xl border-[3px] border-[#8a0a14] overflow-hidden shadow-lg bg-gray-100 relative group">
              <img
                src={photo}
                alt={reporter.fullName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80';
                }}
              />
            </div>
            {/* Green Circular Verified Badge */}
            <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-1 rounded-full shadow-md border-2 border-white">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          {/* Reporter Name & Designation */}
          <div className="text-center w-full mt-1">
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight font-sans">
              {reporter.fullName}
            </h3>
            <div className="mt-1.5 inline-block">
              <span className="text-xs font-bold text-red-900 bg-red-50/90 border border-red-200/90 px-4 py-1 rounded-full shadow-sm">
                {designation}
              </span>
            </div>
          </div>

          {/* Details Table Card with Soft Rounded Border & Gray Lines */}
          <div className="w-full mt-4 bg-white border border-gray-200/90 rounded-2xl p-4 text-xs space-y-2.5 shadow-sm">
            <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
              <span className="text-gray-500 font-semibold tracking-wide">PRESS ID NO:</span>
              <span className="font-mono font-black text-red-900 text-sm tracking-wider">{reporterId}</span>
            </div>

            {'fatherName' in reporter && reporter.fatherName && (
              <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
                <span className="text-gray-500 font-medium">पिता का नाम:</span>
                <span className="font-bold text-gray-800">{reporter.fatherName}</span>
              </div>
            )}

            <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
              <span className="text-gray-500 font-medium">आवंटित क्षेत्र (District):</span>
              <span className="font-bold text-gray-800 flex items-center">
                <MapPin className="w-3.5 h-3.5 text-red-700 mr-1 inline" />
                {reporter.district || 'पटना (Patna)'}
              </span>
            </div>

            {reporter.block && (
              <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
                <span className="text-gray-500 font-medium">प्रखंड (Block):</span>
                <span className="font-bold text-gray-800">{reporter.block}</span>
              </div>
            )}

            <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
              <span className="text-gray-500 font-medium">राज्य (State):</span>
              <span className="font-bold text-gray-800">{reporter.state || 'बिहार'}</span>
            </div>

            <div className="flex justify-between items-center pt-0.5">
              <span className="text-gray-500 font-medium">वैधता (Validity):</span>
              <span className="font-bold text-emerald-700 flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1 inline" /> 2026 - 2028 (ACTIVE)
              </span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* EXACT REFERENCE FOOTER (कार्ड का फुटर)                                    */}
          {/* Real QR Code + Blue Circular Digital Stamp + Chief Editor Sign & Details   */}
          {/* ========================================================================= */}
          <div className="w-full mt-5 pt-3 border-t border-gray-200/80 flex items-center justify-between gap-2 relative">
            {/* Left: Real QR Code + Scan text */}
            <div className="flex items-center space-x-2">
              <RealQRCode value={verificationData} size={48} />
              <div className="text-[9px] text-gray-500 leading-tight">
                <div className="font-bold text-gray-800">Scan QR Code</div>
                <div className="text-emerald-700 font-semibold">100% Verified</div>
                <div className="text-[8px] text-gray-400">DDN Official</div>
              </div>
            </div>

            {/* Middle: Official Blue Circular Digital Stamp */}
            <div className="relative flex items-center justify-center flex-shrink-0">
              <OfficialDigitalStamp size={68} className="opacity-95" />
            </div>

            {/* Right: Signature + Designation exact layout from reference */}
            <div className="text-right flex flex-col items-end flex-shrink-0">
              {/* Handwritten Blue Cursive Signature */}
              <div className="h-9 flex items-center justify-end -mb-0.5">
                <OfficialSignature width={125} height={36} />
              </div>
              <div className="text-[10px] font-black text-gray-900 leading-tight">
                प्रधान संपादक (Chief Editor)
              </div>
              <div className="text-[10px] font-bold text-gray-800 leading-tight">
                राजेश कुमार साहू
              </div>
              <div className="text-[8px] text-gray-500 leading-none mt-0.5">
                अधिकृत हस्ताक्षर
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Disclaimer Strip matching reference */}
        <div className="bg-[#121820] text-gray-300 text-[8.5px] py-1.5 px-3 text-center border-t border-gray-800 tracking-tight leading-normal">
          पुलिस व प्रशासनिक अधिकारियों से अनुरोध है कि समाचार संकलन में पत्रकार को सहयोग प्रदान करें।
        </div>
      </div>

      {showPrintButton && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 print:hidden">
          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 text-sm disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isExportingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>पीडीएफ तैयार हो रही है... (Generating PDF)</span>
              </>
            ) : !isAuthenticated ? (
              <>
                <Lock className="w-4 h-4 text-amber-300" />
                <span>लॉगिन कर डाउनलोड करें (Download ID PDF)</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Export to PDF (आईडी कार्ड डाउनलोड)</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-5 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl font-bold shadow-md transition-all active:scale-95 text-sm"
          >
            {!isAuthenticated ? <Lock className="w-4 h-4 text-amber-300" /> : <Printer className="w-4 h-4" />}
            <span>प्रिंट (Print ID)</span>
          </button>
        </div>
      )}
    </motion.div>
  );
};
