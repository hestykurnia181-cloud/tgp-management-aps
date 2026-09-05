/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const rawUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
const rawKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

export const supabaseUrl: string = typeof rawUrl === 'string' ? rawUrl.trim() : '';
export const supabaseAnonKey: string = typeof rawKey === 'string' ? rawKey.trim() : '';

export const isSupabaseConfigured: boolean = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  (supabaseUrl.startsWith('https://') || supabaseUrl.startsWith('http://')) &&
  supabaseAnonKey.length >= 20
);

let cachedClient: SupabaseClient | null = null;

/**
 * Returns the initialized Supabase client if configured, or null.
 * Ensures lazy initialization and avoids crashing the app if env vars are missing.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) {
    return null;
  }

  if (!cachedClient) {
    try {
      cachedClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        realtime: {
          params: {
            eventsPerSecond: 15,
          },
        },
      });
    } catch (err) {
      console.warn('[Supabase] Initialization error:', err);
      return null;
    }
  }

  return cachedClient;
}
