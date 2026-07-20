import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      messages: {
        Row: {
          id: string;
          encrypted_content: string;
          nonce: string;
          encrypted_password: string | null;
          password_nonce: string | null;
          template_type: 'email' | 'api_key' | 'otp' | 'journal' | 'document' | 'credit_card';
          expiry_at: string;
          scheduled_for: string | null;
          created_at: string;
          opened_at: string | null;
          destroyed_at: string | null;
          view_count: number;
          ip_accessed_from: string | null;
          created_by_ip: string | null;
        };
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'created_at' | 'view_count'>;
        Update: Partial<Database['public']['Tables']['messages']['Row']>;
      };
      password_attempts: {
        Row: {
          id: string;
          message_id: string;
          attempted_at: string;
          success: boolean;
          ip_address: string | null;
        };
        Insert: Omit<Database['public']['Tables']['password_attempts']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['password_attempts']['Row']>;
      };
    };
  };
};
