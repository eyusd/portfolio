import { messages, type Locale } from '../i18n';

export const SITE = 'https://chardine.fr';
export const PERSON = {
  name: 'Clément Chardine',
  email: 'clement.chardine@gmail.com',
  github: 'https://github.com/eyusd',
  linkedin: 'https://www.linkedin.com/in/clement-chardine/',
  spotify: 'https://open.spotify.com/artist/69FmfmKQDzQPSGzltAudeh',
};

/** Links referenced by tags inside the About copy (`<eledonelink>…</eledonelink>`). */
const ABOUT_LINKS: Record<string, string> = {
  eledonelink: 'https://eledone-ai.com',
  sniivelink: 'https://sniive.com',
  cedelink: 'https://cedehub.io/',
  wanderlink: 'https://en.wandercraft.eu/',
  spotilink: PERSON.spotify,
};

type Tech = [emoji: string, name: string];
export interface ExperienceMeta { key: 'eledone' | 'sniive' | 'cede' | 'wandercraft'; company: string; url: string; refs: [string, string][]; techs: Tech[] }
export interface EducationMeta { key: 'centralesupelec' | 'kaist' | 'sorbonne' | 'prepa'; school: string; url: string; emoji: string }

export const EXPERIENCES: ExperienceMeta[] = [
  {
    key: 'eledone', company: 'Eledone', url: 'https://eledone-ai.com',
    refs: [['LinkedIn', 'https://www.linkedin.com/company/eledone']],
    techs: [['🐍', 'Python'], ['🎸', 'Django'], ['📘', 'TypeScript'], ['▲', 'Next.js'], ['☁', 'GCP'], ['🐳', 'Docker'], ['☸', 'Kubernetes'], ['🤖', 'AI/ML'], ['🤗', 'Hugging Face']],
  },
  {
    key: 'sniive', company: 'Sniive', url: 'https://sniive.com',
    refs: [['LinkedIn', 'https://www.linkedin.com/company/sniive'], ['GitHub', 'https://github.com/sniive/sniive-desktop'], ['STATION F', 'https://stationf.co']],
    techs: [['🦀', 'Rust'], ['⚛', 'Tauri'], ['⚛', 'React'], ['📘', 'TypeScript'], ['🎨', 'Tailwind CSS'], ['▲', 'Next.js'], ['▲', 'Vercel'], ['☁', 'Azure'], ['🔴', 'Redis'], ['🤖', 'OpenAI'], ['🤗', 'Hugging Face'], ['🐍', 'Python']],
  },
  {
    key: 'cede', company: 'cede.hub', url: 'https://cedehub.io/',
    refs: [['Medium', 'https://medium.com/@clement.chardine']],
    techs: [['⚛', 'React'], ['🟢', 'Node.js'], ['📘', 'TypeScript'], ['🧩', 'Chrome Extension'], ['📱', 'React Native'], ['📱', 'Expo']],
  },
  {
    key: 'wandercraft', company: 'Wandercraft', url: 'https://en.wandercraft.eu/',
    refs: [['Open Source', 'https://github.com/leducp/KickCAT']],
    techs: [['🔌', 'EtherCAT'], ['⚙', 'C'], ['⚙', 'C++'], ['🐍', 'Python'], ['💻', 'CLI']],
  },
];

export const EDUCATIONS: EducationMeta[] = [
  { key: 'centralesupelec', school: 'CentraleSupélec', url: 'https://www.centralesupelec.fr/', emoji: '🎓' },
  { key: 'kaist', school: 'KAIST', url: 'https://www.kaist.ac.kr/en/', emoji: '🇰🇷' },
  { key: 'sorbonne', school: 'Sorbonne', url: 'https://www.sorbonne-universite.fr/', emoji: '📚' },
  { key: 'prepa', school: 'Lycée Pierre Corneille', url: 'https://corneille-rouen.lycee.ac-normandie.fr/', emoji: '🏫' },
];

export type Block = { type: 'p'; text: string } | { type: 'h'; text: string } | { type: 'ul'; items: string[] };

/** The CV copy uses a tiny markup: <h>heading</h>, <u><l>item</l></u>, <s></s> for a paragraph break. */
export function parseBlocks(src: string): Block[] {
  const out: Block[] = [];
  let joined = false;
  for (const m of src.matchAll(/<h>(.*?)<\/h>|<u>(.*?)<\/u>|<s><\/s>|([^<]+)/g)) {
    const last = out.at(-1);
    if (m[1]) out.push({ type: 'h', text: m[1].trim().replace(/[:：]$/, '') });
    else if (m[2]) out.push({ type: 'ul', items: [...m[2].matchAll(/<l>(.*?)<\/l>/g)].map((l) => l[1].trim()) });
    else if (m[0] === '<s></s>') joined = false;
    else if (m[3]?.trim()) {
      if (joined && last?.type === 'p') last.text += ' ' + m[3].trim();
      else out.push({ type: 'p', text: m[3].trim() });
      joined = true;
      continue;
    }
    joined = false;
  }
  return out;
}

export type Run = { text: string; href?: string };
/** Splits `…at <eledonelink>Eledone</eledonelink>, where…` into text runs with links. */
export function parseRuns(src: string): Run[] {
  const runs: Run[] = [];
  let i = 0;
  for (const m of src.matchAll(/<(\w+)>(.*?)<\/\1>/g)) {
    if (m.index! > i) runs.push({ text: src.slice(i, m.index) });
    runs.push({ text: m[2], href: ABOUT_LINKS[m[1]] });
    i = m.index! + m[0].length;
  }
  if (i < src.length) runs.push({ text: src.slice(i) });
  return runs;
}

const plain = (blocks: Block[]) => blocks.map((b) => (b.type === 'ul' ? b.items.join(' · ') : b.text)).join(' ');

export function profile(locale: Locale) {
  const m = messages[locale];
  return {
    title: m.Identity.title,
    location: m.Identity.location,
    subtitle: m.Identity.subtitle,
    description: m.Metadata.description,
    about: [parseRuns(m.About.code), parseRuns(m.About.other)],
    nav: m.Navbar,
    lab: m.Lab,
    experiences: EXPERIENCES.map((e) => {
      const x = m.Experiences[e.key] as { name: string; time: { begin: string; end?: string }; children: string };
      const blocks = parseBlocks(x.children);
      return { ...e, role: x.name, begin: x.time.begin, end: x.time.end, blocks, plain: plain(blocks) };
    }),
    educations: EDUCATIONS.map((e) => {
      const x = m.Educations[e.key] as { name: string; time: { begin: string; end?: string }; children: string };
      const blocks = parseBlocks(x.children);
      return { ...e, degree: x.name, begin: x.time.begin, end: x.time.end, blocks, plain: plain(blocks) };
    }),
  };
}
export type Profile = ReturnType<typeof profile>;
