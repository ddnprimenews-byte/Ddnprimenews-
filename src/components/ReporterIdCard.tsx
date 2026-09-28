import React from 'react';
import { ReporterApplication, UserProfile } from '../types';
import { Award, ShieldCheck, Printer, CheckCircle, MapPin, Calendar } from 'lucide-react';

interface ReporterIdCardProps {
  reporter: ReporterApplication | UserProfile;
  showPrintButton?: boolean;
}

export const ReporterIdCard: React.FC<ReporterIdCardProps> = ({ reporter, showPrintButton = true }) => {
  const handlePrint = () => {
    window.print();
  };

  const reporterId = reporter.reporterId || ('id' in reporter ? `DDN-${reporter.id.slice(0, 6).toUpperCase()}` : 'DDN-REP-001');
  const designation = reporter.designation || 'Special District Correspondent (विशेष संवाददाता)';
  const photo = reporter.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80';

  return (
    <div className="flex flex-col items-center">
      {/* Front & Back Card View Container */}
      <div id="printable-id-card" className="w-full max-w-[420px] bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-red-700 font-sans relative">
        {/* Top Header with Tricolor accent */}
        <div className="h-2 w-full bg-gradient-to-r from-orange-500 via-white to-green-600" />
        
        {/* Masthead */}
        <div className="bg-gradient-to-r from-red-800 via-red-700 to-red-900 text-white p-4 text-center relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-center justify-center space-x-2">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-amber-400 bg-black flex-shrink-0">
              <img src="/ddn_logo.png" alt="DDN Logo" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/ddn_logo.jpg'; }} />
            </div>
            <span className="bg-white text-red-700 font-black text-xs px-2 py-0.5 rounded tracking-wider uppercase">
              Official Press Card
            </span>
          </div>

          <h2 className="text-2xl font-black tracking-tight mt-1">DDN PRIME NEWS</h2>
          <p className="text-[11px] text-red-100 font-medium tracking-wide">
            डी डी एन प्राइम न्यूज़ • प्रधान संपादक: राजेश कुमार साहू
          </p>
          <div className="text-[9px] text-red-200 mt-0.5">Govt. Regd. Media & Digital Broadcast Network</div>
        </div>

        {/* Card Body */}
        <div className="p-5 bg-gradient-to-b from-white to-gray-50 flex flex-col items-center">
          {/* Photo & Watermark */}
          <div className="relative mb-3">
            <div className="w-28 h-32 rounded-xl border-4 border-red-700 overflow-hidden shadow-lg bg-gray-100 relative group">
              <img
                src={photo}
                alt={reporter.fullName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80';
                }}
              />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-green-600 text-white p-1 rounded-full shadow-md">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>

          {/* Reporter Details */}
          <div className="text-center w-full">
            <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight">{reporter.fullName}</h3>
            <p className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full inline-block mt-1">
              {designation}
            </p>
          </div>

          {/* Details Table */}
          <div className="w-full mt-4 bg-white border border-gray-200 rounded-xl p-3 text-xs space-y-1.5 shadow-sm">
            <div className="flex justify-between border-b border-gray-100 pb-1">
              <span className="text-gray-500 font-medium">PRESS ID NO:</span>
              <span className="font-mono font-bold text-red-700 tracking-wider">{reporterId}</span>
            </div>
            {'fatherName' in reporter && reporter.fatherName && (
              <div className="flex justify-between border-b border-gray-100 pb-1">
                <span className="text-gray-500 font-medium">पिता का नाम:</span>
                <span className="font-semibold text-gray-800">{reporter.fatherName}</span>
              </div>
            )}
            <div className="flex justify-between border-b border-gray-100 pb-1">
              <span className="text-gray-500 font-medium">आवंटित क्षेत्र (District):</span>
              <span className="font-bold text-gray-800 flex items-center">
                <MapPin className="w-3 h-3 text-red-600 mr-1 inline" />
                {reporter.district || 'बिहार (Bihar)'}
              </span>
            </div>
            {reporter.block && (
              <div className="flex justify-between border-b border-gray-100 pb-1">
                <span className="text-gray-500 font-medium">प्रखंड (Block):</span>
                <span className="font-semibold text-gray-800">{reporter.block}</span>
              </div>
            )}
            <div className="flex justify-between border-b border-gray-100 pb-1">
              <span className="text-gray-500 font-medium">राज्य (State):</span>
              <span className="font-semibold text-gray-800">{reporter.state || 'बिहार'}</span>
            </div>
            <div className="flex justify-between pt-0.5">
              <span className="text-gray-500 font-medium">वैधता (Validity):</span>
              <span className="font-semibold text-green-700 flex items-center">
                <Calendar className="w-3 h-3 mr-1 inline" /> 2026 - 2028 (ACTIVE)
              </span>
            </div>
          </div>

          {/* Card Footer: Signature & QR Code simulation */}
          <div className="w-full mt-4 flex items-center justify-between pt-2 border-t border-dashed border-gray-300">
            <div className="flex items-center space-x-2">
              <div className="w-12 h-12 bg-gray-900 rounded p-1 flex items-center justify-center">
                <div className="grid grid-cols-4 gap-0.5 w-full h-full p-0.5 bg-white">
                  <div className="bg-black col-span-2 row-span-2"></div>
                  <div className="bg-black"></div>
                  <div className="bg-black"></div>
                  <div className="bg-black"></div>
                  <div className="bg-black col-span-2 row-span-2"></div>
                  <div className="bg-black"></div>
                </div>
              </div>
              <div className="text-[9px] text-gray-500 leading-tight">
                <div className="font-bold text-gray-700">Digital Verified</div>
                <div>Scan to verify</div>
              </div>
            </div>

            <div className="text-right">
              <div className="font-serif italic text-sm text-red-900 font-bold tracking-tight">Chief Editor</div>
              <div className="text-[10px] text-gray-500 border-t border-gray-400 mt-0.5 pt-0.5">अधिकृत हस्ताक्षर</div>
            </div>
          </div>
        </div>

        {/* Card Disclaimer Banner */}
        <div className="bg-gray-900 text-gray-300 text-[9px] p-2 text-center border-t border-gray-800">
          पुलिस व प्रशासनिक अधिकारियों से अनुरोध है कि समाचार संकलन में पत्रकार को सहयोग प्रदान करें।
        </div>
      </div>

      {showPrintButton && (
        <button
          onClick={handlePrint}
          className="mt-4 flex items-center space-x-2 px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-lg font-bold shadow-md transition-all active:scale-95"
        >
          <Printer className="w-4 h-4" />
          <span>प्रिंट या सेव करें (Print / Download ID Card)</span>
        </button>
      )}
    </div>
  );
};
