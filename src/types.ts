export interface CaseStudy {
  id: string;
  name: string;
  role: string;
  category: string;
  kpi: string;
  kpiType: string;
  description: string;
  image: string;
  link?: string;
  results?: string[];
  fullStory?: string;
}

export interface VideoGalleryItem {
  id: string;
  title: string;
  category: string;
  tag: string;
  vimeoId?: string;
  thumbnail?: string;
  poster?: string;
  videoUrl?: string;
  youtubeId?: string;
  driveId?: string;
  duration?: string;
  orientation?: 'vertical' | 'horizontal';
  clientName?: string;
  views?: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  bulletPoints?: string[];
}

export interface IndustryTag {
  id: string;
  name: string;
  icon?: string;
  count?: number;
}

export interface AiTool {
  id: string;
  badge: string;
  badgeLogo: string;
  title: string;
  description: string;
  image: string;
  bgGradient: string;
}

export interface FeaturePillar {
  id: string;
  title: string;
  description: string;
  image: string;
  cta?: boolean;
}

export interface LeadBooking {
  id: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  phone?: string;
  company?: string;
  website?: string;
  industry: string;
  videoType: string;
  monthlyVolume: string;
  preferredDate: string;
  preferredTime: string;
  selectedPackage?: string;
  packageTier?: string;
  billingCycle?: string;
  notes?: string;
  createdAt: string;
  source?: string;
  status: 'New' | 'Contacted' | 'Call Scheduled' | 'Scheduled' | 'Proposal Sent' | 'Closed Won' | 'Converted' | 'Archived' | string;
}

export interface RawFootageFile {
  name: string;
  size: string;
  uploadedAt: string;
  downloadUrl?: string;
  blobUrl?: string;
  fileContent?: string;
  mimeType?: string;
}

export interface ProjectRevisionNote {
  id: string;
  timestamp: string;
  note: string;
  author: string;
  authorRole: 'client' | 'editor';
  createdAt?: string;
  editorReply?: string;
  isAddressed?: boolean;
}

export interface ChatMessage {
  id: string;
  projectId: string;
  senderId?: string;
  senderName: string;
  senderRole: 'client' | 'editor' | 'admin';
  text: string;
  timestamp: string; // e.g. "10:42 AM"
  createdAt?: number;
  status: 'sent' | 'delivered' | 'read';
  attachmentName?: string;
  attachmentSize?: string;
  attachmentType?: 'video' | 'audio' | 'document' | 'image';
  isAudioNote?: boolean;
  audioDuration?: string;
  timecodeRef?: string;
}

export interface ClientProject {
  id: string;
  title: string;
  clientId?: string;
  clientEmail: string;
  clientName?: string;
  clientCompany?: string;
  clientWebsite?: string;
  clientPhone?: string;
  clientCountry?: string;
  videoType: 'Reels / TikTok (9:16)' | 'YouTube (16:9)' | 'Video Ad (1:1 / 4:5)' | 'Podcast / Interview';
  status: 'In Queue' | 'Editing' | 'Review Ready' | 'Completed';
  rawFootageFiles: RawFootageFile[];
  footageLink?: string; // Google Drive, Dropbox, or WeTransfer link
  referenceLinks?: string;
  creativeInstructions: string;
  editorName: string;
  lastUpdated: string;
  deliveredVideoUrl?: string;
  revisionNotes?: ProjectRevisionNote[];
  chatMessages?: ChatMessage[];
}

export interface ClientProfile {
  id: string;
  name: string;
  email: string;
  company: string;
  website: string;
  phone: string;
  country: string;
  countryFlag?: string;
  plan: 'Scale ($1,299/mo)' | 'Pro ($2,299/mo)' | 'In-House Studio ($5,999/mo)' | 'Scale (Quarterly - $999/mo)' | 'Pro (Quarterly - $1,999/mo)' | 'In-House Studio (Quarterly - $4,999/mo)' | 'Scale (Yearly - $899/mo)' | 'Pro (Yearly - $1,799/mo)' | 'In-House Studio (Yearly - $4,699/mo)' | 'Trial ($89)' | string;
  monthlySpend: number;
  status: 'Active' | 'Paused' | 'Archived' | 'Disabled';
  joinedDate: string;
  activeProjectsCount: number;
  assignedEditor?: string;
}

export interface SimulatedEmail {
  id: string;
  to: string;
  recipientName: string;
  subject: string;
  body: string;
  type: 'status_editing' | 'status_review' | 'status_completed' | 'new_request';
  timestamp: string;
  read: boolean;
  projectId: string;
  projectTitle: string;
}

export type AppRoute = 
  | 'home' 
  | 'pricing' 
  | 'booking'
  | 'flow' 
  | 'admin'
  | 'gallery' 
  | 'creators' 
  | 'business' 
  | 'agencies' 
  | 'testimonials' 
  | 'case-studies' 
  | 'unlimited-editing' 
  | 'platform'
  | 'turkish-drama';

export interface PreselectedPlan {
  id: string; // 'scale' | 'pro' | 'inhouse'
  name: string; // 'Scale' | 'Pro' | 'In-House Studio'
  cycle: 'yearly' | 'quarterly' | 'monthly';
  monthlyRate: number;
  totalPrice?: number;
  savingsText?: string;
  turnaround?: string;
}
