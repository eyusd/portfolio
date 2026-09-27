import { localeMeta, localePath, locales, type Locale } from '../i18n';
import { PERSON, SITE, profile } from './profile';
import { articles } from './lab';
import { toMarkdown } from './markdown';

const abs = (p: string) => new URL(p, SITE).href;
const range = (b: string, e?: string) => `${b} – ${e ?? 'present'}`;

/** The CV as Markdown: the single most useful thing to hand a language model about this person. */
export function profileMarkdown(locale: Locale = 'en') {
  const p = profile(locale);
  const about = p.about.map((runs) => runs.map((r) => (r.href ? `[${r.text}](${r.href})` : r.text)).join('')).join('\n\n');
  const exp = p.experiences.map((e) => [
    `### ${e.role} — [${e.company}](${e.url}) (${range(e.begin, e.end)})`, '',
    ...e.blocks.map((b) => (b.type === 'p' ? b.text + '\n' : b.type === 'h' ? `**${b.text}**` : b.items.map((i) => `- ${i}`).join('\n') + '\n')),
    `Stack: ${e.techs.map((t) => t[1]).join(', ')}`, '',
  ].join('\n')).join('\n');
  const edu = p.educations.map((e) => [
    `### ${e.degree} — [${e.school}](${e.url}) (${range(e.begin, e.end)})`, '',
    ...e.blocks.map((b) => (b.type === 'p' ? b.text + '\n' : b.type === 'h' ? `**${b.text}**` : b.items.map((i) => `- ${i}`).join('\n') + '\n')),
  ].join('\n')).join('\n');
  return `## About\n\n${about}\n\n## Experience\n\n${exp}\n## Education\n\n${edu}`;
}

export function llmsTxt() {
  const p = profile('en');
  return `# ${PERSON.name}

> ${p.description} ${p.subtitle}

${PERSON.name} is a ${p.title.toLowerCase()} based in ${p.location}. This site is Clément’s portfolio (CV: experience, education) and "Lab", a collection of experiments and write-ups. It is available in ${locales.map((l) => localeMeta[l].name).join(', ')}; English is the original.

## Profile

- [Portfolio](${SITE}/): experience, education, contact
- [Full profile and every article, as Markdown](${abs('/llms-full.txt')})
- [GitHub](${PERSON.github}), [LinkedIn](${PERSON.linkedin}), email: ${PERSON.email}

## Lab

${articles('en').map((a) => `- [${a.entry.data.title}](${abs(`/lab/${a.slug}.md`)}): ${a.entry.data.description} (${a.entry.data.date.toISOString().slice(0, 10)})`).join('\n')}

## Optional

${locales.filter((l) => l !== 'en').map((l) => `- [${localeMeta[l].name}](${abs(localePath(l))})`).join('\n')}
- [RSS](${abs('/rss.xml')})
- [Sitemap](${abs('/sitemap-index.xml')})
`;
}

export function llmsFullTxt() {
  const posts = articles('en').map((a) =>
    `# ${a.entry.data.title}\n\n> ${a.entry.data.description}\n\nPublished ${a.entry.data.date.toISOString().slice(0, 10)} · ${abs(`/lab/${a.slug}`)}\n\n${toMarkdown(a.entry.body ?? '')}`);
  return `# ${PERSON.name}\n\n> ${profile('en').description}\n\nSource: ${SITE}\n\n${profileMarkdown('en')}\n\n---\n\n${posts.join('\n\n---\n\n')}\n`;
}
