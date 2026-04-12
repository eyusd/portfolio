"use client";

import { Dock, DockIcon } from "@/components/ui/dock";
import { Icons } from "@/components/icons";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { LanguageSwitch } from "@/components/ui/language-switch";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export function FloatingDock() {
  const t = useTranslations("TopNav");

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <Dock iconSize={36} iconMagnification={52} iconDistance={120}>
        <DockIcon>
          <Link href="/" className="flex items-center justify-center w-full h-full" title={t("portfolio")}>
            <span className="text-sm font-bold text-foreground">CC</span>
          </Link>
        </DockIcon>

        <DockIcon>
          <Link href="/lab" className="flex items-center justify-center w-full h-full" title={t("lab")}>
            <svg className="w-5 h-5 text-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
            </svg>
          </Link>
        </DockIcon>

        <div className="w-px h-8 bg-border mx-1 self-center" />

        <DockIcon>
          <Link
            href="https://github.com/eyusd"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-full h-full"
            title="GitHub"
          >
            <Icons.github className="w-5 h-5 fill-foreground" />
          </Link>
        </DockIcon>

        <DockIcon>
          <Link
            href="https://www.linkedin.com/in/clement-chardine/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-full h-full"
            title="LinkedIn"
          >
            <Icons.linkedIn className="w-5 h-5 fill-foreground" />
          </Link>
        </DockIcon>

        <DockIcon>
          <Link
            href="mailto:clement.chardine@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-full h-full"
            title="Email"
          >
            <svg className="w-5 h-5 text-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
          </Link>
        </DockIcon>

        <div className="w-px h-8 bg-border mx-1 self-center" />

        <DockIcon disableMagnification>
          <LanguageSwitch />
        </DockIcon>

        <DockIcon disableMagnification>
          <ModeToggle />
        </DockIcon>
      </Dock>
    </div>
  );
}
