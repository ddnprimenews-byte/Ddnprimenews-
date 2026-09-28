import React, { useState, useRef, useEffect } from 'react';
import { 
  Radio, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  ExternalLink, 
  Sparkles, 
  Signal, 
  RadioTower, 
  ChevronRight,
  Headphones
} from 'lucide-react';

interface RadioStation {
  id: string;
  name: string;
  frequency: string;
  city: string;
  genre: string;
  streamUrl: string;
  websiteUrl: string;
  color: string;
}

export const LiveFMRadioPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedStationIndex, setSelectedStationIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [streamError, setStreamError] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stations: RadioStation[] = [
    {
      id: 'air-vb',
      name: 'आकाशवाणी विविध भारती (AIR Vividh Bharati)',
      frequency: '102.8 FM',
      city: 'राष्ट्रीय प्रसारण',
      genre: 'हिंदी संगीत, समाचार व वार्ता',
      streamUrl: 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio001/playlist.m3u8',
      websiteUrl: 'https://newsonair.gov.in/live-radio/vividh-bharati-hindi',
      color: 'from-amber-600 to-red-600',
    },
    {
      id: 'air-patna',
      name: 'ऑल इंडिया रेडियो पटना (AIR Patna)',
      frequency: '102.5 FM',
      city: 'पटना, बिहार',
      genre: 'बिहार प्रादेशिक समाचार व मैथिली/भोजपुरी',
      streamUrl: 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio102/playlist.m3u8',
      websiteUrl: 'https://newsonair.gov.in/live-radio/air-patna-regional',
      color: 'from-red-600 to-rose-700',
    },
    {
      id: 'air-gold',
      name: 'आकाशवाणी एफएम गोल्ड (FM Gold)',
      frequency: '100.1 FM',
      city: 'नई दिल्ली / नेशनल',
      genre: 'सदाबहार गीत व ताज़ा समाचार बुलेटिन',
      streamUrl: 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio002/playlist.m3u8',
      websiteUrl: 'https://newsonair.gov.in/live-radio/fm-gold-delhi',
      color: 'from-yellow-600 to-amber-700',
    },
    {
      id: 'mirchi',
      name: 'रेडियो मिर्ची (Radio Mirchi FM)',
      frequency: '98.3 FM',
      city: 'पटना / बिहार',
      genre: 'सुपरहिट बॉलीवुड, टॉक शो व कॉमेडी',
      streamUrl: 'https://streams.radiomast.io/radio-mirchi-live',
      websiteUrl: 'https://radiomirchi.com',
      color: 'from-rose-600 to-red-800',
    },
    {
      id: 'bigfm',
      name: 'बिग एफएम (92.7 Big FM)',
      frequency: '92.7 FM',
      city: 'उत्तर भारत नेटवर्क',
      genre: 'धुनों का जादू व मोटिवेशनल शो',
      streamUrl: 'https://stream.zeno.fm/f3wvbbqmdg8uv',
      websiteUrl: 'https://bigfmindia.com',
      color: 'from-blue-600 to-indigo-800',
    },
    {
      id: 'bhojpuri-fm',
      name: 'भोजपुरी तरंग लाइव एफएम (Bhojpuri FM)',
      frequency: 'Digital FM',
      city: 'बिहार / पूर्वांचल',
      genre: 'लोकगीत, छठ गीत व पारंपरिक संगीत',
      streamUrl: 'https://stream.zeno.fm/4vrtz78dkh0uv',
      websiteUrl: 'https://radiogarden.com',
      color: 'from-emerald-600 to-teal-800',
    },
  ];

  const currentStation = stations[selectedStationIndex];

  // Sync volume and audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setStreamError(false);
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            console.warn('Audio stream autoplay constraint:', err);
            // Even if audio tag direct stream CORS limits apply in some browsers, set stream fallback
            setIsPlaying(true);
          });
      }
    }
  };

  const handleStationChange = (idx: number) => {
    setSelectedStationIndex(idx);
    setStreamError(false);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.src = stations[idx].streamUrl;
      audioRef.current.load();
      setTimeout(() => {
        audioRef.current?.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(true));
      }, 300);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-neutral-900 to-slate-950 text-white rounded-2xl border border-gray-800 shadow-xl overflow-hidden my-6">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={currentStation.streamUrl}
        preload="none"
        onError={() => setStreamError(true)}
      />

      {/* Header */}
      <div className={`p-4 bg-gradient-to-r ${currentStation.color} flex items-center justify-between transition-colors duration-500`}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black shadow-md flex-shrink-0">
            <Radio className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black text-sm uppercase tracking-wide">
                लाइव एफएम व रेडियो (Live FM Radio)
              </span>
              <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-white/20 text-white uppercase backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>ON AIR</span>
              </span>
            </div>
            <p className="text-[11px] text-white/90">
              समाचार और गीतों का 24x7 सीधा प्रसारण • बिहार और राष्ट्रीय स्टेशन
            </p>
          </div>
        </div>

        <a
          href={currentStation.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-white/80 hover:text-white flex items-center space-x-1 bg-black/20 hover:bg-black/40 px-2.5 py-1.5 rounded-lg transition font-bold"
          title="आधिकारिक ब्रॉडकास्ट पोर्टल खोलें"
        >
          <span>आधिकारिक लिंक</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Current Playing Details & Wave Visualizer */}
      <div className="p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/5 p-4 rounded-xl border border-white/5">
          <div className="flex items-center space-x-3 text-left w-full sm:w-auto">
            {/* Play / Pause Big Button */}
            <button
              onClick={togglePlay}
              className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 flex-shrink-0 ${
                isPlaying
                  ? 'bg-amber-400 text-gray-950 ring-4 ring-amber-400/30'
                  : 'bg-red-600 hover:bg-red-700 text-white ring-4 ring-red-600/30'
              }`}
              title={isPlaying ? 'रेडियो बंद करें' : 'रेडियो शुरू करें'}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-current" />
              ) : (
                <Play className="w-6 h-6 fill-current ml-1" />
              )}
            </button>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                  {currentStation.frequency}
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  {currentStation.city}
                </span>
              </div>
              <h4 className="font-extrabold text-sm sm:text-base text-white mt-1">
                {currentStation.name}
              </h4>
              <p className="text-xs text-gray-400 font-medium">
                {currentStation.genre}
              </p>
            </div>
          </div>

          {/* Equalizer Visualizer & Volume */}
          <div className="flex items-center space-x-4 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
            {/* Equalizer Wave */}
            <div className="flex items-end space-x-1 h-8 px-2">
              {[40, 70, 30, 90, 60, 100, 45, 80].map((h, i) => (
                <span
                  key={i}
                  style={{
                    height: isPlaying ? `${h}%` : '20%',
                    transition: 'height 0.2s ease',
                  }}
                  className={`w-1.5 rounded-full ${
                    isPlaying ? 'bg-amber-400 animate-pulse' : 'bg-gray-700'
                  }`}
                />
              ))}
            </div>

            {/* Volume Control */}
            <div className="flex items-center space-x-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-gray-400 hover:text-white"
                title={isMuted ? 'अनम्यूट करें' : 'म्यूट करें'}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  if (isMuted) setIsMuted(false);
                }}
                className="w-16 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Station Presets Grid */}
        <div>
          <div className="flex items-center justify-between text-xs text-gray-400 font-bold mb-2">
            <span>अन्य रेडियो स्टेशन चुनें (Select FM Station):</span>
            <span className="text-[11px] text-amber-400">कुल 6 स्टेशन उपलब्ध</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {stations.map((st, idx) => (
              <button
                key={st.id}
                onClick={() => handleStationChange(idx)}
                className={`p-2.5 rounded-xl text-left transition border ${
                  selectedStationIndex === idx
                    ? 'bg-amber-500/20 border-amber-400 text-white shadow-sm'
                    : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-amber-300">
                    {st.frequency}
                  </span>
                  {selectedStationIndex === idx && isPlaying && (
                    <Signal className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  )}
                </div>
                <div className="font-extrabold text-xs mt-1 truncate">{st.name}</div>
                <div className="text-[10px] text-gray-400 mt-0.5 truncate">{st.city}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Quick External FM Links Bar */}
        <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between text-[11px] text-gray-400 gap-2">
          <span className="flex items-center space-x-1">
            <RadioTower className="w-3.5 h-3.5 text-amber-400" />
            <span>लाइव स्ट्रीमिंग ब्राउज़र और मोबाइल दोनों पर समर्थित</span>
          </span>
          <div className="flex items-center space-x-3">
            <a
              href="https://newsonair.gov.in"
              target="_blank"
              rel="noreferrer"
              className="text-amber-400 hover:underline flex items-center"
            >
              <span>AIR NewsOnAir Portal</span>
              <ExternalLink className="w-2.5 h-2.5 ml-1" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
