import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";

export default async function LabPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Lab");

  // For now, hardcode articles list - we'll make this dynamic later
  const articles = [
    {
      slug: "make-10-solutions",
      title: "Brute forcing the make 10 game",
      description: "Brute-forcing the 'Make 10' puzzle for every 4-digit input; results, notes on the solver, and the few outliers.",
      date: "2025-11-23",
    },
  ];

  return (
    <div className="container mx-auto max-w-4xl px-6 py-16">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">{t("title")}</h1>
        <p className="text-lg text-muted-foreground">
          {t("description")}
        </p>
      </div>

      <div className="grid gap-6">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/lab/${article.slug}`}
            className="group block p-6 border border-border rounded-lg hover:border-primary transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {article.title}
                </h2>
                <p className="text-muted-foreground mb-4">
                  {article.description}
                </p>
                <time className="text-sm text-muted-foreground">
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
