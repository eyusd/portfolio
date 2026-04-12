import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Icons } from "@/components/icons";

export default async function LabPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Lab");

  const articles = [
    {
      slug: "anchor",
      title: "I built a desktop pet that tells me to stop yelling at my AI",
      description: "How a weekend of Rust, raw macOS FFI, and on-device ML turned into a tiny companion that watches your tone.",
      date: "2026-04-12",
      emoji: "😾",
      tags: ["Rust", "macOS", "ML"],
    },
    {
      slug: "life-percentage",
      title: "When did I do this for half my life?",
      description: "An interactive calculator to determine the exact date when an activity accounts for a specific percentage of your total lifespan.",
      date: "2026-01-07",
      emoji: "⏳",
      tags: ["Math", "Interactive"],
    },
    {
      slug: "make-10-solutions",
      title: "Brute forcing the make 10 game",
      description: "Brute-forcing the 'Make 10' puzzle for every 4-digit input; results, notes on the solver, and the few outliers.",
      date: "2025-11-23",
      emoji: "🔢",
      tags: ["Algorithms", "Puzzle"],
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-16">
        <h1 className="text-4xl font-bold tracking-tight mb-3">{t("title")}</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {t("description")}
        </p>
      </div>

      <div className="grid gap-4">
        {articles.map((article, i) => (
          <Link
            key={article.slug}
            href={`/lab/${article.slug}`}
            className="group relative block rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
          >
            <div className="flex items-start gap-5">
              <div className="shrink-0 w-12 h-12 rounded-lg bg-muted/50 flex items-center justify-center text-2xl transition-transform duration-300 group-hover:scale-110">
                {article.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block text-[10px] font-bold uppercase tracking-wider text-primary/70 bg-primary/5 rounded-full px-2 py-0.5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
                  {article.title}
                  <Icons.arrow className="fill-current inline-block h-4 w-4 shrink-0 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 motion-reduce:transition-none ml-1.5 mb-0.5 opacity-0 group-hover:opacity-100" />
                </h2>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
                  {article.description}
                </p>
                <time className="block text-xs text-muted-foreground/60 mt-3 font-medium">
                  {new Date(article.date).toLocaleDateString(locale, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
