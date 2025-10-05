import { createClient } from '@supabase/supabase-js';
import type { MiddlewareResponseHandler } from 'astro';

export const onRequest: MiddlewareResponseHandler = async ({ locals, request, cookies, redirect }, next) => {
  if (request.url.includes('/portal')) {
    const accessToken = cookies.get('sb-access-token');

    if (!accessToken) {
      return redirect('/login');
    }

    const supabase = createClient(import.meta.env.PUBLIC_SUPABASE_URL, import.meta.env.PUBLIC_SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });

    const { data, error } = await supabase.auth.getUser();

    if (error) {
      cookies.delete('sb-access-token', { path: '/' });
      cookies.delete('sb-refresh-token', { path: '/' });
      return redirect('/login');
    }

    locals.user = data.user;
    locals.role = data.user.app_metadata.role;
  }

  return next();
};