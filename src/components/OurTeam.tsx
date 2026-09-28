import React, { useState } from 'react';
import { ReporterApplication, BIHAR_DISTRICTS } from '../types';
import { 
  Users, 
  MapPin, 
  Award, 
  Search, 
  ShieldCheck, 
  CheckCircle,
  Building,
  UserPlus
} from 'lucide-react';

interface OurTeamProps {
  reporters: ReporterApplication[];
  onApplyClick: () => void;
}

export const OurTeam: React.FC<OurTeamProps> = ({ reporters, onApplyClick }) => {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('सभी');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // PRIVACY REQUIREMENT:
  // Show Card Layouts: Reporter Photo, Full Name, Designation/Role, Assigned State, District, and Block.
  // PRIVACY REQUIREMENT: NO mobile numbers or email IDs should be displayed publicly on this page.

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
          <div>
            <div className="inline-flex items-center space-x-1.5 bg-red-950/60 px-3 py-1 rounded-full text-xs font-bold text-red-200 uppercase tracking-widest mb-3 border border-red-500/30">
              <ShieldCheck className="w-4 h-4 text-green-400" />
              <span>DDN Prime News Editorial & Field Bureau</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              हमारी अधिकृत टीम (Our Official Reporters)
            </h1>
            <p className="text-red-100 text-sm sm:text-base mt-2 max-w-2xl">
              डीडीएन प्राइम न्यूज़ के प्रत्येक जिले और प्रखंड में जमीनी हकीकत को निष्पक्षता से प्रस्तुत करने वाले समर्पित पत्रकार।
            </p>
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

      {/* Reporters Grid */}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredReporters.map((reporter) => (
            <div
              key={reporter.id}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group"
            >
              {/* Card Header Strip */}
              <div className="h-2 bg-gradient-to-r from-red-700 via-orange-500 to-red-800" />
              
              <div className="p-5 flex flex-col items-center flex-grow text-center">
                {/* Photo with Verified Badge */}
                <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-red-100 shadow-md group-hover:scale-105 transition duration-300 bg-gray-100">
                    <img
                      src={
                        reporter.photoUrl ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
                      }
                      alt={reporter.fullName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80';
                      }}
                    />
                  </div>
                  <div
                    title="Authorized Press Reporter"
                    className="absolute bottom-0 right-0 bg-green-600 text-white p-1 rounded-full shadow-md"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </div>
                </div>

                {/* Reporter Name & Designation */}
                <h3 className="text-lg font-bold text-gray-900 leading-snug group-hover:text-red-700 transition">
                  {reporter.fullName}
                </h3>
                <div className="mt-1 text-xs font-semibold text-red-700 bg-red-50 border border-red-100 px-3 py-0.5 rounded-full">
                  {reporter.designation || 'संवाददाता (Correspondent)'}
                </div>

                {/* Press ID Badge */}
                {reporter.reporterId && (
                  <div className="mt-2 text-[11px] font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    PRESS ID: <span className="font-bold text-gray-800">{reporter.reporterId}</span>
                  </div>
                )}

                {/* Assigned Work Area */}
                <div className="w-full mt-4 pt-4 border-t border-gray-100 text-xs space-y-1.5 text-left bg-gray-50/70 p-3 rounded-xl">
                  <div className="flex items-center text-gray-700 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-red-600 mr-1.5 flex-shrink-0" />
                    <span>जिला: <strong className="text-gray-900">{reporter.district || 'समस्त बिहार'}</strong></span>
                  </div>
                  {reporter.block && (
                    <div className="flex items-center text-gray-700 font-medium">
                      <Building className="w-3.5 h-3.5 text-blue-600 mr-1.5 flex-shrink-0" />
                      <span>प्रखंड: <strong className="text-gray-900">{reporter.block}</strong></span>
                    </div>
                  )}
                  <div className="flex items-center text-gray-600 text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 ml-1" />
                    <span>राज्य: {reporter.state || 'बिहार'}</span>
                  </div>
                </div>

                {/* Strict Privacy Compliance Notice */}
                <div className="mt-3 text-[10px] text-gray-400 italic">
                  सुरक्षा कारणों से संपर्क सूत्र सार्वजनिक नहीं हैं।
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
