import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import fs from "fs";
import path from "path";
import "katex/dist/katex.min.css";

// This will be our article metadata type
export interface ArticleMetadata {
  title: string;
  description: string;
  date: string;
  slug: string;
}

// Get all article slugs for static generation
export async function generateStaticParams() {
  const articlesDir = path.join(process.cwd(), "src/app/[locale]/lab/articles");
  if (!fs.existsSync(articlesDir)) {
    return [];
  }

  const files = fs.readdirSync(articlesDir);
  const slugs = files
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => ({
      slug: file.replace(/\.mdx$/, ""),
    }));

  return slugs;
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  
  // Import the MDX file dynamically to get its metadata
  try {
    const article = await import(`../articles/${slug}.mdx`);
    const metadata = article.metadata;
    
    return {
      title: metadata?.title || slug,
      description: metadata?.description || "",
      openGraph: {
        title: metadata?.title || slug,
        description: metadata?.description || "",
        type: 'article',
        publishedTime: metadata?.date,
        authors: ['Clément Chardine'],
        locale: locale,
        url: `/${locale}/lab/${slug}`,
      },
      twitter: {
        card: 'summary_large_image',
        title: metadata?.title || slug,
        description: metadata?.description || "",
      },
      alternates: {
        canonical: `/${locale}/lab/${slug}`,
      },
    };
  } catch {
    return {
      title: "Article Not Found",
    };
  }
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  let ArticleContent;
  let metadata: ArticleMetadata;

  try {
    const article = await import(`../articles/${slug}.mdx`);
    ArticleContent = article.default;
    metadata = article.metadata;
  } catch (error) {
    console.error("Failed to load article:", error);
    notFound();
  }

  return (
    <div className="container mx-auto max-w-3xl px-6 py-16">
      <article>
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{metadata.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <time dateTime={metadata.date}>
              {new Date(metadata.date).toLocaleDateString(locale, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </div>
          {metadata.description && (
            <p className="mt-4 text-lg text-muted-foreground">
              {metadata.description}
            </p>
          )}
        </header>
        
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <ArticleContent />
        </div>
      </article>
    </div>
  );
}
