// lib/supabase.ts - Supabase Client for NoTrace by Engage Ad

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not configured');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function createSecret(
  encryptedBlob: string,
  passwordHash?: string,
  collectionId?: string,
  expiresInMinutes: number = 60
) {
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60000).toISOString();

  const { data, error } = await supabase
    .from('secrets')
    .insert([
      {
        encrypted_blob: encryptedBlob,
        password_hash: passwordHash || null,
        collection_id: collectionId || null,
        expires_at: expiresAt,
        is_read: false,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function readSecret(secretId: string) {
  const { data, error } = await supabase
    .from('secrets')
    .select('encrypted_blob, password_hash')
    .eq('id', secretId)
    .eq('is_read', false)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error) throw error;
  return data;
}

export async function markSecretAsReadAndDelete(secretId: string) {
  const { error } = await supabase
    .from('secrets')
    .delete()
    .eq('id', secretId);

  if (error) throw error;
  return { success: true };
}

export async function getSecrets(collectionId?: string) {
  let query = supabase.from('secrets').select('*');

  if (collectionId) {
    query = query.eq('collection_id', collectionId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createCollection(name: string, description?: string) {
  const { data, error } = await supabase
    .from('collections')
    .insert([
      {
        name,
        description: description || null,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getCollections() {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function submitTestimonial(
  message: string,
  name?: string,
  title?: string,
  company?: string,
  rating?: number,
  email?: string
) {
  const { data, error } = await supabase
    .from('testimonials')
    .insert([
      {
        message,
        name: name || null,
        title: title || null,
        company: company || null,
        rating: rating || null,
        email: email || null,
        approved: false,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getApprovedTestimonials() {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('approved', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getUsageStats() {
  const { data, error } = await supabase
    .from('usage_stats')
    .select('secrets_sent_count')
    .limit(1)
    .single();

  if (error) return { secrets_sent_count: 0 };
  return data;
}
