"use client";

import { Link } from "@/i18n/routing";
import { ModeToggle } from "./ui/mode-toggle";
import { LanguageSwitch } from "./ui/language-switch";
import { useTranslations } from "next-intl";

export function TopNav() {
  const t = useTranslations("TopNav");

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-6">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold text-lg">CC</span>
        </Link>
        
        <div className="absolute left-1/2 -translate-x-1/2 flex gap-8">
          <Link 
            href="/" 
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            {t("portfolio")}
          </Link>
          <Link 
            href="/lab" 
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            {t("lab")}
          </Link>
        </div>
        
        <div className="flex items-center gap-2">
          <LanguageSwitch />
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
}
