"use client";

import { Section } from "@/lib/sections";
import { useSection } from "@/lib/use-section";

interface SectionTitleProps {
  name: string;
  id: Section;
}

export function SectionTitle({ name, id }: SectionTitleProps) {
  const ref = useSection(id);

  return (
    <div
      ref={ref}
      className="mb-6 sm:mb-8"
    >
      <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">
        {name}
      </h2>
      <div className="mt-3 h-px w-12 bg-primary" />
    </div>
  );
}
