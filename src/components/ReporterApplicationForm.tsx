import React, { useState } from 'react';
import { BIHAR_DISTRICTS } from '../types';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import confetti from 'canvas-confetti';
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  ArrowLeft, 
  ShieldCheck,
  Building,
  User,
  Phone,
  Mail,
  Home
} from 'lucide-react';

interface ReporterApplicationFormProps {
  onBack: () => void;
  onSuccessToast?: (msg: string) => void;
}

export const ReporterApplicationForm: React.FC<ReporterApplicationFormProps> = ({ onBack, onSuccessToast }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    fatherName: '',
    motherName: '',
    permanentAddress: '',
    mobileNumber: '',
    email: '',
    state: 'बिहार (Bihar)',
    district: 'पटना (Patna)',
    block: '',
    photoUrl: '',
    certificateUrl: '',
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [certPreviewName, setCertPreviewName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Simulated instant image upload conversion or Base64/Storage URI
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setPhotoPreview(result);
        setFormData((prev) => ({ ...prev, photoUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCertChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCertPreviewName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setFormData((prev) => ({ ...prev, certificateUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Form Validations
    if (!formData.fullName.trim()) return setErrorMsg('कृपया अपना पूरा नाम दर्ज करें');
    if (!formData.fatherName.trim()) return setErrorMsg('कृपया पिता का नाम दर्ज करें');
    if (!formData.motherName.trim()) return setErrorMsg('कृपया माता का नाम दर्ज करें');
    if (!formData.permanentAddress.trim()) return setErrorMsg('कृपया स्थायी पता दर्ज करें');
    if (!formData.mobileNumber.trim() || formData.mobileNumber.length < 10) return setErrorMsg('कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें');
    if (!formData.email.trim() || !formData.email.includes('@')) return setErrorMsg('कृपया वैध ईमेल आईडी दर्ज करें');
    if (!formData.block.trim()) return setErrorMsg('कृपया अपना प्रखंड (Block) दर्ज करें');

    // Default placeholder photo if user skipped selecting photo
    const finalPhoto = formData.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';
    const finalCert = formData.certificateUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80';

    setLoading(true);
    try {
      // Data saves to Firestore under pending_reporters collection with status: "pending"
      // Also write to reporter_applications collection
      const appPayload = {
        fullName: formData.fullName.trim(),
        fatherName: formData.fatherName.trim(),
        motherName: formData.motherName.trim(),
        permanentAddress: formData.permanentAddress.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        email: formData.email.trim(),
        state: formData.state,
        district: formData.district,
        block: formData.block.trim(),
        photoUrl: finalPhoto,
        certificateUrl: finalCert,
        status: 'pending',
        appliedAt: Date.now(),
      };

      // Firestore pending_reporters collection
      await addDoc(collection(db, 'pending_reporters'), appPayload);
      // Also save to reporter_applications for uniform admin listing
      await addDoc(collection(db, 'reporter_applications'), appPayload);

      setSubmitted(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      if (onSuccessToast) {
        onSuccessToast('Application submitted successfully! Your ID card is pending admin approval.');
      }
    } catch (err: any) {
      console.error('Error submitting reporter application:', err);
      setErrorMsg('आवेदन सबमिट करने में समस्या आई: ' + (err.message || 'पुनः प्रयास करें'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 text-sm font-semibold text-gray-600 hover:text-red-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>मुख्य पृष्ठ पर वापस जाएं</span>
        </button>

        <div className="inline-flex items-center space-x-1 bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-semibold border border-red-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>DDN Media Press Accreditation</span>
        </div>
      </div>

      {submitted ? (
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center border-t-4 border-green-600 animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">
            Application submitted successfully!
          </h2>
          <p className="text-base text-gray-700 font-medium max-w-lg mx-auto mb-4">
            Your ID card is pending admin approval.
          </p>
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm p-4 rounded-xl max-w-lg mx-auto text-left space-y-2 mb-6">
            <div className="font-bold flex items-center">
              <AlertCircle className="w-4 h-4 mr-1.5 text-amber-600" />
              महत्वपूर्ण सूचना:
            </div>
            <p className="text-xs leading-relaxed">
              आपका आवेदन हमारे संपादकीय मंडल एवं एडमिन वेरिफिकेशन टीम के पास सुरक्षित पहुंच चुका है। दस्तावेजों के सत्यापन के पश्चात आपको <strong>प्रेस आईडी कार्ड</strong> जारी कर ईमेल/व्हाट्सएप द्वारा लॉगिन विवरण प्रेषित किया जाएगा।
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onBack}
              className="px-6 py-2.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg shadow transition"
            >
              समाचार पोर्टल देखें
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          {/* Form Header Banner */}
          <div className="bg-gradient-to-r from-red-800 via-red-700 to-red-900 text-white p-6 md:p-8">
            <div className="flex items-center space-x-2 text-xs font-bold text-red-200 uppercase tracking-widest mb-1">
              <span>DDN Prime News • पत्रकार पंजीकरण प्रणाली</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Apply for Official Reporter ID Card
            </h1>
            <p className="text-sm text-red-100 mt-1">
              डीडीएन प्राइम न्यूज़ के अधिकृत जिला/प्रखंड संवाददाता बनने हेतु अपना आवेदन पत्र भरें।
            </p>
          </div>

          {/* Form Alert / Info */}
          <div className="bg-red-50/70 border-b border-red-100 p-4 px-6 text-xs text-red-900 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-700 flex-shrink-0 mt-0.5" />
            <p>
              <strong>सुरक्षा एवं गोपनीयता नियम:</strong> बिना एडमिन की जांच व अनुमोदन के कोई भी सीधे समाचार प्रकाशित नहीं कर सकता। सभी विवरण वास्तविक और आधार कार्ड/शैक्षणिक प्रमाण पत्र के अनुसार भरें।
            </p>
          </div>

          {errorMsg && (
            <div className="m-6 p-4 bg-red-100 border border-red-300 text-red-800 rounded-xl text-sm flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  पूरा नाम (Full Name) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="उदा. राहुल कुमार शर्मा"
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Father's Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  पिता का नाम (Father's Name) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fatherName}
                  onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                  placeholder="उदा. श्री सत्येंद्र शर्मा"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>

              {/* Mother's Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  माता का नाम (Mother's Name) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.motherName}
                  onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                  placeholder="उदा. श्रीमती कांति देवी"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  मोबाइल नंबर (Mobile Number) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value.replace(/\D/g, '') })}
                    placeholder="10 अंकों का मोबाइल नंबर"
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  ईमेल आईडी (Email Address) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="yourname@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* State */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  राज्य (State)
                </label>
                <input
                  type="text"
                  disabled
                  value={formData.state}
                  className="w-full px-3 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-700 cursor-not-allowed"
                />
              </div>

              {/* Work Area: District Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  कार्य क्षेत्र - जिला (Assigned District) *
                </label>
                <select
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-red-600 focus:outline-none"
                >
                  {BIHAR_DISTRICTS.filter((d) => !d.startsWith('सभी')).map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </div>

              {/* Work Area: Block Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  कार्य क्षेत्र - प्रखंड / अनुमंडल (Block / Tehsil) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Building className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.block}
                    onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                    placeholder="उदा. सदर / मुशहरी / केवटी / मनेर"
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Permanent Address */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                स्थायी पता (Full Permanent Address) *
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none text-gray-400">
                  <Home className="w-4 h-4" />
                </div>
                <textarea
                  rows={3}
                  required
                  value={formData.permanentAddress}
                  onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })}
                  placeholder="मकान संख्या, वार्ड, मोहल्ला/गांव, पोस्ट, थाना, पिन कोड सहित पूर्ण पता"
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Upload Sections: Passport Photo & Education Certificate */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Photo Upload */}
              <div className="border-2 border-dashed border-gray-300 hover:border-red-400 rounded-xl p-4 text-center bg-gray-50 transition">
                <div className="mb-2">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-20 h-24 object-cover mx-auto rounded-lg shadow border border-gray-300"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                      <User className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="text-xs font-bold text-gray-800">
                  पासपोर्ट साइज फोटो अपलोड करें *
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  (JPG/PNG, प्रेस आईडी कार्ड पर मुद्रित करने हेतु)
                </p>
                <label className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-md text-xs font-semibold text-gray-700 hover:bg-gray-100 cursor-pointer shadow-sm">
                  <Upload className="w-3.5 h-3.5" />
                  <span>फोटो चुनें</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Education Certificate Upload */}
              <div className="border-2 border-dashed border-gray-300 hover:border-red-400 rounded-xl p-4 text-center bg-gray-50 transition">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <FileText className="w-8 h-8" />
                </div>
                <div className="text-xs font-bold text-gray-800">
                  शैक्षणिक प्रमाण पत्र / पहचान पत्र *
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {certPreviewName ? (
                    <span className="text-green-700 font-bold">{certPreviewName}</span>
                  ) : (
                    '(10th/12th/Graduation/Journalism Diploma या आधार कार्ड)'
                  )}
                </p>
                <label className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-md text-xs font-semibold text-gray-700 hover:bg-gray-100 cursor-pointer shadow-sm">
                  <Upload className="w-3.5 h-3.5" />
                  <span>दस्तावेज़ अपलोड करें</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleCertChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Declaration */}
            <div className="bg-gray-50 p-4 rounded-xl text-xs text-gray-600 border border-gray-200">
              <label className="flex items-start space-x-2.5 cursor-pointer">
                <input type="checkbox" required className="mt-0.5 text-red-600 rounded" />
                <span>
                  मैं घोषणा करता/करती हूँ कि ऊपर दी गई सभी जानकारियां पूर्णतः सत्य हैं। मैं डीडीएन प्राइम न्यूज़ की पत्रकारिता आचार संहिता एवं संविधान के नियमों का निष्ठापूर्वक पालन करूँगा/करूँगी।
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-8 py-3.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>आवेदन प्रेषित हो रहा है...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>आवेदन जमा करें (Submit Application)</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
