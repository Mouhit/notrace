export type Expiry = "5min" | "1hr" | "24hr" | "never";

export interface Secret {
  id: string;
  title: string | null;
  content: string;
  password_hash: string | null;
  expiry: Expiry;
  expires_at: string | null;
  created_at: string;
  read_at: string | null;
  is_read: boolean;
}

export interface CreateSecretPayload {
  title?: string;
  content: string;
  password?: string;
  expiry: Expiry;
}

export interface PeekResult {
  exists: boolean;
  has_password: boolean;
  title: string | null;
}
