import type { APIRoute } from 'astro';

// Everyone is welcome, search engines and AI answer engines alike: this site exists to be read and cited.
export const GET: APIRoute = ({ site }) => new Response(
  ['User-agent: *', 'Allow: /', '',
    ...['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-User', 'Claude-SearchBot', 'PerplexityBot', 'Perplexity-User',
      'Google-Extended', 'Applebot-Extended', 'Bingbot', 'DuckAssistBot', 'MistralAI-User', 'CCBot'].flatMap((b) => [`User-agent: ${b}`, 'Allow: /', '']),
    `Sitemap: ${new URL('sitemap-index.xml', site)}`, ''].join('\n'),
  { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
