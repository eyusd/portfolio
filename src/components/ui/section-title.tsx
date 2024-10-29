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
      className="sticky top-0 z-20 -mx-6 mb-4 w-screen px-6 py-5 md:-mx-12 md:px-12 lg:sr-only lg:relative lg:top-auto lg:mx-auto lg:w-full lg:px-0 lg:py-0 lg:opacity-0"
    >
      <h2 className="text-sm font-bold uppercase tracking-widest text-foreground lg:sr-only">
        {name}
      </h2>
    </div>
  );
}
