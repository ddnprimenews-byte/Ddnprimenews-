import React, { useState } from 'react';
import { RefreshCw, Trophy, Flame, ChevronRight, Activity } from 'lucide-react';

interface CricketMatch {
  id: string;
  tournament: string;
  matchType: string;
  status: 'LIVE' | 'BREAK' | 'UPCOMING' | 'RESULT';
  statusText: string;
  team1: {
    name: string;
    code: string;
    flag: string;
    score: string;
    overs?: string;
  };
  team2: {
    name: string;
    code: string;
    flag: string;
    score: string;
    overs?: string;
  };
  currentInnings: string;
  crr: string;
  rrr?: string;
  batter1: { name: string; runs: number; balls: number; fours: number; sixes: number };
  batter2: { name: string; runs: number; balls: number; fours: number; sixes: number };
  bowler: { name: string; overs: string; maidens: number; runs: number; wickets: number };
  recentBalls: string[];
  venue: string;
}

export const CricketScoreWidget: React.FC = () => {
  const [selectedMatchIndex, setSelectedMatchIndex] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('अभी-अभी (Just now)');

  const matches: CricketMatch[] = [
    {
      id: 'm1',
      tournament: 'आईसीसी चैंपियंस ट्रॉफी / इंटरनेशनल सीरीज',
      matchType: 'तीसरा वनडे (3rd ODI)',
      status: 'LIVE',
      statusText: 'भारत को जीत के लिए 28 गेंदों में 34 रनों की आवश्यकता',
      team1: {
        name: 'ऑस्ट्रेलिया',
        code: 'AUS',
        flag: '🇦🇺',
        score: '286/7',
        overs: '50.0 ओवर्स',
      },
      team2: {
        name: 'भारत',
        code: 'IND',
        flag: '🇮🇳',
        score: '253/4',
        overs: '45.2 ओवर्स',
      },
      currentInnings: 'भारत की बल्लेबाजी',
      crr: '5.58',
      rrr: '7.28',
      batter1: { name: 'विराट कोहली', runs: 88, balls: 82, fours: 7, sixes: 2 },
      batter2: { name: 'हार्दिक पांड्या', runs: 34, balls: 22, fours: 3, sixes: 1 },
      bowler: { name: 'पैट कमिंस', overs: '8.2', maidens: 0, runs: 46, wickets: 2 },
      recentBalls: ['1', '4', '0', '2', '6', '1'],
      venue: 'ईडन गार्डन्स, कोलकाता',
    },
    {
      id: 'm2',
      tournament: 'रणजी ट्रॉफी (Ranji Trophy Elite)',
      matchType: 'राउंड 4 - डे 3',
      status: 'LIVE',
      statusText: 'बिहार ने दूसरी पारी में 142 रनों की बढ़त हासिल की',
      team1: {
        name: 'बिहार रणजी टीम',
        code: 'BIH',
        flag: '🏏',
        score: '312 & 186/3',
        overs: '54.0 ओवर्स',
      },
      team2: {
        name: 'बंगाल',
        code: 'BEN',
        flag: '🏏',
        score: '356/10',
        overs: '92.4 ओवर्स',
      },
      currentInnings: 'बिहार दूसरी पारी',
      crr: '3.44',
      batter1: { name: 'सकीबुल गनी', runs: 76, balls: 98, fours: 9, sixes: 1 },
      batter2: { name: 'बाबुल कुमार', runs: 45, balls: 72, fours: 5, sixes: 0 },
      bowler: { name: 'मुकेश कुमार', overs: '14.0', maidens: 3, runs: 42, wickets: 2 },
      recentBalls: ['0', '1', '4', '0', '0', '1'],
      venue: 'मोईन-उल-हक स्टेडियम, पटना',
    },
    {
      id: 'm3',
      tournament: 'आईपीएल 2026 (IPL T20 Special)',
      matchType: 'लीग मैच 24',
      status: 'UPCOMING',
      statusText: 'टॉस शाम 7:00 बजे IST • मुकाबला 7:30 बजे से लाइव',
      team1: {
        name: 'चेन्नई सुपर किंग्स',
        code: 'CSK',
        flag: '🦁',
        score: 'प्लेइंग XI प्रतीक्षित',
      },
      team2: {
        name: 'मुंबई इंडियंस',
        code: 'MI',
        flag: '🔷',
        score: 'प्लेइंग XI प्रतीक्षित',
      },
      currentInnings: 'शाम 7:30 बजे मैच प्रारंभ',
      crr: '-',
      batter1: { name: 'रुतुराज गायकवाड़ (C)', runs: 0, balls: 0, fours: 0, sixes: 0 },
      batter2: { name: 'रवींद्र जडेजा', runs: 0, balls: 0, fours: 0, sixes: 0 },
      bowler: { name: 'जसप्रीत बुमराह', overs: '0.0', maidens: 0, runs: 0, wickets: 0 },
      recentBalls: ['-', '-', '-', '-', '-', '-'],
      venue: 'एम. ए. चिदंबरम स्टेडियम, चेन्नई',
    },
  ];

  const currentMatch = matches[selectedMatchIndex];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdated(new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }));
    }, 600);
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-neutral-900 to-black text-white rounded-2xl border border-gray-800 shadow-xl overflow-hidden my-6">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-red-700 via-red-800 to-rose-900 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-400 text-gray-950 flex items-center justify-center font-black shadow-md flex-shrink-0">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-black text-xs sm:text-sm uppercase tracking-wider flex items-center space-x-1.5">
                <span>लाइव क्रिकेट स्कोर (Live Cricket)</span>
              </h3>
              <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-red-500 text-white animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                <span>LIVE</span>
              </span>
            </div>
            <p className="text-[10px] text-red-200">
              {currentMatch.tournament} • {currentMatch.matchType}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] text-gray-300 hidden sm:inline">अपडेट: {lastUpdated}</span>
          <button
            onClick={handleRefresh}
            title="स्कोर रिफ्रेश करें"
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-300' : ''}`} />
          </button>
        </div>
      </div>

      {/* Match Selector Tabs */}
      <div className="flex border-b border-gray-800 bg-black/40 overflow-x-auto text-xs scrollbar-none">
        {matches.map((m, idx) => (
          <button
            key={m.id}
            onClick={() => setSelectedMatchIndex(idx)}
            className={`px-4 py-2 text-left font-bold transition flex-shrink-0 flex items-center space-x-2 border-b-2 ${
              selectedMatchIndex === idx
                ? 'border-amber-400 text-amber-300 bg-white/5'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <span>{m.team1.code} vs {m.team2.code}</span>
            {m.status === 'LIVE' && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>
        ))}
      </div>

      {/* Main Scorecard */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* Teams & Scores Banner */}
        <div className="grid grid-cols-2 gap-3 bg-white/5 rounded-xl p-3.5 border border-white/5">
          {/* Team 1 */}
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xl">{currentMatch.team1.flag}</span>
              <span className="font-extrabold text-sm sm:text-base text-gray-200 truncate">
                {currentMatch.team1.name}
              </span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-lg sm:text-2xl font-black text-amber-400">
                {currentMatch.team1.score}
              </span>
              {currentMatch.team1.overs && (
                <span className="text-[11px] text-gray-400 font-medium">
                  ({currentMatch.team1.overs})
                </span>
              )}
            </div>
          </div>

          {/* Team 2 */}
          <div className="space-y-1 text-right">
            <div className="flex items-center justify-end space-x-2">
              <span className="font-extrabold text-sm sm:text-base text-gray-200 truncate">
                {currentMatch.team2.name}
              </span>
              <span className="text-xl">{currentMatch.team2.flag}</span>
            </div>
            <div className="flex items-baseline justify-end space-x-2">
              <span className="text-lg sm:text-2xl font-black text-emerald-400">
                {currentMatch.team2.score}
              </span>
              {currentMatch.team2.overs && (
                <span className="text-[11px] text-gray-400 font-medium">
                  ({currentMatch.team2.overs})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Live Status Highlight */}
        <div className="bg-amber-400/10 border border-amber-400/20 rounded-xl p-2.5 flex items-center justify-between text-xs text-amber-200">
          <span className="font-bold flex items-center space-x-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 animate-bounce" />
            <span>{currentMatch.statusText}</span>
          </span>
          <span className="text-[11px] text-gray-400 font-medium hidden sm:inline">
            स्थान: {currentMatch.venue}
          </span>
        </div>

        {/* Batsmen & Bowler Details */}
        {currentMatch.status === 'LIVE' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Batsmen Table */}
            <div className="bg-white/5 rounded-xl p-3 border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-gray-400 font-bold border-b border-white/5 pb-1">
                <span>क्रीज पर बल्लेबाज</span>
                <span>रन (गेंद) 4s / 6s</span>
              </div>
              <div className="flex items-center justify-between text-gray-200">
                <span className="font-extrabold text-amber-300 flex items-center">
                  <span>* {currentMatch.batter1.name}</span>
                </span>
                <span className="font-bold">
                  {currentMatch.batter1.runs} ({currentMatch.batter1.balls}) • {currentMatch.batter1.fours}/{currentMatch.batter1.sixes}
                </span>
              </div>
              <div className="flex items-center justify-between text-gray-300">
                <span className="font-medium">{currentMatch.batter2.name}</span>
                <span>
                  {currentMatch.batter2.runs} ({currentMatch.batter2.balls}) • {currentMatch.batter2.fours}/{currentMatch.batter2.sixes}
                </span>
              </div>
            </div>

            {/* Bowler & Over Timeline */}
            <div className="bg-white/5 rounded-xl p-3 border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-gray-400 font-bold border-b border-white/5 pb-1">
                <span>गेंदबाज</span>
                <span>{currentMatch.bowler.name}</span>
              </div>
              <div className="flex items-center justify-between text-gray-200 text-[11px]">
                <span>ओवर्स: {currentMatch.bowler.overs}</span>
                <span>रन: {currentMatch.bowler.runs}</span>
                <span className="font-bold text-red-400">विकेट: {currentMatch.bowler.wickets}</span>
              </div>

              {/* Recent Balls Strip */}
              <div className="flex items-center space-x-1.5 pt-1">
                <span className="text-[10px] text-gray-400">हाल की गेंदें:</span>
                {currentMatch.recentBalls.map((b, i) => (
                  <span
                    key={i}
                    className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px] ${
                      b === '4'
                        ? 'bg-blue-600 text-white'
                        : b === '6'
                        ? 'bg-emerald-600 text-white animate-pulse'
                        : b === 'W'
                        ? 'bg-red-600 text-white'
                        : 'bg-white/10 text-gray-300'
                    }`}
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
