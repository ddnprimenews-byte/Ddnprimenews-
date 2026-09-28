import React, { useState } from 'react';
import { 
  Mail, 
  CheckCircle2, 
  Sparkles, 
  Send, 
  ShieldCheck, 
  AlertCircle, 
  Loader2,
  Calendar,
  MapPin,
  Flame
} from 'lucide-react';
import { collection, addDoc, query, where, getDocs, limit, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { BIHAR_DISTRICTS } from '../types';

export const DailyNewsletterWidget: React.FC = () => {
  const [email, setEmail] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('समस्त बिहार (All Bihar)');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [subscriberEmail, setSubscriberEmail] = useState('');

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setStatus('error');
      setErrorMessage('कृपया अपना ईमेल पता दर्ज करें।');
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setStatus('error');
      setErrorMessage('अमान्य ईमेल पता! कृपया सही ईमेल दर्ज करें (उदा. yourname@gmail.com)।');
      return;
    }

    try {
      setStatus('loading');
      setErrorMessage('');

      // Check if already subscribed
      let alreadySubscribed = false;
      try {
        const checkQuery = query(
          collection(db, 'newsletter_subscribers'),
          where('email', '==', cleanEmail),
          limit(1)
        );
        const checkSnap = await getDocs(checkQuery);
        if (!checkSnap.empty) {
          alreadySubscribed = true;
        }
      } catch (checkErr) {
        console.warn('Subscription check note:', checkErr);
      }

      if (alreadySubscribed) {
        setStatus('success');
        setSubscriberEmail(cleanEmail);
        return;
      }

      // Add to newsletter_subscribers collection
      const payload = {
        email: cleanEmail,
        status: 'active',
        frequency: frequency === 'daily' ? 'दैनिक (Daily Morning 7 AM)' : 'साप्ताहिक (Weekly Roundup)',
        district: selectedDistrict,
        preferredLanguage: 'hi',
        source: 'sidebar_widget',
        subscribedAt: new Date().toISOString(),
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'newsletter_subscribers'), payload);

      setSubscriberEmail(cleanEmail);
      setStatus('success');
      setEmail('');
    } catch (err: unknown) {
      console.error('Newsletter subscribe error:', err);
      try {
        handleFirestoreError(err, OperationType.CREATE, 'newsletter_subscribers');
      } catch {
        // Fall through to display user-friendly message
      }
      setStatus('error');
      setErrorMessage('सब्सक्रिप्शन में तकनीकी समस्या आई। कृपया पुनः प्रयास करें।');
    }
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 via-white to-red-50 rounded-2xl border-2 border-red-100 overflow-hidden shadow-sm hover:shadow-md transition">
      {/* Top Banner Ribbon */}
      <div className="bg-gradient-to-r from-red-700 via-red-800 to-rose-900 text-white px-4 py-3 relative">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-400 text-red-950 flex items-center justify-center font-black shadow-md flex-shrink-0">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-black text-sm uppercase tracking-wide">
                दैनिक समाचार बुलेटिन
              </span>
              <span className="bg-amber-400 text-red-900 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                FREE
              </span>
            </div>
            <p className="text-[11px] text-red-100 font-medium">
              Daily Morning News Summary
            </p>
          </div>
        </div>

        {/* Decorative corner flash */}
        <div className="absolute top-2 right-2 flex items-center space-x-1 bg-white/10 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] text-amber-200">
          <Flame className="w-3 h-3 text-amber-300 animate-pulse" />
          <span className="font-bold">7 AM सुबह</span>
        </div>
      </div>

      <div className="p-4 space-y-3.5">
        {status === 'success' ? (
          /* Subscription Success State */
          <div className="bg-white rounded-xl p-4 border border-emerald-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h4 className="font-black text-emerald-800 text-sm">
                🎉 सदस्यता सफल (Subscribed!)
              </h4>
              <p className="text-xs text-gray-600 mt-1">
                <span className="font-bold text-gray-800">{subscriberEmail}</span> को DDN Prime News बुलेटिन सूची में जोड़ दिया गया है।
              </p>
            </div>

            <div className="bg-emerald-50 rounded-lg p-2.5 text-[11px] text-emerald-800 font-medium text-left space-y-1">
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>प्रथम बुलेटिन कल प्रातः 7:00 बजे भेजा जाएगा।</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>चुना गया क्षेत्र: {selectedDistrict}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setStatus('idle');
                setEmail('');
              }}
              className="text-xs text-red-700 hover:text-red-800 font-bold hover:underline block mx-auto pt-1"
            >
              + दूसरा ईमेल जोड़ें
            </button>
          </div>
        ) : (
          /* Subscription Form */
          <>
            <p className="text-xs text-gray-700 leading-relaxed font-medium">
              बिहार और देश-दुनिया की <strong>शीर्ष 10 विश्वसनीय हेडलाइंस</strong> सीधे आपके ईमेल इनबॉक्स में। 100% निशुल्क।
            </p>

            <form onSubmit={handleSubscribe} className="space-y-3">
              {/* Email Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-700 flex items-center space-x-1">
                  <span>ईमेल पता (Email Address)</span>
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === 'error') setStatus('idle');
                    }}
                    placeholder="उदा. apka.naam@gmail.com"
                    required
                    disabled={status === 'loading'}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 disabled:opacity-50 font-medium"
                  />
                </div>
              </div>

              {/* District Preference */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-700 flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-red-600" />
                  <span>पसंदीदा जिला कवरेज (वैकल्पिक)</span>
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  disabled={status === 'loading'}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 disabled:opacity-50 text-gray-700 font-medium"
                >
                  <option value="समस्त बिहार (All Bihar)">समस्त बिहार (All Bihar)</option>
                  {BIHAR_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Frequency Selector */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setFrequency('daily')}
                  className={`py-1.5 px-2 rounded-lg font-bold border transition text-center flex items-center justify-center space-x-1 ${
                    frequency === 'daily'
                      ? 'bg-red-700 text-white border-red-700 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Calendar className="w-3 h-3" />
                  <span>दैनिक (Daily)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFrequency('weekly')}
                  className={`py-1.5 px-2 rounded-lg font-bold border transition text-center flex items-center justify-center space-x-1 ${
                    frequency === 'weekly'
                      ? 'bg-red-700 text-white border-red-700 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>साप्ताहिक (Weekly)</span>
                </button>
              </div>

              {/* Error Message */}
              {status === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 text-red-700 text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-sm active:scale-[0.99] transition disabled:opacity-50"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>सब्सक्राइब हो रहा है...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>अभी सब्सक्राइब करें (Free Subscribe)</span>
                  </>
                )}
              </button>
            </form>

            {/* Privacy & Anti-spam Guarantee */}
            <div className="pt-2 border-t border-red-100 flex items-center justify-between text-[10px] text-gray-500">
              <span className="flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>100% नो स्पैम गारंटी</span>
              </span>
              <span>कभी भी अनसब्सक्राइब करें</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
