import type { APIRoute } from 'astro';
import { PERSON } from '../data/profile';

export const GET: APIRoute = () => new Response(JSON.stringify({
  name: PERSON.name, short_name: 'CC', description: 'Software engineer in Paris.',
  start_url: '/', scope: '/', display: 'browser', background_color: '#040f11', theme_color: '#040f11',
  icons: [
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
  ],
}), { headers: { 'Content-Type': 'application/manifest+json' } });
