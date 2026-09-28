import en from './messages/en.json';
import fr from './messages/fr.json';
import de from './messages/de.json';
import es from './messages/es.json';
import zh from './messages/zh.json';
import ko from './messages/ko.json';

export const locales = ['en', 'fr', 'de', 'es', 'zh', 'ko'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

/** BCP 47 tags, Open Graph locales, and the name of each language in itself. */
export const localeMeta: Record<Locale, { tag: string; og: string; name: string; short: string }> = {
  en: { tag: 'en', og: 'en_US', name: 'English', short: 'EN' },
  fr: { tag: 'fr', og: 'fr_FR', name: 'Français', short: 'FR' },
  de: { tag: 'de', og: 'de_DE', name: 'Deutsch', short: 'DE' },
  es: { tag: 'es', og: 'es_ES', name: 'Español', short: 'ES' },
  zh: { tag: 'zh-Hans', og: 'zh_CN', name: '简体中文', short: '中文' },
  ko: { tag: 'ko', og: 'ko_KR', name: '한국어', short: '한국어' },
};

export const messages = { en, fr, de, es, zh, ko } satisfies Record<Locale, typeof en>;

/** Interface strings that live outside the CV content. */
const ui = {
  en: {
    skip: 'Skip to content', language: 'Language', portfolio: 'Portfolio', lab: 'Lab', contact: 'Contact',
    highlights: 'highlights', less: 'less', dragToRotate: 'drag to rotate', hoverMe: 'hover me', aboutWin: 'about',
    dinoIdle: 'you reached the bottom. <b>space</b> to run.', dinoRun: '<b>space</b> / tap to jump', dinoOver: 'game over · <b>space</b> to retry',
    dinoLabel: 'A tiny running game. Press space or tap to play.',
    minRead: 'min read', published: 'Published', backToLab: 'Back to the lab', moreExperiments: 'More experiments',
    notFound: 'Nothing here.', notFoundText: 'This page wandered off. The rest of the site is still where you left it.', backHome: 'Back home',
    rss: 'RSS feed', now: 'now', translationNote: 'This article is available in English only.',
    readArticle: 'Read the article', allArticles: 'All articles',
  },
  fr: {
    skip: 'Aller au contenu', language: 'Langue', portfolio: 'Portfolio', lab: 'Lab', contact: 'Contact',
    highlights: 'points clés', less: 'moins', dragToRotate: 'glisser pour tourner', hoverMe: 'survolez-moi', aboutWin: 'à propos',
    dinoIdle: 'vous êtes arrivé en bas. <b>espace</b> pour courir.', dinoRun: '<b>espace</b> / touchez pour sauter', dinoOver: 'perdu · <b>espace</b> pour rejouer',
    dinoLabel: 'Un petit jeu de course. Appuyez sur espace ou touchez pour jouer.',
    minRead: 'min de lecture', published: 'Publié le', backToLab: 'Retour au lab', moreExperiments: 'Autres expériences',
    notFound: 'Rien ici.', notFoundText: 'Cette page s’est égarée. Le reste du site est toujours là où vous l’avez laissé.', backHome: 'Retour à l’accueil',
    rss: 'Flux RSS', now: 'auj.', translationNote: 'Cet article n’est disponible qu’en anglais.',
    readArticle: 'Lire l’article', allArticles: 'Tous les articles',
  },
  de: {
    skip: 'Zum Inhalt springen', language: 'Sprache', portfolio: 'Portfolio', lab: 'Lab', contact: 'Kontakt',
    highlights: 'Highlights', less: 'weniger', dragToRotate: 'ziehen zum Drehen', hoverMe: 'fahr über mich', aboutWin: 'über mich',
    dinoIdle: 'du bist ganz unten. <b>Leertaste</b> zum Laufen.', dinoRun: '<b>Leertaste</b> / tippen zum Springen', dinoOver: 'game over · <b>Leertaste</b> für neuen Versuch',
    dinoLabel: 'Ein kleines Laufspiel. Leertaste drücken oder tippen zum Spielen.',
    minRead: 'Min. Lesezeit', published: 'Veröffentlicht am', backToLab: 'Zurück zum Lab', moreExperiments: 'Weitere Experimente',
    notFound: 'Hier ist nichts.', notFoundText: 'Diese Seite hat sich verlaufen. Der Rest der Website ist noch da, wo du ihn gelassen hast.', backHome: 'Zur Startseite',
    rss: 'RSS-Feed', now: 'heute', translationNote: 'Dieser Artikel ist nur auf Englisch verfügbar.',
    readArticle: 'Artikel lesen', allArticles: 'Alle Artikel',
  },
  es: {
    skip: 'Saltar al contenido', language: 'Idioma', portfolio: 'Portafolio', lab: 'Lab', contact: 'Contacto',
    highlights: 'destacados', less: 'menos', dragToRotate: 'arrastra para girar', hoverMe: 'pasa el cursor', aboutWin: 'sobre mí',
    dinoIdle: 'llegaste al final. <b>espacio</b> para correr.', dinoRun: '<b>espacio</b> / toca para saltar', dinoOver: 'fin del juego · <b>espacio</b> para reintentar',
    dinoLabel: 'Un pequeño juego de carrera. Pulsa espacio o toca para jugar.',
    minRead: 'min de lectura', published: 'Publicado el', backToLab: 'Volver al lab', moreExperiments: 'Más experimentos',
    notFound: 'Aquí no hay nada.', notFoundText: 'Esta página se perdió. El resto del sitio sigue donde lo dejaste.', backHome: 'Volver al inicio',
    rss: 'Feed RSS', now: 'hoy', translationNote: 'Este artículo solo está disponible en inglés.',
    readArticle: 'Leer el artículo', allArticles: 'Todos los artículos',
  },
  zh: {
    skip: '跳到内容', language: '语言', portfolio: '作品集', lab: '实验室', contact: '联系',
    highlights: '要点', less: '收起', dragToRotate: '拖动旋转', hoverMe: '把鼠标移上来', aboutWin: '关于',
    dinoIdle: '你到底了。按 <b>空格</b> 开跑。', dinoRun: '<b>空格</b> / 轻触 跳跃', dinoOver: '游戏结束 · 按 <b>空格</b> 重来',
    dinoLabel: '一个小小的跑酷游戏。按空格或轻触开始。',
    minRead: '分钟阅读', published: '发布于', backToLab: '返回实验室', moreExperiments: '更多实验',
    notFound: '这里什么都没有。', notFoundText: '这个页面走丢了。网站的其他部分都还在原处。', backHome: '返回首页',
    rss: 'RSS 订阅', now: '至今', translationNote: '本文仅提供英文版。',
    readArticle: '阅读文章', allArticles: '所有文章',
  },
  ko: {
    skip: '본문으로 건너뛰기', language: '언어', portfolio: '포트폴리오', lab: '랩', contact: '연락처',
    highlights: '주요 내용', less: '접기', dragToRotate: '드래그해서 회전', hoverMe: '마우스를 올려보세요', aboutWin: '소개',
    dinoIdle: '맨 아래에 도착했어요. <b>스페이스</b>로 달리기.', dinoRun: '<b>스페이스</b> / 탭해서 점프', dinoOver: '게임 오버 · <b>스페이스</b>로 다시',
    dinoLabel: '작은 달리기 게임. 스페이스를 누르거나 탭해서 플레이하세요.',
    minRead: '분 분량', published: '게시일', backToLab: '랩으로 돌아가기', moreExperiments: '다른 실험들',
    notFound: '여기엔 아무것도 없어요.', notFoundText: '이 페이지는 길을 잃었어요. 사이트의 나머지는 그대로 있습니다.', backHome: '홈으로',
    rss: 'RSS 피드', now: '현재', translationNote: '이 글은 영어로만 제공됩니다.',
    readArticle: '글 읽기', allArticles: '모든 글',
  },
} satisfies Record<Locale, Record<string, string>>;

export type UIKey = keyof typeof ui.en;
export const t = (locale: Locale, key: UIKey) => ui[locale][key];

export const isLocale = (s: string | undefined): s is Locale => !!s && (locales as readonly string[]).includes(s);

/** `/fr/lab`, or `/lab` for the default locale: English lives at the root. */
export function localePath(locale: Locale, path = '/') {
  const clean = path === '/' ? '' : path.replace(/\/$/, '');
  if (locale === defaultLocale) return clean || '/';
  return `/${locale}${clean}`;
}

/** Route params for `[...lang]` pages: undefined means the default locale at the root. */
export const langParams = () => locales.map((l) => ({ params: { lang: l === defaultLocale ? undefined : l }, props: { locale: l } }));

export const formatDate = (locale: Locale, iso: string | Date, opts: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }) =>
  new Intl.DateTimeFormat(localeMeta[locale].tag, { ...opts, timeZone: 'UTC' }).format(typeof iso === 'string' ? new Date(iso) : iso);
