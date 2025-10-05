type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

interface ImportMetaEnv {
        readonly SUPABASE_URL: string;
        readonly SUPABASE_ANON_KEY: string;
        readonly SUPABASE_SERVICE_ROLE: string;
        readonly PUBLIC_SUPABASE_URL?: string;
        readonly PUBLIC_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
        readonly env: ImportMetaEnv;
}

declare namespace App {
  interface Locals extends Runtime {}
}
