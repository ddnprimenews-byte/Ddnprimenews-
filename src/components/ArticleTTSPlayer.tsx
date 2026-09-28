import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Gauge, 
  Radio
} from 'lucide-react';

interface ArticleTTSPlayerProps {
  title: string;
  summary: string;
  content: string;
}

export const ArticleTTSPlayer: React.FC<ArticleTTSPlayerProps> = ({
  title,
  summary,
  content,
}) => {
  const [isSupported, setIsSupported] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState<number>(1);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState<number>(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize and check SpeechSynthesis API support
  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
      return;
    }

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices && availableVoices.length > 0) {
        setVoices(availableVoices);
        // Find best Hindi voice or Indian English or default
        const hiVoiceIndex = availableVoices.findIndex(
          (v) => v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi')
        );
        if (hiVoiceIndex !== -1) {
          setSelectedVoiceIndex(hiVoiceIndex);
        } else {
          // fallback to en-IN or default
          const inVoiceIndex = availableVoices.findIndex((v) => v.lang.includes('IN'));
          if (inVoiceIndex !== -1) {
            setSelectedVoiceIndex(inVoiceIndex);
          } else {
            setSelectedVoiceIndex(0);
          }
        }
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Stop playback when article changes
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  }, [title, content]);

  if (!isSupported) {
    return null;
  }

  // Prepares the full Hindi/English text stream
  const getFullCleanText = () => {
    // Clean markdown/newlines for natural voice flow
    const cleanContent = content.replace(/[*_#`]/g, '').trim();
    return `डीडीएन प्राइम न्यूज़। ${title}। ${summary}। ${cleanContent}`;
  };

  const handlePlay = () => {
    if (!('speechSynthesis' in window)) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();

    const textToSpeak = getFullCleanText();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    if (voices[selectedVoiceIndex]) {
      utterance.voice = voices[selectedVoiceIndex];
      utterance.lang = voices[selectedVoiceIndex].lang || 'hi-IN';
    } else {
      utterance.lang = 'hi-IN';
    }

    utterance.rate = rate;
    utterance.pitch = 1;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = (e) => {
      console.error('Speech error:', e);
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    if (!('speechSynthesis' in window)) return;
    if (isPlaying && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handleRateChange = (newRate: number) => {
    setRate(newRate);
    if (isPlaying) {
      // Re-trigger speech with updated rate
      handleStop();
      setTimeout(() => {
        handlePlay();
      }, 50);
    }
  };

  // Filter useful voices (Hindi, Indian, English, etc.)
  const priorityVoices = voices.filter(
    (v) =>
      v.lang.startsWith('hi') ||
      v.lang.includes('IN') ||
      v.name.toLowerCase().includes('hindi') ||
      v.name.toLowerCase().includes('india') ||
      v.lang.startsWith('en')
  );

  return (
    <div className="mb-6 bg-gradient-to-r from-red-50 via-white to-red-50 rounded-2xl border border-red-200 p-4 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Title & Status */}
        <div className="flex items-center space-x-3">
          <div className={`p-2.5 rounded-xl ${isPlaying ? 'bg-red-700 text-white animate-pulse' : 'bg-red-100 text-red-700'}`}>
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black text-sm text-gray-900">
                ऑडियो बुलेटिन सुनें (Listen to News)
              </span>
              {isPlaying && (
                <span className="flex items-center space-x-1 text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full animate-pulse">
                  <Radio className="w-3 h-3" />
                  <span>लाइव वाचन</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-500">
              वेब स्पीच ऑडियो द्वारा समाचार सुनें • हैंड्स-फ़्री अनुभव
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Play / Pause Button */}
          {!isPlaying ? (
            <button
              onClick={handlePlay}
              className="flex items-center space-x-1.5 px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold shadow transition"
              title="समाचार सुनें"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isPaused ? 'पुनः शुरू करें (Resume)' : 'खबर सुनें (Play)'}</span>
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="flex items-center space-x-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow transition"
              title="रोकें"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>विराम दें (Pause)</span>
            </button>
          )}

          {/* Stop Button */}
          {(isPlaying || isPaused) && (
            <button
              onClick={handleStop}
              className="flex items-center space-x-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition"
              title="रोकें"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>रोकें (Stop)</span>
            </button>
          )}

          {/* Speed Selector */}
          <div className="flex items-center space-x-1 bg-white border border-gray-200 rounded-xl p-1 text-[11px] font-bold text-gray-600">
            <Gauge className="w-3 h-3 text-gray-400 ml-1" />
            <button
              onClick={() => handleRateChange(0.85)}
              className={`px-2 py-0.5 rounded-lg transition ${
                rate === 0.85 ? 'bg-red-700 text-white' : 'hover:bg-gray-100'
              }`}
              title="धीमी गति (0.85x)"
            >
              0.8x
            </button>
            <button
              onClick={() => handleRateChange(1)}
              className={`px-2 py-0.5 rounded-lg transition ${
                rate === 1 ? 'bg-red-700 text-white' : 'hover:bg-gray-100'
              }`}
              title="सामान्य गति (1.0x)"
            >
              1.0x
            </button>
            <button
              onClick={() => handleRateChange(1.25)}
              className={`px-2 py-0.5 rounded-lg transition ${
                rate === 1.25 ? 'bg-red-700 text-white' : 'hover:bg-gray-100'
              }`}
              title="तेज गति (1.25x)"
            >
              1.2x
            </button>
          </div>

          {/* Voice Dropdown if multiple voices available */}
          {priorityVoices.length > 1 && (
            <select
              value={selectedVoiceIndex}
              onChange={(e) => {
                const newIdx = Number(e.target.value);
                setSelectedVoiceIndex(newIdx);
                if (isPlaying) {
                  handleStop();
                }
              }}
              className="text-[11px] font-medium bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-red-600"
              title="आवाज चुनें (Select Voice)"
            >
              {priorityVoices.map((v, idx) => {
                const originalIdx = voices.indexOf(v);
                return (
                  <option key={idx} value={originalIdx}>
                    {v.name.slice(0, 20)} ({v.lang})
                  </option>
                );
              })}
            </select>
          )}
        </div>
      </div>
    </div>
  );
};
