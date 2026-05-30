// types/index.ts - TypeScript Types for NoTrace

export interface Secret {
  id: string;
  user_id?: string;
  encrypted_blob: string;
  password_hash?: string;
  collection_id?: string;
  expires_at: string;
  is_read: boolean;
  read_at?: string;
  created_by_tier?: string;
  created_at: string;
  updated_at: string;
}

export interface Collection {
  id: string;
  user_id?: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  id: string;
  name?: string;
  title?: string;
  company?: string;
  message: string;
  rating?: number;
  email?: string;
  avatar_url?: string;
  approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  password_hash: string;
  subscription_tier: 'free' | 'trial' | 'pro' | 'business' | 'enterprise';
  subscription_status: 'active' | 'inactive' | 'cancelled';
  subscription_start_at?: string;
  subscription_end_at?: string;
  razorpay_subscription_id?: string;
  secrets_created_today: number;
  last_secret_reset_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}

export interface CreateSecretRequest {
  encrypted_blob: string;
  password_hash?: string;
  collection_id?: string;
  expires_in_minutes: number;
}

export interface CreateSecretResponse {
  success: boolean;
  id: string;
  link: string;
}

export interface ReadSecretResponse {
  success: boolean;
  encrypted_blob: string;
  requires_password: boolean;
}

export interface SubmitTestimonialRequest {
  name?: string;
  title?: string;
  company?: string;
  message: string;
  rating?: number;
  email?: string;
}

export interface CreateCollectionRequest {
  name: string;
  description?: string;
}
