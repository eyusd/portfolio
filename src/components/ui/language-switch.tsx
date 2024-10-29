"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Locale } from "@/i18n/locale"
import { usePathname, useRouter } from "@/i18n/routing"
import { useLocale } from "next-intl"

const localeToValue: Record<Locale, string> = {
  en: "🇺🇸 English",
  fr: "🇫🇷 Français",
  es: "🇪🇸 Español",
  de: "🇩🇪 Deutsch",
  kr: "🇰🇷 한국말",
  zh: "🇨🇳 中文",
}

export function LanguageSwitch() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          {localeToValue[locale].split(" ")[0]}
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(localeToValue).map(([key, value]) => (
          <DropdownMenuItem
            key={key}
            onClick={() => router.replace({pathname}, {locale: key as Locale})}
          >
            {value}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
