import React, { useState } from 'react';
import { ReporterApplication, UserProfile } from '../types';
import { CircularLogo } from './CircularLogo';
import { 
  Lock, 
  Mail, 
  Key, 
  ArrowLeft, 
  ShieldCheck, 
  AlertCircle,
  UserCheck,
  Sparkles
} from 'lucide-react';

interface LoginModalProps {
  onBack: () => void;
  onAdminLoginSuccess: () => void;
  onReporterLoginSuccess: (reporter: ReporterApplication) => void;
  reporters: ReporterApplication[];
  customTitle?: string;
  customDescription?: string;
  initialRole?: 'reporter' | 'admin';
}

export const LoginModal: React.FC<LoginModalProps> = ({
  onBack,
  onAdminLoginSuccess,
  onReporterLoginSuccess,
  reporters,
  customTitle,
  customDescription,
  initialRole = 'reporter',
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginRole, setLoginRole] = useState<'reporter' | 'admin'>(initialRole);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const cleanEmail = email.trim().toLowerCase();

      // Admin Login Check
      if (loginRole === 'admin') {
        if (
          (cleanEmail === 'admin@ddnprimenews.in' || cleanEmail === 'ddnprimenews@gmail.com') &&
          password === 'admin123'
        ) {
          onAdminLoginSuccess();
          return;
        } else {
          setErrorMsg('अमान्य एडमिन क्रेडेंशियल। कृपया सही ईमेल और पासवर्ड दर्ज करें।');
          return;
        }
      }

      // Reporter Login Check
      const reporter = reporters.find(
        (r) => (r.email.toLowerCase() === cleanEmail || (r.reporterId && r.reporterId.toLowerCase() === cleanEmail)) && r.status === 'approved'
      );

      if (reporter) {
        // Match formalPassword if set, or accept reporter123 / custom password
        const expectedPass = reporter.formalPassword;
        if (
          !expectedPass ||
          password === expectedPass ||
          password === 'reporter123' ||
          password.length >= 4
        ) {
          onReporterLoginSuccess(reporter);
          return;
        } else {
          setErrorMsg('अमान्य पासवर्ड। कृपया एडमिन द्वारा जारी किया गया औपचारिक पासवर्ड दर्ज करें।');
          return;
        }
      }

      const pendingRep = reporters.find((r) => r.email.toLowerCase() === cleanEmail);
      if (pendingRep && pendingRep.status === 'pending') {
        setErrorMsg('आपका आवेदन अभी एडमिन अनुमोदन के लिए लंबित है। कृपया स्वीकृति की प्रतीक्षा करें।');
        return;
      }

      setErrorMsg('इस ईमेल से कोई अधिकृत संवाददाता नहीं मिला। कृपया "Apply for Reporter ID" पर जाकर आवेदन करें।');
    }, 400);
  };

  const handleQuickReporterDemo = (sampleEmail: string) => {
    setEmail(sampleEmail);
    setPassword('reporter123');
    setLoginRole('reporter');
  };

  const handleQuickAdminDemo = () => {
    setEmail('ddnprimenews@gmail.com');
    setPassword('admin123');
    setLoginRole('admin');
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 text-xs font-bold text-gray-600 hover:text-red-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>मुख्य पृष्ठ पर वापस जाएं</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        {/* Masthead */}
        <div className="bg-gradient-to-r from-red-800 via-red-700 to-red-900 text-white p-6 text-center">
          <div className="flex justify-center mb-3">
            <CircularLogo size={58} />
          </div>
          <h2 className="text-xl font-black tracking-tight">
            {customTitle || (loginRole === 'admin' ? 'डीडीएन एडमिन लॉगिन (Admin Portal)' : 'अधिकृत संवाददाता लॉगिन (Reporter Login)')}
          </h2>
          <p className="text-xs text-red-100 mt-1">
            {customDescription || (loginRole === 'admin'
              ? 'सुरक्षित संपादकीय एवं प्रशासनिक नियंत्रण कक्ष'
              : 'आईडी कार्ड / ऑथराइजेशन लेटर डाउनलोड व समाचार भेजने हेतु')}
          </p>
        </div>

        {/* Role Switcher */}
        <div className="grid grid-cols-2 p-2 bg-gray-50 border-b border-gray-200 gap-1">
          <button
            type="button"
            onClick={() => {
              setLoginRole('reporter');
              setErrorMsg(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition ${
              loginRole === 'reporter'
                ? 'bg-red-700 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            संवाददाता लॉगिन (Reporter)
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginRole('admin');
              setErrorMsg(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition ${
              loginRole === 'admin'
                ? 'bg-red-700 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            एडमिनिस्ट्रेटर (Admin)
          </button>
        </div>

        {errorMsg && (
          <div className="m-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              ईमेल आईडी (Registered Email)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={loginRole === 'admin' ? 'ddnprimenews@gmail.com' : 'rajesh.patna@ddnprimenews.in'}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              पासवर्ड (Password)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Key className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-600 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50 text-sm mt-2"
          >
            {loading ? 'सत्यापन हो रहा है...' : 'लॉगिन करें (Secure Login)'}
          </button>
        </form>

        {/* Quick Demo Credentials for Instant Review */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 text-xs text-gray-600 space-y-2">
          <div className="font-bold text-gray-800 flex items-center">
            <Sparkles className="w-3.5 h-3.5 text-yellow-600 mr-1" /> त्वरित परीक्षण क्रेडेंशियल (Demo Access):
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleQuickReporterDemo('rajesh.patna@ddnprimenews.in')}
              className="px-2.5 py-1 bg-white border border-gray-300 rounded text-[11px] font-semibold hover:border-red-600 transition"
            >
              पटना रिपोर्टर (राजेश वर्मा)
            </button>
            <button
              onClick={() => handleQuickReporterDemo('amit.muz@ddnprimenews.in')}
              className="px-2.5 py-1 bg-white border border-gray-300 rounded text-[11px] font-semibold hover:border-red-600 transition"
            >
              मुजफ्फरपुर रिपोर्टर (अमित ठाकुर)
            </button>
            <button
              onClick={handleQuickAdminDemo}
              className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded text-[11px] font-bold hover:bg-red-100 transition"
            >
              चीफ एडमिन लॉगिन (Admin Access)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
