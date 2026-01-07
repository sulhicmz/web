// Lazy-loaded Supabase client initialization
// This ensures Supabase SDK is only loaded when actually needed

export async function createSupabaseClient() {
  const { createClient } = await import('@supabase/supabase-js');
  
  return createClient(
    import.meta.env.PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
  );
}

export async function getSupabaseClient() {
  const { createClient } = await import('@supabase/supabase-js');
  
  // Singleton pattern - reuse existing client
  if (typeof window !== 'undefined' && (window as Window & { __supabaseClient?: unknown }).__supabaseClient) {
    return (window as Window & { __supabaseClient?: unknown }).__supabaseClient as Awaited<ReturnType<typeof createClient>>;
  }
  
  const client = createClient(
    import.meta.env.PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
  );
  
  if (typeof window !== 'undefined') {
    (window as Window & { __supabaseClient?: unknown }).__supabaseClient = client;
  }
  
  return client;
}
