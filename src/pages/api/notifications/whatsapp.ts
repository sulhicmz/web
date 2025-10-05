import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();

  // TODO: Add logging
  console.log(JSON.stringify(body, null, 2));

  // TODO: Add retry logic

  // TODO: Handle opt-out

  return new Response('OK', { status: 200 });
};