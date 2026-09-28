import React, { useState } from 'react';
import { Sparkles, Compass, Moon, Star, Sun, ShieldCheck } from 'lucide-react';

interface RashiData {
  id: string;
  name: string;
  englishName: string;
  symbol: string;
  prediction: string;
  career: string;
  health: string;
  luckyNumber: number;
  luckyColor: string;
  remedy: string;
}

export const RashifalWidget: React.FC = () => {
  const [selectedRashiId, setSelectedRashiId] = useState('mesh');

  const rashis: RashiData[] = [
    {
      id: 'mesh',
      name: 'मेष',
      englishName: 'Aries',
      symbol: '♈',
      prediction: 'आज का दिन आपके लिए आत्मविश्वास और ऊर्जा से भरपूर रहेगा। कार्यक्षेत्र में नए अवसर मिलेंगे। रुका हुआ धन वापस मिलने के योग हैं।',
      career: 'व्यापार में लाभ की संभावना। सहकर्मियों का पूरा सहयोग मिलेगा।',
      health: 'ऊर्जावान महसूस करेंगे, लेकिन खान-पान में संतुलन बनाए रखें।',
      luckyNumber: 9,
      luckyColor: 'लाल (Red)',
      remedy: 'हनुमान चालीसा का पाठ करें और सिंदूर का तिलक लगाएं।',
    },
    {
      id: 'vrishabh',
      name: 'वृषभ',
      englishName: 'Taurus',
      symbol: '♉',
      prediction: 'आज परिवार में सुख-शांति बनी रहेगी। वित्तीय मामलों में समझदारी से निर्णय लें। पुराने मित्रों से मुलाकात से मन प्रसन्न रहेगा।',
      career: 'नौकरीपेशा लोगों को पदोन्नति या नई जिम्मेदारी मिल सकती है।',
      health: 'गले और मौसम संबंधी छोटी समस्याओं से सावधान रहें।',
      luckyNumber: 6,
      luckyColor: 'सफेद (White)',
      remedy: 'माता लक्ष्मी को सफेद पुष्प अर्पित करें।',
    },
    {
      id: 'mithun',
      name: 'मिथुन',
      englishName: 'Gemini',
      symbol: '♊',
      prediction: 'संवाद और बुद्धिमत्ता से कठिन काम भी आसानी से हल होंगे। नए संपर्कों से भविष्य में बड़ा लाभ होगा। यात्रा के योग हैं।',
      career: 'मीडिया, आईटी और मार्केटिंग क्षेत्र से जुड़े लोगों के लिए श्रेष्ठ दिन।',
      health: 'मानसिक तनाव से बचें, योग और प्राणायाम करें।',
      luckyNumber: 5,
      luckyColor: 'हरा (Green)',
      remedy: 'गणेश जी को दूर्वा अर्पित करें।',
    },
    {
      id: 'kark',
      name: 'कर्क',
      englishName: 'Cancer',
      symbol: '♋',
      prediction: 'भावनात्मक रूप से दिन सुखद रहेगा। घर-परिवार में मांगलिक कार्यों की रूपरेखा बनेगी। जमीन-जायदाद के मामलों में प्रगति होगी।',
      career: 'निवेश से लाभ होने के संकेत। नए अनुबंध पर हस्ताक्षर हो सकते हैं।',
      health: 'जल का भरपूर सेवन करें, पर्याप्त नींद लें।',
      luckyNumber: 2,
      luckyColor: 'मोतिया / सिल्वर',
      remedy: 'शिवलिंग पर कच्चा दूध व जल अर्पित करें।',
    },
    {
      id: 'singh',
      name: 'सिंह',
      englishName: 'Leo',
      symbol: '♌',
      prediction: 'आपके नेतृत्व कौशल की प्रशंसा होगी। सरकारी और प्रशासनिक कार्यों में सफलता मिलेगी। मान-सम्मान में वृद्धि होगी।',
      career: 'उच्चाधिकारियों का मार्गदर्शन मिलेगा। व्यवसाय में विस्तार के अवसर।',
      health: 'दिनभर ताजगी और उत्साह बना रहेगा।',
      luckyNumber: 1,
      luckyColor: 'केसरिया (Saffron / Gold)',
      remedy: 'प्रातः सूर्य देव को तांबे के लोटे से अर्घ्य दें।',
    },
    {
      id: 'kanya',
      name: 'कन्या',
      englishName: 'Virgo',
      symbol: '♍',
      prediction: 'योजनाबद्ध तरीके से काम करने पर सफलता निश्चित है। विद्यार्थियों के लिए अध्ययन हेतु उत्तम समय। आर्थिक स्थिति मजबूत होगी।',
      career: 'लेखांकन और बैंकिंग से जुड़े कार्यों में विशेष सफलता।',
      health: 'पेट संबंधी गड़बड़ी से बचने के लिए सात्विक भोजन लें।',
      luckyNumber: 5,
      luckyColor: 'धनी हरा (Light Green)',
      remedy: 'पक्षियों को दाना और गाय को हरी घास खिलाएं।',
    },
    {
      id: 'tula',
      name: 'तुला',
      englishName: 'Libra',
      symbol: '♎',
      prediction: 'कला, संगीत और रचनात्मक कार्यों में रुचि बढ़ेगी। दांपत्य जीवन में मधुरता रहेगी। किसी पुराने विवाद का सुखद समाधान होगा।',
      career: 'साझेदारी के व्यापार में पारदर्शिता रखें, बड़ा मुनाफा संभव।',
      health: 'स्वास्थ्य अनुकूल रहेगा, दिनचर्या नियमित रखें।',
      luckyNumber: 6,
      luckyColor: 'गुलाबी / क्रीम',
      remedy: 'इत्र का प्रयोग करें और जरूरतमंद कन्या को उपहार दें।',
    },
    {
      id: 'vrishchik',
      name: 'वृश्चिक',
      englishName: 'Scorpio',
      symbol: '♏',
      prediction: 'साहस और पराक्रम से विरोधियों पर विजय प्राप्त होगी। अचानक धन लाभ के योग बन रहे हैं। पैतृक संपत्ति के मामले सुलझेंगे।',
      career: 'रिसर्च, रक्षा या रियल एस्टेट क्षेत्र में बड़ी उपलब्धि।',
      health: 'रक्तचाप और आंखों का ध्यान रखें।',
      luckyNumber: 9,
      luckyColor: 'मरून / गहरा लाल',
      remedy: 'सुंदरकांड का पाठ अथवा ॐ अं अंगारकाय नमः का जप करें।',
    },
    {
      id: 'dhanu',
      name: 'धनु',
      englishName: 'Sagittarius',
      symbol: '♐',
      prediction: 'धार्मिक और आध्यात्मिक गतिविधियों में मन लगेगा। गुरुजनों का आशीर्वाद मिलेगा। दूर की यात्रा सुखद और फलदायी रहेगी।',
      career: 'शिक्षा, कंसल्टेंसी और कानून के क्षेत्र में उन्नति।',
      health: 'जोड़ों के दर्द में आराम मिलेगा, सैर करें।',
      luckyNumber: 3,
      luckyColor: 'पीला (Yellow)',
      remedy: 'विष्णु सहस्रनाम का पाठ करें और केले के वृक्ष में जल दें।',
    },
    {
      id: 'makar',
      name: 'मकर',
      englishName: 'Capricorn',
      symbol: '♑',
      prediction: 'कड़ी मेहनत का सुखद परिणाम सामने आएगा। कार्यस्थल पर आपकी निष्ठा का सम्मान होगा। नए प्रोजेक्ट्स शुरू करने के लिए समय उत्तम है।',
      career: 'धीमी लेकिन स्थिर प्रगति। निर्माण कार्यों में गति आएगी।',
      health: 'हड्डियों और घुटनों की देखभाल करें।',
      luckyNumber: 8,
      luckyColor: 'नीला / नेवी ब्लू',
      remedy: 'शनि देव के समक्ष तिल के तेल का दीपक प्रज्वलित करें।',
    },
    {
      id: 'kumbh',
      name: 'कुंभ',
      englishName: 'Aquarius',
      symbol: '♒',
      prediction: 'सामाजिक कार्यों में सहभागिता बढ़ेगी। नए विचारों और आविष्कारों को प्रोत्साहन मिलेगा। आर्थिक दृष्टिकोण से दिन अनुकूल है।',
      career: 'तकनीकी और नवाचार क्षेत्र में नई पहचान बनेगी।',
      health: 'पैरों में थकान संभव है, पर्याप्त विश्राम करें।',
      luckyNumber: 8,
      luckyColor: 'आसमानी (Sky Blue)',
      remedy: 'गरीबों को अन्न या वस्त्र दान करें।',
    },
    {
      id: 'meen',
      name: 'मीन',
      englishName: 'Pisces',
      symbol: '♓',
      prediction: 'मन शांत और सकारात्मक रहेगा। किसी मांगलिक उत्सव में भाग लेने का अवसर मिलेगा। दान-पुण्य से आत्मिक शांति का अनुभव होगा।',
      career: 'विदेशी संपर्कों या आयात-निर्यात से फायदा हो सकता है।',
      health: 'मौसम के अनुसार गर्म पानी का सेवन लाभप्रद रहेगा।',
      luckyNumber: 3,
      luckyColor: 'सुनहरा / पीला',
      remedy: 'केसर का तिलक लगाएं और भगवान शिव को पीले पुष्प चढ़ाएं।',
    },
  ];

  const currentRashi = rashis.find((r) => r.id === selectedRashiId) || rashis[0];

  return (
    <div className="bg-gradient-to-br from-amber-50/50 via-white to-orange-50/40 rounded-2xl border-2 border-amber-200/80 shadow-sm overflow-hidden my-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-amber-200 shadow-inner">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-sm sm:text-base uppercase tracking-wide flex items-center space-x-1.5">
              <span>दैनिक राशिफल व भविष्यफल (Daily Rashifal)</span>
            </h3>
            <p className="text-[11px] text-amber-100 font-medium">
              ज्योतिषीय गणना अनुसार आज का दिन कैसा रहेगा • 12 राशियों का राशिफल
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-1.5 bg-white/10 px-2.5 py-1 rounded-full text-xs font-bold text-amber-100">
          <Sun className="w-3.5 h-3.5 text-amber-300" />
          <span>आज का दिन</span>
        </div>
      </div>

      {/* Rashi Selector Strip */}
      <div className="p-3 bg-white border-b border-amber-100">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {rashis.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRashiId(r.id)}
              className={`flex-shrink-0 flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedRashiId === r.id
                  ? 'bg-amber-600 text-white shadow-sm scale-102'
                  : 'bg-amber-50 text-amber-950 hover:bg-amber-100 border border-amber-200/60'
              }`}
            >
              <span className="text-sm">{r.symbol}</span>
              <span>{r.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Rashi Detail Card */}
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-amber-100 mb-3 gap-2">
          <div className="flex items-center space-x-2.5">
            <span className="text-3xl text-amber-600 font-serif">{currentRashi.symbol}</span>
            <div>
              <h4 className="text-lg font-black text-gray-900">
                {currentRashi.name} राशि ({currentRashi.englishName})
              </h4>
              <span className="text-xs text-amber-800 font-semibold">
                दैनिक पंचांग व ग्रह गोचर फल
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <span className="bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg font-bold">
              शुभ अंक: <strong>{currentRashi.luckyNumber}</strong>
            </span>
            <span className="bg-rose-100 text-rose-900 px-2.5 py-1 rounded-lg font-bold">
              शुभ रंग: <strong>{currentRashi.luckyColor}</strong>
            </span>
          </div>
        </div>

        {/* Prediction Narrative */}
        <p className="text-xs sm:text-sm text-gray-800 leading-relaxed font-normal mb-4 bg-amber-50/50 p-3 rounded-xl border border-amber-100">
          {currentRashi.prediction}
        </p>

        {/* Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-white p-3 rounded-xl border border-gray-200 space-y-1">
            <span className="font-extrabold text-blue-700 block uppercase text-[10px] tracking-wide">
              💼 करियर व व्यवसाय
            </span>
            <p className="text-gray-700 leading-snug">{currentRashi.career}</p>
          </div>

          <div className="bg-white p-3 rounded-xl border border-gray-200 space-y-1">
            <span className="font-extrabold text-emerald-700 block uppercase text-[10px] tracking-wide">
              🌿 स्वास्थ्य सलाह
            </span>
            <p className="text-gray-700 leading-snug">{currentRashi.health}</p>
          </div>
        </div>

        {/* Remedy Mantra */}
        <div className="mt-3 bg-gradient-to-r from-amber-50 to-orange-50 p-3 rounded-xl border border-amber-200 flex items-start space-x-2 text-xs">
          <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-900">आज का अचूक ज्योतिषीय उपाय: </span>
            <span className="text-gray-700">{currentRashi.remedy}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
