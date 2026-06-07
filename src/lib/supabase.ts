import { createClient } from '@supabase/supabase-js';

const meta = import.meta as any;

// Helper to retrieve current credentials (from localStorage first, then from environment/meta variables)
export function getSupabaseCredentials() {
  const localUrl = localStorage.getItem('ocean_supabase_url');
  const localKey = localStorage.getItem('ocean_supabase_anon_key');
  
  const finalUrl = localUrl || meta.env?.VITE_SUPABASE_URL || '';
  const finalKey = localKey || meta.env?.VITE_SUPABASE_ANON_KEY || meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY || '';

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
  if (url.trim()) {
    localStorage.setItem('ocean_supabase_url', url.trim());
  } else {
    localStorage.removeItem('ocean_supabase_url');
  }

  if (key.trim()) {
    localStorage.setItem('ocean_supabase_anon_key', key.trim());
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
