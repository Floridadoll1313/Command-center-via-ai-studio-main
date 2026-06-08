import { createClient } from '@supabase/supabase-js';

const meta = import.meta as any;

// Sanitizes pasted or environment credentials
export function cleanSupabaseUrl(url: string): string {
  let cleaned = (url || '').trim().replace(/['"`;\s]/g, '');
  if (!cleaned) return '';

  // Intercept double-paste such as 'https://xxx.supabase.cohttps://xxx.supabase.co'
  const parts = cleaned.split('https://');
  if (parts.length > 2) {
    // parts would look like ["", "xxx.supabase.co", "xxx.supabase.co"]
    const firstRealPart = parts.find(p => p.length > 0);
    if (firstRealPart) {
      cleaned = 'https://' + firstRealPart;
    }
  }

  // Remove any trailing slashes
  return cleaned.replace(/\/+$/, '');
}

export function cleanSupabaseKey(key: string): string {
  return (key || '').trim().replace(/['"`;\s]/g, '');
}

// Helper to retrieve current credentials (from localStorage first, then from environment/meta variables)
export function getSupabaseCredentials() {
  const localUrl = localStorage.getItem('ocean_supabase_url');
  const localKey = localStorage.getItem('ocean_supabase_anon_key');
  
  const rawUrl = localUrl || meta.env?.VITE_SUPABASE_URL || '';
  const rawKey = localKey || meta.env?.VITE_SUPABASE_ANON_KEY || meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY || '';

  const finalUrl = cleanSupabaseUrl(rawUrl);
  const finalKey = cleanSupabaseKey(rawKey);

  const forceSandbox = localStorage.getItem('ocean_force_sandbox') === 'true';

  return {
    url: finalUrl,
    key: finalKey,
    isReal: !!(finalUrl && finalKey) && !forceSandbox,
    isOverridden: !!(localUrl || localKey),
    isSandboxEnforced: forceSandbox,
  };
}

// Function to enable or disable forced sandbox mode
export function setSandboxModeEnforced(enforced: boolean) {
  localStorage.setItem('ocean_force_sandbox', enforced ? 'true' : 'false');
}

// Function to store custom overrides
export function saveSupabaseCredentials(url: string, key: string) {
  const cleanedUrl = cleanSupabaseUrl(url);
  const cleanedKey = cleanSupabaseKey(key);

  if (cleanedUrl) {
    localStorage.setItem('ocean_supabase_url', cleanedUrl);
  } else {
    localStorage.removeItem('ocean_supabase_url');
  }

  if (cleanedKey) {
    localStorage.setItem('ocean_supabase_anon_key', cleanedKey);
  } else {
    localStorage.removeItem('ocean_supabase_anon_key');
  }
}

// Function to build a client instance dynamically
export function createDynamicSupabaseClient() {
  const { url, key } = getSupabaseCredentials();
  if (url && key) {
    try {
      // Return a real client instance
      return createClient(url, key);
    } catch (e) {
      console.error('Failed to instantiate Supabase client:', e);
    }
  }

  // Graceful simulated client to avoid any workspace/runtime crashes
  return {
    from: (table: string) => ({
      select: () => ({
        order: () => Promise.resolve({ data: [], error: null }),
      }),
      insert: (data: any) => Promise.resolve({ data, error: null }),
      update: (data: any) => Promise.resolve({ data, error: null }),
      delete: () => Promise.resolve({ error: null }),
    }),
    channel: (name: string) => ({
      on: () => ({
        subscribe: () => ({
          unsubscribe: () => {},
        })
      }),
      subscribe: () => ({
        unsubscribe: () => {},
      })
    }),
    removeChannel: () => {},
  } as any;
}

// Default exported client instance
export const supabase = createDynamicSupabaseClient();
