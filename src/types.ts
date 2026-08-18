export type Category = {
  id: string;
  name: string;
  icon: string;
  subcategories: Subcategory[];
};

export type Subcategory = {
  id: string;
  name: string;
  description: string;
};

export type Expert = {
  id: string;
  user_id?: string;
  name: string;
  photo?: string | null;
  experience: string;
  price: number;
  categories?: string[];
  subcategories?: string[];
  subscriptionTiers: string[];
  maxResponseTime: string;
  avgResponseTime: string;
  rating: number;
};

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export enum AppStep {
  ONBOARDING = 'ONBOARDING',
  CATEGORY_SELECTION = 'CATEGORY_SELECTION',
  SUBCATEGORY_SELECTION = 'SUBCATEGORY_SELECTION',
  AI_CHAT = 'AI_CHAT',
  DRAFT_REVIEW = 'DRAFT_REVIEW',
  EXPERT_SELECTION = 'EXPERT_SELECTION',
  PAYMENT = 'PAYMENT',
  REGISTER = 'REGISTER',
  DASHBOARD = 'DASHBOARD',
  EXPERT_APPLICATION = 'EXPERT_APPLICATION',
  ADMIN_PANEL = 'ADMIN_PANEL',
  SUBSCRIPTION = 'SUBSCRIPTION',
  SETTINGS = 'SETTINGS',
  ABOUT = 'ABOUT',
  TERMS = 'TERMS',
  PRIVACY = 'PRIVACY',
  CONTACT = 'CONTACT'
}

export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type ExpertApplication = {
  id: string;
  name: string;
  email: string;
  photo_url?: string | null;
  bio: string;
  categories: string[];
  subcategories?: string[];
  customCategory?: string;
  proposedPrice: number;
  cvFileName: string;
  cvUrl?: string;
  status: ApplicationStatus;
  rejectionReason?: string;
  appliedAt: string;
  user_id: string;
};

export type UserRole = 'USER' | 'EXPERT' | 'ADMIN';
