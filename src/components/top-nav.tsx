"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export function TopNav() {
  const t = useTranslations("TopNav");

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-sm">
      <div className="container flex h-14 max-w-3xl items-center justify-between px-6">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold text-lg text-foreground">CC</span>
        </Link>
        
        <div className="flex gap-8">
          <Link 
            href="/" 
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("portfolio")}
          </Link>
          <Link 
            href="/lab" 
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("lab")}
          </Link>
        </div>
      </div>
    </nav>
  );
}
