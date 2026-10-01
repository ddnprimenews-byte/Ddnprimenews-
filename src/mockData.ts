import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from './firebase';
import { NewsItem, AdBanner, ReporterApplication, UserProfile } from './types';

export const INITIAL_NEWS: Omit<NewsItem, 'id'>[] = [
  {
    title: 'बिहार में 4 एक्सप्रेसवे और नए मेट्रो कॉरिडोर को केंद्र की हरी झंडी, पटना से मुजफ्फरपुर मात्र 40 मिनट में',
    subTitle: 'राज्य के आधारभूत ढांचे में ऐतिहासिक निवेश, उद्योग और रोजगार को मिलेगा भारी बढ़ावा',
    summary: 'केंद्रीय सड़क परिवहन मंत्रालय और बिहार सरकार के बीच उच्चस्तरीय बैठक में 4 नए एक्सप्रेसवे और पटना मेट्रो के दूसरे चरण को मंजूरी मिल गई है। इससे उत्तर बिहार और दक्षिण बिहार की दूरी न्यूनतम हो जाएगी।',
    content: `पटना: बिहार के विकास को एक नई रफ्तार मिलने जा रही है। राजधानी पटना में आयोजित विशेष संवाददाता सम्मेलन में बताया गया कि केंद्र सरकार ने बिहार के लिए चार नए ग्रीनफील्ड एक्सप्रेसवे और पटना मेट्रो फेज-2 को मंजूरी प्रदान की है। 

इस परियोजना के तहत पटना-मुजफ्फरपुर एक्सप्रेसवे, रक्सौल-हल्दिया एक्सप्रेसवे का बिहार खंड, गोरखपुर-सिलीगुड़ी एक्सप्रेसवे और वाराणसी-कोलकाता एक्सप्रेसवे (कैमूर-रोहतास-औरंगाबाद खंड) के काम में तेजी लाई जाएगी।

राज्य के वरिष्ठ अधिकारियों के अनुसार, इस कॉरिडोर के पूरा होने से स्थानीय स्तर पर 50,000 से अधिक प्रत्यक्ष और अप्रत्यक्ष रोजगार के अवसर सृजित होंगे। उद्योग संघों ने भी इस निर्णय का स्वागत करते हुए इसे बिहार के औद्योगिक कायाकल्प का मील का पत्थर बताया है।`,
    category: 'बिहार एक्सप्रेस',
    district: 'पटना (Patna)',
    block: 'सदर',
    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1000&auto=format&fit=crop&q=80',
    mediaEmbeds: ['https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
    suggestedTags: ['बिहार एक्सप्रेसवे', 'पटना मेट्रो', 'सड़क परिवहन', 'बुनियादी ढांचा', 'बिहार विकास'],
    authorName: 'राजेश कुमार वर्मा',
    authorRole: 'reporter',
    authorDistrict: 'पटना (Patna)',
    isBreaking: true,
    status: 'published',
    views: 1420,
    createdAt: Date.now() - 1000 * 60 * 35, // 35 mins ago
  },
  {
    title: 'मुजफ्फरपुर: लीची अनुसंधान केंद्र ने विकसित की नई उन्नत किस्म, देश-विदेश में निर्यात की तैयारी',
    subTitle: 'शाही लीची के संरक्षण और उत्पादन बढ़ाने के लिए किसानों को विशेष तकनीकी प्रशिक्षण',
    summary: 'मुजफ्फरपुर स्थित राष्ट्रीय लीची अनुसंधान केंद्र (NRCL) ने इस वर्ष अधिक टिकाऊ और मीठी लीची की नई प्रजाति तैयार की है, जो 15 दिनों तक ताजी बनी रह सकेगी।',
    content: `मुजफ्फरपुर: उत्तर बिहार की पहचान मानी जाने वाली प्रसिद्ध 'शाही लीची' अब वैश्विक स्तर पर अपनी महक और मिठास और व्यापक स्तर पर बिखेरेगी। मुजफ्फरपुर के मुशहरी स्थित राष्ट्रीय लीची अनुसंधान केंद्र के वैज्ञानिकों ने एक ऐतिहासिक सफलता हासिल की है।
 
केंद्र के वरिष्ठ कृषि वैज्ञानिकों के अनुसार, विकसित नई तकनीक से लीची की शेल्फ लाइफ 5 दिन से बढ़कर 15 दिन हो गई है। इससे यूरोपीय और खाड़ी देशों में हवाई व समुद्री मार्ग से निर्यात में होने वाले नुकसान से बचा जा सकेगा। 
 
किसानों के लिए अगले माह से विशेष शिविर लगाकर पौधे वितरित किए जाएंगे और कोल्ड स्टोरेज चैन पर 60% तक सरकारी सब्सिडी का प्रावधान किया गया है।`,
    category: 'बिहार एक्सप्रेस',
    district: 'मुजफ्फरपुर (Muzaffarpur)',
    block: 'मुशहरी',
    imageUrl: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=1000&auto=format&fit=crop&q=80',
    suggestedTags: ['मुजफ्फरपुर', 'शाही लीची', 'कृषि अनुसंधान', 'किसान निर्यात', 'उत्तर बिहार'],
    authorName: 'अमित कुमार ठाकुर',
    authorRole: 'reporter',
    authorDistrict: 'मुजफ्फरपुर (Muzaffarpur)',
    isBreaking: false,
    status: 'published',
    views: 890,
    createdAt: Date.now() - 1000 * 60 * 90,
  },
  {
    title: 'गयाजी में विष्णुपद मंदिर कॉरिडोर का मास्टर प्लान तैयार, काशी और उज्जैन की तर्ज पर होगा भव्य कायाकल्प',
    subTitle: 'पर्यटन विभाग ने जारी किया ब्लूप्रिंट; फल्गु नदी तट पर घाटों का विस्तार और ग्रीन बफर जोन बनेगा',
    summary: 'अंतरराष्ट्रीय तीर्थ स्थल गया में विष्णुपद मंदिर कॉरिडोर परियोजना को लेकर अंतिम डीपीआर को स्वीकृति मिल गई है। सालाना लाखों देश-विदेश के श्रद्धालुओं को विश्वस्तरीय सुविधाएं मिलेंगी।',
    content: `गया: मोक्ष की भूमि गयाजी को वैश्विक पर्यटन मानचित्र पर भव्य रूप से स्थापित करने के लिए 'विष्णुपद मंदिर कॉरिडोर' परियोजना का ब्लूप्रिंट तैयार हो चुका है। परियोजना के तहत मंदिर के चारों ओर चौड़े परिक्रमा पथ, अत्याधुनिक बहुमंजिला पार्किंग और फल्गु नदी के दोनों किनारों पर सुंदर घाटों का निर्माण होगा।
 
स्थानीय पंडा समाज और नागरिक प्रतिनिधियों के साथ हुई बैठक में योजना पर सर्वसम्मति बनी है। प्रशासन ने आश्वस्त किया है कि किसी भी ऐतिहासिक धरोहर को नुकसान नहीं पहुंचेगा बल्कि संरक्षण को प्राथमिकता दी जाएगी।`,
    category: 'बिहार एक्सप्रेस',
    district: 'गया (Gaya)',
    block: 'नगर प्रखंड',
    imageUrl: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=1000&auto=format&fit=crop&q=80',
    suggestedTags: ['गयाजी', 'विष्णुपद मंदिर', 'तीर्थ कॉरिडोर', 'पर्यटन बिहार', 'फल्गु नदी'],
    authorName: 'सुनील कुमार पाठक',
    authorRole: 'reporter',
    authorDistrict: 'गया (Gaya)',
    isBreaking: false,
    status: 'published',
    views: 1250,
    createdAt: Date.now() - 1000 * 60 * 180,
  },
  {
    title: 'दरभंगा एम्स का निर्माण कार्य युद्धस्तर पर शुरू, 750 बेड का सुपर स्पेशियलिटी अस्पताल मिथिलांचल को समर्पित होगा',
    subTitle: 'स्वास्थ्य क्षेत्र में मिथिलांचल की सबसे बड़ी क्रांति; नेपाल और सीमावर्ती जिलों के मरीजों को बड़ी राहत',
    summary: 'दरभंगा शोभन बाईपास स्थित प्रस्तावित एम्स परिसर में मिट्टी भराई और बाउंड्री का काम पूरा हो गया है। प्रथम चरण में ओपीडी सेवाएं शीघ्र शुरू करने का लक्ष्य रखा गया है।',
    content: `दरभंगा: उत्तर बिहार और मिथिला क्षेत्र के करोड़ों लोगों का वर्षों पुराना सपना अब धरातल पर उतर रहा है। दरभंगा एम्स के मुख्य भवन निर्माण का काम तीव्र गति से आगे बढ़ रहा है। 

750 बिस्तरों वाले इस अत्याधुनिक चिकित्सा संस्थान में कार्डियोलॉजी, न्यूरोलॉजी और ऑन्कोलॉजी जैसी गंभीर बीमारियों के लिए सर्वोत्तम सुविधाएं उपलब्ध कराई जाएंगी। इसके अलावा एमबीबीएस की 100 सीटों के साथ मेडिकल कॉलेज भी संचालित होगा।`,
    category: 'बिहार एक्सप्रेस',
    district: 'दरभंगा (Darbhanga)',
    block: 'केवटी',
    imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1000&auto=format&fit=crop&q=80',
    authorName: 'मनोज कुमार झा',
    authorRole: 'reporter',
    authorDistrict: 'दरभंगा (Darbhanga)',
    isBreaking: false,
    status: 'published',
    views: 1100,
    createdAt: Date.now() - 1000 * 60 * 240,
  },
  {
    title: 'भागलपुर में सिल्क उद्योग को नई उड़ान: टेक्सटाइल पार्क की स्थापना को मिली वित्तीय मंजूरी',
    subTitle: 'तसर और कतरनी रेशम के बुनकरों के लिए विशेष डिजाइनिंग स्टूडियो और ई-कॉमर्स एक्सपोर्ट हब',
    summary: 'सिल्क सिटी के नाम से मशहूर भागलपुर के पारंपरिक बुनकरों को आधुनिक तकनीकी सहयोग और वैश्विक बाजार उपलब्ध कराने हेतु विशेष टेक्सटाइल पार्क स्थापित किया जा रहा है।',
    content: `भागलपुर: बिहार के प्रसिद्ध भागलपुरी सिल्क को अंतरराष्ट्रीय स्तर पर नई पहचान दिलाने के लिए उद्योग विभाग ने बड़ी पहल की है। नाथनगर और जगदीशपुर क्षेत्र के पारंपरिक बुनकरों को सीधे एक्सपोर्टर्स से जोड़ने के लिए मेगा क्लस्टर का निर्माण शुरू हो चुका है।`,
    category: 'बिहार एक्सप्रेस',
    district: 'भागलपुर (Bhagalpur)',
    block: 'नाथनगर',
    imageUrl: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=1000&auto=format&fit=crop&q=80',
    authorName: 'विकास कुमार साह',
    authorRole: 'reporter',
    authorDistrict: 'भागलपुर (Bhagalpur)',
    isBreaking: false,
    status: 'published',
    views: 740,
    createdAt: Date.now() - 1000 * 60 * 360,
  },
  {
    title: 'विधानसभा चुनाव और उप-चुनाव की तैयारियों पर चुनाव आयोग की सर्वदलीय बैठक, नई गाइडलाइंस जारी',
    subTitle: 'बूथ स्तर पर बायोमेट्रिक और वेबकास्टिंग अनिवार्य, फर्जी मतदान रोकने के सख्त उपाय',
    summary: 'राज्य निर्वाचन आयोग ने आगामी चुनावी तैयारियों का जायजा लेते हुए सभी जिलाधिकारियों और पुलिस कप्तानों के साथ विस्तृत समीक्षा बैठक की।',
    content: `पटना: आगामी राजनीतिक गतिविधियों और चुनावी प्रक्रियाओं को पूर्णतः निष्पक्ष व पारदर्शी बनाने के लिए निर्वाचन आयोग ने कड़े दिशा-निर्देश जारी किए हैं। राज्य के सभी 38 जिलों में संवेदनशील मतदान केंद्रों पर लाइव वेबकास्टिंग होगी।`,
    category: 'राजनीति',
    district: 'पटना (Patna)',
    imageUrl: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=1000&auto=format&fit=crop&q=80',
    authorName: 'अविनाश शर्मा',
    authorRole: 'admin',
    isBreaking: true,
    status: 'published',
    views: 2310,
    createdAt: Date.now() - 1000 * 60 * 15,
  },
  {
    title: 'भारत ने टी20 विश्वकप अभ्यास मैच में ऑस्ट्रेलिया को 45 रनों से हराया, युवा तेज गेंदबाज ने झटके 4 विकेट',
    subTitle: 'मध्यक्रम में विस्फोटक अर्धशतक, गेंदबाजी में सटीक यॉर्कर से विपक्षी बल्लेबाजों को किया पस्त',
    summary: 'भारतीय क्रिकेट टीम ने अपने शानदार ऑलराउंड प्रदर्शन के दम पर अभ्यास मैच में शानदार जीत दर्ज कर मुख्य टूर्नामेंट के लिए मजबूत दावेदारी पेश की है।',
    content: `मेलबर्न/नई दिल्ली: भारतीय क्रिकेट टीम ने टी20 टूर्नामेंट की तैयारी में एक और शानदार विजय दर्ज की है। टॉस जीतकर पहले बल्लेबाजी करते हुए भारत ने 20 ओवर में 5 विकेट पर 195 रनों का विशाल स्कोर खड़ा किया। लक्ष्य का पीछा करने उतरी ऑस्ट्रेलियाई टीम 150 रनों पर सिमट गई।`,
    category: 'स्पोर्ट्स',
    imageUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1000&auto=format&fit=crop&q=80',
    authorName: 'दीपक सिंह',
    authorRole: 'admin',
    isBreaking: false,
    status: 'published',
    views: 1890,
    createdAt: Date.now() - 1000 * 60 * 80,
  },
  {
    title: 'भोजपुरी और बॉलीवुड सिनेमा का ऐतिहासिक संगम: पटना में भव्य अंतरराष्ट्रीय फिल्म महोत्सव का आगाज',
    subTitle: 'दिग्गज कलाकारों और निर्देशकों का जमावड़ा, क्षेत्रीय सिनेमा को प्रमोट करने के लिए विशेष सब्सिडी योजना',
    summary: 'राजधानी पटना के ज्ञान भवन में तीसरे अंतरराष्ट्रीय फिल्म महोत्सव का भव्य शुभारंभ हुआ, जिसमें देश भर के 100 से अधिक दिग्गज सिनेमा जगत के सितारे शामिल हुए।',
    content: `पटना: बिहार में कला, संस्कृति और सिनेमा के नए युग की शुरुआत हो रही है। ज्ञान भवन के मुक्ताकाश मंच पर शुरू हुए फिल्म महोत्सव में क्षेत्रीय भाषाओं विशेषकर मैथिली, भोजपुरी, मगही और अंगिका की पुरस्कृत फिल्मों का प्रदर्शन किया जा रहा है।`,
    category: 'मनोरंजन',
    district: 'पटना (Patna)',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1000&auto=format&fit=crop&q=80',
    authorName: 'सपना सिन्हा',
    authorRole: 'reporter',
    authorDistrict: 'पटना (Patna)',
    isBreaking: false,
    status: 'published',
    views: 950,
    createdAt: Date.now() - 1000 * 60 * 120,
  },
  {
    title: 'बिहार के सभी जिला अस्पतालों में टेली-मेडिसिन और निशुल्क स्वास्थ्य जांच शिविर का विस्तार',
    subTitle: 'हृदय, मधुमेह और मौसमी बीमारियों से बचाव के लिए विशेषज्ञ डॉक्टरों की ओपीडी सेवा शुरू',
    summary: 'स्वास्थ्य विभाग ने राज्य के सभी सदर अस्पतालों एवं प्राथमिक स्वास्थ्य केंद्रों में आधुनिक पैथोलॉजी लैब और टेली-कंसल्टेशन सेवा को 24x7 सक्रिय कर दिया है।',
    content: `पटना/दरभंगा: राज्य में आम नागरिकों को बेहतर और सुलभ स्वास्थ्य सुविधाएं मुहैया कराने के उद्देश्य से स्वास्थ्य विभाग ने नई एडवाइजरी और सेवाएं जारी की हैं। दरभंगा, मुजफ्फरपुर और पटना समेत सभी प्रमुख जिलों के मेडिकल कॉलेजों में विशेष स्वास्थ्य जांच केंद्र स्थापित किए गए हैं। वरिष्ठ चिकित्सकों ने बदलते मौसम में बच्चों और बुजुर्गों के स्वास्थ्य का विशेष ध्यान रखने की सलाह दी है।`,
    category: 'हेल्थ',
    district: 'दरभंगा (Darbhanga)',
    imageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1000&auto=format&fit=crop&q=80',
    authorName: 'राजेश कुमार साहू',
    authorRole: 'admin',
    isBreaking: false,
    status: 'published',
    views: 1420,
    createdAt: Date.now() - 1000 * 60 * 65,
  }
];

export const INITIAL_REPORTERS: ReporterApplication[] = [
  {
    id: 'rep-01-patna',
    fullName: 'राजेश कुमार वर्मा',
    fatherName: 'श्री रामेश्वर प्रसाद वर्मा',
    motherName: 'श्रीमती शांति देवी',
    permanentAddress: 'वार्ड संख्या 12, बोरिंग कैनाल रोड, पटना, बिहार - 800001',
    mobileNumber: '9835012345',
    email: 'rajesh.patna@ddnprimenews.in',
    state: 'बिहार',
    district: 'पटना (Patna)',
    block: 'सदर',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    certificateUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    status: 'approved',
    reporterId: 'DDN-PAT-101',
    formalPassword: 'DDN@2026',
    designation: 'वरिष्ठ ब्यूरो प्रमुख (Senior Bureau Chief)',
    appliedAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
    approvedAt: Date.now() - 1000 * 60 * 60 * 24 * 28,
  },
  {
    id: 'rep-02-muz',
    fullName: 'अमित कुमार ठाकुर',
    fatherName: 'श्री बैद्यनाथ ठाकुर',
    motherName: 'श्रीमती उर्मिला देवी',
    permanentAddress: 'कलेक्ट्रेट रोड, छाता चौक, मुजफ्फरपुर, बिहार - 842001',
    mobileNumber: '9431098765',
    email: 'amit.muz@ddnprimenews.in',
    state: 'बिहार',
    district: 'मुजफ्फरपुर (Muzaffarpur)',
    block: 'मुशहरी',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    certificateUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    status: 'approved',
    reporterId: 'DDN-MUZ-102',
    formalPassword: 'DDN@2026',
    designation: 'जिला संवाददाता (District Correspondent)',
    appliedAt: Date.now() - 1000 * 60 * 60 * 24 * 25,
    approvedAt: Date.now() - 1000 * 60 * 60 * 24 * 24,
  },
  {
    id: 'rep-03-gaya',
    fullName: 'सुनील कुमार पाठक',
    fatherName: 'श्री देवनंदन पाठक',
    motherName: 'श्रीमती गिरिजा देवी',
    permanentAddress: 'विष्णुपद रोड, चांदचौरा, गया, बिहार - 823001',
    mobileNumber: '9122334455',
    email: 'sunil.gaya@ddnprimenews.in',
    state: 'बिहार',
    district: 'गया (Gaya)',
    block: 'नगर प्रखंड',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
    certificateUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    status: 'approved',
    reporterId: 'DDN-GAY-103',
    designation: 'विशेष संवाददाता (Special Correspondent)',
    appliedAt: Date.now() - 1000 * 60 * 60 * 24 * 20,
    approvedAt: Date.now() - 1000 * 60 * 60 * 24 * 18,
  },
  {
    id: 'rep-04-dar',
    fullName: 'मनोज कुमार झा',
    fatherName: 'श्री विद्यानंद झा',
    motherName: 'श्रीमती जानकी देवी',
    permanentAddress: 'लक्ष्मीसागर, दरभंगा, बिहार - 846004',
    mobileNumber: '9934567812',
    email: 'manoj.darbhanga@ddnprimenews.in',
    state: 'बिहार',
    district: 'दरभंगा (Darbhanga)',
    block: 'केवटी',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    certificateUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    status: 'approved',
    reporterId: 'DDN-DAR-104',
    designation: 'संवाददाता (Correspondent)',
    appliedAt: Date.now() - 1000 * 60 * 60 * 24 * 15,
    approvedAt: Date.now() - 1000 * 60 * 60 * 24 * 14,
  },
  {
    id: 'rep-05-bhag',
    fullName: 'विकास कुमार साह',
    fatherName: 'श्री मदन साह',
    motherName: 'श्रीमती कौशल्या देवी',
    permanentAddress: 'तिलकामांझी, भागलपुर, बिहार - 812001',
    mobileNumber: '9801234567',
    email: 'vikas.bhagalpur@ddnprimenews.in',
    state: 'बिहार',
    district: 'भागलपुर (Bhagalpur)',
    block: 'नाथनगर',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    certificateUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    status: 'approved',
    reporterId: 'DDN-BHA-105',
    designation: 'क्षेत्रीय प्रतिनिधि (Regional Bureau)',
    appliedAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
    approvedAt: Date.now() - 1000 * 60 * 60 * 24 * 9,
  },
  {
    id: 'rep-pending-01',
    fullName: 'संजय कुमार यादव',
    fatherName: 'श्री शिवप्रसाद यादव',
    motherName: 'श्रीमती कलावती देवी',
    permanentAddress: 'गांव - बिहटा, थाना - बिहटा, जिला - पटना',
    mobileNumber: '9123456780',
    email: 'sanjay.yadav.apply@gmail.com',
    state: 'बिहार',
    district: 'पटना (Patna)',
    block: 'बिहटा',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    certificateUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    status: 'pending',
    appliedAt: Date.now() - 1000 * 60 * 60 * 3, // 3 hours ago
  }
];

export const INITIAL_ADS: AdBanner[] = [
  {
    id: 'ad-top-header',
    title: 'बिहार मेगा उद्योग समिट 2026',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
    targetUrl: 'https://bihar.gov.in',
    placement: 'header_top',
    active: true,
    sponsorName: 'बिहार उद्योग एवं निवेश संवर्धन परिषद',
    createdAt: Date.now(),
  },
  {
    id: 'ad-sidebar-1',
    title: 'पटना स्मार्ट सिटी डिजिटल नागरिक पोर्टल',
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80',
    targetUrl: 'https://smartcitypatna.bihar.gov.in',
    placement: 'sidebar',
    active: true,
    sponsorName: 'पटना नगर निगम एवं स्मार्ट सिटी',
    createdAt: Date.now(),
  },
  {
    id: 'ad-inline-1',
    title: 'बिहार कृषि यंत्रीकरण एवं आधुनिक सिंचाई अनुदान मेला',
    imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1000&auto=format&fit=crop&q=80',
    targetUrl: 'https://krishi.bihar.gov.in',
    placement: 'inline_content',
    active: true,
    sponsorName: 'कृषि विभाग, बिहार सरकार',
    createdAt: Date.now(),
  }
];

// Seed function to initialize Firestore if empty
export async function seedInitialFirestoreData() {
  try {
    const newsSnap = await getDocs(collection(db, 'news'));
    if (newsSnap.empty) {
      console.log('Seeding initial news stories into Firestore...');
      const batch = writeBatch(db);
      for (const item of INITIAL_NEWS) {
        const docRef = doc(collection(db, 'news'));
        batch.set(docRef, item);
      }
      await batch.commit();
      console.log('Initial news successfully seeded in Firestore.');
    }
  } catch (err: any) {
    // Non-fatal permission or network restriction, app gracefully operates on INITIAL_NEWS fallback
    console.warn('Firestore seeding skipped (guest mode or rules restricted):', err?.message || err);
  }
}
