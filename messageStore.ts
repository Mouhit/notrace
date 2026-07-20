import { create } from 'zustand';

interface MessageState {
  // Form state
  content: string;
  templateType: 'email' | 'api_key' | 'otp' | 'journal' | 'document' | 'credit_card';
  password: string;
  expiryMinutes: number;
  scheduledFor: Date | null;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  successMessage: boolean;
  createdMessageId: string | null;
  
  // Actions
  setContent: (content: string) => void;
  setTemplateType: (type: any) => void;
  setPassword: (password: string) => void;
  setExpiryMinutes: (minutes: number) => void;
  setScheduledFor: (date: Date | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSuccessMessage: (success: boolean) => void;
  setCreatedMessageId: (id: string | null) => void;
  reset: () => void;
}

const initialState = {
  content: '',
  templateType: 'email' as const,
  password: '',
  expiryMinutes: 1440,
  scheduledFor: null,
  isLoading: false,
  error: null,
  successMessage: false,
  createdMessageId: null,
};

export const useMessageStore = create<MessageState>((set) => ({
  ...initialState,
  
  setContent: (content) => set({ content }),
  setTemplateType: (templateType) => set({ templateType }),
  setPassword: (password) => set({ password }),
  setExpiryMinutes: (expiryMinutes) => set({ expiryMinutes }),
  setScheduledFor: (scheduledFor) => set({ scheduledFor }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setSuccessMessage: (successMessage) => set({ successMessage }),
  setCreatedMessageId: (createdMessageId) => set({ createdMessageId }),
  
  reset: () => set(initialState),
}));
