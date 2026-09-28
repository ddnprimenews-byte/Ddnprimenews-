export interface NewsItem {
  id: string;
  title: string;
  subTitle?: string;
  summary: string;
  content: string;
  category: string; // e.g. 'बिहार एक्सप्रेस', 'देश', 'राजनीति', 'क्राइम', 'मनोरंजन', 'स्पोर्ट्स', 'कारोबार', 'वीडियो'
  district?: string; // e.g. 'Patna', 'Muzaffarpur', etc.
  block?: string;
  imageUrl?: string;
  imagePrompt?: string;
  mediaEmbeds?: string[]; // YouTube, Facebook, Instagram URLs
  authorId?: string;
  authorName: string;
  authorRole: 'admin' | 'reporter' | 'ai';
  authorDistrict?: string;
  isBreaking?: boolean;
  status: 'published' | 'pending' | 'rejected';
  views: number;
  createdAt: number;
  updatedAt?: number;
}

export interface ReporterApplication {
  id: string;
  fullName: string;
  fatherName: string;
  motherName: string;
  permanentAddress: string;
  mobileNumber: string;
  email: string;
  state: string;
  district: string;
  block: string;
  photoUrl: string;
  certificateUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  reporterId?: string;
  designation?: string;
  appliedAt: number;
  approvedAt?: number;
  adminNotes?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  role: 'admin' | 'reporter';
  reporterId?: string;
  designation?: string;
  state?: string;
  district?: string;
  block?: string;
  photoUrl?: string;
  fatherName?: string;
  createdAt: number;
  active: boolean;
}

export interface AdBanner {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl: string;
  placement: 'header_top' | 'sidebar' | 'inline_content' | 'footer';
  active: boolean;
  sponsorName: string;
  createdAt: number;
}

export interface CommentItem {
  id: string;
  articleId: string;
  authorId: string;
  authorName: string;
  authorRole: 'admin' | 'reporter' | 'reader';
  authorPhotoUrl?: string;
  authorDistrict?: string;
  content: string;
  likes: number;
  likedBy: string[]; // List of user IDs who liked
  parentId?: string | null; // For replies
  createdAt: number;
  updatedAt?: number;
}

export const BIHAR_DISTRICTS = [
  'सभी जिले (All Districts)',
  'पटना (Patna)',
  'मुजफ्फरपुर (Muzaffarpur)',
  'गया (Gaya)',
  'भागलपुर (Bhagalpur)',
  'दरभंगा (Darbhanga)',
  'पूर्णिया (Purnia)',
  'नालंदा (Nalanda)',
  'रोहतास (Rohtas)',
  'वैशाली (Vaishali)',
  'समस्तीपुर (Samastipur)',
  'सीतामढ़ी (Sitamarhi)',
  'मधुबनी (Madhubani)',
  'पूर्वी चंपारण (East Champaran)',
  'पश्चिमी चंपारण (West Champaran)',
  'सारण (Saran / Chhapra)',
  'सीवान (Siwan)',
  'गोपालगंज (Gopalganj)',
  'बेगूसराय (Begusarai)',
  'सहरसा (Saharsa)',
  'मधेपुरा (Madhepura)',
  'सुपौल (Supaul)',
  'कटिहार (Katihar)',
  'अररिया (Araria)',
  'किशनगंज (Kishanganj)',
  'मुंगेर (Munger)',
  'खगड़िया (Khagaria)',
  'जमुई (Jamui)',
  'लखीसराय (Lakhisarai)',
  'शेखपुरा (Sheikhpura)',
  'नवादा (Nawada)',
  'औरंगाबाद (Aurangabad)',
  'जहानाबाद (Jehanabad)',
  'अरवल (Arwal)',
  'बक्सर (Buxar)',
  'भोजपुर (Bhojpur / Ara)',
  'कैमूर (Kaimur / Bhabua)',
  'बांका (Banka)'
] as const;

export const CATEGORIES = [
  'बिहार एक्सप्रेस',
  'देश',
  'राजनीति',
  'क्राइम',
  'मनोरंजन',
  'स्पोर्ट्स',
  'कारोबार',
  'वीडियो',
  'हेल्थ'
] as const;

export interface NewsletterSubscriber {
  id?: string;
  email: string;
  status: 'active' | 'unsubscribed';
  frequency: string;
  district?: string;
  language?: string;
  source: string;
  subscribedAt: string;
}

